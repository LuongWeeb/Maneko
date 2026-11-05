# KẾ HOẠCH NÂNG CẤP HIỆU ỨNG THỊ GIÁC (VISUAL EFFECTS MASTER PLAN)
*(Dự án: Website Ăn vặt Maneko — Phong cách Modern, Dynamic & Premium FMCG)*

---

## 1. MỤC TIÊU & TẦNG TRẢI NGHIỆM

Nâng tầm giao diện website Maneko từ một trang Landing Page chuẩn chỉnh thành một **trải nghiệm thị giác bùng nổ, vui tươi và cao cấp** phù hợp với ngành hàng đồ ăn vặt giới trẻ (FMCG).

### 6 Nhóm hiệu ứng chủ đạo:
1. **Glassmorphism (Kính mờ cao cấp):** Tận dụng `backdrop-filter: blur()`, viền phản quang pha lê và đổ bóng đa lớp cho Header, Card và Modal.
2. **Parallax Scrolling (Cuộn đa tầng):** Chuyển động đa tốc độ cho các mảnh snack bay, lá cây xanh và linh vật mèo Maneko khi cuộn trang.
3. **Hiệu ứng 3D Tilt giả lập (Isometric Card Tilt):** Thẻ sản phẩm và giỏ hàng nghiêng theo toạ độ chuột 3D sống động.
4. **Liquid & Morphing Blobs (Chất lỏng biến hình):** Khối nền uốn lượn morphing liên tưởng đến sốt phô mai / bơ béo ngậy.
5. **Kinetic Typography & Marquee (Chữ động vô tận):** Dải slogan chạy vô tận (*Infinite text banner*) và chữ viết tay vẽ nét.
6. **Micro-interactions & Hover Effects:** Nút nam châm (Magnetic button), hiệu ứng ánh kim (Shimmer glow) lướt qua khi rê chuột.

> **Tiêu chuẩn hiệu năng & Accessibility:**
> - 100% hiệu ứng chuyển động dùng `transform` và `opacity` kích hoạt GPU Acceleration (`will-change`).
> - Tôn trọng thiết lập giảm chuyển động của người dùng qua `@media (prefers-reduced-motion: reduce)`.
> - Không làm tụt FPS trên thiết bị di động (tự động đơn giản hóa hiệu ứng 3D nặng trên màn hình cảm ứng).

---

## 2. KIẾN TRÚC MÃ NGUỒN HIỆU ỨNG (SCSS & JS)

### 2.1. Cấu trúc file SCSS bổ sung:
```text
assets/scss/
├── abstracts/
│   └── _variables.scss         # Bổ sung biến Glassmorphism, Shadow, Gradient
├── components/
│   ├── _glass.scss             # Class dùng chung .glass-card, .glass-header
│   ├── _marquee.scss           # Dải chữ chạy vô tận .marquee-strip
│   └── _tilt.scss              # Hiệu ứng 3D tilt và floating animation
└── sections/
    └── _effects.scss           # Parallax floating layers, morphing blobs
```

### 2.2. Tài nguyên thư viện bổ trợ (Siêu nhẹ, không gây nặng web):
* **Vanilla-Tilt.js (CDN ~4KB):** Phục vụ hiệu ứng nghiêng 3D mượt mà không phụ thuộc framework.
* **Canvas Confetti (Tùy chọn ~3KB):** Hiệu ứng pháo giấy vui nhộn khi thêm sản phẩm vào giỏ hoặc gửi form.

---

## 3. ĐẶC TẢ CHI TIẾT TỪNG NHÓM HIỆU ỨNG

### Nhóm 1: Glassmorphism & Header Sticky Blur
* **Header:** Khi cuộn qua banner hero (scroll > 60px), header chuyển sang dạng dải kính mờ nổi:
  `background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(237, 28, 36, 0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.05);`
* **Card sản phẩm & Review:** Nền màu trắng sữa bán trong suốt, viền ánh thủy tinh nhẹ nhàng `border: 1px solid rgba(255, 255, 255, 0.6)`.

### Nhóm 2: Parallax Floating Snack Elements
* Các chi tiết trang trí: Miếng snack khoai tây, lá trà xanh `category-leaves.png`, chấm tròn vàng được tách thành các layer trôi nổi tự do (`.floating-snack`).
* Sử dụng CSS Scroll Timeline hoặc sự kiện cuộn với tốc độ `transform: translateY(calc(var(--scroll) * 0.15px))` để tạo cảm giác các món ăn vặt đang bồng bềnh trong không gian.

### Nhóm 3: 3D Tilt Card (Nghiêng không gian 3 chiều)
* Thẻ `.product-card` và `.category-card` được gán thuộc tính `perspective: 1000px; transform-style: preserve-3d;`.
* Khi di chuột vào card: Card khẽ nghiêng theo góc chuột (`rotateX`, `rotateY`), trong khi ảnh gói snack nổi hẳn lên phía trước (`translateZ(30px)`), bóng đổ phía sau chuyển dịch ngược hướng tạo chiều sâu quang học 3D chân thực.

### Nhóm 4: Liquid Morphing Shape (Chất lỏng biến hình)
* Khối Banner CTA và các đốm trang trí nền được áp dụng `border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;` kết hợp animation keyframes chuyển động nhịp nhàng liên tục theo chu kỳ 8 giây.

### Nhóm 5: Kinetic Typography & Infinite Marquee
* Chèn dải chữ Marquee chạy ngang liên tục vô tận (*Infinite Marquee Bar*) giữa khối Stats và Giới thiệu:
  `"★ ĂN VẶT MANEKO ★ VUI MỖI NGÀY ★ NGON TỪNG GIÂY ★ 100% TIÊU CHUẨN ISO 22000:2018 ★ GIÒN RÚM ĐẬM VỊ ★ "`
* Chữ viết tay "Câu chuyện về": Áp dụng animation viết nét chữ mềm mại.

### Nhóm 6: Micro-interactions & Shimmer Glow
* **Shimmer Hover:** Một dải phản quang góc 45 độ quét ngang bề mặt gói bánh khi hover (`linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`).
* **Magnetic Button:** Nút Hotline và nút "Xem tất cả" khẽ dịch chuyển theo tọa độ con trỏ khi rê chuột lại gần trong bán kính 30px.
* **Paw Pulse:** Icon chân mèo của logo khẽ đập nhịp tim (*pulse bounce*) nhẹ khi người dùng hover vào Logo.

