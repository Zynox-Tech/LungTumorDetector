@echo off
echo ============================================
echo  Lung Cancer Detection - Setup
echo ============================================
echo.

:: ── Python dependencies ──────────────────────────────────────────────────────
echo [1/3] Installing Python dependencies...
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install tensorflow==2.15.0 keras>=3.0
pip install fastapi uvicorn python-multipart pillow numpy opencv-python-headless firebase-admin huggingface_hub requests python-dotenv
echo Done.
echo.

:: ── Download models from HuggingFace ─────────────────────────────────────────
echo [2/3] Downloading models from HuggingFace Hub...
python -c ^
"from huggingface_hub import hf_hub_download; import os; ^
os.makedirs('model', exist_ok=True); ^
repo = 'hashammubarak1/lits_tumor_model_fixed'; ^
files = ['lung_classifier_model.pth', 'lung_resnet50_stage1_safe.keras']; ^
[hf_hub_download(repo_id=repo, filename=f, local_dir='model') if not os.path.exists(f'model/{f}') else print(f'{f} already present') for f in files]; ^
print('Models ready.')"
echo.

:: ── Node dependencies ─────────────────────────────────────────────────────────
echo [3/3] Installing Node.js dependencies...
npm install
echo.

echo ============================================
echo  Setup complete!
echo.
echo  To run the project:
echo    Terminal 1:  python main.py
echo    Terminal 2:  npm run dev
echo.
echo  Backend : http://localhost:8000
echo  Frontend: http://localhost:5000
echo  API docs: http://localhost:8000/docs
echo ============================================
pause
