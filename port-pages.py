import os
import re
import shutil

src_dir = "source-analysis/client/src/pages"
target_dir = "src/app/(platform)/dashboard"

mappings = {
    'discover.tsx': 'discover/page.tsx',
    'payments.tsx': 'payments/page.tsx',
    'campaigns.tsx': 'campaigns/page.tsx',
    'campaign-wizard.tsx': 'campaigns/wizard/page.tsx',
    'execution-board.tsx': 'board/page.tsx',
    'tracking.tsx': 'tracking/page.tsx',
    'lists.tsx': 'lists/page.tsx',
    'list-detail.tsx': 'lists/[id]/page.tsx',
    'calendar.tsx': 'calendar/page.tsx',
}

def port_file(src_file, dest_relative):
    src_path = os.path.join(src_dir, src_file)
    dest_path = os.path.join(target_dir, dest_relative)
    
    if not os.path.exists(src_path):
        print(f"Not found: {src_path}")
        return

    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add "use client" if not present
    if '"use client"' not in content and "'use client'" not in content:
        content = '"use client";\n' + content

    # Replace wouter with next/navigation
    content = re.sub(r'import\s+\{\s*([^}]*?useLocation.*?)\s*\}\s+from\s+["\']wouter["\'];?', 
                     r"import { useRouter } from 'next/navigation';\n// wouter imports originally here: \1", content)
    
    # Replace useLocation() calls with useRouter()
    # It usually looks like `const [, setLocation] = useLocation();`
    content = re.sub(r'const\s+\[[a-zA-Z0-9_\s]*,?\s*([a-zA-Z0-9_]+)\s*\]\s*=\s*useLocation\(\);', 
                     r'const router = useRouter();\n  const \1 = (path: string) => router.push(path);', content)
                     
    content = re.sub(r'const\s+\[([a-zA-Z0-9_]+)\]\s*=\s*useLocation\(\);', 
                     r'const router = useRouter();\n  // Need path? import { usePathname } from "next/navigation"', content)
                     
    # Replace `<Link href="...` if needed (wouter Link vs next/link)
    content = re.sub(r'import\s+\{\s*([^}]*?Link.*?)\s*\}\s+from\s+["\']wouter["\'];?', 
                     r'import Link from "next/link";', content)

    # Some old pages may export a component directly. 
    # But wait, we are porting page files. Sometimes they just do `export default function Page()`
    # We will let Next build check for more granular type errors.

    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Ported {src_file} -> {dest_relative}")

for src, dest in mappings.items():
    port_file(src, dest)
