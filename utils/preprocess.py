import numpy as np
from PIL import Image
import io
import logging
from typing import Union

logger = logging.getLogger(__name__)


def preprocess_image(image_data: Union[bytes, str], target_size: tuple = (224, 224)) -> np.ndarray:
    """
    Preprocess image to match the cancer model's training pipeline:
      grayscale → resize → normalise [0,1] → stack to 3-channel → (1, H, W, 3)
    """
    try:
        if isinstance(image_data, bytes):
            image = Image.open(io.BytesIO(image_data))
        else:
            image = Image.open(image_data)

        image = image.convert("L")
        image = image.resize(target_size, Image.LANCZOS)
        arr = np.array(image, dtype=np.float32) / 255.0
        rgb = np.stack([arr, arr, arr], axis=-1)   # (H, W, 3)
        return np.expand_dims(rgb, axis=0)          # (1, H, W, 3)

    except Exception as e:
        logger.error(f"Preprocessing failed: {e}")
        raise ValueError(f"Failed to preprocess image: {e}")


def validate_image_format(image_data: bytes) -> bool:
    try:
        img = Image.open(io.BytesIO(image_data))
        img.load()
        return True
    except Exception:
        return False


def get_image_info(image_data: bytes) -> dict:
    try:
        image = Image.open(io.BytesIO(image_data))
        return {
            "format": image.format, "mode": image.mode,
            "size": image.size, "width": image.width,
            "height": image.height, "file_size": len(image_data),
        }
    except Exception as e:
        return {"error": str(e)}
