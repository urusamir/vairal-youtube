import os

file_path = "src/app/(platform)/dashboard/campaigns/wizard/page.tsx"

with open(file_path, "r") as f:
    text = f.read()

# Replace import
if "import { useState, useEffect, useCallback, useMemo, useRef, memo, Suspense }" not in text and "import React" not in text:
    text = text.replace('import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";', 'import React, { useState, useEffect, useCallback, useMemo, useRef, memo, Suspense } from "react";')

# Rename export
text = text.replace("export default function CampaignWizardPage() {", "function CampaignWizardContent() {")

# Append wrapper
wrapper = """

export default function CampaignWizardPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <CampaignWizardContent />
    </Suspense>
  );
}
"""

if "export default function CampaignWizardPage()" not in text:
    text += wrapper

with open(file_path, "w") as f:
    f.write(text)

print("Suspense fix applied.")
