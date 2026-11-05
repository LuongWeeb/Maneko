# KẾ HOẠCH TRIỂN KHAI HIỆU ỨNG & THƯ VIỆN JQUERY (NGÀY 5) CHO CODEX
*(Bám sát Mục 5.1 & 5.2 Giáo án Front-End 7 ngày - Vico Group)*

---

## 1. MỤC TIÊU & DANH SÁCH THƯ VIỆN NGÀY 5

Mục tiêu của giai đoạn này là nâng cấp website Maneko từ trang tĩnh sang **trang web giàu tính tương tác sinh động** bằng cách ứng dụng trọn vẹn kiến thức **Ngày 5: JavaScript, jQuery & Thư viện Front-End**:
1. Sử dụng **jQuery core** cho DOM manipulation, event delegation và animation effects (`fadeIn`/`fadeOut`, `slideToggle`, animate số đếm).
2. Tích hợp các thư viện UI được chỉ định trong bảng danh mục **Mục 5.1 của Giáo án**:
   * **Animation:** `Animate.css` (hiệu ứng xuất hiện mượt mà).
   * **Popup:** `SweetAlert2` (hộp thoại xác nhận, popup thông báo hiện đại).
   * **Toast:** `Toastr` (thông báo tức thì góc màn hình khi thêm sản phẩm/sao chép).
   * **Form Validation:** `jQuery Validation` (kiểm tra dữ liệu form liên hệ/đăng ký đại lý).
   * **Dropdown nâng cao:** `Select2` (chọn Tỉnh/Thành phố hoặc phân loại sản phẩm có tìm kiếm).
   * **Gallery:** `Lightbox2` (phóng to và xem album ảnh sản phẩm / hoạt động sự kiện).
   * **Clipboard:** `Clipboard.js` (sao chép nhanh số Hotline / Email).
3. **Tuân thủ quy tắc kết hợp thư viện (Mục 5.2 Giáo án):**
   * Thứ tự nạp script bắt buộc: `jQuery (core)` tải trước -> các plugin phụ thuộc jQuery (`jquery-validation`, `select2`, `toastr`) -> cuối cùng là `main.js`.
   * Sử dụng CDN ổn định, kiểm tra console không phát sinh lỗi xung đột.

---

## 2. THỨ TỰ CDN & TÍCH HỢP TÀI NGUYÊN (VÀO `index.html`)

### Trong thẻ `<head>`:
```html
<!-- Animate.css (Mục 5.1 Giáo án) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">

<!-- Toastr CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">

<!-- Select2 CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css">

<!-- Lightbox2 CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/css/lightbox.min.css">
```

### Trước thẻ đóng `</body>`:
```html
<!-- 1. jQuery Core (Bắt buộc nạp đầu tiên trong nhóm script Ngày 5) -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- 2. Thư viện độc lập -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.11/clipboard.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/js/lightbox.min.js"></script>

<!-- 3. Plugin phụ thuộc jQuery -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/jquery.validate.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/localization/messages_vi.min.js"></script>

<!-- 4. Script dự án -->
<script src="assets/js/data.js"></script>
<script src="assets/js/main.js"></script>
```

---

## 3. CÁC TÍNH NĂNG & HIỆU ỨNG CHI TIẾT CẦN BỔ SUNG

### Tính năng 1: Hiệu ứng đếm số tăng dần (jQuery Number Counter) cho Khối Stats
* **Vị trí:** Khối `<section class="stats-section">`.
* **Mô tả:** Khi người dùng cuộn màn hình tới phần thống kê số liệu, các con số `80+`, `40000+`, `150+`, `4800+` sẽ chạy tăng dần từ `0` đến giá trị đích trong 2 giây (sử dụng jQuery `$({ countNum: 0 }).animate(...)`).
* **Lợi ích:** Mang lại cảm giác website sống động, số liệu uy tín và trực quan.

### Tính năng 2: Nút "Thêm vào giỏ" & Thông báo Toastr + SweetAlert2
* **Vị trí:** Trên mỗi thẻ sản phẩm (`.product-card`) ở Khối Sản phẩm nổi bật.
* **Mô tả:**
  * Bổ sung nút "Chọn mua / Thêm vào giỏ" có icon giỏ hàng `<i class="fa-solid fa-cart-shopping"></i>`.
  * Khi bấm: Hiển thị thông báo góc màn hình qua **Toastr**: `toastr.success('Đã thêm sản phẩm vào giỏ hàng!', 'Maneko')`.
  * Cập nhật số lượng trên icon giỏ hàng (Badge mini nhảy số với hiệu ứng rung nhẹ `animate__animated animate__rubberBand`).
  * Nút "Xem nhanh" (Quick View): Mở popup **SweetAlert2** hiển thị ảnh lớn, bảng thành phần dinh dưỡng và giá bán chi tiết.

### Tính năng 3: Form Đăng ký nhận mẫu thử / Tư vấn đại lý (jQuery Validation + Select2)
* **Vị trí:** Tích hợp vào Khối `<section class="contact-cta">` hoặc modal "Liên hệ hợp tác".
* **Mô tả:**
  * Các trường nhập liệu:
    * Họ và tên (Bắt buộc, tối thiểu 2 từ).
    * Số điện thoại (Bắt buộc, đúng định dạng di động Việt Nam `/(0[3|5|7|8|9])+([0-9]{8})\b/`).
    * Email (Định dạng email hợp lệ).
    * Khu vực / Tỉnh thành: Dùng thẻ `<select id="agency-city">` được kích hoạt bằng **Select2**, hỗ trợ gõ tìm kiếm nhanh (Hà Nội, Hải Phòng, TP.HCM, Đà Nẵng,...).
    * Nội dung cần tư vấn (textarea).
  * Kiểm tra dữ liệu bằng **jQuery Validation**: Thông báo lỗi bằng tiếng Việt hiển thị ngay dưới từng input, border đổi màu đỏ.
  * Khi submit thành công: Hiện popup **SweetAlert2** (`icon: 'success'`, tiêu đề: "Đã gửi thông tin thành công!", nội dung: "Bộ phận chăm sóc khách hàng Maneko sẽ liên hệ bạn trong vòng 24h").

### Tính năng 4: Khối Q&A Accordion (Hỏi - Đáp) dùng jQuery `slideToggle()`
* **Vị trí:** Bổ sung khối `<section class="qa-section" id="qa">` (khớp với link Q&A trên header).
* **Mô tả:**
  * 4 câu hỏi thường gặp:
    1. *Sản phẩm ăn vặt Maneko có hạn sử dụng bao lâu và bảo quản thế nào?*
    2. *Nhà máy sản xuất Maneko đạt những chứng nhận an toàn thực phẩm nào? (ISO 22000:2018)*
    3. *Chính sách chiết khấu và hỗ trợ vận chuyển cho đại lý phân phối toàn quốc?*
    4. *Tôi có thể mua lẻ đồ ăn vặt Maneko ở đâu?*
  * Sử dụng jQuery click event kết hợp `slideToggle(300)` để đóng/mở câu trả lời mượt mà, xoay icon mũi tên góc 180 độ.

### Tính năng 5: Lightbox2 xem album ảnh & Clipboard.js sao chép Hotline
* **Vị trí:**
  * **Lightbox2:** Gắn thuộc tính `data-lightbox="news-gallery"` vào các ảnh trong khối Tin tức hội chợ (`.news-card__image`) và Giới thiệu để khi người dùng click vào sẽ mở xem ảnh phóng to full-screen.
  * **Clipboard.js:** Gắn vào nút Hotline và Email ở Header & Banner CTA: Bấm vào là tự động copy số `0399.366.168` vào clipboard kèm thông báo `toastr.info("Đã sao chép số hotline!")`.

---

## 4. BẢNG PHÂN CHIA NHIỆM VỤ & PROMPT GIAO CHO CODEX

---

### GIAI ĐOẠN 5.1: NẠP THƯ VIỆN & CẤU HÌNH CƠ BẢN
> **Prompt cho Codex:**
> ```markdown
> Cập nhật `index.html` để bổ sung các CDN theo nội dung Ngày 5 Giáo án Front-End:
> 1. Trong `<head>`: nhúng Animate.css, Toastr CSS, Select2 CSS, Lightbox2 CSS.
> 2. Trước `</body>`: nhúng jQuery 3.7.1 CDN trước tiên, tiếp theo là SweetAlert2, Clipboard.js, Lightbox2, Toastr JS, Select2 JS, jQuery Validation (kèm file vi.min.js), sau cùng mới nạp data.js và main.js.
> 3. Cấu hình Toastr mặc định trong main.js: vị trí "toast-top-right", thời gian hiển thị 3000ms, hiệu ứng progressBar: true.
> ```

---

### GIAI ĐOẠN 5.2: JQUERY NUMBER COUNTER CHO KHỐI STATS
> **Prompt cho Codex:**
> ```markdown
> Bổ sung hiệu ứng đếm số tăng dần cho các con số trong Khối thống kê `<section class="stats-section">`:
> 1. Đổi các thẻ số liệu `.stats__value` thành cấu trúc hỗ trợ animation, lưu giá trị đích vào `data-target` (ví dụ `data-target="80"`, `data-target="40000"`, `data-target="150"`, `data-target="4800"`).
> 2. Trong `assets/js/main.js`: dùng jQuery và IntersectionObserver để kích hoạt khi người dùng cuộn tới khối stats:
>    - Chạy animation tăng dần từ 0 đến số đích trong 2000ms.
>    - Định dạng lại số có dấu chấm hàng nghìn (ví dụ 40.000+) và chỉ kích hoạt 1 lần duy nhất (one-time animation).
> ```

---

### GIAI ĐOẠN 5.3: TOASTR & SWEETALERT2 CHO SẢN PHẨM & CLIPBOARD HOTLINE
> **Prompt cho Codex:**
> ```markdown
> Nâng cấp trải nghiệm tương tác cho Khối Sản phẩm nổi bật và Hotline:
> 1. Trong hàm render sản phẩm (`renderProducts`): Thêm nút "Thêm vào giỏ" `<button class="button button--add-cart" data-id="...">` và nút "Xem nhanh" `<button class="button--quick-view">`.
> 2. Dùng jQuery event delegation:
>    - Khi bấm "Thêm vào giỏ": dùng Toastr bắn thông báo thành công `toastr.success('Đã thêm [Tên sản phẩm] vào giỏ hàng!', 'Maneko')`.
>    - Khi bấm "Xem nhanh": dùng SweetAlert2 mở modal hiển thị ảnh sản phẩm lớn, giá 5.000đ, mô tả hương vị và nút đặt mua ngay.
> 3. Kích hoạt Clipboard.js cho các nút Hotline và Email: khi click tự sao chép số điện thoại/email vào khay nhớ tạm và hiển thị `toastr.info('Đã sao chép vào bộ nhớ tạm!')`.
> ```

---

### GIAI ĐOẠN 5.4: FORM TƯ VẤN ĐẠI LÝ VỚI JQUERY VALIDATION & SELECT2
> **Prompt cho Codex:**
> ```markdown
> Xây dựng Form "Đăng ký tư vấn đại lý / nhận mẫu thử" trong khối `<section class="contact-cta">`:
> 1. Tạo form gồm các trường: Họ tên, Số điện thoại, Email, Tỉnh/Thành phố (`<select id="agency-city">`), Lời nhắn.
> 2. Áp dụng Select2 cho `#agency-city` với danh sách các tỉnh thành phố chính của Việt Nam, bật tính năng tìm kiếm.
> 3. Viết jQuery Validation cho form:
>    - Họ tên: required, minlength: 2.
>    - Số điện thoại: required, kiểm tra regex số điện thoại Việt Nam (10 số, đầu 03, 05, 07, 08, 09).
>    - Email: email hợp lệ nếu có nhập.
>    - Tỉnh thành: required.
> 4. Khi form hợp lệ và submit: ngăn reload trang (`e.preventDefault()`), hiển thị SweetAlert2 thông báo "Gửi yêu cầu thành công!", sau đó reset form.
> ```

---

### GIAI ĐOẠN 5.5: ACCORDION Q&A VỚI JQUERY SLIDETOGGLE & LIGHTBOX2 ALBUM
> **Prompt cho Codex:**
> ```markdown
> Bổ sung Khối Hỏi - Đáp (Q&A Accordion) và tích hợp Lightbox2:
> 1. Tạo section `<section class="qa-section" id="qa">` gồm 4 câu hỏi - trả lời thường gặp về ăn vặt Maneko (chuẩn ISO 22000, hạn sử dụng, bảo quản, đại lý).
> 2. Viết SCSS và jQuery xử lý Accordion:
>    - Mặc định mở câu đầu tiên, các câu khác đóng.
>    - Click vào câu hỏi: dùng `.slideToggle(300)` để mở nội dung câu đó và đóng các câu khác (`.slideUp()`), xoay icon chevron 180 độ.
> 3. Bổ sung thuộc tính `data-lightbox` và `data-title` vào các hình ảnh trong khối Tin tức & Khối Giới thiệu để người dùng bấm vào xem được ảnh phóng to qua Lightbox2.
> ```

