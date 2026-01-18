// 100 Pushups Tracker - Main Entry Point

const app = document.getElementById("app");

if (app) {
  app.innerHTML = "<h1>100 Pushups</h1><p>App coming soon...</p>";
}

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}
