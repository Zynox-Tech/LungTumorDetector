# Lung Cancer Detection AI System

An advanced medical AI application for lung cancer detection using **Deep Learning, ResNet50 CNN architecture, FastAPI backend, and React frontend**.

The system analyzes medical images using artificial intelligence to assist in lung cancer screening and provides confidence-based predictions through a modern web interface.

---

# Developed By

## Zynox Tech

Website: https://zynoxtech.site  
Email: hello@zynoxtech.site  
Location: Abbottabad, Pakistan

Zynox Tech is a software development company specializing in:

- Artificial Intelligence Solutions
- Machine Learning Applications
- Medical AI Systems
- Web Applications
- Mobile Applications
- Enterprise Software

We build innovative, scalable, and reliable technology solutions that help organizations solve complex real-world problems.

For AI solutions, software development, and technology partnerships:

Website: https://zynoxtech.site  
Email: hello@zynoxtech.site

---

# Project Overview

The **Lung Cancer Detection AI System** is a medical imaging application designed to assist in detecting possible lung cancer patterns from medical images.

The system combines:

- Deep Learning model analysis
- ResNet50 CNN architecture
- Image validation techniques
- FastAPI backend services
- React-based frontend interface
- Firebase authentication

The goal of this project is to demonstrate how artificial intelligence can support medical image analysis workflows.

---

# Features

## Medical Image Validation

- Detects whether uploaded images are relevant medical images
- Rejects unsupported files such as documents or unrelated photos
- Improves prediction reliability

## AI-Based Cancer Detection

- Uses ResNet50 CNN architecture
- Deep learning-powered image analysis
- Confidence-based prediction results
- Real-time analysis workflow

## Secure Authentication

- Firebase Authentication integration
- Secure user login system
- Google sign-in support

## Real-Time Analysis

- Fast image processing
- Prediction confidence scoring
- Professional analysis output

## Medical Recommendations

- Risk assessment information
- AI-generated guidance
- Screening support recommendations

---

# Technology Stack

## Artificial Intelligence

- Python
- TensorFlow
- ResNet50 CNN
- Deep Learning
- Medical Image Processing

## Backend

- FastAPI
- Python
- Uvicorn
- REST API

## Frontend

- React
- JavaScript
- Bootstrap
- Responsive UI

## Authentication & Database

- Firebase Authentication
- Firebase Services

---

# Requirements

Before running this project, install:

- Python 3.10+
- Node.js 18+
- Git
- VS Code
- Firebase Account

Recommended VS Code extensions:

- Python
- JavaScript ES6 Snippets
- React Snippets
- GitLens

---

# Installation Guide

## 1. Clone Repository

```bash
git clone <your-repo-url>

cd LungTumorDetector
```

Open project:

```bash
code .
```

---

# Firebase Setup

## Create Firebase Project

1. Open Firebase Console
2. Create a new project
3. Complete setup wizard

## Enable Authentication

Enable:

- Email/Password Authentication
- Google Authentication

## Add Web Application

Create a web app and copy:

- API Key
- Project ID
- App ID

---

# Environment Configuration

Create:

```
.env
```

Add Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

# Backend Setup

Navigate to backend:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate environment:

### Windows

```bash
venv\Scripts\activate
```

### macOS/Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start backend:

```bash
python main.py
```

Backend will run:

```
http://localhost:8000
```

API documentation:

```
http://localhost:8000/docs
```

---

# Frontend Setup

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend will run:

```
http://localhost:5000
```

---

# Running The Application

## Backend Terminal

```bash
python main.py
```

## Frontend Terminal

```bash
npm run dev
```

Access:

Frontend:

```
http://localhost:5000
```

Backend API:

```
http://localhost:8000
```

---

# Project Structure

```
LungTumorDetector/

├── src/
│   ├── components/
│   ├── config/
│   ├── hooks/
│   ├── services/
│   └── styles/

├── model/
│   └── AI model files

├── utils/
│   └── Image preprocessing utilities

├── static/

├── main.py
│   └── FastAPI backend

├── package.json

├── requirements.txt

├── .env

└── README.md
```

---

# Testing The System

## Authentication Test

1. Open application
2. Create account
3. Login using email or Google authentication

---

## Image Validation Test

Upload an unrelated image.

Expected:

```
This doesn't appear to be a lung/chest X-ray image
```

---

## Cancer Detection Test

Upload:

- Chest X-ray
- Lung CT scan

The system will provide:

- Prediction result
- Confidence score
- Analysis information

---

# Troubleshooting

## Firebase Errors

Check:

- Firebase credentials
- Authentication settings
- Environment variables

---

## Python Errors

Activate environment:

```bash
venv\Scripts\activate
```

Reinstall:

```bash
pip install -r requirements.txt
```

---

## Node Errors

Remove dependencies:

```bash
rm -rf node_modules
```

Install again:

```bash
npm install
```

---

## Port Issues

Default ports:

Frontend:

```
5000
```

Backend:

```
8000
```

---

# Medical Disclaimer

This AI system is developed for educational and research purposes only.

The predictions generated by this application should not be considered a final medical diagnosis.

All medical decisions must be made by qualified healthcare professionals.

---

# Development Notes

- Backend powered by FastAPI
- Frontend built with React
- AI model based on ResNet50 transfer learning
- Image validation improves prediction quality
- Firebase provides secure authentication
- Designed for scalable medical AI applications

---

# Future Improvements

Possible enhancements:

- Larger medical datasets
- Improved model accuracy
- Lung segmentation support
- Medical report generation
- Cloud-based AI inference
- Doctor dashboard integration

---

# License

This project was developed by **Zynox Tech**.

For AI development, medical software, and custom technology solutions:

Zynox Tech  
Website: https://zynoxtech.site  
Email: hello@zynoxtech.site  

---

Developed by **Zynox Tech**  
Abbottabad, Pakistan
