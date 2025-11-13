// EXECUTE IMMEDIATELY - This must run when module loads
console.log('🔥🔥🔥 MAIN.TSX EXECUTING NOW! 🔥🔥🔥');

import { createRoot } from "react-dom/client";
console.log('✅ React imported');
import { BrowserRouter, Routes, Route } from "react-router-dom";
console.log('✅ Router imported');
import App from "./App.tsx";
console.log('✅ App imported');
import { AboutUsPage } from "./pages/AboutUsPage";
import { DeliveryInfoPage } from "./pages/DeliveryInfoPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsConditionsPage } from "./pages/TermsConditionsPage";
import { CartProvider } from "./contexts/CartContext";
console.log('✅ All imports done');
import "./index.css";
import "./styles/custom.css";
import "./styles/mobile-responsive.css";
import "./styles/mobile-slideshow.css";
console.log('✅ Styles imported');

// Detect base path for XAMPP
const getBasePath = (): string => {
  if (window.location.pathname.includes('/fda/')) {
    return '/fda';
  }
  return '';
};

const basePath = getBasePath();

// Mount React app
console.log('🔍 Starting mount process...');
console.log('Base path:', basePath);

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error("Root element not found");
}

console.log('✅ Root element found');
console.log('🔍 Creating React root...');

const root = createRoot(rootElement);
console.log('✅ React root created');
console.log('🔍 Rendering app...');

try {
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
  console.log('✅✅✅ APP RENDERED SUCCESSFULLY! ✅✅✅');
} catch (error) {
  console.error('❌❌❌ RENDER ERROR:', error);
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  rootElement.innerHTML = `
    <div style="padding: 20px; background: #f8d7da; border: 2px solid red; color: #721c24; font-family: monospace;">
      <h1>❌ React Render Error</h1>
      <p><strong>Error:</strong> ${errorMsg}</p>
      ${errorStack ? `<pre style="background: #f5f5f5; padding: 10px; overflow: auto; font-size: 12px;">${errorStack}</pre>` : ''}
      <p>Check browser console (F12) for more details.</p>
    </div>
  `;
  throw error;
}
