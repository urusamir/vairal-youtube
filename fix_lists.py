import re

file_path = "src/app/(platform)/dashboard/lists/page.tsx"

with open(file_path, "r") as f:
    text = f.read()

# Make it a panel component
if "export function ListsPanel" not in text:
    text = text.replace("export default function ListsPage() {", "export function ListsPanel({ hideHeader }: { hideHeader?: boolean }) {")
    
    # Hide the header based on prop
    text = text.replace("<FeaturePageHeader", "{!hideHeader && <FeaturePageHeader")
    text = text.replace('description="Create and manage custom creator lists for your campaigns."\n        />', 'description="Create and manage custom creator lists for your campaigns."\n        />}')
    text = text.replace('description="Create and manage custom creator lists for your campaigns."\n      />', 'description="Create and manage custom creator lists for your campaigns."\n      />}')

    # Add default export back at bottom
    text += "\n\nexport default function ListsPage() {\n  return <ListsPanel />;\n}\n"

with open(file_path, "w") as f:
    f.write(text)

