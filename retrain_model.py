"""
retrain_model.py — Rebuild lung_model.h5 using ResNet50 transfer learning.

Dataset structure:
  chest_xray_lung/
    train/
      Cancer/   (3875 images)
      NORMAL/   (1341 images)
    test/
      Cancer/   (390 images)
      NORMAL/   (234 images)

USAGE (from your project root with venv activated):
  python retrain_model.py --epochs 30
"""

import os
import argparse
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.layers import (
    Dense, GlobalAveragePooling2D, Dropout,
    BatchNormalization, Input
)
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import (
    EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
)
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ── CONFIG ────────────────────────────────────────────────────────────────────
DATASET_ROOT = r"C:\Users\PMLS\Downloads\archive\chest_xray_lung"
TRAIN_DIR    = os.path.join(DATASET_ROOT, "train")
TEST_DIR     = os.path.join(DATASET_ROOT, "test")

IMG_SIZE     = (224, 224)
BATCH_SIZE   = 16
MODEL_PATH   = "lung_model.h5"

# NORMAL=0 (non-cancerous), Cancer=1 (cancerous)
CLASS_NAMES  = ["NORMAL", "Cancer"]


def build_model():
    inputs = Input(shape=(*IMG_SIZE, 3))
    base = ResNet50(weights='imagenet', include_top=False, input_tensor=inputs)
    base.trainable = False

    x = base.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.5)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.3)(x)
    outputs = Dense(1, activation='sigmoid')(x)

    model = Model(inputs=inputs, outputs=outputs)
    model.compile(
        optimizer=Adam(learning_rate=1e-4),
        loss='binary_crossentropy',
        metrics=[
            'accuracy',
            tf.keras.metrics.Precision(name='precision'),
            tf.keras.metrics.Recall(name='recall'),
            tf.keras.metrics.AUC(name='auc'),
        ]
    )
    return model, base


def make_generators():
    # preprocess_input is Keras's built-in ResNet50 normalisation function
    # It applies the correct ImageNet mean/std that ResNet50 was trained with
    # This replaces the broken mean=/std= kwargs from ImageDataGenerator

    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.15,
        horizontal_flip=True,
        brightness_range=[0.85, 1.15],
    )

    # No augmentation on test set — only normalisation
    test_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
    )

    common = dict(
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        classes=CLASS_NAMES,   # NORMAL=0, Cancer=1
    )

    train_gen = train_datagen.flow_from_directory(TRAIN_DIR, shuffle=True,  **common)
    test_gen  = test_datagen.flow_from_directory( TEST_DIR,  shuffle=False, **common)

    print(f"\nClass mapping : {train_gen.class_indices}")
    print(f"  ✓ NORMAL=0 (non-cancerous), Cancer=1 (cancerous)")
    print(f"Training      : {train_gen.samples} images")
    print(f"Test/Val      : {test_gen.samples} images")

    # Correct for class imbalance (3875 Cancer vs 1341 NORMAL)
    total    = train_gen.samples
    n_cancer = 3875
    n_normal = 1341
    class_weights = {
        0: (total / (2 * n_normal)),   # upweight NORMAL
        1: (total / (2 * n_cancer)),   # downweight Cancer
    }
    print(f"\nClass weights : NORMAL={class_weights[0]:.2f}, Cancer={class_weights[1]:.2f}")
    print(f"  (corrects imbalance: {n_cancer} Cancer vs {n_normal} NORMAL)")

    return train_gen, test_gen, class_weights


def plot_history(h1, h2):
    acc   = h1.history['accuracy']     + h2.history['accuracy']
    val   = h1.history['val_accuracy'] + h2.history['val_accuracy']
    loss  = h1.history['loss']         + h2.history['loss']
    vloss = h1.history['val_loss']     + h2.history['val_loss']
    split = len(h1.history['accuracy'])
    epochs = range(1, len(acc) + 1)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

    ax1.plot(epochs, acc,  'b-', label='Train')
    ax1.plot(epochs, val,  'r-', label='Val/Test')
    ax1.axvline(split, color='gray', linestyle='--', label='Fine-tune start')
    ax1.set_title('Accuracy'); ax1.set_ylim(0, 1); ax1.legend()

    ax2.plot(epochs, loss,  'b-', label='Train')
    ax2.plot(epochs, vloss, 'r-', label='Val/Test')
    ax2.axvline(split, color='gray', linestyle='--', label='Fine-tune start')
    ax2.set_title('Loss'); ax2.legend()

    plt.tight_layout()
    plt.savefig("training_history.png")
    print("Training curve saved → training_history.png")


def train(epochs: int = 30):
    print("\n" + "="*60)
    print("LUNG CANCER DETECTOR — ResNet50 Retraining")
    print("="*60)
    print(f"  Train dir : {TRAIN_DIR}")
    print(f"  Test dir  : {TEST_DIR}")
    print(f"  Input     : {IMG_SIZE[0]}×{IMG_SIZE[1]}")
    print(f"  Epochs    : {epochs}")
    print(f"  Output    : {MODEL_PATH}")
    print("="*60)

    train_gen, test_gen, class_weights = make_generators()
    model, base_model = build_model()

    callbacks = [
        EarlyStopping(
            monitor='val_auc', mode='max',
            patience=7, restore_best_weights=True, verbose=1
        ),
        ModelCheckpoint(
            MODEL_PATH, monitor='val_auc', mode='max',
            save_best_only=True, verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss', factor=0.5,
            patience=3, min_lr=1e-8, verbose=1
        ),
    ]

    # ── Phase 1: Train head only (ResNet50 frozen) ───────────────────────────
    print("\n── Phase 1: Training classification head (ResNet50 frozen) ──")
    phase1_epochs = min(15, epochs // 2)
    h1 = model.fit(
        train_gen,
        validation_data=test_gen,
        epochs=phase1_epochs,
        class_weight=class_weights,
        callbacks=callbacks,
        verbose=1
    )

    # ── Phase 2: Fine-tune top ResNet50 layers ───────────────────────────────
    print("\n── Phase 2: Fine-tuning top 40 ResNet50 layers ──────────────")
    base_model.trainable = True
    for layer in base_model.layers[:-40]:
        layer.trainable = False

    model.compile(
        optimizer=Adam(learning_rate=1e-5),
        loss='binary_crossentropy',
        metrics=[
            'accuracy',
            tf.keras.metrics.Precision(name='precision'),
            tf.keras.metrics.Recall(name='recall'),
            tf.keras.metrics.AUC(name='auc'),
        ]
    )

    h2 = model.fit(
        train_gen,
        validation_data=test_gen,
        epochs=epochs,
        class_weight=class_weights,
        callbacks=callbacks,
        verbose=1
    )

    # ── Final evaluation ─────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"Model saved → {MODEL_PATH}")
    print("\nFinal test set metrics:")
    results = model.evaluate(test_gen, verbose=0)
    metrics = dict(zip(model.metrics_names, results))
    for name, value in metrics.items():
        print(f"  {name:12s}: {value:.4f}")

    plot_history(h1, h2)

    val_acc = metrics.get('accuracy', 0)
    if val_acc >= 0.85:
        print(f"\n✓ Great result! accuracy={val_acc:.1%} — model is ready")
    elif val_acc >= 0.75:
        print(f"\n~ Decent ({val_acc:.1%}) — try --epochs 50 to improve further")
    else:
        print(f"\n⚠ Low accuracy ({val_acc:.1%}) — try --epochs 50")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--epochs', type=int, default=30,
                        help='Total training epochs (default: 30)')
    args = parser.parse_args()
    train(args.epochs)