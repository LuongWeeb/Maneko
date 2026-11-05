# Maneko

Triển khai Giai đoạn 1–5 theo `plan/CODEX_PLAN.md`: hoàn thiện 9 khối giao diện trang chủ, từ Header/Hero đến đánh giá, tin tức, liên hệ và footer.

Phạm vi là trang `index.html`, gồm cả Q&A trong trang. Trang chi tiết sản phẩm, danh mục và các bài viết dùng liên kết tới website Maneko thật.

Từ Giai đoạn 3, tham khảo [website Maneko thực tế](https://maneko.vn/) ngày 04/11/2026. Giữ bố cục module, BEM và font của plan; thông tin doanh nghiệp, số liệu và hình ảnh ưu tiên nguồn thực tế.

## Sử dụng

```sh
npm ci
npm run build:sass
npm run dev
```

Mở `http://127.0.0.1:4173`. Để theo dõi SCSS khi chỉnh sửa, mở terminal thứ hai:

```sh
npm run watch:sass
```

`build:sass` biên dịch một lần ra `assets/css/style.css`.
`watch:sass` theo dõi thay đổi SCSS và biên dịch lại; nhấn Ctrl+C để dừng.

## Cấu trúc SCSS

- `abstracts`: biến màu, font, breakpoint, function và mixin.
- `base`: reset và typography cơ bản.
- `components`: buttons, cards, badge, sliders, gallery.
- `layout`: grid, header, footer.
- `sections`: hero, stats, about, categories, products, testimonials, news, qa, cta.
- `style.scss`: tổng hợp tất cả module bằng `@use`.

Các partial nội dung đã có style theo BEM, gồm cả Testimonials, News, CTA, Footer và phần điều khiển carousel dùng chung.

## Giai đoạn 2

- `index.html`: HTML5 tiếng Việt, meta viewport/description/OpenGraph, Google Fonts, Font Awesome 6 và Swiper 12 qua CDN; container tự dựng bằng SCSS.
- Header dùng logo nền trong suốt, 6 mục điều hướng, hotline thực tế `0399 366 168`, tìm kiếm và menu mobile dưới 1024px.
- Drawer và hộp tìm kiếm hỗ trợ Escape, click nền, giữ focus bên trong, trả focus về nút mở và khóa cuộn nền. Drawer tự đóng khi chuyển sang desktop.
- Hero có 2 slide, vuốt cảm ứng và pagination màu đỏ. Slide đầu dùng banner gốc từ website, slide thứ hai là mockup giới thiệu snack. Không tự chuyển slide; tôn trọng thiết lập giảm chuyển động. H1 đặt ngoài carousel để luôn có trong cây truy cập.
- Tìm kiếm hỗ trợ tiếng Việt có/không dấu, nhiều từ khóa và tìm trong banner, giới thiệu, danh mục cùng 8 sản phẩm nổi bật. Bấm kết quả chuyển đến đúng slide/section/thẻ sản phẩm trên index.
- Giới thiệu, Sản phẩm, Tin tức, Q&A và Liên hệ dẫn đến section tương ứng trên index. Các nút xem thêm dẫn đến trang thật trên `maneko.vn`; hotline dùng `tel:0399366168` (các nút có biểu tượng sao chép được bổ sung Clipboard.js ở Ngày 5).

## Ngày 5: Thư viện và tương tác

- Thư viện nạp theo thứ tự jQuery → thư viện/plugin → `data.js` → `main.js`.
- Số liệu thống kê chạy một lần khi cuộn tới; sản phẩm có Toastr, xem nhanh SweetAlert2 và giỏ hàng giữ đến khi tải lại trang.
- Form đại lý dùng Select2 và jQuery Validation. Đây là bản dùng thử, chưa gửi thông tin tới Maneko.
- Q&A có 4 câu hỏi, mặc định mở câu đầu, hiệu ứng jQuery 300ms và hỗ trợ bàn phím; khi tắt JavaScript, tất cả câu trả lời vẫn đọc được.
- Ảnh Giới thiệu và album 4 ảnh Tin tức mở bằng Lightbox2. Tiêu đề/“Đọc tiếp” giữ liên kết bài viết. Trình xem có chú thích tiếng Việt, điều hướng bàn phím, giữ/trả focus và hỗ trợ giảm chuyển động. Nếu Lightbox không tải được, liên kết vẫn mở ảnh gốc.
- Kiểm tra: `npm run test:ui`, `npm run test:day5`, `npm run test:gallery`. Ảnh kiểm tra phần 5.5 nằm trong `artifacts/day5-5/`.
- Canonical và OpenGraph dùng tên miền thực tế, ảnh chia sẻ là URL tuyệt đối đang có trên website. Font/icon/Swiper CDN cần kết nối mạng; bố cục carousel có CSS dự phòng, menu/tìm kiếm vẫn dùng được nếu Swiper không tải được.

## Giai đoạn 3

- `_stats.scss`: 4 cột từ 1024px, 2 cột trên mobile/tablet. Số liệu theo website: **80+** nhà phân phối, **40.000+** sản phẩm mỗi năm, **150+** nhân viên, **4.800+** đơn hàng giao thành công. Thay cho các số minh họa trong plan.
- `_about.scss`: phụ đề Dancing Script, tiêu đề doanh nghiệp, giới thiệu về thương hiệu và ISO 22000:2018; ảnh gốc bo góc 24px. Hai cột từ 1024px, xếp dọc trên màn hình nhỏ. Nút Tìm hiểu thêm dẫn đến trang giới thiệu chính thức.
- `_categories.scss`: hai thẻ Snack khô (16 sản phẩm) và Snack ướt (2 sản phẩm), khung đỏ, ảnh vuông, hover/focus phóng nhẹ. Hai cột từ 768px, một cột trên mobile; lá trang trí chỉ hiện trên desktop lớn.
- Các con số là ảnh chụp nội dung tại thời điểm đối chiếu, chưa đồng bộ tự động với website.

### Sửa lỗi và hoàn thiện Giai đoạn 1–2

- Thay hotline mẫu, logo/banner cắt từ screenshot bằng dữ liệu và tài nguyên gốc; banner có `srcset` 600/1000/1900px.
- Bổ sung canonical/OpenGraph đầy đủ theo tên miền đã xác định; bỏ các chevron không có dropdown.
- Giữ H1 khả dụng khi đổi slide; tăng vùng bấm pagination lên 44px.
- Sửa Escape trong ô `type="search"` để đóng dialog ngay, thay vì bị trình duyệt dùng để xóa từ khóa.
- Khi drawer đóng do chuyển sang desktop, chuyển focus về logo đang hiển thị.
- Cập nhật chiều cao Swiper khi ảnh/font tải xong; thêm CSS bố cục dự phòng nếu stylesheet CDN lỗi.
- Làm nền đỏ của nút và thống kê tối hơn nhẹ để chữ trắng dễ đọc hơn; giữ nguyên các design token đã yêu cầu.

## Giai đoạn 4

- `assets/js/data.js` chứa mảng `products`, cung cấp qua `window.ManekoData.products`. Mỗi sản phẩm có `id`, `name`, `price` (VND dạng số), `image`, kích thước ảnh, `tag` và `url` trang chi tiết chính thức.
- Dùng 8 sản phẩm nổi bật từ trang chủ Maneko ngày 04/11/2026. Tên/giá/nhãn được giữ theo dữ liệu nguồn: 3 sản phẩm có badge HOT; giá 5.000đ, 6.000đ và 20.000đ. Dữ liệu là bản lưu local, không đồng bộ trực tiếp với website.
- `renderProducts()` trong `main.js` dựng các thẻ bằng DOM API vào `#product-list`. Giá định dạng bằng `Intl.NumberFormat('vi-VN')`; nội dung chữ dùng `textContent`.
- Lưới có 1 cột dưới 430px, 2 cột từ 430px, 4 cột từ 1024px. Ảnh dùng `object-fit: contain` để giữ nguyên bao bì; các thẻ có cùng chiều cao theo hàng.
- Hover/focus làm nổi thẻ, phóng ảnh nhẹ và hiện “Xem chi tiết”. Thẻ là liên kết thật, dùng được bằng chuột, cảm ứng hoặc Enter. “Xem tất cả” dẫn đến `https://maneko.vn/tat-ca-san-pham`.
- Tìm kiếm theo tên sản phẩm sẽ cuộn và chuyển focus đến thẻ tương ứng trên index. Chọn thẻ mới mở trang chi tiết trên website thật.
- Nếu file dữ liệu không tải được, hiển thị thông báo và giữ nút “Xem tất cả”; menu/tìm kiếm vẫn hoạt động. Có hướng dẫn thay thế khi JavaScript bị tắt.
- `_products.scss` chứa layout/nền; `_cards.scss` chứa product card; `_badge.scss` chứa nhãn HOT. Nền trang trí gốc dùng trên desktop, nền sáng đơn giản trên màn hình nhỏ.

## Giai đoạn 5

- Đánh giá khách hàng có nền đỏ, thẻ trắng, avatar, rating 5 sao và icon trích dẫn. Tin tức có ảnh, tiêu đề, mô tả và liên kết đến bài viết trên website thật.
- Mỗi carousel có 4 thẻ, hiển thị 1 thẻ trên mobile, 2 từ 768px và 3 từ 1024px. Nút trước/sau và pagination hoạt động độc lập; không tự chuyển slide. Thẻ ngoài vùng hiển thị được loại khỏi thứ tự focus khi Swiper hoạt động.
- Khi Swiper JavaScript không tải được, vẫn có thể cuộn ngang các thẻ; khi CSS CDN không tải được, CSS local giữ bố cục. Thiết lập giảm chuyển động được áp dụng cho cả hai carousel.
- Banner liên hệ nền hồng có ảnh riêng cho mobile/desktop, nút gọi điện và email. Footer hiển thị 1/2/4 cột theo kích thước màn hình, gồm thông tin công ty, menu, chính sách và Fanpage.
- Theo yêu cầu cho phép dùng thông tin mẫu phù hợp với từng mục, ô Fanpage dùng tên `Ăn vặt Maneko` và liên kết Facebook chung. Đây là thẻ giao diện tĩnh, chưa nhúng fanpage chính thức. Số điện thoại/email đã có được giữ lại; có thể thay trực tiếp trong `index.html`.
- Nội dung đánh giá được diễn đạt lại và tin tức được rút gọn từ nguồn tham khảo; dữ liệu lưu tĩnh trong HTML. Tìm kiếm bổ sung các mục Tin tức và Liên hệ.

### Tài nguyên hình ảnh

Nguồn tải, ngày đối chiếu và SHA-256 của tài nguyên website được ghi trong `assets/images/SOURCES.json`. Logo, banner, ảnh giới thiệu, ảnh danh mục, nền sản phẩm, avatar đánh giá, ảnh tin tức và ảnh liên hệ được lưu local trong `assets/images/`; 8 ảnh sản phẩm nằm trong `assets/images/products/`. Không cần tải ảnh từ website khi xem giao diện. Dữ liệu đối chiếu nằm tại `artifacts/reference/products-phase4.json` và `artifacts/reference/news-phase5.json`.

Ảnh gốc trong `figma_exports` và các ảnh cắt của Giai đoạn 2 được giữ nguyên để đối chiếu, nhưng ảnh cắt không còn được dùng trên trang. `favicon.svg` là biểu tượng chân mèo đơn giản.

## Giai đoạn 6: Kiểm định và tối ưu

- Sửa các nhãn ARIA cho nhóm slider/pagination và đánh giá sao, sửa autocomplete của điện thoại và option rỗng trong form để HTML đáp ứng Nu Validator.
- Bảy bản WebP giữ nguyên kích thước ảnh, được dùng qua `picture`/`image-set` với JPG/PNG dự phòng. Ảnh phóng to Lightbox tiếp tục dùng ảnh gốc. Thông số chuyển đổi, dung lượng và SHA-256 nằm trong `assets/images/OPTIMIZED.json`; `SOURCES.json` tiếp tục ghi nguồn ảnh gốc.
- Tái tạo WebP bằng `python scripts/optimize-images.py` (cần Pillow có hỗ trợ WebP), sau đó chạy `npm run build:sass`.
- `npm run test:quality` gửi nội dung `index.html` tới W3C Nu Validator, lưu kết quả kèm SHA-256, rồi kiểm tra semantic, font tiếng Việt, tài nguyên, WebP và responsive 375/430/768/1366/1920px trên Chrome/Edge.
- Chạy thêm `npm run test:ui`, `npm run test:day5`, `npm run test:gallery` để kiểm tra cảm ứng, bàn phím, giỏ hàng, form, accordion, album ảnh và các trường hợp tải thư viện thất bại.
- Kết quả và ảnh chụp kiểm định nằm trong `artifacts/phase-6/`. Phạm vi kiểm tra là giao diện Front-End; form chưa có API tiếp nhận và giỏ hàng chưa có thanh toán.

### Kiểm tra giao diện

```sh
npm run build:sass
npm run test:ui
```

Kiểm tra dùng Playwright với Chrome/Edge đã cài trên máy; có thể đặt `BROWSER_PATH` nếu trình duyệt ở đường dẫn khác. `scripts/check-ui.cjs` tự chạy và dừng server tạm, kiểm tra tràn ngang và số cột ở 320/375/430/768/1024/1366/1440/1920px, chuyển slide, cảm ứng, drawer, bàn phím, điều hướng, tìm kiếm, H1 và chế độ giảm chuyển động. Kiểm tra thêm 8 sản phẩm, giá/nhãn/liên kết, hover/focus, tìm kiếm theo tên và lỗi tải dữ liệu; carousel đánh giá/tin tức, nút điều hướng độc lập, liên kết liên hệ và số cột footer. Đồng thời kiểm tra trường hợp CDN JavaScript hoặc CSS của Swiper không tải được. Ảnh kiểm tra hiện tại lưu tại `artifacts/phase-5/`; ảnh các giai đoạn trước được giữ để tham chiếu.

Tài liệu Swiper tham chiếu: [Getting started](https://swiperjs.com/get-started), [API](https://swiperjs.com/swiper-api).

### Hiệu ứng 3D và tương tác vi mô

- `assets/js/effects.js` chạy sau khi `main.js` dựng sản phẩm. Vanilla-Tilt 1.8.1 nghiêng thẻ sản phẩm/danh mục tối đa 12°, perspective 1000px, chuyển tiếp 400ms và glare tối đa 0,25; không dùng cảm biến thiết bị.
- `components/_tilt.scss` giữ các lớp ảnh trong không gian 3D, đưa ảnh lên 28px và phóng 1,05 lần khi hover. Vệt sáng nghiêng 45° quét trong 0,6 giây, không nhận thao tác chuột.
- Nút hotline và “Xem tất cả” hút nhẹ khi chuột cách mép nút tối đa 20px; độ dịch chuyển cũng giới hạn trong bán kính 20px. Nút trở về vị trí khi rời xa, cuộn trang hoặc dùng bàn phím.
- Chỉ bật hiệu ứng với thiết bị có chuột chính xác và hover; tự hủy khi bật giảm chuyển động. Nếu CDN Vanilla-Tilt lỗi, mua hàng và điều hướng vẫn hoạt động.
- Chạy `npm run test:effects` để kiểm tra 3D, shimmer, magnet, bật/tắt giảm chuyển động, cảm ứng và lỗi CDN. Ảnh kiểm tra lưu trong `artifacts/effects-3d/`.
- Tham chiếu: [Vanilla-Tilt](https://micku7zu.github.io/vanilla-tilt.js/), [CSS Transforms Level 2](https://www.w3.org/TR/css-transforms-2/#grouping-property-values).

## Responsive và mixin

| Tên breakpoint | Chiều rộng |
| --- | --- |
| `mobile` | 375px |
| `mobile-lg` | 430px |
| `tablet` | 768px |
| `desktop` | 1024px |
| `desktop-lg` | 1366px |
| `desktop-xl` | 1440px |

Viết style mặc định cho mobile, sau đó mở rộng bằng `respond-to` (min-width). Helper `respond-below` dùng max-width bằng breakpoint trừ 0.02px để tránh chồng lấn. Tên breakpoint không hợp lệ sẽ báo lỗi khi biên dịch.

Mỗi partial cần tự `@use` các module mình sử dụng, ví dụ trong `components/_cards.scss`:

```scss
@use '../abstracts/variables';
@use '../abstracts/mixins';

.product-card {
  color: variables.$color-dark;

  @include mixins.respond-to('tablet') {
    padding: 1.5rem;
  }

  @include mixins.respond-below('tablet') {
    padding: 1rem;
  }

  &__title {
    @include mixins.line-clamp(2);
  }

  &__action {
    @include mixins.flex-center;
  }
}
```
