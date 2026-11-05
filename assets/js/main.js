(() => {
  'use strict';

  const header = document.querySelector('.header');
  if (header) {
    const updateHeader = () => header.classList.toggle('header--scrolled', window.scrollY > 50);
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('pageshow', updateHeader);
    updateHeader();
  }

  toastr.options = {
    positionClass: "toast-top-right",
    timeOut: 3000,
    progressBar: true,
    closeButton: true,
  };

  const products = Array.isArray(window.ManekoData?.products) ? window.ManekoData.products : [];
  const numberFormatter = new Intl.NumberFormat('vi-VN');
  const formatPrice = (price) => `${numberFormatter.format(price)}đ`;

  const renderProducts = (items) => {
    const list = document.querySelector('#product-list');
    const status = document.querySelector('#products-status');
    if (!list) return;

    const fragment = document.createDocumentFragment();
    items.forEach((product) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.id = `product-${product.id}`;
      card.tabIndex = -1;

      const titleId = `${card.id}-title`;
      const priceId = `${card.id}-price`;
      card.setAttribute('aria-labelledby', titleId);

      const link = document.createElement('a');
      link.className = 'product-card__link';
      link.href = product.url;
      link.title = product.name;
      link.setAttribute('aria-labelledby', `${titleId} ${priceId}`);

      const media = document.createElement('div');
      media.className = 'product-card__media';
      const image = document.createElement('img');
      image.className = 'product-card__image';
      image.src = product.image;
      image.alt = product.name;
      image.width = product.width;
      image.height = product.height;
      image.loading = 'lazy';
      image.decoding = 'async';
      media.append(image);

      const action = document.createElement('span');
      action.className = 'product-card__action';
      action.textContent = 'Xem chi tiết →';
      action.setAttribute('aria-hidden', 'true');
      media.append(action);

      const title = document.createElement('h3');
      title.className = 'product-card__title';
      title.id = titleId;
      title.textContent = product.name;

      const price = document.createElement('p');
      price.className = 'product-card__price';
      price.id = priceId;
      price.textContent = formatPrice(product.price);
      link.append(media, title, price);
      card.append(link);

      const actions = document.createElement('div');
      actions.className = 'product-card__buttons';
      const addButton = document.createElement('button');
      addButton.type = 'button';
      addButton.className = 'button button--add-cart';
      addButton.dataset.id = product.id;
      addButton.setAttribute('aria-label', `Thêm vào giỏ: ${product.name}`);
      const cartIcon = document.createElement('i');
      cartIcon.className = 'fa-solid fa-cart-shopping';
      cartIcon.setAttribute('aria-hidden', 'true');
      addButton.append(cartIcon, 'Thêm vào giỏ');
      const quickViewButton = document.createElement('button');
      quickViewButton.type = 'button';
      quickViewButton.className = 'button button--quick-view';
      quickViewButton.dataset.id = product.id;
      quickViewButton.textContent = 'Xem nhanh';
      quickViewButton.setAttribute('aria-label', `Xem nhanh: ${product.name}`);
      quickViewButton.setAttribute('aria-haspopup', 'dialog');
      actions.append(addButton, quickViewButton);
      card.append(actions);

      if (product.tag) {
        const badge = document.createElement('span');
        badge.className = 'badge product-card__badge';
        badge.textContent = product.tag;
        card.append(badge);
      }
      fragment.append(card);
    });

    list.replaceChildren(fragment);
    status.hidden = items.length > 0;
    status.textContent = items.length ? '' : 'Chưa tải được danh sách sản phẩm. Bạn có thể chọn “Xem tất cả” để tiếp tục khám phá tại Maneko.';
  };

  renderProducts(products);

  const menu = document.querySelector('#mobile-menu');
  const menuToggle = document.querySelector('.header__menu-toggle');
  const search = document.querySelector('#search-dialog');
  const dialogs = [...document.querySelectorAll('dialog')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let heroSlider;

  const cart = new Map();
  const cartButton = document.querySelector('[data-open-cart]');
  const cartCount = document.querySelector('[data-cart-count]');
  const cartStatus = document.querySelector('[data-cart-status]');
  const notify = (type, message) => {
    const toast = toastr[type](message, 'Maneko', { escapeHtml: true });
    // Keep feedback visible above a native mobile-menu dialog, too.
    toast?.parent().appendTo(document.querySelector('dialog[open]') || document.body);
  };
  const popupOptions = () => ({
    showCloseButton: true,
    closeButtonAriaLabel: 'Đóng',
    buttonsStyling: false,
    customClass: {
      popup: 'product-popup',
      confirmButton: 'button',
      cancelButton: 'button button--quick-view',
    },
    showClass: { popup: reducedMotion.matches ? '' : 'animate__animated animate__fadeIn' },
    hideClass: { popup: reducedMotion.matches ? '' : 'animate__animated animate__fadeOut' },
  });

  const addToCart = (product) => {
    cart.set(product.id, (cart.get(product.id) || 0) + 1);
    const count = [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
    cartCount.textContent = numberFormatter.format(count);
    cartButton.setAttribute('aria-label', `Xem giỏ hàng, ${count} sản phẩm`);
    cartStatus.textContent = `Giỏ hàng có ${count} sản phẩm.`;
    cartCount.classList.remove('animate__animated', 'animate__rubberBand');
    if (!reducedMotion.matches) {
      void cartCount.offsetWidth;
      cartCount.classList.add('animate__animated', 'animate__rubberBand');
    }
    notify('success', `Đã thêm ${product.name} vào giỏ hàng!`);
  };

  window.jQuery('#product-list').on('click', '.button--add-cart, .button--quick-view', function () {
    const product = products.find((item) => item.id === this.dataset.id);
    if (!product) return;
    if (this.classList.contains('button--add-cart')) {
      addToCart(product);
      return;
    }

    const content = document.createElement('div');
    const price = document.createElement('p');
    price.className = 'product-popup__price';
    price.textContent = formatPrice(product.price);
    const description = document.createElement('p');
    description.textContent = product.description || product.name;
    const orderLink = document.createElement('a');
    orderLink.className = 'product-popup__order';
    orderLink.href = product.url;
    orderLink.textContent = 'Đặt mua ngay';
    content.append(price, description, orderLink);
    window.Swal.fire({
      ...popupOptions(),
      titleText: product.name,
      imageUrl: product.image,
      imageAlt: product.name,
      html: content,
      confirmButtonText: 'Thêm vào giỏ',
      showCancelButton: true,
      cancelButtonText: 'Đóng',
    }).then(({ isConfirmed }) => {
      if (isConfirmed) addToCart(product);
    });
  });

  cartButton.hidden = false;
  cartButton.addEventListener('click', () => {
    const content = document.createElement('div');
    const list = document.createElement('ul');
    list.className = 'product-popup__cart';
    let total = 0;
    cart.forEach((quantity, id) => {
      const product = products.find((item) => item.id === id);
      const item = document.createElement('li');
      item.textContent = `${product.name} × ${quantity} — ${formatPrice(product.price * quantity)}`;
      list.append(item);
      total += product.price * quantity;
    });
    const summary = document.createElement('p');
    summary.className = 'product-popup__price';
    summary.textContent = cart.size ? `Tạm tính: ${formatPrice(total)}` : 'Giỏ hàng của bạn đang trống.';
    const note = document.createElement('p');
    note.textContent = 'Giỏ hàng được giữ đến khi tải lại trang. Liên hệ Maneko để đặt hàng.';
    const contact = document.createElement('a');
    contact.href = 'tel:0399366168';
    contact.className = 'product-popup__order';
    contact.textContent = 'Gọi Maneko: 0399 366 168';
    content.append(list, summary, note, contact);
    window.Swal.fire({ ...popupOptions(), titleText: 'Giỏ hàng của bạn', html: content, confirmButtonText: 'Tiếp tục chọn' });
  });

  document.querySelectorAll('[data-clipboard-text]').forEach((trigger) => {
    // The temporary selection must stay inside a native dialog when it is open.
    const clipboard = new window.ClipboardJS(trigger, { container: trigger.closest('dialog') || document.body });
    trigger.addEventListener('click', (event) => event.preventDefault());
    clipboard.on('success', (event) => {
      event.clearSelection();
      notify('info', `Đã sao chép: ${event.text}`);
    });
    clipboard.on('error', () => {
      notify('error', `Không thể tự động sao chép. Vui lòng sao chép thủ công: ${trigger.dataset.clipboardText}`);
    });
  });

  const initAgencyForm = () => {
    const $ = window.jQuery;
    const form = document.querySelector('#agency-form');
    if (!form || typeof $.fn.select2 !== 'function' || typeof $.fn.validate !== 'function') return;

    const city = $('#agency-city');
    city.select2({
      width: '100%',
      placeholder: 'Chọn tỉnh/thành phố',
      minimumResultsForSearch: 0,
      language: { noResults: () => 'Không tìm thấy khu vực phù hợp.' },
    });
    const cityControl = city.next('.select2').find('[role="combobox"]');
    cityControl.attr({
      'aria-labelledby': 'agency-city-label select2-agency-city-container',
      'aria-required': 'true',
    });
    city.on('select2:open', () => {
      const searchField = document.querySelector('.select2-container--open .select2-search__field');
      searchField?.setAttribute('aria-label', 'Tìm tỉnh/thành phố');
      searchField?.focus();
    });

    $.validator.addMethod('vietnameseMobile', function (value, element) {
      return this.optional(element) || /^0[35789][0-9]{8}$/.test(value);
    }, 'Nhập số di động Việt Nam gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08 hoặc 09.');

    const validator = $(form).validate({
      // Select2 hides the original select; it must still be validated.
      ignore: ':hidden:not(#agency-city)',
      normalizer: value => value.trim(),
      rules: {
        fullName: { required: true, minlength: 2, maxlength: 100 },
        phone: { required: true, vietnameseMobile: true },
        email: { email: true, maxlength: 254 },
        city: { required: true },
        message: { maxlength: 1000 },
      },
      messages: {
        fullName: { required: 'Vui lòng nhập họ và tên.', minlength: 'Họ tên cần ít nhất 2 ký tự.' },
        phone: { required: 'Vui lòng nhập số điện thoại.' },
        email: { email: 'Vui lòng nhập địa chỉ email hợp lệ.' },
        city: { required: 'Vui lòng chọn tỉnh/thành phố.' },
      },
      errorElement: 'span',
      errorClass: 'agency-form__error',
      errorPlacement(error, element) {
        error.appendTo(element.closest('.agency-form__field'));
        if (element.is(city)) cityControl.attr('aria-describedby', error.attr('id'));
      },
      highlight(element) {
        $(element).closest('.agency-form__field').addClass('is-invalid');
        if (element === city[0]) cityControl.attr('aria-invalid', 'true');
      },
      unhighlight(element) {
        $(element).closest('.agency-form__field').removeClass('is-invalid');
        if (element === city[0]) cityControl.attr('aria-invalid', 'false');
      },
      focusInvalid: false,
      invalidHandler(event, validation) {
        const firstInvalid = validation.errorList[0]?.element;
        if (firstInvalid === city[0]) cityControl.trigger('focus');
        else firstInvalid?.focus();
      },
      submitHandler(validForm, event) {
        event.preventDefault();
        window.Swal.fire({
          ...popupOptions(),
          icon: 'success',
          titleText: 'Gửi yêu cầu thành công! (Bản dùng thử)',
          text: 'Bạn đã hoàn tất thao tác thử. Thông tin chưa được gửi tới Maneko. Vui lòng gọi 0399 366 168 để đăng ký tư vấn hoặc nhận mẫu thử thực tế.',
          confirmButtonText: 'Đã hiểu',
        }).then(() => {
          validForm.reset();
          validator.resetForm();
          city.val('').trigger('change.select2');
          cityControl.removeAttr('aria-invalid aria-describedby');
        });
        return false;
      },
    });
    city.on('change', () => validator.element(city[0]));
    form.querySelector('[type="submit"]').disabled = false;
  };

  initAgencyForm();

  const initStatsCounter = () => {
    const section = document.querySelector('.stats-section');
    // Keep the final HTML values when animation is unavailable or unwanted.
    if (!section || reducedMotion.matches || typeof window.IntersectionObserver !== 'function' ||
        typeof window.jQuery !== 'function') return;

    const counters = [...section.querySelectorAll('.stats__value[data-target]')].map((element) => ({
      element,
      target: Number(element.dataset.target),
      animation: window.jQuery({ countNum: 0 }),
    }));
    const finishOnReducedMotion = ({ matches }) => {
      if (matches) counters.forEach(({ animation }) => animation.stop(true, true));
    };
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      // Disconnect before starting so scrolling back cannot replay the counters.
      observer.disconnect();
      reducedMotion.addEventListener('change', finishOnReducedMotion);
      let remaining = counters.length;
      counters.forEach(({ element, target, animation }) => {
        element.textContent = '0+';
        animation.animate({ countNum: target }, {
          duration: reducedMotion.matches ? 0 : 2000,
          easing: 'swing',
          step(now) {
            element.textContent = `${numberFormatter.format(Math.floor(now))}+`;
          },
          complete() {
            element.textContent = `${numberFormatter.format(target)}+`;
            remaining -= 1;
            if (remaining === 0) reducedMotion.removeEventListener('change', finishOnReducedMotion);
          },
        });
      });
    }, { threshold: 0.15 });
    observer.observe(section);
  };

  initStatsCounter();

  const initAccordion = () => {
    const $ = window.jQuery;
    const buttons = $('#qa .qa__question');
    const setState = (button, expanded) => {
      button.setAttribute('aria-expanded', String(expanded));
      const answer = document.getElementById(button.getAttribute('aria-controls'));
      answer.inert = !expanded;
      answer.setAttribute('aria-hidden', String(!expanded));
      return $(answer);
    };
    // Answers stay readable in the HTML when JavaScript is disabled.
    buttons.each((index, button) => setState(button, index === 0).toggle(index === 0));
    buttons.on('click', function () {
      const expanded = this.getAttribute('aria-expanded') !== 'true';
      const duration = reducedMotion.matches ? 0 : 300;
      buttons.not(this).each((index, button) => setState(button, false).stop(true, true).slideUp(duration));
      setState(this, expanded).stop(true, true).slideToggle(duration);
    });
    buttons.on('keydown', function (event) {
      const index = buttons.index(this);
      const next = { ArrowDown: (index + 1) % buttons.length, ArrowUp: (index + buttons.length - 1) % buttons.length, Home: 0, End: buttons.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      buttons.eq(next).trigger('focus');
    });
  };
  initAccordion();

  // Lightbox builds its DOM on jQuery ready, before this callback runs.
  window.jQuery(() => {
    const gallery = window.lightbox;
    if (!gallery) return;
    const viewer = gallery.$lightbox;
    const updateGalleryMotion = () => gallery.option({
      fadeDuration: reducedMotion.matches ? 0 : 200,
      imageFadeDuration: reducedMotion.matches ? 0 : 200,
      resizeDuration: reducedMotion.matches ? 0 : 200,
    });
    gallery.option({ albumLabel: 'Ảnh %1 / %2', wrapAround: true, disableScrolling: true, alwaysShowNavOnTouchDevices: true, sanitizeTitle: true, positionFromTop: 24 });
    updateGalleryMotion();
    reducedMotion.addEventListener('change', updateGalleryMotion);
    viewer.attr({ role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Xem ảnh Maneko' });
    viewer.find('.lb-prev').attr('aria-label', 'Ảnh trước');
    viewer.find('.lb-next').attr('aria-label', 'Ảnh tiếp theo');
    viewer.find('.lb-close, .lb-cancel').attr('aria-label', 'Đóng ảnh');

    let opener;
    let active = false;
    let background = [];
    const start = gallery.start.bind(gallery);
    const showImage = gallery.showImage.bind(gallery);
    const end = gallery.end.bind(gallery);
    gallery.start = (link) => {
      opener = link[0];
      background = [...document.querySelectorAll('body > header, body > main, body > footer, body > .skip-link')].map(element => ({ element, inert: element.inert }));
      background.forEach(({ element }) => { element.inert = true; });
      active = true;
      start(link);
      viewer.trigger('focus');
    };
    gallery.showImage = () => {
      showImage();
      if (active) viewer.trigger('focus');
    };
    gallery.end = () => {
      active = false;
      end();
      background.forEach(({ element, inert }) => { element.inert = inert; });
      viewer.promise().done(() => { if (!active) opener?.focus({ preventScroll: true }); });
    };
    viewer.add(gallery.$overlay).on('keydown.maneko', (event) => {
      if (!active) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        gallery.end();
      } else if (event.key === 'Tab') {
        const controls = viewer.find('[tabindex="0"]:visible').toArray();
        const index = controls.indexOf(document.activeElement);
        const next = event.shiftKey ? (index <= 0 ? controls.length - 1 : index - 1) : (index + 1) % controls.length;
        event.preventDefault();
        (controls[next] || viewer[0]).focus();
      } else if (event.key === ' ' && event.target.matches('.lb-prev, .lb-next')) {
        event.preventDefault();
        event.target.click();
      }
    });
  });

  const updateDialogState = () => {
    document.body.classList.toggle('has-dialog', dialogs.some((dialog) => dialog.open));
    menuToggle.setAttribute('aria-expanded', String(menu.open));
  };

  const openDialog = (dialog) => {
    const switchingFromMenu = menu.open && dialog !== menu;
    dialogs.forEach((other) => {
      if (other !== dialog && other.open) other.close();
    });
    if (switchingFromMenu) menuToggle.focus();
    if (!dialog.open) dialog.showModal();
    updateDialogState();
  };

  dialogs.forEach((dialog) => {
    dialog.addEventListener('close', updateDialogState);
    dialog.addEventListener('keydown', (event) => {
      // Search inputs may consume Escape to clear their value before the dialog can close.
      if (event.key === 'Escape') {
        event.preventDefault();
        dialog.close();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]')]
        .filter((element) => !element.disabled && element.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    // Close only when both ends of the click are on the backdrop, not when selecting text.
    let pointerStartedOutside = false;
    const isOutside = (event) => {
      const bounds = dialog.getBoundingClientRect();
      return event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom;
    };
    dialog.addEventListener('pointerdown', (event) => { pointerStartedOutside = isOutside(event); });
    dialog.addEventListener('click', (event) => {
      if (pointerStartedOutside && isOutside(event)) dialog.close();
      pointerStartedOutside = false;
    });
  });

  menuToggle.addEventListener('click', () => openDialog(menu));
  const desktop = window.matchMedia('(min-width: 1024px)');
  desktop.addEventListener('change', ({ matches }) => {
    if (matches && menu.open) {
      menu.close();
      document.querySelector('.header__brand').focus({ preventScroll: true });
    }
  });

  document.querySelectorAll('.header__nav a, .header__mobile-links a').forEach((link) => {
    link.addEventListener('click', () => {
      if (menu.open) menu.close();
      if (link.hash && link.origin === window.location.origin) {
        document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
      }
    });
  });

  const showFallbackSlide = (activeIndex) => {
    document.querySelectorAll('.hero-section__slide').forEach((slide, index) => {
      slide.inert = index !== activeIndex;
      slide.hidden = index !== activeIndex;
      slide.setAttribute('aria-hidden', String(index !== activeIndex));
    });
  };

  if (typeof window.Swiper === 'function') {
    heroSlider = new window.Swiper('.hero-section__slider', {
      slidesPerView: 1,
      speed: reducedMotion.matches ? 0 : 450,
      autoHeight: true,
      rewind: true,
      grabCursor: true,
      // Manual navigation avoids auto-advancing content while visitors are reading.
      pagination: {
        el: '.hero-section__pagination',
        clickable: true,
        renderBullet(index, className) {
          return `<button class="${className}" type="button" aria-label="Xem banner ${index + 1}"></button>`;
        },
      },
      a11y: {
        enabled: true,
        containerRoleDescriptionMessage: 'Trình chiếu banner',
        itemRoleDescriptionMessage: 'Banner',
        slideLabelMessage: '{{index}} / {{slidesLength}}',
        paginationBulletMessage: 'Xem banner {{index}}',
      },
    });

    const updateSlideAccess = () => {
      heroSlider.slides.forEach((slide, index) => {
        slide.inert = index !== heroSlider.activeIndex;
        slide.setAttribute('aria-hidden', String(index !== heroSlider.activeIndex));
      });
    };
    updateSlideAccess();
    heroSlider.on('slideChange', updateSlideAccess);
    reducedMotion.addEventListener('change', ({ matches }) => {
      heroSlider.params.speed = matches ? 0 : 450;
    });
    const updateHeroHeight = () => heroSlider.updateAutoHeight(0);
    window.addEventListener('load', updateHeroHeight, { once: true });
    document.querySelectorAll('.hero-section__slider img').forEach((image) => {
      image.addEventListener('load', updateHeroHeight);
    });
    document.fonts.ready.then(updateHeroHeight);
  } else {
    showFallbackSlide(0);
  }

  document.querySelectorAll('[data-carousel]').forEach((section) => {
    if (typeof window.Swiper !== 'function') return;
    const slider = new window.Swiper(section.querySelector('.content-carousel'), {
      slidesPerView: 1,
      spaceBetween: 24,
      speed: reducedMotion.matches ? 0 : 450,
      rewind: true,
      watchOverflow: true,
      breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
      navigation: { prevEl: section.querySelector('.carousel-arrow--prev'), nextEl: section.querySelector('.carousel-arrow--next') },
      pagination: {
        el: section.querySelector('.carousel-pagination'), clickable: true,
        renderBullet(index, className) { return `<button class="${className}" type="button" aria-label="Xem nhóm ${index + 1}"></button>`; },
      },
      a11y: {
        enabled: true,
        prevSlideMessage: section.querySelector('.carousel-arrow--prev').getAttribute('aria-label'),
        nextSlideMessage: section.querySelector('.carousel-arrow--next').getAttribute('aria-label'),
        paginationBulletMessage: 'Xem nhóm {{index}}', slideLabelMessage: '{{index}} / {{slidesLength}}',
      },
    });
    section.classList.add('has-carousel');
    const updateAccess = () => {
      slider.slides.forEach((slide, index) => {
        const visible = index >= slider.activeIndex && index < slider.activeIndex + Number(slider.params.slidesPerView);
        slide.inert = !visible;
        slide.setAttribute('aria-hidden', String(!visible));
      });
    };
    updateAccess();
    slider.on('slideChange', updateAccess);
    slider.on('resize', () => requestAnimationFrame(updateAccess));
    slider.on('breakpoint', () => requestAnimationFrame(updateAccess));
    reducedMotion.addEventListener('change', ({ matches }) => { slider.params.speed = matches ? 0 : 450; });
  });

  const searchInput = search.querySelector('input');
  const resultList = search.querySelector('.search__results');
  const resultStatus = search.querySelector('.search__status');
  const content = [
    { title: 'Ăn vặt Maneko — Ngon mê ly', keywords: 'maneko mèo may mắn ăn vặt ngon mê ly', target: 'hero', slide: 0 },
    { title: 'Khám phá các hương vị snack Maneko', keywords: 'maneko sản phẩm snack phồng tôm mì giòn bánh mì giòn luffy chân gà', target: 'hero', slide: 1 },
    { title: 'Câu chuyện thương hiệu Maneko', keywords: 'giới thiệu công ty nhà máy chất lượng an toàn ISO 22000:2018', target: 'gioi-thieu' },
    { title: 'Danh mục sản phẩm Maneko', keywords: 'danh mục sản phẩm', target: 'san-pham' },
    { title: 'Snack khô — 16 sản phẩm', keywords: 'snack khô phồng tôm mì giòn bánh mì giòn luffy', target: 'snack-kho' },
    { title: 'Snack ướt — 2 sản phẩm', keywords: 'snack ướt tăm cay thiên long bò kobe hoàng kim', target: 'snack-uot' },
    { title: 'Tin tức và sự kiện Maneko', keywords: 'hoạt động hội chợ tin tức cộng đồng', target: 'tin-tuc' },
    { title: 'Hỏi & Đáp về Maneko', keywords: 'qa q&a hỏi đáp hạn sử dụng bảo quản đại lý chiết khấu mua lẻ', target: 'qa' },
    { title: 'Liên hệ và hợp tác với Maneko', keywords: 'hotline email điện thoại 0399366168 nhamaymaneko@gmail.com', target: 'lien-he' },
    ...products.map((product) => ({
      title: `${product.name} — ${formatPrice(product.price)}`,
      keywords: `sản phẩm nổi bật ${product.tag}`,
      target: `product-${product.id}`,
    })),
  ];
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();

  const renderResults = () => {
    const query = normalize(searchInput.value);
    const results = content.filter((item) => query.split(/\s+/).every((word) => normalize(`${item.title} ${item.keywords}`).includes(word)));
    resultList.replaceChildren();
    resultStatus.textContent = query
      ? (results.length ? `${results.length} nội dung phù hợp` : 'Chưa tìm thấy nội dung phù hợp. Thử “Maneko” hoặc “mì giòn”.')
      : 'Khám phá cùng Maneko';

    results.forEach((item) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${item.target}`;
      link.textContent = item.title;
      link.addEventListener('click', () => {
        search.close();
        if (Number.isInteger(item.slide)) {
          if (heroSlider) heroSlider.slideTo(item.slide);
          else showFallbackSlide(item.slide);
        }
        const target = document.getElementById(item.target);
        (target.hasAttribute('tabindex') ? target : document.querySelector('#main-content')).focus({ preventScroll: true });
      });
      li.append(link);
      resultList.append(li);
    });
  };

  document.querySelectorAll('[data-open-search]').forEach((button) => {
    button.addEventListener('click', () => {
      renderResults();
      openDialog(search);
      searchInput.focus();
    });
  });
  searchInput.addEventListener('input', renderResults);
  search.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    renderResults();
    resultList.querySelector('a')?.focus();
  });
})();
