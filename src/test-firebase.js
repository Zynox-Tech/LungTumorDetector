// Firebase configuration test
console.log('Testing Firebase configuration...');
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing');
console.log('App ID:', import.meta.env.VITE_FIREBASE_APP_ID ? 'Set' : 'Missing');
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Missing');

import { auth } from './config/firebase.js';
console.log('Firebase Auth initialized:', !!auth);
console.log('Current user:', auth.currentUser);