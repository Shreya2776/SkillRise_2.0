import fs from 'fs';
import path from 'path';

const rootDir = 'backend';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (f === 'node_modules') return;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

const replacements = {
  'user.js': 'User.js',
  'profile.js': 'Profile.js',
  'otp.js': 'Otp.js'
};

walk(rootDir, (filePath) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.cjs')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [oldName, newName] of Object.entries(replacements)) {
    // Look for imports/requires ending with the filename
    const regex = new RegExp(`\\/${oldName.replace('.', '\\.')}`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `/${newName}`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated case in ${filePath}`);
  }
});
