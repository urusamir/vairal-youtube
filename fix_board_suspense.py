import os

file_path = "src/app/(platform)/dashboard/board/page.tsx"

with open(file_path, "r") as f:
    text = f.read()

# Replace import
if "Suspense" not in text:
    text = text.replace('import { useMemo, useState, memo, useCallback } from "react";', 'import React, { useMemo, useState, memo, useCallback, Suspense } from "react";')

# Rename export
text = text.replace("export default function BoardPage() {", "function BoardPageContent() {")

# Append wrapper
wrapper = """

export default function BoardPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center p-12"><div className="w-8 h-8 animate-spin border-4 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <BoardPageContent />
    </Suspense>
  );
}
"""

if "export default function BoardPage()" not in text:
    text += wrapper

with open(file_path, "w") as f:
    f.write(text)

print("Board Suspense fix applied.")
