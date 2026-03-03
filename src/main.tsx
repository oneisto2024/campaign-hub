import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Purge old cache keys from previous broken logic (holidays_v1 / holidays-abstract*)
(function purgeOldHolidayCache() {
  const toDelete: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith('holidays_v1_') || k.startsWith('holidays-abstract'))) {
      toDelete.push(k);
    }
  }
  toDelete.forEach((k) => localStorage.removeItem(k));
})();

createRoot(document.getElementById("root")!).render(<App />);
