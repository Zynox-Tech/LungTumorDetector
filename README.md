# Lung Cancer Detection AI System

A professional medical AI application for lung cancer detection using ResNet50 CNN architecture with React frontend and FastAPI backend.

## 🏥 Features

- **Professional Medical Image Validation**: Rejects non-medical images (empty pages, documents, etc.)
- **Advanced Cancer Detection**: ResNet50 + CNN with realistic medical analysis
- **Firebase Authentication**: Secure user authentication system
- **Real-time Analysis**: Fast lung cancer prediction with confidence scoring
- **Medical Recommendations**: Professional medical advice and risk assessment

## 📋 Prerequisites

Before running this project, ensure you have:

- **Python 3.10+** installed
- **Node.js 18+** installed
- **Git** installed
- **VS Code** with Python and JavaScript extensions
- **Firebase project** set up (instructions below)

## 🚀 Step-by-Step Setup Guide

### Step 1: Clone and Open Project

```bash
# Clone the repository
git clone <your-repo-url>
cd lung-cancer-detection

# Open in VS Code
code .
```

### Step 2: Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Authentication**:
   - In Firebase Console, go to Authentication
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/password" method
   - Enable "Google" sign-in method

3. **Add Web App**:
   - In Firebase Console, click "Add app" (</> Web icon)
   - Register your app with a name
   - Copy the Firebase configuration object

4. **Get Firebase Credentials**:
   - From the Firebase config object, note down:
     - `apiKey`
     - `projectId` 
     - `appId`

### Step 3: Environment Configuration

1. **Create Environment File**:
   ```bash
   # In VS Code terminal, create .env file
   touch .env
   ```

2. **Add Firebase Configuration**:
   ```env
   # Add to .env file
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```

### Step 4: Python Backend Setup

1. **Create Python Virtual Environment**:
   ```bash
   # In VS Code terminal
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   
   # If requirements.txt doesn't exist, install manually:
   pip install fastapi uvicorn tensorflow opencv-python pillow numpy scipy python-multipart python-jose passlib firebase-admin
   ```

3. **Test Backend**:
   ```bash
   # Start the FastAPI backend
   python main.py
   
   # Should see: "Uvicorn running on http://0.0.0.0:8000"
   ```

### Step 5: Frontend Setup

1. **Install Node.js Dependencies**:
   ```bash
   # In a new VS Code terminal
   npm install
   
   # If package.json doesn't exist, install manually:
   npm install vite react react-dom react-router-dom axios bootstrap react-bootstrap firebase @vitejs/plugin-react
   ```

2. **Start Frontend Development Server**:
   ```bash
   npm run dev
   
   # Should see: "Local: http://localhost:5000/"
   ```

### Step 6: VS Code Configuration

1. **Install Recommended Extensions**:
   - Python (Microsoft)
   - JavaScript (ES6) code snippets
   - React snippets
   - Auto Rename Tag
   - Bracket Pair Colorizer
   - GitLens

2. **Configure VS Code Settings**:
   ```json
   // .vscode/settings.json
   {
     "python.defaultInterpreterPath": "./venv/bin/python",
     "python.terminal.activateEnvironment": true,
     "emmet.includeLanguages": {
       "javascript": "javascriptreact"
     }
   }
   ```

3. **Create Launch Configuration**:
   ```json
   // .vscode/launch.json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Python: FastAPI",
         "type": "python",
         "request": "launch",
         "program": "main.py",
         "console": "integratedTerminal",
         "cwd": "${workspaceFolder}"
       }
     ]
   }
   ```

## 🔧 Running the Project

### Method 1: VS Code Integrated Terminals

1. **Terminal 1 - Backend**:
   ```bash
   # Activate Python environment
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   
   # Start backend server
   python main.py
   ```

2. **Terminal 2 - Frontend**:
   ```bash
   # Start frontend development server
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Method 2: VS Code Debug Mode

1. **Start Backend in Debug Mode**:
   - Press `F5` or go to Run > Start Debugging
   - Select "Python: FastAPI" configuration

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
lung-cancer-detection/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── config/            # Firebase configuration
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   └── styles/            # CSS styles
├── model/                 # AI model files
├── utils/                 # Preprocessing utilities
├── static/                # Static files
├── main.py               # FastAPI backend
├── package.json          # Frontend dependencies
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables
└── README.md            # This file
```

## 🧪 Testing the System

1. **Register/Login**:
   - Go to http://localhost:5000
   - Create account or sign in with Google

2. **Test Image Validation**:
   - Upload a non-medical image (document, photo, etc.)
   - Should see: "This doesn't appear to be a lung/chest X-ray image"

3. **Test Cancer Detection**:
   - Upload a chest X-ray or lung CT scan
   - Should receive detailed analysis with confidence scores

## 🔍 Troubleshooting

### Common Issues:

1. **Firebase Authentication Errors**:
   - Verify Firebase credentials in `.env`
   - Check Firebase console for enabled auth methods

2. **Python Import Errors**:
   - Ensure virtual environment is activated
   - Reinstall packages: `pip install -r requirements.txt`

3. **Node.js Module Errors**:
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **Port Conflicts**:
   - Backend uses port 8000
   - Frontend uses port 5000
   - Change ports in configuration if needed

### Debug Commands:

```bash
# Check Python environment
python --version
pip list

# Check Node.js environment
node --version
npm list

# Test API endpoint
curl http://localhost:8000/health

# Check Firebase connection
# Upload test image through frontend
```

## 🏥 Medical Disclaimer

This AI system is for educational and screening purposes only. All results must be interpreted by qualified healthcare professionals. Never use for final medical diagnosis without proper medical consultation.

## 📝 Development Notes

- Backend runs on FastAPI with automatic API documentation
- Frontend uses React with Bootstrap for responsive design
- AI model uses ResNet50 with transfer learning
- Image validation prevents non-medical image analysis
- Authentication required for all medical analysis requests

## 🔗 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TensorFlow Documentation](https://www.tensorflow.org/)