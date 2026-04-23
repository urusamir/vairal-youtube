# Discover — Product Requirements Document

**Product:** VAIRAL — Influencer Marketing Platform
**Scope:** Discover sidebar tab (complete)
**Audience:** ARC Manager (primary user for v1)
**Platform:** Web, desktop-first

---

## 1. Overview

The Discover tab is where ARC Managers browse the creator database, research individual creators via detailed insight modals, save favorites, and organize creators into purpose-built Talent Lists that can later be attached to campaigns.

This tab contains three inner tabs:

1. **Creators** — the full searchable/filterable creator grid (default view)
2. **Saved Creators** — a flat favorites bucket populated by the heart icon
3. **Talent Lists** — user-created named lists for future campaign use

A clicked creator card opens a full-screen modal showing detailed audience and demographic insights.

Data shown in Discover is manually uploaded by the platform admin (no API integrations in v1). All 100+ creator records and their insight data are populated from admin-provided source files.

---

## 2. Mental model

**Three independent concepts:**
- A creator **exists** in the platform database (admin-uploaded)
- A creator can be **saved** (heart icon) — appears in Saved Creators tab
- A creator can be **listed** (list icon) — appears in one or more Talent Lists

Saved and Listed are orthogonal. A creator can be:
- Neither saved nor listed (just exists in Discover)
- Saved only (in Saved Creators tab, not in any list)
- Listed only (in one or more Talent Lists, no heart)
- Both saved and in multiple lists

**Why both exist:**
- **Saved Creators** is a personal favorites bucket — quick emotional reactions ("I like this person"). Flat, ungrouped, one click to save or unsave.
- **Talent Lists** are curated collections for operational use — "creators I'm considering for the Ramadan campaign", "my pool of Saudi food creators". Named, grouped, attached to campaigns later.

These serve different moments in the workflow: Saved is for browsing/discovery, Lists are for shortlisting.

---

## 3. Discover tab (the main Creators view)

### 3.1 Purpose

The default view when a user clicks Discover in the sidebar. Shows a searchable, filterable grid of all creators in the database.

### 3.2 Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Creators] [Saved Creators] [Talent Lists]            [⊞ Grid] [☰ List]  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                      │                   │
│ ┌─ Search by name, handle, location, interest... ─┐  │  FILTERS          │
│ └───────────────────────────────────────────────────┘  │                 │
│                                                      │  Platform          │
│ 100 creators       Sort by [Total Followers ▾] [↓]   │  [All] [YT] [IG] [TT]│
│                                                      │                   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                  │  Category         │
│ │ creator │ │ creator │ │ creator │                  │  [Beauty] [Tech]..│
│ │  card   │ │  card   │ │  card   │                  │                   │
│ └─────────┘ └─────────┘ └─────────┘                  │  Follower count   │
│                                                      │  [────●─────] 1M+ │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                  │                   │
│ │ creator │ │ creator │ │ creator │                  │  Engagement rate  │
│ │  card   │ │  card   │ │  card   │                  │  [──●───────] 2%+ │
│ └─────────┘ └─────────┘ └─────────┘                  │                   │
│                                                      │  Creator age      │
│                                                      │  [18-24][25-34]...│
│                                                      │                   │
│                                                      │  Language         │
│                                                      │  [English][Arabic]│
│                                                      │                   │
│                                                      │  Top interests    │
│                                                      │  [Automotive]...  │
│                                                      │                   │
│                                                      │  Audience cred.   │
│                                                      │  [──●───────] 60%+│
│                                                      │                   │
│                                                      │  [Reset filters]  │
└──────────────────────────────────────────────────────┴───────────────────┘
```

### 3.3 Top tab bar

Three inner tabs plus view toggle, top of page:
- `Creators` (default active)
- `Saved Creators`
- `Talent Lists`

Active tab: purple underline + bold text, same pattern as rest of app.

Right-aligned on the same row: view toggle (grid ⊞ / list ☰). This toggle applies to Creators and Saved Creators tabs only; Talent Lists has its own layout.

### 3.4 Search bar

Full-width input at the top of the content area:
- Placeholder: "Search by name, handle, location, or interest..."
- Case-insensitive, searches across: creator name, handle, location string, and all `top_interests` tags
- Debounced (300ms) — no explicit search button needed
- Live-filters the visible creators as the user types
- No search results state: "No creators match your search. Try different keywords or reset filters."

### 3.5 Results meta row

Below the search bar:
- Left: count of matching creators (e.g., "100 creators" or "23 creators match")
- Right: Sort controls
  - Sort dropdown: Total Followers (default), Engagement Rate, Recently Added, Name A–Z
  - Ascending/descending toggle (arrow icon)

### 3.6 Creator card (grid view)

Each creator displayed as a rounded white card. Anatomy:

```
┌─────────────────────────────────┐
│         [list icon] [♡ heart]   │
│                                 │
│           ┌─────────┐           │
│           │ avatar  │ ✓         │
│           └─────────┘           │
│                                 │
│         Sherin Amara            │
│         @sherinsbeauty          │
│      📍 Dubai, UAE              │
│                                 │
│  ───────────────────────────    │
│                                 │
│   12.3M         5.18%           │
│   Followers   Eng. Rate         │
│                                 │
│   [Family] [Fashion]            │
└─────────────────────────────────┘
```

**Card elements:**
- **Top-right icons** (hover-visible or always-visible — recommend always-visible):
  - List icon — opens "Add to list" modal
  - Heart icon — toggles saved state. Filled red when saved, gray outline when not saved.
- **Avatar** — circular, centered, with a small verification checkmark badge (purple) in the bottom-right if the creator is verified on their platform
- **Name** — bold, centered
- **Handle** — purple text, centered (@sherinsbeauty style)
- **Location** — pin icon + city, country, centered, muted gray
- **Separator line**
- **Stats row** — two columns side by side:
  - Followers count (bold number, "Followers" label below)
  - Engagement rate (bold green %, "Eng. Rate" label below)
- **Category chips** — up to 2–3 visible, the first styled with a purple tint (primary category), others gray. Additional categories hidden with a "+3 more" chip if overflow.

**Card interaction:**
- Clicking anywhere on the card (except the two icons) opens the Creator Insights modal (Section 5)
- Clicking heart toggles saved state, shows a subtle animation, and the icon fills red
- Clicking list icon opens the Add-to-list modal (Section 4.5)

### 3.7 Creator row (list view)

When list view is toggled, creators render as horizontal rows in a table:

| Avatar | Creator (name + handle) | Platform | Followers | Eng. Rate | Location | Categories | [♡] [list] |

Same click behaviors as grid cards.

### 3.8 Filters panel (right side)

Persistent right-side panel, ~280px wide. Does not collapse in v1.

**Filter sections (top to bottom):**

**1. Platform**
Segmented pill group with icon+label for each:
- All (default)
- YouTube
- Instagram
- TikTok

Single-select. Clicking a platform filters creators whose `primary_platform` matches.

**2. Category**
Wrapped pill chips, multi-select:
- Beauty, Tech, Lifestyle, Fitness, Automotive, Travel, Finance, Food, Fashion, Gaming, Wellness

Clicking a pill toggles selection. Selected pills fill with darker background.

**3. Follower count (range slider)**
Single-thumb slider representing minimum follower count.

**Granularity:** Steps of 50,000 from 50K to 10M+
- 50K, 100K, 150K, 200K, ..., 9.95M, 10M+
- The last stop is "10M+" (unbounded upward)

Label displays current value (e.g., "250K+", "1.5M+", "10M+"). Default: Any (no minimum applied).

**4. Engagement rate (range slider)**
Single-thumb slider for minimum engagement rate.

**Granularity:** Steps of 0.5% from 0% to 20%+
- 0%, 0.5%, 1%, 1.5%, 2%, ..., 19.5%, 20%+

Label displays current value (e.g., "3.5%+"). Default: Any.

**5. Creator age**
Pill chips, multi-select:
- 18–24, 25–34, 35–44, 45+

**6. Language**
Pill chips, multi-select:
- English, Arabic, Korean, Spanish, French, Hindi (customizable list based on uploaded data)

**7. Top interests**
Wrapped pill chips, multi-select (this mirrors categories somewhat — kept separate because interests describe audience affinity, categories describe creator content):
- Automotive, Beauty, Business, Cooking, Design, Esports, Family, Fashion, Finance, Fitness, Food, Gaming, Health, Home, Hospitality, K-Culture, Lifestyle, Parenting, Photography, Tech, Travel, Wellness

**8. Gender**
Segmented group:
- All (default), Female, Male, Non-binary

**9. Audience credibility (range slider)**
Single-thumb slider for minimum audience credibility score.

**Granularity:** Steps of 5% from 0% to 95%+
- 0%, 5%, 10%, ..., 90%, 95%+

(Audience credibility = the % of real/genuine followers, from the uploaded insights data.)

**10. Location (covered in existing screenshot)**
Search input at top, scrollable list of countries with flag icons below. Multi-select via radio buttons (actually checkboxes since multi-select — spec as checkboxes with filled state on selection).

**Reset button:** Bottom of the panel, full-width secondary button: "Reset filters". Clears all filter selections back to defaults.

**Filter behavior:**
- All filters apply simultaneously (AND logic across filter types, OR logic within multi-select filters)
- Filter state persists across tab switches but resets on sidebar nav away from Discover
- Active filter count badge appears next to the "Filters" heading (e.g., "Filters (3)") when any non-default filter is applied

### 3.9 Empty states

- **No creators in database** (shouldn't happen in prod, but defensive): "No creators available yet. Creators will appear here once they're added to the platform."
- **No matches after filter/search:** "No creators match your criteria. Try adjusting filters or [resetting them]."

### 3.10 Performance notes

Since the creator dataset is manually uploaded (not API-fed) and expected to be ~100–500 records in v1, client-side filtering is acceptable. Load all creator metadata on tab open; filter in-memory. For v2+ when database grows, move to server-side filtering with pagination.

---

## 4. Saved Creators tab

### 4.1 Purpose

A flat, ungrouped list of creators the user has hearted. Functions as a "favorites" bucket — quick emotional shortlist independent of any campaign or use case.

### 4.2 Layout

Visually near-identical to the Creators tab:
- Same search bar
- Same sort controls
- Same grid/list view toggle
- Same right-side filter panel
- Same creator card UI

The only differences:
- Only shows creators where the current user has toggled heart = true
- Result count reflects saved-only count (e.g., "1 creator" in the screenshot)
- Heart icon on each card is filled red by default (clicking unsaves and immediately removes the card from the view, with a toast: "Removed from saved. [Undo]")
- If zero saved: Empty state — "No saved creators yet. Click the ♡ heart on any creator to save them here."

### 4.3 Heart interaction (applies everywhere in the app)

**Toggle behavior:**
- Unfilled gray outline heart = not saved
- Click to save → heart animates to filled red, small haptic/visual feedback, no modal, no prompt
- Filled red heart = saved
- Click to unsave → heart animates to gray outline, creator remains in view (unless inside Saved Creators tab, where it disappears)

**No list prompting.** Saving is strictly a one-click toggle. If the user wants to add the creator to a list, they click the separate list icon.

**State is per-user, not global.** Each ARC Manager has their own saved set.

### 4.4 Filter and search on Saved Creators

All filters and search work identically to the Creators tab, scoped to the saved subset. Useful when a user has hearted many creators and wants to find "my saved Dubai-based beauty creators."

### 4.5 Filter panel note

The filter panel on Saved Creators tab is contextually less important (saved set is usually smaller), but keep it for consistency. Same component, same filter options.

---

## 5. Creator Insights modal

### 5.1 Purpose

When any creator card is clicked (from any context — Discover, Saved, or inside a Talent List), a full-screen modal opens showing detailed audience and demographic insights for that creator.

This modal is the key decision surface — ARC Managers use it to evaluate whether a creator fits a campaign before adding them to a list or selecting them in Step 3 of campaign creation.

### 5.2 Trigger

- Clicking anywhere on a creator card except the heart or list icons
- Clicking a creator name in any creator table (campaign Creators tab, list detail view, etc.)

### 5.3 Layout

Modal opens as a full-screen overlay with a semi-transparent dark backdrop. Close button (×) top-right.

```
┌──────────────────────────────────────────────────────────────────┐
│ [avatar] Ossy Marwah ✓                                      [×] │
│          @ossymarwah · 📍 Dubai, UAE                            │
│          [Instagram pill] [Male pill]                           │
│                                                                  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │9.1M  │ │10.06%│ │918K  │ │20K   │ │21.1M │ │ 187  │         │
│ │Follow│ │EngRt │ │AvgLik│ │AvgCmt│ │AvgRls│ │Posts │         │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘         │
│                                                                  │
│ ┌──── Age Distribution ────────┐ ┌──── Gender Split ──────────┐ │
│ │ 13–17 ▓▓─────────── 11%      │ │  [donut chart]             │ │
│ │ 18–24 ▓▓▓▓▓▓─────── 50.28%   │ │  Female 74.09%             │ │
│ │ 25–34 ▓▓▓▓▓─────── 34.14%    │ │  Male   25.91%             │ │
│ │ 35–44 ▓────────── 3.6%       │ │                            │ │
│ └──────────────────────────────┘ └────────────────────────────┘ │
│                                                                  │
│ ┌──── Top Countries ──────────┐ ┌──── Top Cities ────────────┐ │
│ │ Algeria  ▓▓▓▓▓▓ 11.8%       │ │ Baghdad ▓▓▓▓ 4.8%          │ │
│ │ Morocco  ▓▓▓▓▓ 10.2%        │ │ Algiers ▓▓▓ 2.8%           │ │
│ │ Iraq     ▓▓▓▓ 9%            │ │ Cairo   ▓▓▓ 2.2%           │ │
│ └──────────────────────────────┘ └────────────────────────────┘ │
│                                                                  │
│ ⭐ Top Interests                                                │
│ [Fashion 34.3%] [Photography 24.1%] [Food & Dining 24.1%] ...   │
│                                                                  │
│ 🛡 Audience Quality                                             │
│ Follower Credibility  ▓▓▓▓▓▓▓▓▓▓────  72.69%                    │
│ Notable Followers     ▓─────────────  3.37%                     │
│                                                                  │
│ 📞 Platforms & Contact                                          │
│ [Instagram button] [Email button]                               │
│ 📍 Dubai / Los Angeles   YouTube: 12M+                          │
│                                                                  │
│                              [♡ Save] [+ Add to list] [× Close] │
└──────────────────────────────────────────────────────────────────┘
```

### 5.4 Modal sections (top to bottom)

**1. Header**
- Avatar (left), name + verification checkmark
- Handle and location
- Platform badge (with icon, color-matched to platform — pink/gradient for Instagram, red for YouTube, black for TikTok)
- Gender badge

**2. Stats row (6 cards in a horizontal row)**
Each card displays a single number + label:
- Followers
- Engagement Rate (formatted as %)
- Average Likes
- Average Comments
- Average Reels Views (for IG creators) / Average Video Views (for YouTube) / Average Views (for TikTok)
- Total Posts

**3. Age Distribution + Gender Split (two-column row)**
- Age distribution: horizontal bar chart with 4 age bracket rows (13–17, 18–24, 25–34, 35–44, 45+). Bars use purple fill with percentage labels.
- Gender split: donut chart with pink (female) and purple (male) segments, plus labeled percentages.

**4. Top Countries + Top Cities (two-column row)**
- Top countries: horizontal bar chart, max 5 entries, with country name + flag emoji + percentage
- Top cities: horizontal bar chart, max 5 entries, teal-colored bars, city name + percentage

**5. Top Interests**
Section with a small star icon. Renders as wrapped chips, each showing interest name + percentage (e.g., "Fashion 34.3%"). Up to 10 interests shown.

**6. Audience Quality**
Section with a shield icon. Two horizontal progress bars:
- Follower Credibility (% of real/genuine followers) — green fill
- Notable Followers (% of followers with verified/influential accounts) — amber fill

Each bar labeled with the percentage on the right.

**7. Platforms & Contact**
Section with a phone icon.
- Row of buttons for each platform the creator is on (clickable, opens platform profile in new tab) — styled with platform-colored fills
- Email button (opens mailto: or copies email to clipboard)
- Footer line with additional context: dual city (if applicable, e.g., "Dubai / Los Angeles"), and cross-platform reach ("YouTube: 12M+")

**8. Footer actions**
Sticky to bottom of modal:
- Left or right group:
  - `♡ Save` (toggles saved state — same behavior as heart icon on cards)
  - `+ Add to list` (opens Add-to-list modal)
- Close button: `×` (top-right corner, always visible while scrolling)

### 5.5 Modal behavior

- Clicking the backdrop closes the modal
- ESC key closes the modal
- Modal scrolls internally if content exceeds viewport height
- Header, stats row, and footer actions should be sticky-considered for long insights (stretch goal — keep simple scrolling for v1)

### 5.6 Data source

All insights data for each creator is pre-populated from the admin-uploaded source file. The modal is a pure-read view — no live API calls, no real-time data fetching.

---

## 6. Talent Lists tab

### 6.1 Purpose

User-created named lists for organizing creators around specific campaigns, seasons, themes, or use cases. Lists are reusable — the same list can be attached to a campaign during Step 3 of campaign creation to bulk-populate the creator roster.

### 6.2 Layout — Lists overview

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Creators] [Saved Creators] [Talent Lists]         [⊞ Grid] [☰ List] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Talent Lists                                        [+ Create List]  │
│                                                                      │
│ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│ │ Summer Glow     │  │ Ramadan Fitness │  │ Hotel Launch    │      │
│ │ Collection      │  │ Challenge       │  │                 │      │
│ │ 2 creators      │  │ 3 creators      │  │ 5 creators      │      │
│ └─────────────────┘  └─────────────────┘  └─────────────────┘      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Elements:**
- Section heading: "Talent Lists"
- `+ Create List` button, top-right, primary purple
- Grid of list cards

**Each list card contains:**
- List name (bold, truncated with ellipsis if too long)
- Creator count ("N creators")
- Clicking the card opens the list detail view
- Hover: subtle elevation/shadow increase
- Each card has a `⋯` menu icon (top-right corner, visible on hover):
  - Rename list
  - Duplicate list
  - Delete list (confirmation required)

### 6.3 Empty state

If no lists exist yet:
- Title: "No talent lists yet"
- Body: "Organize creators into lists by campaign, season, or theme. Lists can be attached to campaigns during creation."
- CTA: `+ Create your first list`

### 6.4 Create list modal

Triggered by `+ Create List` button or from the "Add to list" flow.

```
┌──────────────────────────────────────────┐
│ Create a new list                        │
│                                          │
│ List name                                │
│ [e.g. Summer Glow Collection        ]   │
│                                          │
│ Description (optional)                   │
│ [Short note about what this list is for] │
│                                          │
│                     [Cancel] [Create]    │
└──────────────────────────────────────────┘
```

**Fields:**
- **List name** — required, 3–100 characters, must be unique per user
- **Description** — optional, free text, 500 char max

**On Create:**
- Closes modal
- Navigates user to the newly-created list detail view (empty)
- Toast: "List created. Add creators from Discover or Saved."

### 6.5 List detail view

When a user clicks a list card, they land on the list detail view.

```
┌──────────────────────────────────────────────────────────────────────┐
│ ← Back to Talent Lists  Summer Glow Collection Launch                │
│                          2 creators                                  │
│                                                                      │
│                          [+ Add creators] [Exit Preview to Edit]     │
│                                                                      │
│                                             [Export CSV]             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Creator              Platform   Followers  Eng.Rate  Country    Added│
│                                                                      │
│ 🧑 Sherin Amara     Instagram  12.3M      5.18%    UAE       Apr 10│
│    @sherinsbeauty                                             [🗑]  │
│                                                                      │
│ 🧑 Ossy Marwah      Instagram  9.1M       10.06%   UAE       Apr 11│
│    @ossymarwah                                                [🗑]  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Header:**
- Back button: `← Back to Talent Lists`
- List name (large, bold, editable inline by clicking)
- Creator count subtitle ("2 creators")
- Actions on right:
  - `+ Add creators` (primary) — opens a picker modal to search and add creators to this list
  - `Export CSV` — exports the list as a CSV with creator details

**Table columns:**
| Column | Content |
|--------|---------|
| Creator | Avatar + name (bold) + @handle (smaller, purple) |
| Platform | Platform name (Instagram / YouTube / TikTok) |
| Followers | Formatted count (12.3M) |
| Eng. Rate | Green-colored percentage |
| Country | Country name |
| Added | Date the creator was added to this list |
| Actions | Trash icon to remove from list |

**Row interaction:**
- Clicking a row (except trash icon) opens the Creator Insights modal

**Remove creator:**
- Trash icon click triggers an inline confirmation toast ("Removed Sherin from Summer Glow Collection. [Undo]")
- Removing is soft — undo for 5 seconds before the remove is committed

**Add creators flow:**
- `+ Add creators` opens a modal showing the Discover creator grid (reusable component)
- Search/filter works the same way
- Clicking the list icon on a creator card toggles them in/out of the current list
- Clicking `Done` closes the modal and returns to the list detail view
- The list updates in real time

### 6.6 Rename list

- Click the list name in the header (inline edit state) OR use `⋯` menu → Rename
- Inline text input appears, user types, presses Enter or clicks outside to save
- Validation: same as create (unique name required)

### 6.7 Delete list

- `⋯` menu → Delete list
- Confirmation modal:
  - Title: "Delete this list?"
  - Body: "'Summer Glow Collection' contains 2 creators. Deleting the list won't remove the creators from the platform. This action can't be undone."
  - Buttons: `[Cancel]` `[Delete list]` (red)
- On confirm: list is deleted, user returned to Talent Lists overview, toast confirms deletion

### 6.8 Duplicate list

- `⋯` menu → Duplicate list
- Creates an immediate copy with " (copy)" appended to the name
- All creators in the original list are carried over
- User can rename afterwards
- No modal needed — just duplicate silently with a toast

### 6.9 List integration with campaigns

The connection to campaigns (mentioned in user requirements):
- During campaign creation Step 3, the "Select from saved list" dropdown displays all available Talent Lists
- Selecting a list pre-populates the shortlisted creators section with all creators from that list
- This is a one-time import — after selection, the campaign's creator roster is independent of the list (removing a creator from the list doesn't remove them from the campaign)
- Multiple lists can be combined — user can select List A, then List B, adding all creators from both (deduped)

**This behavior is documented here for cross-reference.** The actual implementation detail belongs in the Manage Campaigns PRD Section 5.4 (Step 3 of campaign creation).

---

## 7. Add-to-list modal (from Discover or Saved)

### 7.1 Purpose

When the user clicks the list icon on any creator card (from Creators tab, Saved Creators tab, or inside a list), a modal opens allowing them to add that creator to one or more lists.

### 7.2 Modal

```
┌──────────────────────────────────────────────┐
│ Add Sherin Amara to lists             [×]   │
│                                              │
│ [🔍 Search lists...                       ] │
│                                              │
│ ☑ Summer Glow Collection         (2)        │
│ ☐ Ramadan Fitness Challenge      (3)        │
│ ☐ Hotel Launch                   (5)        │
│                                              │
│ ─────────────────────────────────────        │
│ + Create new list                            │
│                                              │
│                           [Cancel] [Save]    │
└──────────────────────────────────────────────┘
```

**Contents:**
- Title: "Add [Creator Name] to lists"
- Search input to filter list names
- Checkbox list of all existing Talent Lists, with creator count in parentheses
- Checkboxes are pre-checked if the creator is already in that list (multi-select, can remove from some and add to others simultaneously)
- Bottom: `+ Create new list` link that opens the Create List modal inline (returns to this modal with the new list pre-checked after creation)
- Footer: `Cancel` and `Save`

**On Save:**
- Applies all checkbox changes (adds to newly-checked lists, removes from unchecked lists)
- Closes modal
- Toast: "Added Sherin to 2 lists"

---

## 8. Data model

### 8.1 Creator

```
Creator {
  id: UUID
  name: string
  handle: string
  primary_platform: enum (INSTAGRAM, YOUTUBE, TIKTOK)
  verified: boolean
  avatar_url: string
  location_city: string
  location_country: string (ISO country code)
  gender: enum (FEMALE, MALE, NON_BINARY, UNDISCLOSED)
  creator_age_bracket: enum (18_24, 25_34, 35_44, 45_PLUS)
  languages: array of string
  categories: array of string (Beauty, Tech, Lifestyle, etc.)
  top_interests: array of { interest: string, percentage: decimal }

  // Core stats
  followers: integer
  engagement_rate: decimal
  avg_likes: integer
  avg_comments: integer
  avg_views: integer (context-dependent per platform)
  total_posts: integer

  // Audience insights
  age_distribution: { 13_17: decimal, 18_24: decimal, 25_34: decimal, 35_44: decimal, 45_plus: decimal }
  gender_split: { female: decimal, male: decimal, other: decimal }
  top_countries: array of { country_code: string, percentage: decimal }
  top_cities: array of { city: string, percentage: decimal }

  // Quality scores
  follower_credibility: decimal
  notable_followers: decimal

  // Contact
  email: string (nullable)
  platforms: array of { platform: enum, url: string, follower_count: integer }

  // Metadata
  created_at: timestamp (when added to VAIRAL database)
  updated_at: timestamp
}
```

### 8.2 SavedCreator

```
SavedCreator {
  id: UUID
  user_id: UUID
  creator_id: UUID
  saved_at: timestamp
}
```
Unique constraint on (user_id, creator_id).

### 8.3 TalentList

```
TalentList {
  id: UUID
  user_id: UUID
  name: string (unique per user)
  description: string (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

### 8.4 TalentListCreator

```
TalentListCreator {
  id: UUID
  list_id: UUID
  creator_id: UUID
  added_at: timestamp
}
```
Unique constraint on (list_id, creator_id).

### 8.5 Admin data upload (out of UI scope)

Creator records are populated from an admin-uploaded file (JSON or CSV). The upload mechanism is not part of the Discover tab UI; it's an admin/backend concern. The PRD assumes creator data is already present in the database when the tab loads.

Expected admin source file format: JSON array of creator objects matching the schema in 8.1.

---

## 9. Visual design system

Uses the established VAIRAL design system:
- Light purple-blue gradient page background
- White rounded card surfaces
- Purple primary accent (for active tabs, primary buttons, @handles)
- Pink/red for heart (filled) saved state
- Green for positive metrics (engagement rate, follower credibility)
- Gray for secondary text, muted data

**Components to build (reusable):**
- `CreatorCard` (grid variant)
- `CreatorRow` (list variant)
- `CreatorInsightsModal`
- `FilterPanel` (right-side persistent panel with all filter sections)
- `RangeSlider` (with configurable step granularity, used for Follower count, Engagement rate, Audience credibility)
- `PillGroup` (reusable from Manage Campaigns)
- `AddToListModal`
- `CreateListModal`
- `TalentListCard` (used in Talent Lists overview)
- `HeartToggle` (the heart icon with animated state transitions)
- `ListIconButton` (the second icon on each card)

---

## 10. Out of scope for this PRD

- Admin upload interface for creator data (backend/CLI concern)
- Creator outreach / messaging (separate feature)
- Creator profile pages (standalone URLs) — insights only shown as modal in v1
- API integrations (Instagram/YouTube/TikTok) — manual data only for v1
- Bulk actions on Saved Creators or Talent Lists (not needed per user flow)
- Sharing a Talent List externally (link-based share) — post-v1
- Creator tagging beyond categories/interests (custom tags) — post-v1

---

## 11. Acceptance criteria

The Discover tab is considered complete when:

1. User can land on the Discover tab and see all creators in a grid
2. User can search creators by name, handle, location, or interest
3. User can toggle between grid and list view
4. All filter sections work with the specified granularity
5. Filters apply in real-time as they're adjusted
6. User can reset all filters with one click
7. Clicking a creator card opens the full Creator Insights modal with all sections populated
8. The modal can be closed via ×, ESC, or clicking outside
9. Clicking the heart icon toggles saved state with animated feedback
10. Saved creators appear in the Saved Creators tab, unsaved creators don't
11. Clicking the list icon opens the Add-to-list modal with existing lists shown
12. User can create a new list from the Add-to-list modal
13. User can create, rename, duplicate, and delete Talent Lists from the Talent Lists overview
14. User can view a list's detail page showing all creators in that list as a table
15. User can add and remove creators from a list
16. User can export a list as CSV
17. Creator Insights modal can be opened from any creator reference
18. All empty states are designed and implemented
19. Visual design matches the VAIRAL design system
