import os
import re

for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'react-icons/si' in content:
                content = content.replace('react-icons/si', 'react-icons/fa')
                content = content.replace('SiInstagram', 'FaInstagram')
                content = content.replace('SiYoutube', 'FaYoutube')
                content = content.replace('SiTiktok', 'FaTiktok')
                content = content.replace('SiLinkedin', 'FaLinkedin')
                content = content.replace('SiSnapchat', 'FaSnapchatGhost')
                content = content.replace('SiFacebook', 'FaFacebook')
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
