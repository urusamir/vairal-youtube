import os

# 1. Update card default styles
card_file = 'src/components/ui/card.tsx'
with open(card_file, 'r') as f:
    text = f.read()

target_card = '"shadcn-card rounded-2xl border bg-card/60 backdrop-blur-xl border-white/5 text-card-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:border-white/10"'
new_card = '"shadcn-card rounded-3xl border bg-white/80 backdrop-blur-xl border-white/50 text-card-foreground shadow-glass transition-all duration-500 hover:shadow-float"'

if target_card in text:
    text = text.replace(target_card, new_card)
    with open(card_file, 'w') as f:
        f.write(text)

# 2. Update Layout background
layout_file = 'src/app/(platform)/dashboard/layout.tsx'
with open(layout_file, 'r') as f:
    text = f.read()

target_layout = """            <main className="flex-1 overflow-y-auto">
              {children}
            </main>"""

new_layout = """            <main className="flex-1 overflow-y-auto bg-hero-gradient relative">
              {/* Global Decorative Orbs */}
              <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none z-0" />
              <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-purple-400/15 blur-[150px] pointer-events-none z-0" />
              <div className="relative z-10 w-full min-h-full">
                {children}
              </div>
            </main>"""

if target_layout in text:
    text = text.replace(target_layout, new_layout)
    with open(layout_file, 'w') as f:
        f.write(text)

# 3. Strip duplicate background from Dashboard Page
dash_file = 'src/app/(platform)/dashboard/page.tsx'
with open(dash_file, 'r') as f:
    text = f.read()

text = text.replace('<div className="relative min-h-screen bg-hero-gradient p-6 sm:p-10 w-full overflow-hidden">', '<div className="relative p-6 sm:p-10 w-full">')
text = text.replace('      {/* Decorative Background Orbs */}\n      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />\n      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-400/15 blur-[120px] pointer-events-none" />\n', '')

with open(dash_file, 'w') as f:
    f.write(text)

print("UI consistency pushed!")
