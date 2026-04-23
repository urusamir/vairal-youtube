# PROTECTED PROJECT RULES & ARCHITECTURE

**CRITICAL INSTRUCTION TO AI:** This file MUST be reviewed and its rules applied before undertaking any major modifications, debugging tasks, or deployments in this repository.

## 1. 🛡️ Untouchable & Protected Components
The following architectural pillars have been heavily stabilized. Do NOT modify these files unless explicitly requested by the user. If a modification is requested, treat it with extreme caution and analyze cross-system impacts before changing a single line.

*   `src/providers/auth.provider.tsx`: The heart of the platform's authentication and routing layer. It manages lock-state prevention and simulated/active login sessions.
*   `src/providers/prefetch.provider.tsx`: The central nervous system for data caching. It broadcasts and listens for custom window events (`vairal-lists-updated`, etc.). Modifying this risks breaking reactivity platform-wide.
*   `src/lib/supabase.ts`: Core database configuration.
*   `src/app/globals.css` and `tailwind.config.js`: The foundational design tokens. The Tailwind preflight and hex codes here dictate the strict "blue-accent/light-grey" aesthetic that must remain uncorrupted by brownish or off-white tints.
*   `src/models/creators.data.ts`: The central static dataset. Modifying the schema here breaks dummy data loading across Campaign Wizard, Discover, and Lists layers.
*   `supabase/migrations/*`: The exact SQL sequences required for RLS and table definitions. 

## 2. 🚦 Strict Procedural Workflows

### A. Code Review for Live Deployments
**Rule:** You shall not push any major feature or architectural change to live (GitHub/Vercel) without conducting a formal code review.
**Action:** Always invoke and follow the `code-review-excellence` skill before executing `git commit`. 

### B. Debugging User-Highlighted Bugs
**Rule:** When the user explicitly highlights a broken functionality, blank screen, locked button, or missing data error, do not guess the solution.
**Action:** Always invoke the `debugging` skill to systematically trace logs, state, and root causes before applying a patch.

### C. Browser Testing
**Rule:** Whenever executing a browser testing-related task or visual verification task, the Playwright MCP server MUST be used.
**Action:** This shouldn't be ignored at any cost in any project. Ensure Playwright MCP is utilized to validate DOM states and visual renders.
### D. UI & Component Standards
**Rule:** No toaster or alert dialogs should be outside of the platform context.
**Action:** NEVER use `window.confirm`, `window.alert`, or native `<select>` dropdowns. All toasters must be in-app notifications (e.g. `toast` from `@/hooks/use-toast`). All dialogs must use `AlertDialog` or `Dialog` from `shadcn/ui`. All dropdowns must use `Select` or `DropdownMenu` from `shadcn/ui`. Absolutely no native grey components.
