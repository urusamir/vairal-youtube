# Manage Campaigns — Product Requirements Document

**Product:** VAIRAL — Influencer Marketing Platform
**Scope:** Manage Campaigns sidebar tab (complete)
**Audience:** ARC Manager (create & edit), Brand Client (view-only — out of scope for v1 build, but structure must support it)
**Platforms:** Web, desktop-first

---

## 1. Overview

The Manage Campaigns tab is the operational heart of the VAIRAL platform. It is where ARC Managers create campaigns, assign creators, track deliverables through production phases, and manage the day-to-day execution of influencer marketing work.

This tab contains three layers:

1. **Campaigns list** — the landing view, showing all campaigns filtered by lifecycle state (All, Active, Drafts, Finished).
2. **Campaign creation wizard** — a 4-step flow for creating new campaigns, accessible via "Create Campaign" button.
3. **Campaign workspace** — the detail view opened by clicking any campaign row. Contains 5 inner tabs: Overview, Briefs, Creators, Deliverables Board, Report (↗ outbound).

Data created here flows downstream into the Reporting sidebar tab, but Reporting itself is out of scope for this document.

---

## 2. Mental model

**Campaign-level lifecycle states** (shown in list view):
- `Draft` — campaign is being set up, not yet in market
- `Active` — campaign is live and deliverables are being produced
- `Finished` — campaign is complete, reporting is locked to a final snapshot

**Deliverable-level phases** (shown on Deliverables Board inside an Active campaign):
- `Confirmation` → `Shoot` → `Edit` → `Review & Changes` → `Approved & Scheduled` → `Live`

These two levels are distinct. A campaign's state is operational metadata; a deliverable's phase is production status. The Deliverables Board only functions when a campaign is Active.

**Data hierarchy:**
- A Campaign has many Briefs (creative direction only — no quantities)
- A Campaign has many Creators (the roster)
- A Creator has many Deliverables (the actual content units — these become Kanban cards)
- Each Deliverable is tagged to one Brief

---

## 3. Campaigns list (landing view)

### 3.1 Purpose
The default view when a user clicks "Manage Campaigns" in the sidebar. Shows all campaigns the user has access to, with the ability to filter, search, create, and bulk-manage.

### 3.2 Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ Campaigns                                        [Export CSV] [+ Create] │
│ Create, sort, export, and monitor influencer campaigns from one      │
│ standardized workspace.                                              │
├──────────────────────────────────────────────────────────────────────┤
│ [All 12]  [Active 5]  [Drafts 4]  [Finished 3]                       │
│                                                                      │
│ [🔍 Search campaigns...]  [Sort: Recently created ▾]  [Filters ▾]   │
│                                                                      │
│ ┌─ 2 selected  [Make Active] [Move to Draft] [Mark Finished] [×] ──┐│
│ └───────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌───────────────────────────────────────────────────────────────────┐│
│ │ ☐ Campaign            Brand       Goal       Platforms  Dates    ││
│ │                                                                   ││
│ │ ☑ Ramadan Fitness     FitLife     App        IG·YT·TT   Apr27-   ││
│ │   Challenge           UAE         Installs              May27    ││
│ │   [▓▓▓▓░░] 4/6 phases                              [Active] [⋯]  ││
│ │                                                                   ││
│ │ ☐ Summer Glow         Luminara    Product    IG·TT      Apr17-   ││
│ │   Collection Launch   Beauty      Launch                May17    ││
│ │   [▓▓▓▓▓▓] 6/6 phases                                [Live] [⋯]  ││
│ └───────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### 3.3 Header
- Page title: "Campaigns"
- Subtitle: "Create, sort, export, and monitor influencer campaigns from one standardized workspace."
- Top-right actions: `Export CSV` (secondary button), `+ Create Campaign` (primary button, VAIRAL purple)

### 3.4 State filter tabs
Four tabs in a row, each showing a count badge:
- `All` (all campaigns except deleted)
- `Active` (state = Active)
- `Drafts` (state = Draft)
- `Finished` (state = Finished)

Selected tab is underlined in VAIRAL purple with a small count badge in a matching tint.

### 3.5 Search, sort, filter row
- **Search bar** (left): "Search campaigns by title..." — searches campaign name field, case-insensitive.
- **Sort dropdown**: Recently created (default), Recently updated, Campaign name A–Z, End date ascending.
- **Filters dropdown** (optional for v1): Brand, Platform, Goal, Date range.

### 3.6 Bulk action bar
Appears only when one or more campaigns are selected (via row checkboxes). Sticky banner above the table.

Contents:
- "N selected" count on left
- Action buttons (varying based on selection state):
  - `Make Active` (green) — only if all selected are Draft
  - `Move to Draft` (amber) — only if all selected are Active
  - `Mark Finished` (teal) — only if all selected are Active
  - `Duplicate` — available for any state
  - `Delete` (red) — requires confirmation modal
- `×` to deselect all

If mixed states are selected, show only universally-applicable actions (Duplicate, Delete).

### 3.7 Campaigns table

Columns:
1. **Checkbox** — for bulk selection
2. **Campaign** — name (bold), with a thin progress bar below for Active campaigns showing deliverable phase distribution. For Draft campaigns, show "Not published yet" instead. For Finished campaigns, show "Completed [date]".
3. **Brand** — brand name
4. **Goal** — campaign goal
5. **Platforms** — small circular icons for each selected platform
6. **Date Range** — "Apr 27 – May 27" format
7. **Status** — colored pill:
   - Draft = amber pill, label "Draft"
   - Active = green pill, label "Active"
   - Finished = gray pill, label "Finished"
8. **Actions** — `↗` icon (opens campaign in new tab), `⋯` menu (Duplicate, Archive, Delete)

**Row interaction:** Clicking anywhere on the row (except checkbox, icons, or ⋯) opens the campaign workspace.

### 3.8 Empty states
- All tab empty: "No campaigns yet. Create your first campaign to get started." with a primary CTA.
- Drafts empty: "No drafts. Campaigns you're still setting up will appear here."
- Active empty: "No active campaigns. Published campaigns will appear here."
- Finished empty: "No finished campaigns. Completed campaigns will appear here for historical reference."

### 3.9 Pagination
Standard pagination or infinite scroll at 25 campaigns per page. For v1, pagination is preferred because it's simpler.

---

## 4. Campaign state transitions

### 4.1 Allowed transitions

| From    | To       | Trigger                                                                 | Validation                                                  |
|---------|----------|-------------------------------------------------------------------------|-------------------------------------------------------------|
| (new)   | Draft    | User clicks "Create Campaign" and starts the wizard                     | None — draft is auto-created on wizard open                 |
| Draft   | Active   | User completes wizard and clicks "Publish Campaign" in Step 4           | Required fields in Steps 1 & 2 must be filled               |
| Draft   | Active   | User selects Draft campaigns from list and clicks "Make Active"         | Same as above                                               |
| Active  | Draft    | User clicks "Move to Draft" from list or campaign settings              | Confirmation modal: "Pause this campaign? Deliverables will freeze where they are." |
| Active  | Finished | User clicks "Mark Finished" from list or campaign settings              | If deliverables are not all Live, show modal: "N deliverables are not Live. Mark finished anyway?" |
| Finished| Active   | Admin-only (out of scope for v1) or blocked                             | Blocked in v1                                               |
| Any     | Deleted  | User clicks Delete from list or campaign settings                       | Hard confirmation modal: "Delete this campaign? This cannot be undone." |

### 4.2 State-specific behaviors

**Draft campaigns:**
- Appear in Drafts tab
- Clicking opens the wizard at the last-edited step (not the workspace)
- Wizard can be edited at any time
- Deliverables Board is not yet accessible
- No Reporting data exists

**Active campaigns:**
- Appear in Active tab
- Clicking opens the campaign workspace (default tab: Deliverables Board)
- Briefs and Creators can still be edited via the workspace
- Deliverables are fully interactive (drag, edit, mark live)
- Reporting tab becomes meaningful once deliverables go Live

**Finished campaigns:**
- Appear in Finished tab
- Clicking opens the campaign workspace (default tab: Overview, in read-only mode)
- Deliverables Board is visible but frozen — no drag-and-drop, no editing
- Reporting data is locked to a final snapshot
- Edits require reopening the campaign (admin action, not in v1)

### 4.3 Campaign duplication

**Purpose:** Allow users to re-use campaign structure (basics, briefs, optionally creators and deliverables) as a starting point for a new campaign without rebuilding from scratch.

**Trigger points:**
- `Duplicate` in the campaigns list bulk action bar (when one or more campaigns selected)
- `Duplicate campaign` in the `⋯` menu on any campaign row
- `Duplicate campaign` in the `⋯` menu inside the campaign workspace header

**Duplication modal:**

When the user clicks any Duplicate trigger, a modal opens:

```
┌───────────────────────────────────────────────────────┐
│ Duplicate campaign                                    │
│                                                       │
│ New campaign name                                     │
│ [Ramadan Fitness Challenge (copy)             ]       │
│                                                       │
│ What to include                                       │
│ ☑ Campaign basics (goal, platforms, budget, etc.)    │
│ ☑ Briefs (creative direction, moodboards, messages)  │
│ ☐ Creators (roster from original campaign)           │
│ ☐ Deliverables (creator → deliverable assignments)   │
│                                                       │
│ Flight dates will be cleared — set new dates after.  │
│                                                       │
│                        [Cancel]  [Create Duplicate]   │
└───────────────────────────────────────────────────────┘
```

**Field behaviors:**

- **New campaign name** — text input pre-filled with `[original name] (copy)`. Editable. Required.
- **Campaign basics checkbox** — default CHECKED. When unchecked, the duplicate starts with only the name set; all other basics are blank.
- **Briefs checkbox** — default CHECKED. When unchecked, no briefs are carried over.
- **Creators checkbox** — default UNCHECKED. Carries over the creator roster (CampaignCreator records) without their deliverables.
- **Deliverables checkbox** — default UNCHECKED. Only enableable if Creators is also checked (disabled and grayed out otherwise). Carries over the full creator → deliverable mapping.

**Dependency rule:** Deliverables cannot be duplicated without Creators. If the user checks Deliverables, the UI should auto-check Creators. If the user unchecks Creators, Deliverables is force-unchecked.

**What is always cleared/reset on duplicate (not user-configurable):**
- Status forced to `Draft`
- Flight Start and Flight End cleared (user must set new dates before publishing)
- `created_at` and `updated_at` set to now
- All IDs regenerated (new Campaign ID, new Brief IDs, new CampaignCreator IDs, new Deliverable IDs)
- For any copied Deliverables: `current_phase` reset to `Confirmation`, `post_url` cleared, `draft_link` cleared, `version_number` reset to 1, `revision_notes` cleared, `actual_go_live_date` cleared, `target_go_live_date` set to null (will default to campaign.flight_end once user sets flight dates)
- For any copied CampaignCreator records: `status` reset to `Active` (ignore withdrawn status from original)

**On submit:**

1. Create the new Campaign record with the user-specified name, state = Draft, all other fields per checkbox selections
2. Copy Brief records (new UUIDs, same content) if checkbox is checked
3. Copy CampaignCreator records (new UUIDs, pointing at same Creator IDs) if checkbox is checked
4. Copy Deliverable records (new UUIDs, pointing at new Brief IDs and new Creator IDs) if checkbox is checked, with reset fields as noted above
5. Close modal
6. Toast notification: "Campaign duplicated. Open 'Drafts' to continue editing."
7. Refresh the campaigns list (new draft appears at the top of the Drafts tab)
8. **Do NOT automatically open the duplicated campaign.** User clicks into it from the Drafts tab when ready.

**Why not auto-open:** Users duplicating campaigns in bulk, or duplicating while reviewing an existing campaign, shouldn't have their context hijacked. The toast signals success; the Drafts tab holds the result. This also prevents confusion ("which campaign am I looking at?") immediately after the duplicate action.

**Edge cases:**
- Duplicating a Finished campaign: works identically. The duplicate is a new Draft.
- Duplicating a Draft campaign: works identically. The duplicate is a separate new Draft.
- Bulk duplicate from list (multiple campaigns selected): each campaign gets its own duplication modal shown sequentially, OR a simplified bulk modal with one set of checkboxes applied to all selected campaigns (decision: use the simplified bulk modal; power users duplicating 5 campaigns shouldn't click through 5 modals). Each duplicate gets `(copy)` appended to its original name.

---

## 5. Campaign creation wizard (4 steps)

### 5.1 Wizard shell

**Trigger:** `+ Create Campaign` button from the campaigns list, or `Continue editing` action from a Draft row.

**URL structure:**
- `/campaigns/new` — starts fresh, creates new draft
- `/campaigns/new?step=2&id=[draftId]` — resumes an existing draft at a specific step
- `/campaigns/new?step=1&id=[draftId]&returnTo=4` — jump-back navigation from Step 4's Edit links

**Auto-save behavior:**
- On every field blur, save to the draft
- On step transitions, save to the draft
- Single "Draft saved" indicator, top-right of the wizard header, fades in for 2s after each save
- No bottom-center "Auto-saving..." text

**Exit behavior:**
- Pressing ESC, clicking the X in the wizard header, or navigating away via sidebar → save draft and return to the Campaigns list
- The draft appears in the Drafts tab, clickable to resume
- No "are you sure?" modal — the draft is already saved, so exit is safe

**Resume behavior:**
- From the Drafts tab, clicking a draft row opens the wizard at the last step the user was on
- A small indicator at the top of the wizard shows "Resuming draft — last edited [timestamp]"

**Stepper UI:**
- Horizontal top bar with 4 step indicators
- Format: `[1 Basics] ─── [2 Briefs] ─── [3 Creators & Deliverables] ─── [4 Review & Publish]`
- Current step: purple filled circle with step number
- Completed step: teal filled circle with check icon
- Upcoming step: gray outlined circle with step number
- Clicking a completed step navigates back to it; clicking an upcoming step does nothing

**Footer (persistent across all steps):**
- Left: `← Back` button (disabled on Step 1)
- Right: `Save Draft` (secondary) + `Save & Continue →` (primary, purple)
- On Step 4, right button becomes `Publish Campaign` (primary, green)

**Header actions:**
- Top-right: `Draft saved` indicator
- Top-right: `⋯` menu with "Delete campaign" (destructive, red text, confirmation required)
- Top-right: `×` to close wizard (saves and exits)

---

### 5.2 Step 1 — Campaign Basics

**Purpose:** Capture the foundational campaign attributes.

**Required fields:**
| Field                      | Type                        | Validation                                |
|----------------------------|-----------------------------|--------------------------------------------|
| Primary Goal               | Single-select pill group    | Required. One of 8 options.                |
| Campaign Name              | Text input                  | Required. 3–200 characters.                |
| Brand Name                 | Text input with autocomplete| Required. Autocompletes from existing brands.|
| Product or Service         | Text input                  | Required. Short description, 200 char max. |
| Target Platform(s)         | Multi-select pill group     | Required. At least 1 of 6 options.         |
| Target Country(ies)        | Multi-select with search    | Required. At least 1.                      |
| Target Audience Age Range  | Multi-select pill group     | Required. At least 1 of 6 options.         |
| Total Budget               | Number input                | Required. > 0.                             |
| Currency                   | Dropdown                    | Required. Default based on brand country.  |
| Flight Start               | Date picker                 | Required. Must be today or future.         |
| Flight End                 | Date picker                 | Required. Must be after Flight Start.      |

**Goal options (8 pills):**
- Brand Awareness
- Product Launch
- Lead Generation
- Sales & Conversions
- Content Creation
- Event Promotion
- App Installs
- Community Building

**Platform options (6 pills with icons):**
- Instagram, YouTube, TikTok, Twitter/X, LinkedIn, Snapchat

**Age range options (6 pills):**
- 13–17, 18–24, 25–34, 35–44, 45–54, 55+

**Country picker:** Searchable dropdown with flag icons. Selected countries appear as removable chips above the dropdown. Predefined list (ISO country codes).

**Budget input:** Number field with thousands separator formatting (40,000 not 40000). Currency dropdown adjacent on the right.

**Flight dates:** Two date pickers side by side. End date auto-sets to start + 30 days when start is picked (user can override).

**Visual notes:**
- Goals and platforms as compact pills, NOT cards with descriptions
- Two-column layout where possible (e.g., Name + Brand on one row, Budget + Currency, Flight Start + Flight End)
- No decorative illustrations or icons taking vertical space

**Validation:**
- "Save & Continue" button is disabled until all required fields are filled
- Invalid fields show red border and error text on blur
- User can save as draft even with incomplete fields (no validation on Save Draft)

---

### 5.3 Step 2 — Campaign Briefs

**Purpose:** Define the creative direction. Briefs are pure creative guidance — no deliverable quantities are set here.

**Status:** Mandatory step. User cannot proceed to Step 3 without at least one brief with a title and at least one key message.

**Layout:**
- A tabbed row at the top listing existing briefs (e.g., `Brief 1` | `Brief 2` | `+ Add Brief`)
- The form below shows the currently selected brief's fields
- Switching tabs preserves all fields in the other briefs

**Per-brief fields:**

| Field             | Type                       | Required?                 |
|-------------------|----------------------------|---------------------------|
| Brief Title       | Text input                 | Yes                       |
| Visual Moodboard  | URL paste field + thumbnail grid | No                  |
| Key Messages      | Repeatable text rows       | At least 1 required       |
| Do's              | Repeatable text rows       | No                        |
| Don'ts            | Repeatable text rows       | No                        |
| Hashtags          | Chip input                 | No                        |
| Mentions / Tags   | Chip input                 | No                        |

**Visual Moodboard:**
- Text field: "Paste TikTok, Instagram, or YouTube URL..."
- "Add to Board" button
- URLs are parsed and rendered as video thumbnails (TikTok / Reel / Short embeds via oEmbed or similar)
- Thumbnails display in a grid below, each with a small × to remove
- Empty state: "No inspiration links yet. Paste URLs above to build your moodboard."

**Key Messages:**
- Each message is a single text input row
- `+ Add` button below to add another row
- Trash icon on the right to remove a row
- At least one message required to proceed to Step 3

**Do's and Don'ts:**
- Two-column layout (Do's left, Don'ts right)
- Each column has its own repeatable rows and `+ Add` button
- Subtle green left-border on Do's inputs, red left-border on Don'ts inputs
- Optional — can proceed with zero entries

**Hashtags and Mentions:**
- Chip-style inputs
- User types text, presses Enter, it becomes a chip
- Hashtag chips auto-prefix with #; mention chips auto-prefix with @
- Click × on a chip to remove
- Optional

**Multiple briefs:**
- User can add up to N briefs (soft limit 10)
- Deleting a brief requires a confirmation modal: "Delete this brief? Creator deliverables tagged to this brief will need to be re-tagged."
- If a brief is deleted, any deliverables in Step 3 currently tagged to that brief are re-tagged to the first remaining brief automatically (with a toast notification to the user)

**Validation for Save & Continue:**
- At least one brief exists
- Each existing brief has a title AND at least one key message

**Visual reference:** Closely matches the existing Step 2 UI in the current build, with deliverables section REMOVED.

---

### 5.4 Step 3 — Creators & Deliverables

**Purpose:** Pick creators for the campaign and (optionally) attach their deliverables. Both are editable later.

**Status:** Open-ended. User can proceed with zero creators, zero deliverables, or any partial state. A confirmation modal appears only in one specific scenario (described below).

**Layout:** Two sections stacked vertically.

#### Section A — Creator Selection

**Purpose:** Search and add creators to the campaign.

**Components:**
- Search bar: "Search creators..."
- "Select from saved list" dropdown on the right — loads creators from a pre-saved list
- Results table below:

| Avatar | Creator (name, handle) | Platform | Followers | Action |
|--------|------------------------|----------|-----------|--------|
| 🧑     | Sherin Amara @sherinsbeauty | Instagram | 12.3M | [+ Add] |
| 🧑     | Ossy Marwah @ossymarwah | Instagram | 9.1M | [+ Add] |

**Actions:**
- `+ Add` button: adds the creator to Section B below. Button state changes to `✓ Added` (green text).
- Clicking `✓ Added` again removes them (with a brief undo toast).

#### Section B — Shortlisted Creators

**Purpose:** Show creators who have been added to the campaign, and allow deliverable specification per creator.

**Per-creator card:**

```
┌──────────────────────────────────────────────────────────────┐
│ 🧑 Al Rafaelo @alrafaelo                             [🗑]   │
│                                                              │
│ DELIVERABLES                           [+ Add Deliverable]   │
│ ┌──────────┬────────┬────────┬──────────────────────┬────┐ │
│ │ Platform │ Format │ Brief  │ Notes                │  × │ │
│ ├──────────┼────────┼────────┼──────────────────────┼────┤ │
│ │ Instagram│ Story  │ Brief 1│ (optional notes)     │  × │ │
│ │ YouTube  │ Video  │ Brief 1│                      │  × │ │
│ └──────────┴────────┴────────┴──────────────────────┴────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Creator card header:**
- Avatar, name, handle (left)
- Trash icon (right) — removes creator from campaign. Confirmation toast with undo.
- NO status dropdown. NO confirmation pills. A creator is either on the campaign or not.

**Deliverables table (inline, per creator):**
- Columns: Platform, Format, Brief, Notes, Remove (×)
- All cells are editable inline (dropdowns for Platform/Format/Brief, text input for Notes)
- `+ Add Deliverable` button above or below the table to add a new row
- Trash icon per row to remove that deliverable

**Platform dropdown values:** Only platforms selected in Step 1 appear here.

**Format dropdown values (depends on platform):**
- Instagram: Reel, Story, Post, Carousel
- YouTube: Video, Short
- TikTok: Video
- Twitter/X: Post, Thread
- LinkedIn: Post, Article, Video
- Snapchat: Story, Spotlight

**Brief dropdown values:** All briefs defined in Step 2. If only one brief exists, it's auto-selected and the dropdown becomes read-only. If zero briefs exist (shouldn't happen since Step 2 is mandatory), the column is hidden.

**Notes field:** Free-form text, optional. Used for anything specific to this deliverable ("Align with Eid morning post", "Include promo code FIT20").

**Design principle:** Deliverables must be assigned deliberately, per-creator. Do not offer any bulk or auto-distribute functionality — creator assignment is a curated decision (based on audience fit, format preference, reach), not a symmetric split. Each row is added one at a time via `+ Add Deliverable` on the appropriate creator's card.

#### Validation for Save & Continue

**Confirmation modal trigger:** If the user clicks "Save & Continue" AND there is at least one shortlisted creator with ZERO deliverables, show:

```
┌──────────────────────────────────────────────────────┐
│ Publish without all deliverables assigned?           │
│                                                      │
│ 2 of 3 creators don't have deliverables assigned    │
│ yet. You can add these later from the Creators tab  │
│ inside the campaign workspace.                       │
│                                                      │
│                      [Go back]  [Continue anyway]    │
└──────────────────────────────────────────────────────┘
```

**No modal** if:
- Zero creators are shortlisted (user is clearly skipping Step 3 intentionally)
- Every shortlisted creator has at least one deliverable

---

### 5.5 Step 4 — Review & Publish

**Purpose:** Read-only confirmation of the full campaign before publishing. No fake dashboards, no fake metrics. Just a scannable summary.

**Layout:** Single column, four stacked sections.

#### Header
- Title: "Review & Publish"
- Subtitle: "One final look before your campaign goes live. You can still make changes — just click Edit on any section."

#### Section 1 — Campaign Basics

Card container with header row:
- Left: "Campaign Basics"
- Right: `Edit ↗` (jumps back to Step 1 with returnTo=4 param)

Two-column read-only grid:
```
Goal                 App Installs
Campaign Name        Ramadan Fitness Challenge
Brand                FitLife UAE
Product              FitLife App Premium
Platforms            Instagram · YouTube · TikTok
Countries            United Arab Emirates · Saudi Arabia
Audience             25–34 · 35–44
Total Budget         AED 40,000
Flight Dates         Apr 27, 2026 → May 27, 2026 (30 days)
```

Labels in muted gray, values in primary text color, left-aligned.

#### Section 2 — Briefs

Card container with header row:
- Left: "Briefs (N)"
- Right: `Edit ↗` (jumps back to Step 2)

Collapsed list of briefs:
```
▸ Brief 1 · Pre-Ramadan teaser          2 key messages · 4 moodboard items
▸ Brief 2 · Mid-Ramadan engagement      3 key messages · 6 moodboard items
▸ Brief 3 · Eid closer                  2 key messages · 3 moodboard items
```

Clicking ▸ expands the brief inline showing: moodboard thumbnails, key messages list, do's/don'ts columns, hashtags and mentions as chips.

Default state: all collapsed.

#### Section 3 — Creators & Deliverables

Card container with header row:
- Left: "Creators & Deliverables"
- Right: `Edit ↗` (jumps back to Step 3)

Top summary sentence:
> 3 creators · 5 deliverables across Instagram (3) and YouTube (2) · All aligned to Brief 1

Table below:
| Creator       | Platform   | Format | Brief    | Notes |
|---------------|------------|--------|----------|-------|
| Al Rafaelo    | Instagram  | Story  | Brief 1  | —     |
| Al Rafaelo    | YouTube    | Video  | Brief 1  | —     |
| Anas Elshayib | Instagram  | Story  | Brief 1  | —     |
| Anas Elshayib | YouTube    | Video  | Brief 1  | —     |
| Cedra Ammara  | Instagram  | Story  | Brief 1  | —     |

Creator avatars next to names. If a creator has no deliverables, their row reads "No deliverables assigned yet" in italic muted text spanning the other columns.

#### Section 4 — What happens when you publish

Card container with lighter background tint (informational, not editorial). No Edit link.

Title: "What happens when you publish"

Prose bulleted list:
- Your campaign status changes from Draft to **Active**
- **[N] deliverable cards** will be created on the Deliverables Board, all starting in the **Confirmation** phase
- Target go-live date defaults to **[Flight End date]** for every deliverable — you can adjust individual dates later from the Deliverables Board
- You'll be taken to the Deliverables Board so you can start moving work forward

#### Footer

- Left: `← Back` (returns to Step 3)
- Right: `Save Draft` (secondary) + `Publish Campaign` (primary, green, small send icon)

#### On Publish action

1. Validate: Step 1 complete, Step 2 has at least one valid brief, Step 3 has any state (zero creators is OK)
2. Create Campaign record with state = Active
3. For each row in Section 3's table, create a Deliverable record:
   - creator_id, platform, format, brief_id, notes (copied from Step 3)
   - current_phase = "Confirmation"
   - target_go_live_date = campaign.flight_end
   - version_number = 1
4. Redirect user to `/campaigns/[id]/deliverables` (campaign workspace with Deliverables Board as default tab)
5. Show toast: "Campaign published! Your deliverables are ready to move."

#### Edit jump behavior

When a user clicks `Edit ↗` from Step 4:
1. URL becomes `/campaigns/new?step=[N]&id=[draftId]&returnTo=4`
2. User lands on the requested step
3. "Save & Continue" on that step reads the returnTo param and routes directly back to Step 4, skipping intermediate steps
4. If the user uses the stepper to navigate forward manually instead, returnTo param is cleared and normal flow resumes

---

## 6. Campaign workspace (opened by clicking a campaign)

### 6.1 Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ ← Back to Campaigns      Ramadan Fitness Challenge       [Active ▾] [⋯]│
│                          FitLife UAE · Apr 27 – May 27   Your role: ARC│
│                                                                      │
│ [Overview] [Briefs] [Creators] [Deliverables Board] [Report ↗]       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [tab content renders here]                                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.2 Page header
- Left: `← Back to Campaigns` breadcrumb link
- Center: Campaign name (large, bold) + subline with brand name · flight dates · role
- Right: Status dropdown (editable only if user has permission) + `⋯` menu
- Status dropdown values: Draft, Active, Finished (confirmations triggered on transitions)
- `⋯` menu: Duplicate campaign, Archive campaign, Delete campaign

### 6.3 Tab navigation
Five tabs in a row:
1. **Overview** — default tab for Finished campaigns, secondary for Active
2. **Briefs** — view/edit briefs (read-only if campaign is Finished)
3. **Creators** — view/edit creators and their deliverables (read-only if Finished)
4. **Deliverables Board** — the Kanban; default tab for Active campaigns, disabled for Drafts
5. **Report ↗** — outbound link to Reporting sidebar tab with this campaign pre-selected

Tab styling:
- Active tab: purple underline + bold text
- Inactive tabs: gray text
- Report tab: has small ↗ arrow icon next to label to signal outbound navigation
- Report tab hover: arrow shifts up-and-right by 1px

### 6.4 Default tab by state
- Draft campaign: clicking the row opens the wizard, not the workspace (workspace doesn't apply)
- Active campaign: default tab = Deliverables Board
- Finished campaign: default tab = Overview (read-only)

### 6.5 Overview tab

**Purpose:** At-a-glance status of the campaign.

**Contents:**
- Hero metrics row (4 cards):
  - Total Deliverables (count)
  - Deliverables Live (count + percentage)
  - Days Remaining (based on flight end date)
  - Budget Utilized (spent / total, as percentage)
- Mini-Kanban bar: horizontal bar showing card counts per phase, e.g., `Confirmation: 2 · Shoot: 1 · Edit: 0 · Review: 1 · Scheduled: 0 · Live: 1`
- Upcoming go-live dates: list of the next 7 days' scheduled deliverables
- Recent activity feed: last 10 card movements (e.g., "Al Rafaelo's IG Reel moved to Review — 2h ago")

### 6.6 Briefs tab

**Purpose:** View and edit the campaign's briefs post-launch.

**Contents:**
- Same UI as Step 2 of the wizard, but in edit mode
- Briefs are listed as expandable cards (default collapsed)
- Each can be edited inline
- `+ Add Brief` button to add new briefs post-launch
- Deleting a brief requires confirmation and reassignment of any tagged deliverables

**Read-only for Finished campaigns:** All inputs disabled, delete buttons hidden.

### 6.7 Creators tab

**Purpose:** View and manage the creator roster, including adding/removing creators and editing deliverables post-launch.

**Contents:**
- Same UI as Step 3 Section A + B of the wizard, but in edit mode
- Search bar and "Select from saved list" at the top
- Shortlisted creators as editable cards below
- `+ Add Deliverable` per creator
- Trash icon to remove creators (with deliverable cascade warning)

**Withdrawal handling (post-launch only):**
- Each creator card has a `⋯` menu with options: Edit deliverables (scrolls to their row), Mark as withdrawn, Remove from campaign
- Marking as withdrawn:
  - Applies strikethrough to creator name and all their deliverable cards on the Kanban
  - Creator gets a "Withdrawn" pill next to name
  - Kanban cards move to a collapsed "Withdrawn" section at the bottom of the Confirmation column
  - Creator remains in reporting with "Withdrawn — 0 deliverables completed"
- Removing from campaign: deletes creator and all their deliverables entirely (hard confirmation required)

**Per-deliverable withdrawal:**
- Each deliverable row has its own `⋯` menu: Withdraw this deliverable, Remove entirely
- Withdrawing strikes through the deliverable and moves it to Withdrawn section on the Kanban
- Other deliverables for that creator continue normally

### 6.8 Deliverables Board tab (Kanban)

**Purpose:** The execution surface. Drag-and-drop cards through production phases.

**Detailed in a separate spec document** (recommended next deliverable). For this PRD, key requirements:

- Six columns: Confirmation → Shoot → Edit → Review & Changes → Approved & Scheduled → Live
- One card per deliverable
- Drag-and-drop to move between columns
- Phase transitions trigger modals for required fields (e.g., Live requires post URL)
- Filters: by brief, by creator, by platform, by status
- Each card shows: creator avatar + handle, platform icon + format, brief tag, days-in-phase, version number (if revisions), status dot
- Card click opens side drawer with full details
- Withdrawn section at bottom of Confirmation column (collapsible)

### 6.9 Report tab (outbound)

**Behavior:**
- Clicking this tab does NOT load content inline
- Instead, navigates user to `/reporting/campaigns/[id]` (Reporting sidebar tab with this campaign pre-selected)
- On the Reporting page, a breadcrumb at top reads: `← Back to Ramadan Fitness Challenge` to return to this workspace

---

## 7. Data model

### 7.1 Campaign

```
Campaign {
  id: UUID
  name: string (200 char max)
  brand_name: string
  product_description: string
  goal: enum (BRAND_AWARENESS, PRODUCT_LAUNCH, LEAD_GENERATION, SALES_CONVERSIONS, CONTENT_CREATION, EVENT_PROMOTION, APP_INSTALLS, COMMUNITY_BUILDING)
  platforms: array of enum (INSTAGRAM, YOUTUBE, TIKTOK, TWITTER, LINKEDIN, SNAPCHAT)
  countries: array of ISO country codes
  audience_age_ranges: array of enum (13_17, 18_24, 25_34, 35_44, 45_54, 55_PLUS)
  total_budget: decimal
  currency: ISO currency code
  flight_start: date
  flight_end: date
  state: enum (DRAFT, ACTIVE, FINISHED)
  created_at: timestamp
  updated_at: timestamp
  created_by: user_id
  last_edited_step: integer (1-4, for resuming drafts)
}
```

### 7.2 Brief

```
Brief {
  id: UUID
  campaign_id: UUID (foreign key)
  title: string
  moodboard_urls: array of strings
  key_messages: array of strings
  dos: array of strings
  donts: array of strings
  hashtags: array of strings
  mentions: array of strings
  created_at: timestamp
  updated_at: timestamp
}
```

### 7.3 Creator

```
Creator {
  id: UUID
  name: string
  handle: string
  primary_platform: enum
  follower_count: integer
  avatar_url: string
  contact_email: string
  // creators exist independently of campaigns
  // many-to-many relationship via CampaignCreator join table
}

CampaignCreator {
  id: UUID
  campaign_id: UUID
  creator_id: UUID
  status: enum (ACTIVE, WITHDRAWN) // only post-launch
  added_at: timestamp
}
```

### 7.4 Deliverable

```
Deliverable {
  id: UUID
  campaign_id: UUID (foreign key)
  creator_id: UUID (foreign key)
  brief_id: UUID (foreign key, optional)
  platform: enum
  format: enum (Reel, Story, Post, Video, Short, etc.)
  notes: string (optional)
  current_phase: enum (CONFIRMATION, SHOOT, EDIT, REVIEW, SCHEDULED, LIVE, WITHDRAWN)
  target_go_live_date: date (defaults to campaign.flight_end)
  actual_go_live_date: date (set when moved to LIVE)
  post_url: string (required for LIVE phase)
  version_number: integer (starts at 1, increments on revision requests)
  revision_notes: array of strings (one per revision request)
  draft_link: string (required for REVIEW phase)
  created_at: timestamp
  updated_at: timestamp
}
```

---

## 8. Permissions

For v1, only the ARC Manager role is implemented in detail. Structure the codebase to support role-based permissions but don't build the Brand Client view yet.

| Role            | Can do                                                                         |
|-----------------|--------------------------------------------------------------------------------|
| ARC Manager     | Full CRUD on campaigns, briefs, creators, deliverables. Can publish, pause, finish.|
| Brand Client    | (Out of scope v1) View-only access to assigned campaigns. Can leave comments on Review phase deliverables. Cannot edit.|

---

## 9. Visual design system

### 9.1 Color usage (consistent across entire app)

| Color  | Usage                                                                |
|--------|----------------------------------------------------------------------|
| Gray   | Neutral, not started, draft metadata                                 |
| Purple | Primary actions, current step in wizard, VAIRAL brand accent         |
| Amber  | Draft state, attention needed, Review & Changes phase, pause actions |
| Teal   | Approved & Scheduled phase, completed steps in wizard                |
| Green  | Active campaign state, Live deliverables, Publish action             |
| Red    | Destructive actions (delete), blocked/overdue cards, errors          |
| Blue   | In-progress phases (Shoot, Edit) — optional, can use gray            |

### 9.2 Spacing and typography
- Use generous vertical whitespace between sections (24–32px)
- Primary text: dark navy/black
- Secondary text: muted gray
- Card backgrounds: white on a subtle gradient page background (VAIRAL light blue-purple)
- Section headers: 18–20px bold
- Body text: 14–16px regular

### 9.3 Components to build (reusable)
- PillGroup (single-select and multi-select variants)
- ChipInput (for hashtags, mentions)
- CountryPicker (searchable with flags)
- RepeatableRows (for key messages, dos, donts)
- MoodboardGrid (URL paste + thumbnail render)
- WizardStepper (horizontal top stepper with 4 steps)
- BulkActionBar (sticky banner with contextual actions)
- StatusPill (colored pills for campaign states)
- ProgressBar (6-segment phase distribution)

### 9.4 Things to avoid (explicitly)
- Large card-based selectors for simple choices (goal, format)
- Nested sidebars inside modal/wizard flows
- Multiple "Draft saved" or "Auto-saving" indicators on the same screen
- Fake dashboards or metrics on pre-launch screens
- Icons inside Kanban cards (text only)
- Emoji anywhere in the UI
- Destructive actions (Delete) sitting next to support CTAs

---

## 10. Out of scope for this PRD

The following are explicitly out of scope for the Manage Campaigns tab and are documented separately:

- **Reporting tab** (all 3 views: Campaign-level, Creator-level, Analysis)
- **Deliverables Board detailed spec** (Kanban card design, drawer design, transition modals) — separate document recommended
- **Creator-facing portal** (creators submitting metrics themselves) — post-v1
- **Brand Client view** (read-only campaign access) — post-v1
- **Authentication and user management**
- **Notifications and email/in-app alerts**
- **Integrations** (YouTube API, Meta API, TikTok API) — post-v1

---

## 11. Acceptance criteria

The Manage Campaigns tab is considered complete when:

1. User can land on the campaigns list and see all campaigns filtered by state
2. User can search, sort, and filter the campaigns list
3. User can perform bulk actions
4. User can duplicate a campaign
5. User can click "Create Campaign" and progress through all 4 wizard steps
6. User can exit the wizard at any step and resume from the Drafts tab
7. User can jump back from Step 4 to any earlier step via Edit links
8. User can publish a campaign
9. User can click any campaign row and open the campaign workspace with 5 tabs
10. Campaign state transitions work with proper confirmations
11. User can add/remove creators and deliverables post-launch
12. Creator and deliverable withdrawal works correctly
13. Report tab clicks navigate correctly
14. All empty states are designed and implemented
15. Draft auto-save works
16. Visual design matches the VAIRAL design system
