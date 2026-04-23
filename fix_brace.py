import re

file_path = "src/app/(platform)/dashboard/lists/page.tsx"

with open(file_path, "r") as f:
    text = f.read()

# Replace the specific syntax issue
text = text.replace("}\n      />\n      }", "}\n      />\n      )}")
text = text.replace("{!hideHeader && <FeaturePageHeader", "{!hideHeader && (<FeaturePageHeader")

with open(file_path, "w") as f:
    f.write(text)

