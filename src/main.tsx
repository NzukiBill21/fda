
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/custom.css";
import "./styles/mobile-responsive.css";
import "./styles/mobile-slideshow.css";
import { initSecurityMonitor } from "./security/monitor";

initSecurityMonitor({
  reportUrl: "http://localhost:5000/api/security/log",
  showToast: true,
});

createRoot(document.getElementById("root")!).render(<App />);
  