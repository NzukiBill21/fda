/**
 * Update API URLs in build folder for XAMPP deployment
 * Changes localhost:5000 to relative paths for PHP backend
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const apiPath = '/fda/backend-php'; // XAMPP path

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Replace localhost:5000 with relative path
    const patterns = [
      { from: /http:\/\/localhost:5000/g, to: apiPath },
      { from: /http:\/\/localhost:5000\//g, to: apiPath + '/' },
      { from: /'http:\/\/localhost:5000'/g, to: `'${apiPath}'` },
      { from: /"http:\/\/localhost:5000"/g, to: `"${apiPath}"` },
      // Fix asset paths: /assets/ -> /fda/build/assets/ (but NOT if already /fda/build/assets/)
      { from: /(?<!\/fda\/build)\/assets\//g, to: '/fda/build/assets/' },
    ];

    patterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        updated = true;
      }
    });

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

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.json')) {
      updateFile(filePath);
    }
  });
}

console.log('🔄 Updating API URLs for XAMPP...');
console.log(`   API Path: ${apiPath}`);
console.log('');

if (fs.existsSync(buildDir)) {
  processDirectory(buildDir);
  console.log('');
  console.log('✅ API URLs updated for XAMPP deployment!');
} else {
  console.log('❌ Build directory not found. Run "npm run build" first.');
}

