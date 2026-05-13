# Lingofy Usage Flow

Tai lieu nay mo ta usage flow chinh cua website Lingofy dua tren cac man hinh UI hien co.

## 1. Flow Tong Quan

```mermaid
flowchart TD
    A[User mo Lingofy] --> B[Dashboard Projects]
    B --> C[Chon Project]
    B --> D[Add Project]
    C --> E[Project Detail: Topics]
    E --> F[Chon Topic]
    E --> G[New Topic]
    E --> H[Analytics]
    F --> I[Topic Detail]
    I --> J[Import Vocabulary]
    I --> K[Learn Flashcards]
    I --> L[Graph View]
    I --> M[Generate Story]
    I --> N[Edit Table]
    B --> O[Smart Review]
    O --> P[Chon Project Review]
    P --> Q[Review Session]
    Q --> R[Summary / Today Review]
    B --> S[Profile]
```

## 2. Flow Tao Va Quan Ly Tu Vung

```mermaid
flowchart TD
    A[Dashboard: All Projects] --> B[Click Add Project]
    B --> C[Nhap ten project]
    C --> D[Project duoc tao]
    D --> E[Vao Project Detail]
    E --> F[Click New Topic]
    F --> G[Nhap ten topic]
    G --> H[Vao Topic Detail]
    H --> I[Click Import]
    I --> J[Dan danh sach tu vung]
    J --> K[Preview Data]
    K --> L[Kiem tra du lieu]
    L --> M[Save Vocabulary]
    M --> N[Tu xuat hien trong Table]
```

Format import goi y:

```text
日 にち / ひ Ngay, mat troi noun
月 つき / がつ Mat trang, thang noun
```

Muc tieu cua flow nay la giup user nhanh chong tao bo tu vung co cau truc: project, topic, vocabulary list.

## 3. Flow Hoc Theo Topic

```mermaid
flowchart TD
    A[Dashboard] --> B[Chon Project]
    B --> C[Chon Topic]
    C --> D[Topic Detail]
    D --> E[Click Learn]
    E --> F[Flashcard Mode]
    F --> G[Xem tu va phat am]
    G --> H[Chon Meaning First hoac Hide Pronunciation]
    H --> I[Danh gia: Sai / Lap lai / Dung]
    I --> J[Chuyen sang card tiep theo]
    J --> K[Hoan thanh topic]
```

Muc tieu cua flow nay la cho phep user hoc tung topic bang flashcard va tu danh dau muc do nho tu.

## 4. Flow Xem Tu Vung Dang Graph

```mermaid
flowchart TD
    A[Topic Detail] --> B[Click Graph]
    B --> C[Graph View]
    C --> D[Xem nhom Kanji ben trai]
    C --> E[Xem node tu vung tren canvas]
    E --> F[Click mot node]
    F --> G[Xem chi tiet tu o panel duoi]
    C --> H[Switch Topic]
    H --> I[Modal chon topic]
    I --> J[Chon topic khac]
    J --> K[Graph cap nhat theo topic moi]
    C --> L[Back to Table]
```

Muc tieu cua flow nay la giup user nhin moi quan he giua Kanji, tu ghep, phat am va nghia theo dang ban do truc quan.

## 5. Flow Smart Review

```mermaid
flowchart TD
    A[Bottom Navigation] --> B[Smart Review]
    B --> C[Danh sach project review]
    C --> D[Xem so tu can on / overdue / weak words]
    D --> E[Click Start Review]
    E --> F[Review Session]
    F --> G[Hien thi cau hoi]
    G --> H[Chon dap an trong thoi gian gioi han]
    H --> I{Dung hay sai?}
    I -->|Dung| J[Tang correct count]
    I -->|Sai hoac timeout| K[Dua vao weak words]
    J --> L[Cau tiep theo]
    K --> L
    L --> M[Hoan thanh batch]
    M --> N[Today Summary]
```

Review session hien tai gom:

- Cau hoi dang chon nghia dung.
- Thanh tien do, vi du `1 / 50`.
- Dong ho dem nguoc.
- Thong tin lan review gan nhat.
- Nut `Stop` de dung phien on.

## 6. Flow Xem Tong Ket Review

```mermaid
flowchart TD
    A[Smart Review] --> B[Click Today Summary]
    B --> C[Project Review Summary]
    C --> D[Xem reviewed today]
    C --> E[Xem correct / incorrect]
    C --> F[Xem timeout / slow]
    C --> G[Xem weak words]
    C --> H[Start Review 50 words]
    C --> I[View reviewed today]
    C --> J[View weak words]
```

Muc tieu cua flow nay la giup user biet hom nay da on bao nhieu, dung bao nhieu, sai bao nhieu va nhung tu nao can chu y lai.

## 7. Flow Profile / Account

```mermaid
flowchart TD
    A[Bottom Navigation] --> B[Profile]
    B --> C[Activity & Account]
    C --> D[Xem tai khoan]
    C --> E[Xem review count]
    C --> F[Xem streak]
    C --> G[Xem accuracy]
    C --> H[Xem learning heatmap]
    B --> I[Mobile QR Sign-In]
    B --> J[AI API Settings]
```

Muc tieu cua flow nay la giup user theo doi lich su hoc tap, do chinh xac, streak va cau hinh tai khoan.

## 8. User Journey Chinh

Mot user dien hinh se dung Lingofy theo thu tu:

1. Vao `Dashboard` de xem toan bo project hoc tu vung.
2. Chon mot `Project`, vi du `Kanji N3`.
3. Tao hoac chon mot `Topic`.
4. Import danh sach tu vung vao topic.
5. Hoc tu bang `Table`, `Flashcard`, hoac `Graph`.
6. Sau khi hoc, vao `Smart Review` de on lai theo thuat toan.
7. Xem `Today Summary` de biet tien do trong ngay.
8. Vao `Profile` de theo doi streak, accuracy va learning heatmap.

## 9. Cac Flow Nen Uu Tien Khi Lam UX

- Onboarding flow: tao project -> tao topic -> import vocabulary -> hoc lan dau.
- Daily review flow: mo app -> Smart Review -> Start Review -> xem summary.
- Topic learning flow: project -> topic -> table / graph / learn.
- Progress tracking flow: Smart Review summary + Profile heatmap.
- Topic switching flow: graph view -> switch topic -> chon topic moi.

## 10. Mo Hinh Su Dung Cot Loi

Lingofy co 3 vong lap chinh:

1. To chuc tu vung: Project -> Topic -> Vocabulary.
2. Hoc theo topic: Table -> Flashcard -> Graph.
3. On tap thong minh hang ngay: Smart Review -> Review Session -> Summary -> Weak Words.

