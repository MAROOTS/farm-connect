import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { useThemeStore } from "./store/themeStore";


const savedTheme = JSON.parse(
  localStorage.getItem("agriconnect-theme") ?? "{}",
);
if (savedTheme?.state?.isDark) {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
