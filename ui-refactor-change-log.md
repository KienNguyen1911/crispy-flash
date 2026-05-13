# UI Refactor Change Log

## 1. Boi Canh

He thong Lingofy truoc refactor co 2 huong UI chinh:

- Graph view component dung phong cach neobrutalism: nen sang, border den day, shadow cung, nut bam ro rang, cam giac nhu visual workspace.
- Cac page con lai dung dark mode/glass style: nen toi gradient, card mem, border mong, shadow nhe.

Hai phong cach nay deu co diem manh rieng, nhung khi user di chuyen giua cac page nhu `Topic Detail`, `Table`, `Import`, `Smart Review`, `Profile` va `Graph View`, trai nghiem bi roi rac. Graph view tao cam giac la mot san pham khac thay vi mot phan cua cung mot he thong.

## 2. Nguyen Nhan Thay Doi

Ly do chinh cua thay doi:

- Can tang tinh nhat quan UI giua graph view va cac page khac.
- Can giam hard-code style rieng le trong tung component.
- Can tao mot design system de quan ly visual language tap trung.
- Can giu graph view vi component nay da co ban sac ro va dang hoat dong tot.
- Can chuyen cac page con lai sang mot style gan voi graph view hon ma van giu dark mode lam nen tang.

Van de ban dau khong phai la dark mode sai hay graph view sai. Van de la thieu mot lop design language dung chung de noi hai phan nay lai.

## 3. Muc Dich

Muc tieu cua refactor:

- Thong nhat he thong theo huong `Dark Neo-Brutal UI`.
- Giu dark mode cho cac page hoc tap va review de phu hop voi app hoc tu vung.
- Dua cac dac diem manh cua graph view vao cac page khac:
  - border day hon
  - shadow dang block
  - button chac hon
  - card/panel co cau truc ro hon
  - typography dam hon
  - accent cyan ro rang hon
- Tao reusable UI primitives de sau nay thay doi style o mot noi thay vi sua tung page.
- Khong refactor dashboard/admin pages theo yeu cau.

## 4. Huong Thiet Ke

Huong thiet ke duoc chon la:

```text
Dark Neo-Brutal Learning UI
```

Quyet dinh nay co y nghia:

- App shell va cac page chinh van dung dark mode.
- Graph view tiep tuc la canvas neobrutalism sang, tuong tu cac workspace nhu Figma/Miro.
- Cac page dark mode duoc nang cap bang border, shadow, button va panel style de giong cung mot he sinh thai voi graph view.

Khong chuyen toan bo app sang nen sang vi dieu do co the lam cac page review/profile/table qua nang va kem phu hop cho viec hoc lau.

## 5. Action Da Thuc Hien

### 5.1 Them design tokens

File:

- `src/app/globals.css`

Da them cac CSS variables cho dark neo-brutal system:

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

Muc dich la gom cac quyet dinh visual vao token de de doi sau nay.

### 5.2 Mo rong UI primitives hien co

Files:

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`

Da them button variants:

- `neo`
- `neoSecondary`
- `neoDanger`
- `neoGhost`

Da them card variants:

- `neo`
- `neoSubtle`

Muc dich la tranh lap lai class Tailwind dai trong tung page.

### 5.3 Them reusable Neo components

File:

- `src/components/ui/neo.tsx`

Da tao cac component dung chung:

- `NeoPage`: layout container chuan cho cac page.
- `NeoPanel`: panel/card co border va shadow neo-brutal.
- `NeoHeader`: header page co title, description, breadcrumb/action.
- `NeoToolbar`: toolbar dung cho filter, tabs, actions.
- `NeoStat`: stat box dung cho review/profile metrics.
- `NeoSectionTitle`: section title dung chung khi can.

Day la lop design system moi de cac page khong phai hard-code style truc tiep.

## 6. Page/Component Da Ap Dung

### 6.1 Topic detail page

Files:

- `src/app/projects/[projectId]/topics/[topicId]/page.tsx`
- `src/components/DataTable.tsx`

Thay doi:

- Header topic dung `NeoHeader`.
- Action buttons dung `neo` va `neoSecondary`.
- Toolbar table/filter dung `NeoToolbar`.
- Table container dung `NeoPanel`.
- Segmented control `Table / Graph` duoc doi sang style neo-brutal.
- Import/Edit buttons dung button variants moi.

Muc dich:

- Lam table page co visual gan hon voi graph view.
- Giam style shock khi user chuyen tu table sang graph.

### 6.2 Import vocabulary page

File:

- `src/components/vocabulary/VocabularyImportClient.tsx`

Thay doi:

- Header dung `NeoHeader`.
- Textarea duoc doi sang workspace-style input: border day, mono font, shadow block.
- Preview/save buttons dung variants moi.
- Preview table container dung `NeoPanel`.

Muc dich:

- Bien import page thanh mot tool surface ro rang hon.
- Giam cam giac page trong va tach roi so voi graph/table.

### 6.3 Smart Review pages

Files:

- `src/app/review/page.tsx`
- `src/components/srs/ProjectReviewOverview.tsx`
- `src/components/srs/ReviewSession.tsx`

Thay doi:

- Smart Review header dung `NeoHeader`.
- Project review cards dung `NeoPanel`.
- Review stats dung `NeoStat`.
- Overdue/weak/due metrics co tone mau ro hon.
- Review session card, progress bar va answer buttons duoc doi sang border/shadow style.
- Summary/overview panels dung chung `NeoPanel`.

Muc dich:

- Lam review flow trong ro rang va co tinh he thong hon.
- Tang do nhan dien cua cac state quan trong: due, weak, overdue, correct, incorrect.

### 6.4 Profile pages

Files:

- `src/app/profile/page.tsx`
- `src/components/profile/ActivityStatistics.tsx`
- `src/components/profile/ProfileQrScannerCard.tsx`
- `src/components/profile/ApiKeyManagement.tsx`

Thay doi:

- Tabs wrapper dung `NeoToolbar`.
- Account/stat/heatmap cards dung `NeoPanel`.
- Stats typography dam hon, dung accent color ro hon.
- QR sign-in va API settings card dung `neo` card variant.
- Primary actions dung button variants moi.

Muc dich:

- Dong bo profile voi review/dashboard learning style.
- Lam cac metrics nhu review count, streak, accuracy noi bat hon.

## 7. Pham Vi Khong Thay Doi

Khong refactor cac phan sau:

- `/dashboard`
- cac page con trong dashboard/admin
- core graph view visual style
- logic hoc/review/import
- API/service layer
- data model

Graph view van duoc giu la canvas neobrutalism sang. Chi cac page xung quanh duoc dieu chinh de co cung design language.

## 8. Ket Qua Mong Doi

Sau thay doi, UI system nen co cac dac diem:

- Nhat quan hon giua table/import/review/profile va graph view.
- It hard-code style rieng le hon.
- De doi visual language hon thong qua token va primitive components.
- Cac page co cam giac nhu mot learning tool co ban sac rieng thay vi generic dark SaaS.
- Graph view van giu vai tro visual workspace noi bat.

## 9. Ghi Chu Verification

Da chay:

```bash
git diff --check
```

Ket qua: pass, khong co whitespace error.

Chua chay duoc:

```bash
npm run typecheck
npm run dev
```

Ly do:

- Moi truong hien tai khong co `npm`, `pnpm`, `corepack` trong PATH.
- Repo hien khong co `node_modules`, nen khong the chay truc tiep TypeScript check hoac local dev server trong session nay.

Can verify tiep khi moi truong Node/npm san sang:

```bash
npm install
npm run typecheck
npm run dev
```

Sau do nen kiem tra cac route:

- `/review`
- `/profile`
- `/projects/[projectId]/topics/[topicId]`
- `/projects/[projectId]/topics/[topicId]/import`
- graph view trong topic detail

