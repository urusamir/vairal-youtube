import os

filepath = 'src/app/(platform)/dashboard/payments/page.tsx'
with open(filepath, 'r') as f:
    text = f.read()

hero_banner = """      {/* Hero Banner */}
      <div className="relative mb-6 overflow-hidden rounded-2xl glass-card border border-white/5 bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/5 p-8 lg:p-10">
        <div className="absolute top-0 right-0 -m-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -m-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight" data-testid="text-payments-title">
              Payments
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed">
              Track and manage creator payments seamlessly. Upload receipts, manage pending budgets, and ensure your creators are paid out in time.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Label htmlFor="dummy-toggle-payments" className="text-sm font-medium text-muted-foreground">
              Preview with data
            </Label>
            <Switch
              id="dummy-toggle-payments"
              checked={showDummy}
              onCheckedChange={setShowDummy}
              data-testid="switch-dummy-data"
            />
          </div>
        </div>
      </div>"""

target_to_replace = """      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-payments-title">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage creator payments</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="dummy-toggle-payments" className="text-sm text-muted-foreground">
            Preview with data
          </Label>
          <Switch
            id="dummy-toggle-payments"
            checked={showDummy}
            onCheckedChange={setShowDummy}
            data-testid="switch-dummy-data"
          />
        </div>
      </div>"""

if target_to_replace in text:
    new_text = text.replace(target_to_replace, hero_banner)
    with open(filepath, 'w') as f:
        f.write(new_text)
    print("Replaced successfully")
else:
    print("Target not found")
