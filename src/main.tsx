
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import { AboutUsPage } from "./pages/AboutUsPage";
import { DeliveryInfoPage } from "./pages/DeliveryInfoPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsConditionsPage } from "./pages/TermsConditionsPage";
import { CartProvider } from "./contexts/CartContext";
import "./index.css";
import "./styles/custom.css";
import "./styles/mobile-responsive.css";
import "./styles/mobile-slideshow.css";
import { initSecurityMonitor } from "./security/monitor";

// Detect base path for XAMPP
const getBasePath = (): string => {
  if (window.location.pathname.includes('/fda/build/')) {
    return '/fda/build';
  }
  return '';
};

const basePath = getBasePath();

// Get API URL for security monitor
const getSecurityReportUrl = (): string => {
  if (window.location.pathname.includes('/fda/')) {
    return '/fda/backend-php/api/security/log';
  }
  return 'http://localhost:5000/api/security/log';
};

initSecurityMonitor({
  reportUrl: getSecurityReportUrl(),
  showToast: true,
});

createRoot(document.getElementById("root")!).render(
  <CartProvider>
    <BrowserRouter basename={basePath}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/delivery-info" element={<DeliveryInfoPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsConditionsPage />} />
      </Routes>
    </BrowserRouter>
  </CartProvider>
);
  