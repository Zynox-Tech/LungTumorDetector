import os
import io
import base64
import logging
import numpy as np
import torch
import torch.nn as nn
from torchvision import models
from PIL import Image, ImageDraw
import cv2

logger = logging.getLogger(__name__)

os.environ.setdefault("KERAS_BACKEND", "tensorflow")

_MODEL_DIR = os.path.dirname(os.path.abspath(__file__))


def _build_lung_classifier():
    m = models.resnet18(weights=None)
    in_f = m.fc.in_features
    m.fc = nn.Sequential(
        nn.Dropout(0.6), nn.Linear(in_f, 128), nn.ReLU(),
        nn.BatchNorm1d(128), nn.Dropout(0.5), nn.Linear(128, 2),
    )
    return m


class ModelManager:
    def __init__(self):
        self._lung_classifier = None
        self._cancer_model = None
        self._input_size = (224, 224)
        self._load()

    def _load(self):
        # Stage 1 — PyTorch ResNet18 lung classifier
        cls_path = os.path.join(_MODEL_DIR, "lung_classifier_model.pth")
        if os.path.exists(cls_path):
            try:
                m = _build_lung_classifier()
                ckpt = torch.load(cls_path, map_location="cpu", weights_only=False)
                state = ckpt.get("model_state_dict", ckpt)
                m.load_state_dict(state, strict=True)
                m.eval()
                self._lung_classifier = m
                logger.info("[OK] Lung classifier loaded")
            except Exception as e:
                logger.error(f"Lung classifier load failed: {e}")
        else:
            logger.warning(f"Lung classifier not found: {cls_path}")

        # Stage 2 — Keras ResNet50 cancer model
        cancer_path = os.path.join(_MODEL_DIR, "lung_resnet50_stage1_safe.keras")
        if os.path.exists(cancer_path):
            try:
                import keras
                self._cancer_model = keras.models.load_model(cancer_path)
                logger.info(f"[OK] Cancer model loaded (keras {keras.__version__})")
            except Exception as e:
                logger.error(f"Cancer model load failed: {e}")
        else:
            logger.warning(f"Cancer model not found: {cancer_path}")

    # ── public API ────────────────────────────────────────────────────────────

    @property
    def model(self):
        return self._cancer_model

    @property
    def input_size(self):
        return self._input_size

    async def load_model(self):
        pass  # models load at startup — kept for API compat

    # ── Stage 1: lung gate ────────────────────────────────────────────────────

    def is_lung_image(self, image_bytes: bytes) -> tuple:
        """Returns (is_lung: bool, lung_probability: float)."""
        if self._lung_classifier is None:
            return True, 1.0
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("L")
            img = img.resize((224, 224))
            arr = np.array(img, dtype=np.float32) / 255.0
            rgb = np.stack([arr, arr, arr], axis=-1)
            t = torch.from_numpy(rgb.transpose(2, 0, 1)).float().unsqueeze(0)
            with torch.no_grad():
                probs = torch.softmax(self._lung_classifier(t), dim=1)[0]
            lung_prob = float(probs[1])
            return lung_prob >= 0.5, lung_prob
        except Exception as e:
            logger.error(f"Lung classifier error: {e}")
            return True, 1.0

    # ── Preprocessing ─────────────────────────────────────────────────────────

    def preprocess(self, image_bytes: bytes) -> tuple:
        """
        Returns (img_array, gray_224).
        img_array : (1, 224, 224, 3) float32 [0,1]  — input for cancer model
        gray_224  : (224, 224) uint8                  — used for heatmap overlay
        """
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        img_cv = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
        img_cv = cv2.resize(img_cv, (224, 224))
        norm = img_cv.astype(np.float32) / 255.0
        rgb = np.stack([norm, norm, norm], axis=-1)
        return np.expand_dims(rgb, axis=0), img_cv

    # ── Stage 2: cancer inference ─────────────────────────────────────────────

    def predict(self, img_array: np.ndarray) -> float:
        if self._cancer_model is None:
            raise ValueError("Cancer model not loaded")
        return float(self._cancer_model.predict(img_array, verbose=0)[0][0])

    # ── Grad-CAM ──────────────────────────────────────────────────────────────

    def gradcam(self, img_array: np.ndarray) -> np.ndarray:
        """
        Returns (H, W) float32 heatmap in [0,1], or None.
        Uses conv5_block3_out (last ResNet50 conv layer — most class-discriminative).
        Logit scoring prevents gradient vanishing from sigmoid saturation.
        EigenCAM fallback when gradients still vanish.
        """
        if self._cancer_model is None:
            return None
        try:
            import tensorflow as tf

            target_name = None
            for candidate in ["conv5_block3_out", "conv5_block2_out",
                              "conv5_block1_out", "conv4_block6_out"]:
                try:
                    self._cancer_model.get_layer(candidate)
                    target_name = candidate
                    break
                except ValueError:
                    continue

            if target_name is None:
                logger.warning("Grad-CAM: no ResNet50 conv layer found")
                return None

            logger.info(f"Grad-CAM target: {target_name}")
            grad_model = tf.keras.Model(
                inputs=self._cancer_model.inputs,
                outputs=[self._cancer_model.get_layer(target_name).output,
                         self._cancer_model.output],
            )

            img_tf = tf.constant(img_array, dtype=tf.float32)
            with tf.GradientTape() as tape:
                tape.watch(img_tf)
                conv_out, preds = grad_model(img_tf, training=False)
                p = tf.clip_by_value(preds[:, 0], 1e-6, 1.0 - 1e-6)
                score = tf.math.log(p / (1.0 - p))   # logit — gradient=1 at sigmoid

            grads = tape.gradient(score, conv_out)
            grad_max = float(tf.reduce_max(tf.abs(grads))) if grads is not None else 0.0

            if grad_max > 1e-8:
                pooled = tf.reduce_mean(grads, axis=(0, 1, 2))
                heatmap = (conv_out[0] @ pooled[..., tf.newaxis]).numpy().squeeze()
            else:
                logger.info("Grad-CAM: gradients vanished — using EigenCAM fallback")
                feat = conv_out[0].numpy()
                H, W, C = feat.shape
                feat_flat = feat.reshape(-1, C)
                feat_flat -= feat_flat.mean(axis=0)
                _, _, Vt = np.linalg.svd(feat_flat, full_matrices=False)
                heatmap = (feat_flat @ Vt[0]).reshape(H, W)

            heatmap = np.maximum(heatmap, 0)
            if heatmap.max() > 0:
                heatmap = heatmap / heatmap.max()
            return heatmap

        except Exception as e:
            logger.warning(f"Grad-CAM failed: {e}")
            return None

    # ── Heatmap overlay ───────────────────────────────────────────────────────

    def make_heatmap(self, gray_224: np.ndarray, cam: np.ndarray) -> tuple:
        """
        Returns (original_b64, overlay_b64) as PNG base64 strings.
        gray_224 : (224, 224) uint8 grayscale
        cam      : (H, W) float32 Grad-CAM heatmap or None
        """
        try:
            orig = Image.fromarray(gray_224, "L").convert("RGB")
            ImageDraw.Draw(orig).rectangle(
                [1, 1, orig.width - 2, orig.height - 2], outline="white", width=2)

            def to_b64(img):
                buf = io.BytesIO()
                img.save(buf, format="PNG")
                return base64.b64encode(buf.getvalue()).decode()

            orig_b64 = to_b64(orig)

            if cam is None or cam.size == 0:
                return orig_b64, None

            h, w = gray_224.shape
            c = cv2.resize(cam.astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
            c = cv2.GaussianBlur(c, (11, 11), 0)
            c = (c - c.min()) / (c.max() - c.min() + 1e-8)
            hm_col = cv2.applyColorMap((c * 255).astype(np.uint8), cv2.COLORMAP_JET)
            ovl_arr = cv2.addWeighted(
                cv2.cvtColor(gray_224, cv2.COLOR_GRAY2RGB), 0.5, hm_col, 0.5, 0)
            ovl = Image.fromarray(ovl_arr)
            ImageDraw.Draw(ovl).rectangle(
                [1, 1, ovl.width - 2, ovl.height - 2], outline="white", width=2)

            return orig_b64, to_b64(ovl)

        except Exception as e:
            logger.error(f"Heatmap overlay failed: {e}")
            return None, None
