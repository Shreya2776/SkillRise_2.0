import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to fix
const fixes = [
  // From services/auth/controllers or middleware
  {
    pattern: /from ["']\.\.\/\.\.\/shared\/(.*?)["']/g,
    replacement: 'from "../../../shared/$1"',
    paths: [
      'services/auth/controllers',
      'services/auth/middleware',
      'services/auth/routes'
    ]
  },
  // From services/auth/services
  {
    pattern: /from ["']\.\.\/\.\.\/shared\/(.*?)["']/g,
    replacement: 'from "../../../shared/$1"',
    paths: ['services/auth/services']
  }
];

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check which directory level we're at
    const relativePath = path.relative(path.join(__dirname, 'services'), filePath);
    const depth = relativePath.split(path.sep).length - 1;

    // Fix imports based on depth
    if (content.includes('from "../../shared/')) {
      content = content.replace(/from ["']\.\.\/\.\.\/shared\/(.*?)["']/g, 'from "../../../shared/$1"');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${relativePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other unnecessary directories
      if (!['node_modules', '.git', 'dist', 'build', 'uploads'].includes(file)) {
        walkDirectory(filePath, callback);
      }
    } else if (file.endsWith('.js')) {
      callback(filePath);
    }
  });
}

console.log('🔧 Fixing import paths in backend...\n');

const servicesDir = path.join(__dirname, 'services');
let fixedCount = 0;

walkDirectory(servicesDir, (filePath) => {
  if (fixImportsInFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('🎉 Import paths corrected!\n');
