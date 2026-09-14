
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
 
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTUr0TayQbS_-j4FYXfZhnuJxr9HCNODo",
  authDomain: "annuity-valt.firebaseapp.com",
  projectId: "annuity-valt",
  storageBucket: "annuity-valt.firebasestorage.app",
  messagingSenderId: "534879208435",
  appId: "1:534879208435:web:da60a3c47c6f07d43e4886"
};
 
let messaging: ReturnType<typeof getMessaging>;

if (typeof window !== "undefined" && "navigator" in window) {
  const app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
}

export { messaging, getToken, onMessage };