const fs = require('fs');
const path = require('path');

function fixCjsImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'uploads'].includes(file)) {
        fixCjsImports(filePath);
      }
    } else if (file.endsWith('.cjs')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Fix require statements to add .cjs extension
      const patterns = [
        { from: /require\(['"](\.\.[\/\\][^'"]+)(?<!\.cjs)['"]\)/g, to: (match, p1) => `require('${p1}.cjs')` },
        { from: /require\(['"](\.[\/\\][^'"]+)(?<!\.cjs)['"]\)/g, to: (match, p1) => `require('${p1}.cjs')` }
      ];
      
      patterns.forEach(({ from, to }) => {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
      }
    }
  });
}

console.log('Fixing .cjs imports...\n');
fixCjsImports(path.join(__dirname, 'services', 'chatbot'));
console.log('\n✅ Done!');
