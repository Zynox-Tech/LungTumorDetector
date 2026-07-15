# Lung Cancer Detection AI System

An advanced **medical AI application for lung cancer detection** powered by Deep Learning, the ResNet50 CNN architecture, FastAPI, and React.

The system analyzes medical images using artificial intelligence to assist with lung cancer screening and provides confidence-based predictions through a modern web interface.

> **Important:** This application is developed for educational and research purposes and is not a replacement for professional medical diagnosis.

---

# Developed By

## Zynox Tech

**Website:** https://zynoxtech.site
**Email:** [hello@zynoxtech.site](mailto:hello@zynoxtech.site)
**Location:** Abbottabad, Pakistan

Zynox Tech is a software development company specializing in:

* Artificial Intelligence Solutions
* Machine Learning Applications
* Medical AI Systems
* Web Applications
* Mobile Applications
* Enterprise Software
* Custom Digital Products

We build innovative, scalable, and reliable technology solutions designed to solve complex real-world problems.

For AI solutions, software development, and technology partnerships:

**Website:** https://zynoxtech.site
**Email:** [hello@zynoxtech.site](mailto:hello@zynoxtech.site)

---

# Project Overview

The **Lung Cancer Detection AI System** is a medical imaging application designed to assist in identifying possible lung cancer patterns from supported medical images.

The system combines:

* Deep Learning model analysis
* ResNet50 CNN architecture
* Medical image validation
* FastAPI backend services
* React-based frontend interface
* Firebase authentication
* Confidence-based AI predictions

The project demonstrates how artificial intelligence and modern web technologies can be integrated into a medical image analysis workflow.

---

# Main Features

## Medical Image Validation

The system validates uploaded images before sending them through the prediction workflow.

Features include:

* Medical image relevance checking
* Unsupported image detection
* Unrelated image rejection
* Input validation before AI analysis

This helps reduce invalid prediction requests and improves the overall analysis workflow.

---

## AI-Based Lung Cancer Detection

The artificial intelligence model uses the **ResNet50 CNN architecture** for medical image analysis.

The AI workflow includes:

* Image preprocessing
* Deep learning inference
* CNN-based image feature analysis
* Prediction generation
* Confidence score calculation
* Structured result presentation

---

## Secure Authentication

Firebase Authentication provides user authentication functionality.

Authentication features include:

* User registration
* Email and password authentication
* Secure login
* Google Sign-In support
* Firebase-based authentication services

---

## Real-Time Analysis

The application provides a streamlined image analysis workflow.

Users can:

* Upload supported medical images
* Submit images for AI analysis
* Receive prediction results
* View confidence scores
* Review analysis information

---

## Screening Support Information

The system presents prediction results alongside supporting information intended for educational and research use.

The application may provide:

* Prediction information
* Confidence scoring
* Risk-related information
* General screening guidance

AI-generated output should always be reviewed by qualified healthcare professionals.

---

# Application Screenshots

Explore the authentication interface, medical image analysis workflow, and AI prediction experience.

## Authentication and Medical Analysis

<p align="center">
  <img src="https://github.com/user-attachments/assets/47c8c1d1-1b86-4769-9ea6-660b11becf81" alt="Lung Cancer Detection Login Interface" width="46%" />
  &nbsp;&nbsp;
  <img src="https://github.com/user-attachments/assets/92776c3d-4208-47cd-9e01-65080bd3d9a7" alt="Lung Cancer Detection AI Analysis Interface" width="46%" />
</p>

## AI Prediction and Analysis Results

<p align="center">
  <img src="https://github.com/user-attachments/assets/b7635a84-7e45-4bb3-a76f-51d68cb23e4d" alt="Lung Cancer Detection Prediction Results" width="72%" />
</p>

---

# Technology Stack

## Artificial Intelligence

* Python
* TensorFlow
* ResNet50 CNN
* Deep Learning
* Transfer Learning
* Medical Image Processing

## Backend

* FastAPI
* Python
* Uvicorn
* REST API

## Frontend

* React
* JavaScript
* Bootstrap
* Responsive Web Interface

## Authentication and Cloud Services

* Firebase Authentication
* Firebase Services
* Google Authentication

---

# System Architecture

The application follows a modern AI-powered web application architecture.

```text
React Frontend
      ↓
Medical Image Upload
      ↓
FastAPI Backend
      ↓
Image Validation & Preprocessing
      ↓
ResNet50 Deep Learning Model
      ↓
AI Prediction & Confidence Score
      ↓
Structured Analysis Result
```

Firebase Authentication manages user access independently from the AI prediction workflow.

---

# AI Analysis Workflow

The medical image analysis process follows these steps:

```text
Medical Image
      ↓
Image Validation
      ↓
Image Preprocessing
      ↓
ResNet50 CNN Model
      ↓
Deep Learning Inference
      ↓
Prediction Classification
      ↓
Confidence Score
      ↓
Analysis Result
```

This structured workflow separates image validation, preprocessing, AI inference, and result presentation.

---

# Requirements

Before running this project, install:

* Python 3.10 or newer
* Node.js 18 or newer
* npm
* Git
* Visual Studio Code or another development environment
* Firebase account

Check Python:

```bash
python --version
```

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

# Clone the Repository

Clone the project using Git:

```bash
git clone https://github.com/Zynox-Tech/LungTumorDetector.git
```

Navigate into the project directory:

```bash
cd LungTumorDetector
```

Open the project in Visual Studio Code:

```bash
code .
```

---

# Firebase Setup

## 1. Create a Firebase Project

Open the Firebase Console and create a new project.

Complete the Firebase project configuration process.

---

## 2. Enable Authentication

Inside Firebase Authentication, enable:

* Email/Password Authentication
* Google Authentication

---

## 3. Add a Web Application

Create a Firebase Web Application and retrieve the required configuration values.

These may include:

* API Key
* Project ID
* App ID
* Authentication Domain

---

# Environment Configuration

Create an environment file:

```text
.env
```

Add the required Firebase configuration values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

Additional Firebase configuration variables may be required depending on the implementation.

> Never commit private credentials, API secrets, or sensitive environment variables to a public GitHub repository.

---

# Backend Setup

Navigate to the backend project directory if the backend is stored in a separate folder:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### macOS and Linux

```bash
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI backend:

```bash
python main.py
```

The backend runs by default at:

```text
http://localhost:8000
```

FastAPI API documentation is available at:

```text
http://localhost:8000/docs
```

---

# Frontend Setup

Navigate to the frontend project directory.

Install Node.js dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend is configured to run locally on the application's development port.

If configured for port `5000`, access:

```text
http://localhost:5000
```

Check the terminal output after running `npm run dev` for the exact development URL.

---

# Running the Application

The frontend and backend should run simultaneously.

## Backend Terminal

Activate the Python environment and run:

```bash
python main.py
```

## Frontend Terminal

Run:

```bash
npm run dev
```

The frontend communicates with the FastAPI backend to submit medical images and retrieve AI prediction results.

---

# Project Structure

```text
LungTumorDetector/

├── src/
│   ├── components/
│   │   └── Reusable React components
│   │
│   ├── config/
│   │   └── Application configuration
│   │
│   ├── hooks/
│   │   └── React hooks
│   │
│   ├── services/
│   │   └── API and application services
│   │
│   └── styles/
│       └── Application styling
│
├── model/
│   └── Deep learning model files
│
├── utils/
│   └── Image preprocessing utilities
│
├── static/
│   └── Static application assets
│
├── main.py
│   └── FastAPI backend and AI inference
│
├── package.json
│   └── Frontend dependencies and scripts
│
├── requirements.txt
│   └── Python dependencies
│
├── .env
│   └── Environment configuration
│
└── README.md
```

---

# Testing the System

## Authentication Test

1. Open the application.
2. Create a user account.
3. Log in using email and password.
4. Test Google authentication if configured.

---

## Image Validation Test

Upload an unrelated or unsupported image.

The application should reject the image before AI analysis.

An example validation response may be:

```text
This doesn't appear to be a lung/chest X-ray image.
```

---

## AI Detection Test

Upload a supported medical image such as a compatible lung or chest scan used by the trained model.

The system processes the image and may provide:

* Prediction classification
* Confidence score
* Analysis information
* Screening support information

The output must not be interpreted as a final clinical diagnosis.

---

# Troubleshooting

## Firebase Authentication Errors

Verify:

* Firebase configuration values
* Authentication provider settings
* Environment variables
* Google Sign-In configuration

---

## Python Dependency Errors

Activate the Python environment:

```bash
venv\Scripts\activate
```

Reinstall dependencies:

```bash
pip install -r requirements.txt
```

---

## Node.js Dependency Errors

Remove existing dependencies:

```bash
rm -rf node_modules
```

Install the dependencies again:

```bash
npm install
```

On Windows PowerShell, you can use:

```powershell
Remove-Item -Recurse -Force node_modules
```

Then run:

```bash
npm install
```

---

## Backend Connection Issues

Verify that the FastAPI backend is running.

Default backend address:

```text
http://localhost:8000
```

Check the API documentation:

```text
http://localhost:8000/docs
```

---

# Medical Disclaimer

This artificial intelligence system is developed strictly for **educational, research, and software demonstration purposes**.

The predictions, confidence scores, risk information, and AI-generated output produced by this application must **not be considered a final medical diagnosis or professional medical advice**.

The system may produce inaccurate, incomplete, or incorrect predictions.

All medical screening, diagnosis, treatment, and healthcare decisions must be performed by qualified healthcare professionals using validated clinical procedures and approved medical systems.

**Zynox Tech does not recommend using this application as a standalone clinical diagnostic system.**

---

# Development Notes

* Backend powered by FastAPI
* Frontend developed using React
* AI model based on ResNet50 transfer learning
* CNN architecture used for image analysis
* Medical image validation improves input control
* Firebase provides authentication services
* Confidence-based AI predictions are displayed
* Designed as a scalable medical AI demonstration application

---

# Future Improvements

Possible future enhancements include:

* Larger and more diverse medical datasets
* Improved model validation and accuracy
* Lung segmentation support
* Explainable AI visualization
* Medical report generation
* Cloud-based AI inference
* Doctor dashboard integration
* Patient case management
* Model performance monitoring
* DICOM image support
* Clinical validation workflows
* Advanced medical image preprocessing

---

# License

This project was developed by **Zynox Tech** for artificial intelligence research, educational use, and software demonstration purposes.

Review the repository licensing terms before redistribution, modification, or commercial use.

---

# About Zynox Tech

Zynox Tech develops modern and scalable technology solutions for businesses and organizations.

Our services include:

* Artificial Intelligence Solutions
* Machine Learning Applications
* Medical AI Systems
* Custom Web Applications
* Mobile Applications
* Enterprise Software
* Business Automation Systems
* Custom Digital Products

We focus on building innovative, reliable, and scalable technology solutions designed to solve real-world challenges.

For AI development, custom software solutions, and technology partnerships:

**Website:** https://zynoxtech.site
**Email:** [hello@zynoxtech.site](mailto:hello@zynoxtech.site)
**Location:** Abbottabad, Pakistan

---

<div align="center">

### Developed by **Zynox Tech**

**Building Intelligent Technology Solutions for Real-World Challenges**

</div>
