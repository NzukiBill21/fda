
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

// Initialize security monitor with error handling
try {
  initSecurityMonitor({
    reportUrl: getSecurityReportUrl(),
    showToast: false, // Disable toasts during init
  });
} catch (error) {
  console.warn('Security monitor init failed:', error);
}

// Mount React app with error handling
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: Root element not found</h1><p>Please check if index.html has &lt;div id="root"&gt;&lt;/div&gt;</p></div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
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
    console.log('React app mounted successfully!');
  } catch (error) {
    console.error('Failed to mount React app:', error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h1>Error Loading App</h1><p>${error}</p><p>Check console for details.</p></div>`;
  }
}
  