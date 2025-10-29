import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC8mwJ_0cp8S_p4ph2oxGEwZm-JBqhrZrg",
    authDomain: "forajido-music.firebaseapp.com",
    projectId: "forajido-music",
    storageBucket: "forajido-music.firebasestorage.app",
    messagingSenderId: "1092453636915",
    appId: "1:1092453636915:web:08a2b152246e85c39afc46"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  console.warn("Persistencia no habilitada:", err.code);
});
export { db };
