# UI Refactor Change Log

## 1. Context

Before the refactor, Lingofy had two main UI directions:

- The graph view component used a neobrutalist style: light background, thick black borders, hard shadows, clear buttons, and a visual-workspace feel.
- The remaining pages used a dark mode/glass style: dark gradient backgrounds, soft cards, thin borders, and light shadows.

Both directions had their own strengths, but when users moved between pages such as `Topic Detail`, `Table`, `Import`, `Smart Review`, `Profile`, and `Graph View`, the experience felt fragmented. Graph view felt like a different product instead of one part of the same system.

## 2. Reason For The Change

The main reasons for the change were:

- Increase UI consistency between graph view and the other pages.
- Reduce isolated hard-coded styling inside individual components.
- Create a design system so the visual language can be managed centrally.
- Preserve graph view because it already has a clear identity and works well.
- Move the remaining pages closer to the graph view style while keeping dark mode as the foundation.

The original problem was not that dark mode was wrong or that graph view was wrong. The problem was the lack of a shared design-language layer connecting the two parts.

## 3. Goal

The goal of the refactor:

- Unify the system around a `Dark Neo-Brutal UI` direction.
- Keep dark mode for learning and review pages because it fits long vocabulary study sessions.
- Bring the strongest traits of graph view into the other pages:
  - thicker borders
  - block-style shadows
  - sturdier buttons
  - clearer card/panel structure
  - bolder typography
  - more visible cyan accents
- Create reusable UI primitives so future visual changes can happen in one place instead of being repeated page by page.
- Do not refactor dashboard/admin pages, per the original scope.

## 4. Design Direction

The selected design direction is:

```text
Dark Neo-Brutal Learning UI
```

This decision means:

- The app shell and primary pages continue to use dark mode.
- Graph view remains a light neobrutalist canvas, similar to workspaces such as Figma or Miro.
- Dark-mode pages are upgraded with border, shadow, button, and panel styling so they feel like they belong to the same ecosystem as graph view.

The entire app was not moved to a light background because that could make review/profile/table pages feel too heavy and less suitable for long study sessions.

## 5. Actions Completed

### 5.1 Added Design Tokens

File:

- `src/app/globals.css`

Added CSS variables for the dark neo-brutal system:

- `--neo-bg`
- `--neo-surface`
- `--neo-surface-raised`
- `--neo-line`
- `--neo-line-strong`
- `--neo-primary`
- `--neo-success`
- `--neo-warning`
- `--neo-danger`
- `--neo-shadow`
- `--neo-shadow-sm`
- `--neo-radius`

The purpose is to centralize visual decisions into tokens so they are easier to change later.

### 5.2 Extended Existing UI Primitives

Files:

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`

Added button variants:

- `neo`
- `neoSecondary`
- `neoDanger`
- `neoGhost`

Added card variants:

- `neo`
- `neoSubtle`

The purpose is to avoid repeating long Tailwind class lists inside each page.

### 5.3 Added Reusable Neo Components

File:

- `src/components/ui/neo.tsx`

Created shared components:

- `NeoPage`: standard layout container for pages.
- `NeoPanel`: panel/card with neo-brutal border and shadow.
- `NeoHeader`: page header with title, description, breadcrumb, and actions.
- `NeoToolbar`: toolbar for filters, tabs, and actions.
- `NeoStat`: stat box for review/profile metrics.
- `NeoSectionTitle`: shared section title when needed.

This is the new design-system layer so pages no longer need to hard-code visual styling directly.

## 6. Pages/Components Updated

### 6.1 Topic Detail Page

Files:

- `src/app/projects/[projectId]/topics/[topicId]/page.tsx`
- `src/components/DataTable.tsx`

Changes:

- Topic header now uses `NeoHeader`.
- Action buttons use `neo` and `neoSecondary`.
- Table/filter toolbar uses `NeoToolbar`.
- Table container uses `NeoPanel`.
- The `Table / Graph` segmented control was changed to a neo-brutal style.
- Import/Edit buttons use the new button variants.

Purpose:

- Make the table page visually closer to graph view.
- Reduce the style shock when the user switches from table to graph.

### 6.2 Import Vocabulary Page

File:

- `src/components/vocabulary/VocabularyImportClient.tsx`

Changes:

- Header uses `NeoHeader`.
- Textarea was changed into a workspace-style input with a thick border, mono font, and block shadow.
- Preview/save buttons use the new variants.
- Preview table container uses `NeoPanel`.

Purpose:

- Turn the import page into a clearer tool surface.
- Reduce the feeling that the page is empty or detached from graph/table.

### 6.3 Smart Review Pages

Files:

- `src/app/review/page.tsx`
- `src/components/srs/ProjectReviewOverview.tsx`
- `src/components/srs/ReviewSession.tsx`

Changes:

- Smart Review header uses `NeoHeader`.
- Project review cards use `NeoPanel`.
- Review stats use `NeoStat`.
- Overdue/weak/due metrics have clearer color tones.
- Review session cards, progress bar, and answer buttons now use border/shadow styling.
- Summary/overview panels use the shared `NeoPanel`.

Purpose:

- Make the review flow clearer and more systematic.
- Improve recognition of important states: due, weak, overdue, correct, and incorrect.

### 6.4 Profile Pages

Files:

- `src/app/profile/page.tsx`
- `src/components/profile/ActivityStatistics.tsx`
- `src/components/profile/ProfileQrScannerCard.tsx`
- `src/components/profile/ApiKeyManagement.tsx`

Changes:

- Tabs wrapper uses `NeoToolbar`.
- Account/stat/heatmap cards use `NeoPanel`.
- Stats typography is bolder and uses stronger accent colors.
- QR sign-in and API settings cards use the `neo` card variant.
- Primary actions use the new button variants.

Purpose:

- Align profile with the review/dashboard learning style.
- Make metrics such as review count, streak, and accuracy more prominent.

### 6.5 Learner Dashboard And Project Pages

Files:

- `src/components/dashboard/UserDashboard.tsx`
- `src/app/projects/[projectId]/page.tsx`
- `src/components/projects/TopicCardClient.tsx`
- `src/components/projects/ProjectCreate.tsx`
- `src/components/projects/TopicCreate.tsx`
- `src/components/projects/ProjectHeaderEditor.tsx`

Changes:

- Dashboard and project pages now use `NeoPage`, `NeoHeader`, `NeoPanel`, `NeoToolbar`, and `NeoSectionTitle`.
- Project and topic cards now use neo-brutal borders, block shadows, stronger titles, and clearer stat pills.
- Empty states were moved from soft glass panels to structured `NeoPanel` surfaces.
- Create-project and create-topic drawers were aligned with the neo-brutal surface treatment.
- Inline project/topic editing controls now use the neo action styling.

Purpose:

- Make the learner entry points match the already-refactored topic detail page.
- Remove the remaining generic dark SaaS/glass look from the core learning flow.

### 6.6 Project Analytics And Public Topic Pages

Files:

- `src/app/projects/[projectId]/analytics/page.tsx`
- `src/app/public/topics/[shareId]/page.tsx`
- `src/components/topics/PublicTopicActions.tsx`

Changes:

- Project analytics now uses `NeoHeader`, `NeoStat`, and `NeoPanel`.
- Analytics chart container now uses a dark neo-brutal panel.
- Public topic page now uses `NeoPage`, `NeoHeader`, and `NeoPanel`.
- Public vocabulary cards and story panel now match the same card system.
- Public topic actions use the neo button variants.

Purpose:

- Keep secondary learner-facing pages consistent with the main project/topic flow.
- Avoid sending shared-topic users into an older visual language.

## 7. Scope Not Changed

The following areas were not refactored:

- `/dashboard`
- dashboard/admin sub-pages
- core graph view visual style
- learning/review/import logic
- API/service layer
- data model

Graph view remains a light neobrutalist canvas. Only the surrounding pages were adjusted to share the same design language.

## 8. Expected Result

After the change, the UI system should have these traits:

- More consistency between table/import/review/profile/project pages and graph view.
- Less isolated hard-coded styling.
- Easier visual-language updates through tokens and primitive components.
- Pages feel like a learning tool with a distinct identity instead of a generic dark SaaS app.
- Graph view keeps its role as the standout visual workspace.

## 9. Verification Notes

Ran:

```bash
git diff --check
```

Result: passed, no whitespace errors.

Ran:

```bash
npm run lint
```

Result: lint did not run to completion because `next lint` opened the interactive ESLint configuration prompt. The repo needs ESLint configuration before this command can be used non-interactively.

Ran:

```bash
npm run typecheck
```

Result: typecheck failed on existing type/model issues outside this UI pass, including Prisma `Vocabulary` exports, PWA `Element.href`, `BarcodeDetector`, `TopicSwitcher` ref typing, missing `DueReviewBadge`, `ProjectContext` `name` vs `title` mismatches, and mock-data shape mismatches. The UI files updated in this pass were adjusted so they no longer add separate typecheck failures.

Still recommended:

```bash
npm run dev
```

Then manually verify these routes:

- `/`
- `/projects/[projectId]`
- `/projects/[projectId]/analytics`
- `/projects/[projectId]/topics/[topicId]`
- `/projects/[projectId]/topics/[topicId]/import`
- `/public/topics/[shareId]`
- `/review`
- `/profile`
- graph view inside topic detail
