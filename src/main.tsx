
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import { AboutUsPage } from "./pages/AboutUsPage";
import { DeliveryInfoPage } from "./pages/DeliveryInfoPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsConditionsPage } from "./pages/TermsConditionsPage";
import "./index.css";
import "./styles/custom.css";
import "./styles/mobile-responsive.css";
import "./styles/mobile-slideshow.css";
import { initSecurityMonitor } from "./security/monitor";

initSecurityMonitor({
  reportUrl: "http://localhost:5000/api/security/log",
  showToast: true,
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/delivery-info" element={<DeliveryInfoPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsConditionsPage />} />
    </Routes>
  </BrowserRouter>
);
  