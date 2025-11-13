// Ultra-simple test - bypass all imports
console.log('🚀 SIMPLE main.tsx executing...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-size: 24px;"><h1>ERROR: Root element not found</h1></div>';
} else {
  console.log('✅ Root element found');
  
  // Try to import React dynamically
  import('react-dom/client').then(({ createRoot }) => {
    console.log('✅ React imported successfully');
    try {
      const root = createRoot(rootElement);
      root.render(
        <div style={{ padding: '20px', backgroundColor: 'red', color: 'white', fontSize: '24px' }}>
          <h1>✅ REACT IS WORKING!</h1>
          <p>If you see this, React mounted successfully.</p>
        </div>
      );
      console.log('✅ React rendered successfully!');
    } catch (renderError) {
      console.error('❌ React render error:', renderError);
      rootElement.innerHTML = `<div style="padding: 20px; color: red; font-size: 20px;"><h1>React Render Error</h1><p>${renderError}</p></div>`;
    }
  }).catch((importError) => {
    console.error('❌ Failed to import React:', importError);
    rootElement.innerHTML = `<div style="padding: 20px; color: red; font-size: 20px;"><h1>React Import Error</h1><p>${importError}</p></div>`;
  });
}

