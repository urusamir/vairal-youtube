import os
import re

for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'const router = useRouter();\n  // Need path? import { usePathname } from "next/navigation"' in content:
                content = content.replace(
                    'const router = useRouter();\n  // Need path? import { usePathname } from "next/navigation"', 
                    'const router = useRouter();\n  const location = usePathname() || "";'
                )
                if 'usePathname' not in content:
                    content = content.replace("import { useRouter } from 'next/navigation';", "import { useRouter, usePathname } from 'next/navigation';")
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
