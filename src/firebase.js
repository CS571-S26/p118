// Import the functions you need from the SDKs you need
import { initializeApp, getFirestore} from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBc5ZR_yruu8HBst2pkTd_AS_7Uz7XfaEw",
  authDomain: "runrouter-d63f4.firebaseapp.com",
  projectId: "runrouter-d63f4",
  storageBucket: "runrouter-d63f4.firebasestorage.app",
  messagingSenderId: "511867440810",
  appId: "1:511867440810:web:abf3ad8457b13d37d38ad3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);