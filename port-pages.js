const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'source-analysis/client/src/pages');
const targetDir = path.join(__dirname, 'src/app/(platform)/dashboard');

const mappings = {
  'discover.tsx': 'discover/page.tsx',
  'payments.tsx': 'payments/page.tsx',
  'campaigns.tsx': 'campaigns/page.tsx',
  'campaign-wizard.tsx': 'campaigns/wizard/page.tsx',
  'execution-board.tsx': 'board/page.tsx',
  'tracking.tsx': 'tracking/page.tsx',
  'lists.tsx': 'lists/page.tsx',
  'list-detail.tsx': 'lists/[id]/page.tsx',
  'calendar.tsx': 'calendar/page.tsx',
};

function portFile(srcFile, destRelative) {
  const srcPath = path.join(srcDir, srcFile);
  const destPath = path.join(targetDir, destRelative);
  
  if (!fs.existsSync(srcPath)) {
    console.error(`Not found: ${srcPath}`);
    return;
  }

  let content = fs.readFileSync(srcPath, 'utf8');

  // Add "use client" if not present
  if (!content.includes('"use client"') && !content.includes("'use client'")) {
    content = `"use client";\n` + content;
  }

  // Replace wouter with next/navigation
  content = content.replace(/import\s+\{\s*useLocation\s*\}\s+from\s+["']wouter["'];?/g, "import { useRouter } from 'next/navigation';");
  
  // Replace useLocation() hooks
  content = content.replace(/const\s+\[\s*(.*?)\s*,\s*setLocation\s*\]\s*=\s*useLocation\(\);/g, "const router = useRouter();");
  content = content.replace(/setLocation\((.*?)\)/g, "router.push($1)");

  // Some wouter code might just do `const [, setLocation] = useLocation()`
  
  // Make sure dest directory exists
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  
  fs.writeFileSync(destPath, content);
  console.log(`Ported ${srcFile} -> ${destRelative}`);
}

for (const [srcFile, destRelative] of Object.entries(mappings)) {
  portFile(srcFile, destRelative);
}
