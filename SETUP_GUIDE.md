# VS Code Setup Guide - Lung Cancer Detection AI

## Quick Start for VS Code

### 1. Prerequisites Installation

**Install Required Software:**
```bash
# Download and install:
- Python 3.10+ from python.org
- Node.js 18+ from nodejs.org
- Git from git-scm.com
- VS Code from code.visualstudio.com
```

### 2. Clone Project in VS Code

```bash
# Open VS Code terminal (Ctrl+`)
git clone <your-repository-url>
cd lung-cancer-detection
code .
```

### 3. VS Code Extensions Setup

**Install these extensions in VS Code:**
- Python (Microsoft)
- JavaScript (ES6) code snippets
- React snippets
- Auto Rename Tag

**Install extensions via VS Code:**
1. Press `Ctrl+Shift+X`
2. Search for each extension above
3. Click "Install"

### 4. Firebase Configuration

**Create Firebase Project:**
1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Enable Authentication → Email/password + Google sign-in
4. Add Web App (</> icon)
5. Copy these values from Firebase config:
   - apiKey
   - projectId
   - appId

**Create .env file in VS Code:**
```bash
# In VS Code terminal
touch .env
```

**Add to .env file:**
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 5. Python Backend Setup

**In VS Code Terminal 1:**
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn tensorflow opencv-python pillow numpy scipy python-multipart python-jose passlib firebase-admin

# Start backend
python main.py
```

**You should see:**
```
INFO: Uvicorn running on http://0.0.0.0:8000
```

### 6. React Frontend Setup

**Open new VS Code Terminal 2:**
```bash
# Install Node.js dependencies
npm install

# Start frontend
npm run dev
```

**You should see:**
```
Local: http://localhost:5000/
```

### 7. VS Code Configuration

**Create .vscode/settings.json:**
```json
{
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

**Create .vscode/launch.json for debugging:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "program": "main.py",
      "console": "integratedTerminal"
    }
  ]
}
```

## Running the Application

### Daily Development Workflow

**Step 1: Open VS Code to project folder**
```bash
code /path/to/lung-cancer-detection
```

**Step 2: Start Backend (Terminal 1)**
```bash
# Activate Python environment
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Start server
python main.py
```

**Step 3: Start Frontend (Terminal 2)**
```bash
npm run dev
```

**Step 4: Access Application**
- Frontend: http://localhost:5000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### VS Code Debugging

**Debug Backend:**
1. Press `F5` in VS Code
2. Select "Python: FastAPI"
3. Set breakpoints in Python files

**Debug Frontend:**
1. Use browser developer tools
2. Console logs available in VS Code terminal

## Testing the System

### 1. Authentication Test
- Navigate to http://localhost:5000
- Register new account or sign in
- Verify Firebase authentication works

### 2. Image Validation Test
- Upload non-medical image (document, photo)
- Should see error: "This doesn't appear to be a lung/chest X-ray image"

### 3. Cancer Detection Test
- Upload chest X-ray or lung CT scan
- Should receive analysis with confidence scores and medical recommendations

## Troubleshooting

### Python Issues
```bash
# Check Python version
python --version

# Reinstall packages
pip uninstall -r requirements.txt -y
pip install fastapi uvicorn tensorflow opencv-python pillow numpy scipy python-multipart python-jose passlib firebase-admin

# Check if virtual environment is active
which python  # Should show venv path
```

### Node.js Issues
```bash
# Check Node version
node --version

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port conflicts
netstat -an | grep 5000
```

### Firebase Issues
```bash
# Verify .env file exists and has correct values
cat .env

# Test Firebase config in browser console at localhost:5000
# Should see Firebase config object in console
```

### Common VS Code Problems

**Python interpreter not found:**
1. Press `Ctrl+Shift+P`
2. Type "Python: Select Interpreter"
3. Choose the venv/bin/python path

**Import errors:**
1. Ensure virtual environment is activated
2. Restart VS Code
3. Check Python interpreter path

**Port already in use:**
```bash
# Kill processes on ports
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

## Development Tips

### VS Code Shortcuts
- `Ctrl+`` - Toggle terminal
- `Ctrl+Shift+`` - New terminal
- `F5` - Start debugging
- `Ctrl+C` - Stop server in terminal

### File Structure
```
lung-cancer-detection/
├── src/              # React frontend
├── model/            # AI model files
├── utils/            # Image processing
├── main.py          # FastAPI backend
├── .env             # Environment variables
├── package.json     # Frontend dependencies
└── .vscode/         # VS Code settings
```

### Environment Variables
- Backend uses port 8000
- Frontend uses port 5000  
- All Firebase credentials in .env file
- Never commit .env to git

This setup provides a complete development environment for the lung cancer detection AI system in VS Code.