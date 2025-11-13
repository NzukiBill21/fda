
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import "./styles/custom.css";
import "./styles/mobile-responsive.css";
import "./styles/mobile-slideshow.css";
import { initSecurityMonitor } from "./security/monitor";
import { createApiUrl } from "./config/api";

// Clean up old service workers to prevent runtime errors
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => {
      reg.unregister().catch(err => console.log('Service worker unregister error:', err));
    });
  });
}

// Detect base path for XAMPP
const getBasePath = (): string => {
  if (window.location.pathname.includes('/Food-Delivery-App/')) {
    return '/Food-Delivery-App';
  }
  return '';
};

const basePath = getBasePath();

// Initialize security monitor with dynamic URL
initSecurityMonitor({
  reportUrl: createApiUrl('api/security/log'),
  showToast: true,
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(
  <BrowserRouter basename={basePath}>
    <App />
  </BrowserRouter>
);
  }

const root = createRoot(rootElement);
root.render(
  <BrowserRouter basename={basePath}>
    <App />
  </BrowserRouter>
);
  
