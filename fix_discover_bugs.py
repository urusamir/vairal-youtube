import re

with open("src/app/(platform)/dashboard/discover/page.tsx", "r") as f:
    content = f.read()

# Remove Gender filter from JSX
gender_block = re.search(r'\s*{\/\* ── Gender ── \*\/}.*?</div>\s*</div>', content, re.DOTALL)
if gender_block:
    content = content.replace(gender_block.group(0), '')

# Fix TabsList box issue by removing border and p-1 from tabs.tsx instead of here,
# actually wait, I already know discover/page.tsx has:
# <TabsList className="h-14 justify-start gap-7 rounded-none bg-transparent p-0">
# The box is coming from tabs.tsx default class: "border border-border p-1"
# We can just override it by adding border-0 to discover/page.tsx TabsList:
content = content.replace('className="h-14 justify-start gap-7 rounded-none bg-transparent p-0"', 'className="h-14 justify-start gap-7 rounded-none bg-transparent p-0 border-0"')

with open("src/app/(platform)/dashboard/discover/page.tsx", "w") as f:
    f.write(content)

with open("src/components/ui/tabs.tsx", "r") as f:
    tabs_content = f.read()

tabs_content = tabs_content.replace('bg-white border border-border p-1 text-muted-foreground', 'bg-transparent text-muted-foreground border-0 p-0')

with open("src/components/ui/tabs.tsx", "w") as f:
    f.write(tabs_content)

with open("src/components/ui/slider.tsx", "r") as f:
    slider_content = f.read()

slider_content = slider_content.replace('bg-secondary', 'bg-slate-200')
slider_content = slider_content.replace('bg-primary', 'bg-violet-500')
slider_content = slider_content.replace('border-primary', 'border-violet-500')

with open("src/components/ui/slider.tsx", "w") as f:
    f.write(slider_content)

