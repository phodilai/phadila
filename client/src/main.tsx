import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for Firebase messaging
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered successfully:', registration);
    })
    .catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
}

createRoot(document.getElementById("root")!).render(<App />);
