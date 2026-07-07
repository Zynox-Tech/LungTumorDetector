#!/usr/bin/env python3
"""
Test script to demonstrate the enhanced lung cancer detection system
"""

import numpy as np
from PIL import Image
import io
import requests
import json

def create_test_images():
    """Create test images to demonstrate validation"""
    
    # 1. Create a white/empty page image (should be rejected)
    white_image = Image.new('RGB', (400, 600), color='white')
    white_bytes = io.BytesIO()
    white_image.save(white_bytes, format='PNG')
    white_bytes.seek(0)
    
    # 2. Create a realistic chest X-ray-like image (should be accepted)
    # This simulates the gray-scale intensity distribution of a chest X-ray
    chest_array = np.random.normal(120, 40, (600, 400))  # Medical imaging intensity range
    
    # Add some anatomical-like structures
    # Simulate rib shadows
    for i in range(5):
        y_pos = 100 + i * 80
        chest_array[y_pos:y_pos+5, :] *= 0.7  # Darker ribs
    
    # Simulate lung fields (brighter areas)
    chest_array[150:450, 50:180] *= 1.3   # Left lung
    chest_array[150:450, 220:350] *= 1.3  # Right lung
    
    # Clip values to valid range
    chest_array = np.clip(chest_array, 0, 255).astype(np.uint8)
    
    # Convert to RGB
    chest_rgb = np.stack([chest_array, chest_array, chest_array], axis=2)
    chest_image = Image.fromarray(chest_rgb)
    
    chest_bytes = io.BytesIO()
    chest_image.save(chest_bytes, format='PNG')
    chest_bytes.seek(0)
    
    return white_bytes, chest_bytes

def test_api_validation():
    """Test the API with different image types"""
    
    print("Creating test images...")
    white_img, chest_img = create_test_images()
    
    # Test 1: Empty/white page (should fail)
    print("\n1. Testing white/empty page image:")
    try:
        response = requests.post(
            'http://localhost:8000/predict',
            files={'file': ('white.png', white_img.getvalue(), 'image/png')},
            timeout=30
        )
        if response.status_code == 400:
            error_data = response.json()
            print(f"✓ Correctly rejected: {error_data['detail']['error']}")
        else:
            print(f"✗ Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"✗ Request failed: {e}")
    
    # Test 2: Chest X-ray-like image (should pass)
    print("\n2. Testing simulated chest X-ray:")
    try:
        response = requests.post(
            'http://localhost:8000/predict',
            files={'file': ('chest.png', chest_img.getvalue(), 'image/png')},
            timeout=30
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Analysis completed:")
            print(f"  Prediction: {result['prediction']}")
            print(f"  Confidence: {result['confidence']:.1%}")
            print(f"  Risk Level: {result['risk_level']}")
            print(f"  Validation: {result['lung_validation']['confidence']:.1%}")
        else:
            print(f"✗ Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"✗ Request failed: {e}")

if __name__ == "__main__":
    test_api_validation()