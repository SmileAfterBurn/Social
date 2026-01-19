
import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "social-service-map-ua.firebaseapp.com",
  projectId: "social-service-map-ua",
  storageBucket: "social-service-map-ua.firebasestorage.app",
  messagingSenderId: "89123456789",
  appId: "1:89123456789:web:abcdef123456789"
};

// Singleton initialization for Firebase App
let app: any;
try {
  if (firebaseConfig.apiKey) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
} catch (e) {
  console.error("Firebase App initialization failed", e);
}

// Global variable for appCheck instance
let appCheck: any = null;

const initAppCheck = async () => {
  if (typeof window !== 'undefined' && app) {
    try {
      const appCheckModule: any = await import('firebase/app-check');
      const initializeAppCheck = appCheckModule.initializeAppCheck;
      const ReCaptchaEnterpriseProvider = appCheckModule.ReCaptchaEnterpriseProvider;
      
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider('6LcVm6EqAAAAAabcdefghijklmnopqrstuvwxyz'), 
        isTokenAutoRefreshEnabled: true,
      });
    } catch (error) {
      console.warn('Firebase App Check notice:', error);
    }
  }
};

if (typeof window !== 'undefined') {
  initAppCheck();
}

export { app, appCheck };
