# KẾ HOẠCH NÂNG CẤP HỆ THỐNG TYPOGRAPHY & FONT CHỮ CHO MANEKO
*(Dự án: Website Ăn vặt Maneko — Khớp 100% bản vẽ Figma & Tối ưu Web Font)*

---

## 1. PHÂN TÍCH FONT TỪ BẢN VẼ FIGMA & GIẢI PHÁP WEB MAPPING

Qua trích xuất chi tiết từ file thiết kế Figma `kjJEoepl5tiKd2NSWOscBI`:

| Nhóm Font trong Figma | Trọng số (Weight) | Ứng dụng trong giao diện | Giải pháp Web Font tối ưu |
| :--- | :--- | :--- | :--- |
| **SVN-Gilroy** | 300, 400, 500, 600, 700 | Font chính: Toàn bộ body, menu, heading H1-H3, card sản phẩm, giá bán, nút bấm | **Phương án 1 (Khuyên dùng):** Cấu hình `@font-face` tự host WOFF2 `SVN-Gilroy`.<br>**Phương án 2 (Google Fonts):** `Plus Jakarta Sans` (hình thái geometric tương đồng nhất với Gilroy, hỗ trợ tiếng Việt hoàn hảo). |
| **DVN - Photograph / SVN-Aaron Script** | 400 (Regular) | Phụ đề viết tay nghệ thuật ("Câu chuyện về", "Vui mỗi ngày...") | `Dancing Script` hoặc `Caveat` (Google Fonts miễn phí bản quyền, hỗ trợ đầy đủ ký tự dấu tiếng Việt). |

---

## 2. THANG ĐO TYPOGRAPHY CHUẨN (TYPE SCALE & FLUID TYPOGRAPHY)

Để giao diện hiển thị sắc nét trên cả điện thoại (375px) và màn hình lớn (1920px), áp dụng kỹ thuật **Fluid Typography** dùng hàm `clamp()`:

* **Hero H1:** `clamp(2.25rem, 5vw + 1rem, 3.5rem)` (36px -> 56px), Line-height: `1.15`, Weight: `800` (ExtraBold).
* **Section Title H2:** `clamp(1.75rem, 3vw + 0.8rem, 2.25rem)` (28px -> 36px), Line-height: `1.25`, Weight: `700` (Bold), Text-transform: `uppercase`.
* **Script Subtitle:** `clamp(1.5rem, 2vw + 0.5rem, 1.875rem)` (24px -> 30px), Weight: `600`, Font-family: `$font-script`.
* **Card Title H3:** `1.125rem` - `1.25rem` (18px -> 20px), Line-height: `1.3`, Weight: `600` (SemiBold).
* **Stats Counter Value:** `clamp(2rem, 4vw + 0.5rem, 2.75rem)` (32px -> 44px), Weight: `800`.
* **Price Tag (5.000đ):** `1.125rem` (18px), Weight: `700`, Color: `$color-primary`.
* **Body / Description:** `0.9375rem` - `1rem` (15px -> 16px), Line-height: `1.6`, Weight: `400` (Regular).
* **Button & Navigation:** `0.9375rem` (15px), Weight: `600`, Letter-spacing: `0.3px`.
* **Badge & Small Tag (HOT):** `0.75rem` (12px), Weight: `700`, Letter-spacing: `0.5px`, Text-transform: `uppercase`.

---

## 3. KIẾN TRÚC MÃ NGUỒN (SCSS & PERFORMANCE)

```text
assets/
├── fonts/                      # Thư mục chứa font local (nếu dùng SVN-Gilroy WOFF2)
│   ├── SVN-Gilroy-Regular.woff2
│   ├── SVN-Gilroy-Medium.woff2
│   ├── SVN-Gilroy-SemiBold.woff2
│   └── SVN-Gilroy-Bold.woff2
└── scss/
    ├── abstracts/
    │   └── _variables.scss     # Định nghĩa biến font stack & type scale
    └── base/
        ├── _fonts.scss         # Khai báo @font-face local
        └── _typography.scss    # Thiết lập thẻ h1-h6, p, fluid classes
```

### Nguyên tắc tối ưu hiệu năng (Core Web Vitals - CLS & LCP):
1. Thêm `font-display: swap` vào tất cả các khai báo font để trình duyệt hiển thị nội dung ngay lập tức, không bị giật trang hoặc trắng chữ (FOIT).
2. Thêm thẻ `<link rel="preconnect" href="https://fonts.googleapis.com">` và `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` trong `<head>` để rút ngắn thời gian bắt tay SSL khi tải font.
3. Preload font chính có tần suất sử dụng cao nhất (Regular 400 và Bold 700).

