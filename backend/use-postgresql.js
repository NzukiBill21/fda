// Script to automatically use PostgreSQL schema when DATABASE_URL contains postgresql
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || '';

// Get the correct directory (works from root or backend directory)
const backendDir = __dirname.includes('backend') ? __dirname : path.join(__dirname, 'backend');
const prismaDir = path.join(backendDir, 'prisma');

// Check if DATABASE_URL is PostgreSQL
if (dbUrl.includes('postgresql://') || dbUrl.includes('postgres://')) {
  console.log('✅ PostgreSQL detected in DATABASE_URL');
  
  const productionSchema = path.join(prismaDir, 'schema.production.prisma');
  const mainSchema = path.join(prismaDir, 'schema.prisma');
  
  if (fs.existsSync(productionSchema)) {
    console.log('📝 Copying production schema (PostgreSQL) to main schema...');
    const productionContent = fs.readFileSync(productionSchema, 'utf8');
    fs.writeFileSync(mainSchema, productionContent);
    console.log('✅ Schema updated to use PostgreSQL');
  } else {
    console.log('⚠️  Production schema not found, using default');
  }
} else {
  console.log('ℹ️  SQLite detected (or no DATABASE_URL), using default schema');
}

