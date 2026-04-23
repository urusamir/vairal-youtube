# VAIRAL — Influencer Marketing Platform

## What This Is
VAIRAL is an influencer marketing platform designed for ARC Managers. It allows managers to discover creators, manage curated talent lists, create campaigns, assign creators to deliverables, and track campaign performance.

## Core Value
A standardized workspace to create, sort, export, and monitor influencer campaigns from end-to-end, serving as the operational heart of the influencer marketing workflow.

## Target Audience
- **Primary:** ARC Manager (creator & editor of campaigns, lists, etc.)
- **Secondary (v1 Out of Scope):** Brand Client (view-only access to assigned campaigns)

## Platform Constraints
- Web application, desktop-first design.
- Uses VAIRAL design system: purple primary accent, light purple-blue gradient background, white rounded cards.

## Requirements

### Active

- [ ] Build the Dashboard tab
- [ ] Build the Discover tab (Creators grid, Saved Creators, Talent Lists, Insights Modal)
- [ ] Build the Manage Campaigns tab (Campaigns List, Creation Wizard, Campaign Workspace)
- [ ] Build the Reporting tab

### Out of Scope (for v1)

- Admin upload interface for creator data
- Creator outreach / messaging
- Creator profile pages (standalone URLs)
- API integrations (Instagram/YouTube/TikTok) for automatic metrics
- Bulk actions on Saved Creators or Talent Lists
- Sharing Talent Lists externally
- Brand Client view
- Notifications and email/in-app alerts

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 4-Phase Architecture | Aligns with the 4 primary feature tabs of the platform (Dashboard, Discover, Campaigns, Reporting). | — Pending |
| Manual Data Source for v1 | v1 will rely on a manually uploaded JSON file containing creator data, simulating a database without building API integrations yet. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-23 after initialization*
