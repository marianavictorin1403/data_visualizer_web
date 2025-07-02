import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHDaMD45VPMApJb7EWGI9naaNTHEyN2Xo",
  authDomain: "india-map-visualiser.firebaseapp.com",
  projectId: "india-map-visualiser",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
