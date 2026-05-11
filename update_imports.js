import fs from 'fs';
import path from 'path';

const rootDir = 'backend_new/services';
const sharedModelsDir = 'shared/models';
const sharedUtilsDir = 'shared/utils';
const sharedConfigDir = 'shared/config';

// Map of old model filenames to new ones in shared/models
const modelMap = {
  'user.js': 'User.js',
  'User.js': 'User.js',
  'Resume.js': 'Resume.js',
  'Profile.js': 'Profile.js',
  'blog.model.js': 'Blog.js',
  'opportunity.model.js': 'Opportunity.js',
  'program.model.js': 'Program.js',
  'Interview.js': 'Interview.js',
  'otp.js': 'Otp.js',
  'Professional.js': 'Professional.js',
  'Student.js': 'Student.js',
  'Worker.js': 'Worker.js',
  'ChatMessage.js': 'ChatMessage.js',
  'ChatThread.js': 'ChatThread.js',
  'Progress.js': 'Progress.js',
  'Skill.js': 'Skill.js',
  'userMemory.model.js': 'UserMemory.js'
};

// Map of old util filenames to new ones in shared/utils
const utilMap = {
  'sendEmail.js': 'sendEmail.js',
  'contextBuilder.js': 'contextBuilder.js',
  'llmFactory.js': 'llmFactory.js',
  'responseCache.js': 'responseCache.js'
};

// Map of config filenames
const configMap = {
  'Passport.js': 'Passport.js',
  'database.js': 'database.js'
};

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(rootDir, (filePath) => {
  if (!filePath.endsWith('.js')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Calculate relative path to backend_new/ from this file
  // backend_new/services/auth/controllers/file.js -> ../../../
  const parts = filePath.split(path.sep);
  // SkillRise_India/backend_new/services/auth/controllers/authController.js
  // parts will be ['backend_new', 'services', 'auth', 'controllers', 'authController.js']
  // depth from backend_new is parts.length - 1 = 4.
  // We need to go up 3 levels to reach backend_new if we start from the folder.
  const depth = parts.length - 2; // e.g., for authController.js, parts.length is 5, depth is 3.
  const prefix = '../'.repeat(depth);

  // Replace model imports
  Object.keys(modelMap).forEach(oldName => {
    const newName = modelMap[oldName];
    const oldImportRegex = new RegExp(`(\\.\\.?\\/)+models\\/${oldName.replace('.', '\\.')}`, 'g');
    const newImport = `${prefix}shared/models/${newName}`;
    
    if (oldImportRegex.test(content)) {
      content = content.replace(oldImportRegex, newImport);
      changed = true;
    }
  });

  // Replace util imports
  Object.keys(utilMap).forEach(oldName => {
    const newName = utilMap[oldName];
    const oldImportRegex = new RegExp(`(\\.\\.?\\/)+utils\\/${oldName.replace('.', '\\.')}`, 'g');
    const newImport = `${prefix}shared/utils/${newName}`;
    
    if (oldImportRegex.test(content)) {
      content = content.replace(oldImportRegex, newImport);
      changed = true;
    }
  });

  // Replace config imports
  Object.keys(configMap).forEach(oldName => {
    const newName = configMap[oldName];
    const oldImportRegex = new RegExp(`(\\.\\.?\\/)+config\\/${oldName.replace('.', '\\.')}`, 'g');
    const newImport = `${prefix}shared/config/${newName}`;
    
    if (oldImportRegex.test(content)) {
      content = content.replace(oldImportRegex, newImport);
      changed = true;
    }
  });

  // Special cases: some files might import from ./models/User without .js
  Object.keys(modelMap).forEach(oldName => {
    const baseName = oldName.replace('.js', '');
    const newName = modelMap[oldName];
    const oldImportRegex = new RegExp(`(\\.\\.?\\/)+models\\/${baseName}(?![\\w\\.])`, 'g');
    const newImport = `${prefix}shared/models/${newName}`;
    
    if (oldImportRegex.test(content)) {
      content = content.replace(oldImportRegex, newImport);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated imports in ${filePath}`);
  }
});
