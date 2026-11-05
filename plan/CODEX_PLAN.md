# KẾ HOẠCH TRIỂN KHAI DỰ ÁN MANEKO CHO CODEX
*(Bám sát thiết kế Figma & Chuẩn giáo án Front-end Vico Group)*

---

## 1. TỔNG QUAN DỰ ÁN & MỤC TIÊU

* **Khách hàng / Thương hiệu:** Công ty TNHH Thương mại và Dịch vụ Maneko (Ăn vặt Maneko).
* **Loại website:** Landing Page & Giới thiệu sản phẩm FMCG / Đồ ăn vặt cao cấp.
* **Tài liệu tham chiếu:**
  * **Figma File:** [Maneko Desktop (1440px)](https://www.figma.com/proto/kjJEoepl5tiKd2NSWOscBI/Maneko?node-id=1-2)
  * **Giáo án đào tạo:** `doc/Giao_an_Front_End_7_ngay.pdf` (Vico Group).
* **Mục tiêu kỹ thuật:**
  1. Chuyển đổi chính xác 100% thiết kế Figma sang web chuẩn semantic HTML5 & SCSS.
  2. Bố cục Responsive hoàn hảo (Mobile First: 375px, 430px, 768px, 1366px, 1920px). Không xuất hiện thanh cuộn ngang (*horizontal scroll*).
  3. Cấu trúc SCSS dạng module (`@use` / `@forward`), quy tắc đặt tên **BEM** (*Block - Element - Modifier*).
  4. Tương tác động mượt mà bằng JavaScript / jQuery & thư viện chuẩn (Swiper slider, Mobile drawer menu, Filter, Form validation).

---

## 2. HÌNH ẢNH TRÍCH XUẤT CÁC PHẦN GIAO DIỆN CHÍNH (FIGMA CUTS)

Toàn bộ ảnh chụp và cắt theo từng section đã được lưu tại: `d:\Maneko\figma_exports\sections\`
* `1_2.png`: Ảnh toàn màn hình Desktop (1440x4855px)
* `01_header_hero.png`: Khối Header (Logo, Nav menu, Hotline) & Hero Banner Ăn vặt Maneko
* `02_features_commitments.png`: Khối thống kê nền đỏ (10000+ Khách hàng, 78922 Sản phẩm...)
* `03_brand_story_about.png`: Khối Câu chuyện thương hiệu Maneko & Chứng nhận ISO 22000:2018
* `04_product_categories.png`: Khối Danh mục sản phẩm (2 rổ sản phẩm viền đỏ)
* `05_product_catalog.png`: Lưới 8 sản phẩm bán chạy (tag HOT, giá 5.000đ) & Nút Xem tất cả
* `06_customer_reviews.png`: Khối Đánh giá khách hàng (3 thẻ review 5 sao nền đỏ)
* `07_news_events.png`: Khối Tin tức và sự kiện (Slider 3 tin tức)
* `08_subscribe_cta.png`: Banner liên hệ & hợp tác màu hồng (Hotline 0399.366.168, email)
* `09_footer.png`: Chân trang 4 cột (Thông tin công ty, Chính sách, Fanpage, Copyright VicoGroup)

---

## 3. THÔNG SỐ THIẾT KẾ (DESIGN TOKENS)

| Nhóm | Giá trị trích xuất từ Figma | Ứng dụng |
| :--- | :--- | :--- |
| **Primary Color** | `#ED1C24` / `#C8232C` | Màu đỏ chủ đạo (Header nút, Footer, Background banner, Badge HOT, Giá) |
| **Accent Gold** | `#FAA61A` | Đánh giá 5 sao, highlight |
| **Dark Text** | `#333333`, `#383938`, `#000000` | Màu chữ tiêu đề và văn bản |
| **Muted Text** | `#777777`, `#A1A1A1` | Chú thích phụ, trích dẫn, mô tả |
| **Light BG** | `#FFFFFF`, `#FFF6F6`, `#FFFAF0` | Màu nền section xen kẽ, thẻ card |
| **Primary Font** | `'Plus Jakarta Sans'`, `'SVN-Gilroy'`, sans-serif | Toàn bộ body, menu, heading |
| **Script Font** | `'Dancing Script'`, `'Caveat'`, cursive | Phụ đề cách điệu ("Câu chuyện về") |
| **Border Radius** | Card: `16px` / `20px`, Button pill: `50px` | Bo góc chuẩn giao diện hiện đại |
| **Box Shadow** | `0 10px 30px rgba(0, 0, 0, 0.08)` | Đổ bóng mềm mại cho card sản phẩm & review |

---

## 4. KIẾN TRÚC THƯ MỤC CHUẨN (VICO GROUP GUIDELINES)

```text
d:\Maneko\
│
├── index.html                  # Trang chủ chính
├── CODEX_PLAN.md               # Bản kế hoạch này
├── figma_exports/              # Ảnh trích xuất từ Figma (gốc & sections)
│   ├── 1_2.png                 # Ảnh toàn trang Desktop
│   └── sections/               # Ảnh cắt 9 section (01_ -> 09_)
├── assets/
│   ├── css/
│   │   └── style.css           # CSS biên dịch từ SCSS
│   ├── scss/
│   │   ├── abstracts/
│   │   │   ├── _variables.scss # Biến màu, font, breakpoint
│   │   │   ├── _mixins.scss    # Mixin flex, grid, responsive
│   │   │   └── _functions.scss
│   │   ├── base/
│   │   │   ├── _reset.scss     # CSS Reset
│   │   │   └── _typography.scss
│   │   ├── components/
│   │   │   ├── _buttons.scss   # Nút pill, nút icon
│   │   │   ├── _cards.scss     # Product card, review card, news card
│   │   │   ├── _badge.scss     # Badge HOT, tags
│   │   │   └── _sliders.scss   # Tùy biến Swiper pagination/navigation
│   │   ├── layout/
│   │   │   ├── _header.scss    # Navbar, mobile drawer
│   │   │   ├── _footer.scss    # Footer 4 cột
│   │   │   └── _grid.scss      # Container & grid system
│   │   ├── sections/
│   │   │   ├── _hero.scss
│   │   │   ├── _stats.scss
│   │   │   ├── _about.scss
│   │   │   ├── _categories.scss
│   │   │   ├── _products.scss
│   │   │   ├── _testimonials.scss
│   │   │   ├── _news.scss
│   │   │   └── _cta.scss
│   │   └── style.scss          # File trung tâm tổng hợp (@use)
│   ├── js/
│   │   ├── data.js             # Mock data sản phẩm, tin tức, review
│   │   └── main.js             # Script khởi tạo Swiper, mobile menu, search
│   └── images/                 # Ảnh sử dụng trong source code web
└── README.md
```

---

## 5. KẾ HOẠCH BÀN GIAO THỰC THI CHO CODEX (PROMPT THEO GIAI ĐOẠN)

---

### GIAI ĐOẠN 1: KHỞI TẠO CẤU TRÚC DỰ ÁN & SCSS BOILERPLATE
> **Prompt cho Codex:**
> ```markdown
> Hãy khởi tạo cấu trúc thư mục và tài nguyên ban đầu cho dự án Maneko theo đúng kiến trúc SCSS module của Vico Group:
> 1. Tạo thư mục `assets/scss/abstracts`, `assets/scss/base`, `assets/scss/components`, `assets/scss/layout`, `assets/scss/sections`.
> 2. Trong `assets/scss/abstracts/_variables.scss`: khai báo đầy đủ các biến màu:
>    - `$color-primary: #ED1C24;`
>    - `$color-primary-dark: #C8232C;`
>    - `$color-accent: #FAA61A;`
>    - `$color-dark: #333333;`
>    - `$color-gray: #777777;`
>    - `$color-bg-light: #FFF9F9;`
>    - Font families: `$font-main: 'Plus Jakarta Sans', sans-serif;`, `$font-script: 'Dancing Script', cursive;`
>    - Breakpoints: mobile (375px, 430px), tablet (768px), desktop (1024px, 1366px, 1440px).
> 3. Trong `assets/scss/abstracts/_mixins.scss`: viết mixin responsive `@mixin respond-to($breakpoint)` sử dụng mobile-first (min-width) và max-width helper, mixin flexbox center, mixin line-clamp.
> 4. Tạo `assets/scss/style.scss` tổng hợp tất cả các file qua cú pháp `@use`.
> 5. Tạo file `package.json` với script `npm run build:sass` và `npm run watch:sass` sử dụng `sass` biên dịch ra `assets/css/style.css`.
> ```

---

### GIAI ĐOẠN 2: DỰNG KHUNG HTML5 SEMANTIC & HEADER + HERO
> **Prompt cho Codex:**
> ```markdown
> Hãy xây dựng khung HTML5 chuẩn semantic cho `index.html` và hoàn thiện Khối 1 (Header & Hero Banner):
> 1. Sử dụng đầy đủ meta viewport, OpenGraph, nhúng Google Fonts ('Plus Jakarta Sans' và 'Dancing Script'), Font Awesome 6 CDN, Bootstrap 5 Grid CDN (hoặc tự dựng), Swiper CSS & JS CDN.
> 2. Thẻ `<header class="header">`:
>    - Logo MANEKO kèm icon chân mèo.
>    - Menu chính: Trang chủ, Giới thiệu, Sản phẩm, Q&A, Tin tức - Sự kiện, Liên hệ.
>    - Khối bên phải: Icon tìm kiếm (kèm popup/input tìm kiếm), nút Hotline dạng pill màu đỏ `0123 456 789`.
>    - Nút Hamburger mở menu mobile drawer.
> 3. Thẻ `<section class="hero-section">`:
>    - Dùng Swiper carousel hiển thị banner lớn của Maneko (hình ảnh lấy từ `figma_exports/sections/01_header_hero.png` hoặc mockup cắt từ figma).
>    - Dots pagination tùy chỉnh theo màu đỏ thương hiệu.
> 4. Viết SCSS tương ứng trong `_header.scss` và `_hero.scss`, tuân thủ BEM và responsive trên mobile/tablet.
> ```

---

### GIAI ĐOẠN 3: TRIỂN KHAI CÁC KHỐI NỘI DUNG CHÍNH (STATS, ABOUT, CATEGORIES)
> **Prompt cho Codex:**
> ```markdown
> Tiếp tục triển khai Khối 2, Khối 3 và Khối 4 theo sát thiết kế Figma:
> 1. Khối 2: `<section class="stats-section">`:
>    - Nền đỏ full-width, 4 cột thống kê: 10000+ Khách hàng thân thiết, 78922 Số sản phẩm mỗi năm, 200+ Đội ngũ nhân viên, 10020+ Đơn hàng thành công.
>    - Dùng CSS Grid / Flexbox căn đều, trên mobile chuyển thành 2 hàng x 2 cột.
> 2. Khối 3: `<section class="about-section">`:
>    - Cột trái: Phụ đề `class="about__subtitle"` dùng font viết tay nghệ thuật màu đỏ "Câu chuyện về", tiêu đề H2 in hoa "CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ MANEKO", đoạn văn giới thiệu chuẩn ISO 22000:2018, nút pill "Tìm hiểu thêm".
>    - Cột phải: Khung ảnh bo góc 24px với hình ảnh sản phẩm rực rỡ (từ `03_brand_story_about.png`).
> 3. Khối 4: `<section class="categories-section">`:
>    - Tiêu đề H2 căn giữa "DANH MỤC SẢN PHẨM".
>    - 2 thẻ card rổ sản phẩm có viền đỏ đậm bo tròn, nền sáng, hiệu ứng hover phóng nhẹ.
> 4. Viết SCSS chi tiết trong `_stats.scss`, `_about.scss`, `_categories.scss`.
> ```

---

### GIAI ĐOẠN 4: LƯỚI SẢN PHẨM & DỮ LIỆU ĐỘNG (JAVASCRIPT / JQUERY)
> **Prompt cho Codex:**
> ```markdown
> Xây dựng Khối 5 (Lưới sản phẩm nổi bật) với khả năng render dữ liệu động:
> 1. Tạo file `assets/js/data.js` chứa mảng đối tượng `products` gồm 8 sản phẩm (id, name: 'SNACK VỊ BÒ KOBE HOÀNG KIM', price: 5000, image, tag: 'HOT').
> 2. Trong `index.html`: tạo `<section class="products-section">` có tiêu đề và container chứa danh sách sản phẩm `#product-list`. Phía dưới có nút pill "XEM TẤT CẢ".
> 3. Trong `assets/js/main.js`: viết hàm dùng jQuery/JS render các thẻ sản phẩm:
>    - Cấu trúc thẻ card: `<div class="product-card">`:
>      - Badge HOT góc trái (`.product-card__badge`)
>      - Hình ảnh sản phẩm (`.product-card__image`)
>      - Tên sản phẩm (`.product-card__title`)
>      - Giá sản phẩm (`.product-card__price`: 5.000đ)
>      - Nút hover "Thêm vào giỏ" hoặc hiệu ứng tương tác.
> 4. Responsive: Desktop hiển thị 4 cột, Tablet hiển thị 2 cột, Mobile hiển thị 1-2 cột.
> ```

---

### GIAI ĐOẠN 5: ĐÁNH GIÁ KHÁCH HÀNG, TIN TỨC, CTA & FOOTER
> **Prompt cho Codex:**
> ```markdown
> Hoàn thiện 4 khối còn lại của website Maneko:
> 1. Khối 6: `<section class="testimonials-section">`: Nền đỏ, tiêu đề trắng "KHÁCH HÀNG NÓI VỀ CHÚNG TÔI". Dùng Swiper slider hiển thị 3 review card màu trắng bo góc, rating 5 sao vàng, icon trích dẫn màu đỏ.
> 2. Khối 7: `<section class="news-section">`: Tiêu đề "CHÚNG TÔI LÀM GÌ - TIN TỨC VÀ SỰ KIỆN", kèm carousel 3 bài viết tin tức và 2 nút mũi tên điều hướng hai bên.
> 3. Khối 8: `<section class="contact-cta">`: Card bo góc lớn nền hồng pastel, tiêu đề "LIÊN HỆ VỚI CHÚNG TÔI", 2 nút liên hệ Hotline (`0399.366.168`) và Email (`nhamaymaneko@gmail.com`).
> 4. Khối 9: `<footer class="footer">`:
>    - Cột 1: Thông tin công ty Maneko (MST, địa chỉ Hải Phòng, hotline, email).
>    - Cột 2: Menu Thông tin.
>    - Cột 3: Chính sách hỗ trợ.
>    - Cột 4: Box Fanpage.
>    - Thanh bản quyền dưới cùng: `© 2026 maneko. Designed by VicoGroup. All Rights Reserved.`
> ```

---

### GIAI ĐOẠN 6: RESPONSIVE TEST & KIỂM ĐỊNH THEO TIÊU CHÍ GIÁO ÁN
> **Prompt cho Codex:**
> ```markdown
> Thực hiện kiểm định toàn diện chất lượng website Maneko theo đúng Phụ lục B - Tiêu chí đánh giá của Giáo án Vico Group:
> 1. HTML5 (20%): Kiểm tra mã nguồn với W3C Nu HTML Validator, đảm bảo dùng đúng thẻ `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, thuộc tính `alt` cho tất cả ảnh, heading `h1`-`h4` phân cấp chuẩn.
> 2. CSS/SCSS/Responsive (20%): Kiểm tra Chrome DevTools trên các mốc: 375px (iPhone), 430px, 768px (iPad), 1366px, 1920px. Đảm bảo 100% không bị thanh cuộn ngang (overflow-x: hidden), menu mobile trượt ra mượt mà.
> 3. JavaScript/jQuery (20%): Kiểm tra không có bất kỳ lỗi nào trên Console, Swiper hoạt động trơn tru với cảm ứng vuốt trên mobile, hiệu ứng hover đẹp mắt.
> 4. Trải nghiệm người dùng: Tối ưu kích thước ảnh, đảm bảo font hiển thị sắc nét tiếng Việt.
> ```

