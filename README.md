# MANEKO — Website Thương Hiệu Ăn Vặt Cao Cấp

Landing Page chính thức giới thiệu thương hiệu và các dòng sản phẩm đồ ăn vặt của **Công ty TNHH Thương mại và Dịch vụ Maneko**. Giao diện được phát triển theo tiêu chuẩn Web hiện đại, tối ưu trải nghiệm người dùng (UX/UI) và tương thích đa thiết bị.

---

## 🌟 Tính Năng Nổi Bật

* **Giao diện chuẩn Responsive (Mobile-First):** Tối ưu hiển thị mượt mà trên mọi kích thước màn hình từ điện thoại thông minh (375px, 430px), máy tính bảng (768px, 1024px) đến màn hình máy tính lớn (1366px, 1920px).
* **Kiến trúc SCSS chuyên nghiệp:** Phân chia module rõ ràng theo cấu trúc 7-1 (`abstracts`, `base`, `components`, `layout`, `sections`) với quy tắc đặt tên **BEM** (*Block - Element - Modifier*).
* **Semantic HTML5 & Accessibility:** Cấu trúc chuẩn ngữ nghĩa W3C (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<dialog>`, `<footer>`), hỗ trợ đầy đủ phím điều hướng (Keyboard Navigation) và Screen Reader.
* **Tương tác động & Hiệu ứng sinh động:**
  * **Hero Carousel & Slider:** Banner linh hoạt hỗ trợ thao tác vuốt cảm ứng trên di động.
  * **Number Counter:** Hiệu ứng số liệu thống kê tự động chạy tăng dần khi cuộn trang.
  * **Interactive Shopping & Quick View:** Thông báo nhanh (Toastr notification), popup xem chi tiết sản phẩm (SweetAlert2) và giỏ hàng tương tác.
  * **Live Search Dialog:** Tìm kiếm nhanh sản phẩm và danh mục theo từ khóa tiếng Việt có dấu và không dấu.
  * **Q&A Accordion:** Khối giải đáp thắc mắc khách hàng với hiệu ứng đóng/mở mượt mà.
  * **Gallery & Lightbox:** Phóng to xem album ảnh hoạt động và sự kiện.
  * **Visual Effects:** 3D Card Tilt, Shimmer hover, Parallax scrolling và dải chữ chuyển động vô tận (Infinite Marquee).

---

## 🛠 Công Nghệ Sử Dụng

| Thành phần | Công nghệ / Thư viện |
| :--- | :--- |
| **Cốt lõi** | HTML5, CSS3, SCSS (Sass), JavaScript (ES6+), jQuery 3.7 |
| **Bố cục** | Flexbox, CSS Grid, Fluid Typography (`clamp()`) |
| **Carousel / Slider** | Swiper 12 |
| **Icon & Typography** | Font Awesome 6, Google Fonts (*Plus Jakarta Sans*, *Dancing Script*) |
| **UI Components** | SweetAlert2, Toastr, Select2, Lightbox2, Vanilla-Tilt |

---

## 📁 Cấu Trúc Thư Mục

```text
.
├── index.html                  # File giao diện chính của website
├── package.json                # Cấu hình dự án và scripts biên dịch SASS
├── README.md                   # Tài liệu giới thiệu dự án
└── assets/
    ├── css/
    │   └── style.css           # File CSS hoàn chỉnh đã biên dịch
    ├── fonts/                  # Phông chữ cục bộ định dạng WOFF2
    ├── images/                 # Hình ảnh sản phẩm, banner, logo chất lượng cao
    │   └── products/           # Ảnh chi tiết từng dòng sản phẩm
    ├── js/
    │   ├── data.js             # Dữ liệu sản phẩm và danh mục
    │   ├── main.js             # Xử lý logic giao diện, slider, popup, tìm kiếm
    │   ├── effects.js          # Xử lý hiệu ứng 3D tilt, marquee, animation
    │   └── parallax.js         # Xử lý chuyển động cuộn parallax
    └── scss/                   # Mã nguồn SCSS dạng module
        ├── abstracts/          # Biến màu, breakpoint, mixin, function
        ├── base/               # Reset CSS, typography
        ├── components/         # Button, card, badge, slider, modal
        ├── layout/             # Header, footer, grid system
        ├── sections/           # Style chi tiết cho từng khối giao diện
        └── style.scss          # File trung tâm tổng hợp (@use)
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Website

### Cách 1: Chạy trực tiếp (Nhanh nhất)
Mở trực tiếp file `index.html` bằng bất kỳ trình duyệt web nào (Chrome, Edge, Safari, Firefox), hoặc sử dụng tiện ích mở rộng **Live Server** trên VS Code.

### Cách 2: Quản lý và biên dịch SCSS (Dành cho Lập trình viên)
1. **Cài đặt thư viện phụ thuộc:**
   ```bash
   npm install
   ```

2. **Biên dịch SCSS sang CSS:**
   ```bash
   npm run build:sass
   ```

3. **Theo dõi thay đổi SCSS tự động khi phát triển:**
   ```bash
   npm run watch:sass
   ```

---

## 🏢 Thông Tin Doanh Nghiệp

* **Đơn vị:** Công ty TNHH Thương mại và Dịch vụ Maneko
* **Địa chỉ:** Số 12D phố Đặng Dung, Khu 15, Phường Thành Đông, TP. Hải Phòng, Việt Nam
* **Hotline:** 0399.366.168
* **Email:** nhamaymaneko@gmail.com
* **Tiêu chuẩn chất lượng:** Nhà máy đạt chứng nhận ISO 22000:2018
