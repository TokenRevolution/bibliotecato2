import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBPqEFj1U4j1uS4Upaehj_2Aym-wPj--Co",
  authDomain: "biblioteca-6e185.firebaseapp.com",
  projectId: "biblioteca-6e185",
  storageBucket: "biblioteca-6e185.appspot.com",
  messagingSenderId: "23059798224",
  appId: "1:23059798224:web:aba027e89d43b5e1cb26d5",
  measurementId: "G-P04RCJK3BX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Impostazione della persistenza della sessione
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // La persistenza della sessione è stata impostata con successo
  })
  .catch((error) => {
    // Gestire gli errori qui
    console.error('Errore durante l\'impostazione della persistenza della sessione:', error);
  });

export { auth, firestore };
