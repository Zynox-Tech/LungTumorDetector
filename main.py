from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import logging
from model.load_model import ModelManager
import firebase_admin
from firebase_admin import credentials, auth
from typing import Optional
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lung Cancer Detection API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# ── Firebase ───────────────────────────────────────────────────────────────
try:
    firebase_key = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
    if firebase_key:
        cred = credentials.Certificate(json.loads(firebase_key))
        firebase_admin.initialize_app(cred)
        logger.info("Firebase initialised")
    else:
        logger.warning("Firebase key not found — auth disabled")
        firebase_admin = None
except Exception as e:
    logger.error(f"Firebase init failed: {e}")
    firebase_admin = None

# ── Model ───────────────────────────────────────────────────────────────────
model_manager = ModelManager()
os.makedirs("static/uploads", exist_ok=True)


async def verify_firebase_token(authorization: Optional[str] = None):
    if not firebase_admin or not authorization:
        return None
    try:
        if authorization.startswith("Bearer "):
            token = authorization.split("Bearer ")[1]
            return auth.verify_id_token(token)
        return None
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        return None


@app.get("/")
async def root():
    return {"message": "Lung Cancer Detection API is running", "status": "healthy"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_status": "loaded" if model_manager.model is not None else "not_loaded",
        "firebase_status": "enabled" if firebase_admin else "disabled",
        "version": "2.0.0",
    }


@app.post("/predict")
async def predict_lung_cancer(
    file: UploadFile = File(...),
    authorization: Optional[str] = None,
):
    """
    Predict lung cancer from an uploaded chest X-ray / CT scan.

    Pipeline:
      1. Auth check
      2. File-type & size validation
      3. Lung-image gating (is_lung_image)
      4. Preprocessing  (224×224, CLAHE, ImageNet normalisation)
      5. Model inference  — ONE sigmoid, no heuristic rewrite
      6. Confidence-band interpretation
    """

    # ── 1. Auth ──────────────────────────────────────────────────────────────
    user_info = await verify_firebase_token(authorization)
    if firebase_admin and not user_info:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")

    # ── 2. File validation ───────────────────────────────────────────────────
    allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/bmp", "image/tiff"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {allowed_types}")

    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")

    try:
        # ── 3. Lung-image gate (ML classifier) ──────────────────────────────
        is_lung, lung_prob = model_manager.is_lung_image(file_content)

        if not is_lung:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "This does not appear to be a chest X-ray or lung CT scan.",
                    "suggestion": "Please upload a valid chest X-ray or CT scan.",
                    "lung_confidence": round(lung_prob * 100, 1),
                },
            )

        # ── 4. Preprocess ────────────────────────────────────────────────────
        processed_image, gray_224 = model_manager.preprocess(file_content)

        # ── 5. Cancer prediction ──────────────────────────────────────────────
        cancer_probability = model_manager.predict(processed_image)

        # ── 5a. Grad-CAM heatmap ──────────────────────────────────────────────
        cam = model_manager.gradcam(processed_image)
        original_image, heatmap_image = model_manager.make_heatmap(gray_224, cam)

        # ── 6. Interpret ─────────────────────────────────────────────────────
        #
        # BUG FIXED: old code applied a second sigmoid here on top of the
        # sigmoid that is already the model's output layer.  Applying sigmoid
        # twice on a value already in [0,1] warps the distribution toward 0.5
        # and makes the threshold meaningless.
        #
        # We also add a REJECTION ZONE: if the model is uncertain (0.35–0.65)
        # we decline to make a clinical call rather than guess.
        #
        THRESHOLD_CANCER = 0.80  
        THRESHOLD_NORMAL = 0.20   
        # between 0.25 and 0.75 → uncertain, ask for better image

        if cancer_probability >= THRESHOLD_CANCER:
            predicted_class = "Cancerous"
            confidence_score = cancer_probability
        elif cancer_probability <= THRESHOLD_NORMAL:
            predicted_class = "Non-Cancerous"
            confidence_score = 1.0 - cancer_probability
        else:
            # Model is uncertain — do NOT make a clinical call
            predicted_class = "Uncertain"
            confidence_score = 1.0 - abs(cancer_probability - 0.5) * 2   # low number

        # Risk level (only meaningful for definitive predictions)
        if cancer_probability >= 0.85:
            risk_level = "High"
        elif cancer_probability >= 0.75:
            risk_level = "Moderate"
        elif cancer_probability <= 0.15:
            risk_level = "Very Low"
        elif cancer_probability <= 0.25:
            risk_level = "Low"
        else:
            risk_level = "Indeterminate"

        user_id = user_info.get("uid", "anonymous") if user_info else "anonymous"
        logger.info(
            f"Prediction [{user_id}]: {predicted_class} | "
            f"prob={cancer_probability:.4f} | risk={risk_level}"
        )

        return {
            "prediction": predicted_class,
            "confidence": round(confidence_score, 4),
            "cancer_probability": round(cancer_probability * 100, 2),
            "non_cancer_probability": round((1 - cancer_probability) * 100, 2),
            "lung_confidence": round(lung_prob * 100, 2),
            "risk_level": risk_level,
            "user_id": user_id if user_info else None,
            "status": "success",
            "original_image": original_image,
            "heatmap_image": heatmap_image,
            "heatmap_error": None if heatmap_image else "Grad-CAM generation failed",
            "medical_advice": _medical_advice(predicted_class, cancer_probability),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")


def _medical_advice(predicted_class: str, prob: float) -> dict:
    if predicted_class == "Cancerous":
        return {
            "recommendation": "Consult a qualified radiologist or oncologist immediately.",
            "urgency": "High — immediate consultation recommended" if prob > 0.80 else "Moderate — schedule consultation soon",
        }
    elif predicted_class == "Non-Cancerous":
        return {
            "recommendation": "Continue regular screening as recommended by your physician.",
            "urgency": "Routine follow-up",
        }
    else:  # Uncertain
        return {
            "recommendation": "The model could not make a confident determination. Please consult a radiologist with the original scan.",
            "urgency": "Please seek professional review",
        }


@app.post("/auth/verify")
async def verify_token(authorization: Optional[str] = None):
    user_info = await verify_firebase_token(authorization)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return {
        "valid": True,
        "user_id": user_info.get("uid"),
        "email": user_info.get("email"),
        "name": user_info.get("name"),
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True, log_level="info")