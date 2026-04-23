import os

for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.js')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'SiX' in content or 'FaSith' in content:
                content = content.replace('SiX as SiXIcon', 'FaXTwitter as SiXIcon')
                content = content.replace('SiX ', 'FaXTwitter ')
                content = content.replace('SiX,', 'FaXTwitter,')
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
