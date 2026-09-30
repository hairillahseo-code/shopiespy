const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/App.tsx',
  'src/app/app/page.tsx',
  'src/main.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace .tsx" and .ts" and .tsx' and .ts' in import statements
    content = content.replace(/from\s+['"](.+?)\.tsx['"]/g, "from '$1'");
    content = content.replace(/from\s+['"](.+?)\.ts['"]/g, "from '$1'");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in ${file}`);
  }
});
