// Script to update all hardcoded localhost URLs to use API config
const fs = require('fs');
const path = require('path');

const API_CONFIG_PATH = './src/config/api.ts';
const API_IMPORT = "import { API_URL, createApiUrl } from '@/config/api';";

// Files to update
const filesToUpdate = [
  'src/components/MenuEditor.tsx',
  'src/components/MenuSection.tsx',
  'src/components/DeliveryDashboard.tsx',
  'src/components/OrdersDashboard.tsx',
  'src/components/AdminDashboard.tsx',
  'src/components/SuperAdminDashboard.tsx',
  'src/components/SecurityCenter.tsx',
  'src/main.tsx',
  'src/App.tsx',
  'src/components/DeliveryConfirmationDialog.tsx',
  'src/components/DeliveryTracker.tsx',
  'src/components/CatererDashboard.tsx',
  'src/components/OrderTracker.tsx',
  'src/components/OrderSummary.tsx',
  'src/utils/realtime.ts',
  'src/components/AuthDialog.tsx',
  'src/components/BackendStatus.tsx',
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Replace http://localhost:5000 with API_URL
    if (content.includes('http://localhost:5000')) {
      // Add import if not present
      if (!content.includes("from '@/config/api'") && !content.includes("from './config/api'")) {
        // Find the last import statement
        const importMatch = content.match(/(import\s+.*?from\s+['"].*?['"];?\s*\n)/g);
        if (importMatch) {
          const lastImport = importMatch[importMatch.length - 1];
          const lastImportIndex = content.lastIndexOf(lastImport);
          const insertIndex = lastImportIndex + lastImport.length;
          content = content.slice(0, insertIndex) + API_IMPORT + '\n' + content.slice(insertIndex);
          updated = true;
        }
      }

      // Replace URLs
      content = content.replace(/http:\/\/localhost:5000/g, '${API_URL}');
      content = content.replace(/\$\{API_URL\}/g, (match, offset) => {
        // Check if it's inside a template literal
        const before = content.substring(0, offset);
        const after = content.substring(offset);
        if (before.match(/`[^`]*$/)) {
          return '${API_URL}';
        }
        return '`${API_URL}`';
      });

      // Fix template literals
      content = content.replace(/`\$\{API_URL\}`/g, '${API_URL}');
      content = content.replace(/\$\{API_URL\}/g, (match, offset) => {
        const before = content.substring(Math.max(0, offset - 20), offset);
        if (before.includes('`')) {
          return '${API_URL}';
        }
        return '`${API_URL}`';
      });

      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔄 Updating API URLs...\n');

let updatedCount = 0;
filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    if (updateFile(filePath)) {
      updatedCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log(`\n✅ Updated ${updatedCount} files`);
console.log('\n⚠️  Please review the changes and test your application!');

