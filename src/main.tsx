import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  onRegistered(r) {
    console.log("Service Worker registered:", r);
  },
  onRegisterError(error) {
    console.log("SW registration error:", error);
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
