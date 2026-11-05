const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');
const { createServer } = require('./serve.cjs');

const candidates = [
  process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

(async () => {
  const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
  assert.ok(executablePath, 'Install Chrome/Edge or set BROWSER_PATH to the browser executable.');
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    const page = await browser.newPage();
    const pageErrors = [];
    const networkErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) networkErrors.push(`${response.status()} ${response.url()}`);
    });
    const url = `http://127.0.0.1:${server.address().port}`;
    const output = path.resolve(__dirname, '../artifacts/phase-5');
    fs.mkdirSync(output, { recursive: true });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector('.hero-section__slider').swiper);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.skip-link').evaluate((link) => link === document.activeElement && getComputedStyle(link).clipPath === 'none'), true);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#main-content').evaluate((main) => main === document.activeElement), true);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('img:not([alt])').count(), 0);
    const contrast = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d');
      return ['.stats-section', '.button'].map((selector) => {
        context.fillStyle = getComputedStyle(document.querySelector(selector)).backgroundColor;
        context.fillRect(0, 0, 1, 1);
        const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
        const linear = rgb.map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return 1.05 / (linear.reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0) + 0.05);
      });
    });
    assert.ok(contrast.every((ratio) => ratio >= 4.5), `White text contrast on red surfaces: ${contrast}`);
    await page.locator('.stats-section').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('.stats__value')].every((element) =>
      element.textContent === `${new Intl.NumberFormat('vi-VN').format(Number(element.dataset.target))}+`
    ));
    assert.deepEqual(await page.locator('.stats__value').allTextContents(), ['80+', '40.000+', '150+', '4.800+']);
    assert.equal(await page.locator('.category-card').count(), 2);
    assert.equal(await page.locator('#product-list .product-card').count(), 8);
    assert.equal(await page.locator('.product-card__badge').count(), 3);
    assert.deepEqual(await page.locator('.product-card__price').allTextContents(), ['6.000đ', '6.000đ', '5.000đ', '6.000đ', '6.000đ', '5.000đ', '20.000đ', '20.000đ']);
    assert.equal(await page.locator('.products__view-all').getAttribute('href'), 'https://maneko.vn/tat-ca-san-pham');
    const referenceProducts = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../artifacts/reference/products-phase4.json'), 'utf8'));
    assert.deepEqual(await page.locator('.product-card__title').allTextContents(), referenceProducts.map((product) => product.name));
    assert.deepEqual(await page.locator('.product-card__link').evaluateAll((links) => links.map((link) => link.href)), referenceProducts.map((product) => product.url));
    assert.equal(await page.locator('a[href="tel:0123456789"]').count(), 0);
    assert.equal(await page.locator('.header__nav a[href="#lien-he"], .header__mobile-links a[href="#lien-he"]').count(), 2);
    assert.equal(await page.locator('.review-card').count(), 4);
    assert.equal(await page.locator('.news-card').count(), 4);
    assert.equal(await page.locator('footer').count(), 1);
    assert.equal(await page.locator('.fanpage-card__name').textContent(), 'Ăn vặt Maneko');
    assert.equal(await page.locator('.contact-cta a[href="tel:0399366168"]').count(), 1);
    assert.equal(await page.locator('.contact-cta a[href="mailto:nhamaymaneko@gmail.com"]').count(), 1);
    assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'), 'https://maneko.vn/');
    assert.equal(await page.locator('.about__button').getAttribute('href'), 'https://maneko.vn/blog/gioi-thieu');
    assert.deepEqual(await page.locator('.category-card__link').evaluateAll((links) => links.map((link) => link.href)), ['https://maneko.vn/snake', 'https://maneko.vn/tam-cay']);
    assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll((links) => links.filter((link) => !document.getElementById(link.hash.slice(1))).map((link) => link.hash)), [], 'All internal anchors have a destination');
    await page.waitForFunction(() => [...document.images].filter((image) => image.loading !== 'lazy').every((image) => image.complete && image.naturalWidth > 0));
    await page.locator('#san-pham').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('.about__image, .category-card__image')].every((image) => image.complete && image.naturalWidth > 0));
    for (const card of await page.locator('.product-card').all()) await card.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('.product-card__image')].every((image) => image.complete && image.naturalWidth > 0));
    for (const section of await page.locator('[data-carousel]').all()) {
      await section.scrollIntoViewIfNeeded();
      await section.locator('.content-carousel').evaluate((element) => element.swiper.slideTo(1, 0));
      await page.waitForFunction(() => [...document.querySelectorAll('[data-carousel] img')].filter((image) => image.getBoundingClientRect().top < innerHeight + 2000).every((image) => image.complete && image.naturalWidth > 0));
      await section.locator('.content-carousel').evaluate((element) => element.swiper.slideTo(0, 0));
    }
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('.contact-cta img, footer img')].every((image) => image.complete && image.naturalWidth > 0));
    await page.evaluate(() => window.scrollTo(0, 0));

    for (const width of [320, 375, 430, 768, 1024, 1366, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(180);
      for (const slide of [0, 1]) {
        await page.evaluate((index) => document.querySelector('.hero-section__slider').swiper.slideTo(index, 0), slide);
        await page.waitForTimeout(80);
        const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
        assert.ok(dimensions.scroll <= dimensions.width, `Horizontal overflow at ${width}px, slide ${slide}`);
        assert.equal(await page.locator('#hero-title').evaluate((heading) => Boolean(heading.closest('[inert], [aria-hidden="true"]'))), false, 'Main H1 remains accessible on both slides');
      }
      const gridColumns = await page.evaluate(() => ['.stats__grid', '.about__grid', '.categories__grid', '.products__grid'].map((selector) => getComputedStyle(document.querySelector(selector)).gridTemplateColumns.split(' ').length));
      assert.deepEqual(gridColumns, [width >= 1024 ? 4 : 2, width >= 1024 ? 2 : 1, width >= 768 ? 2 : 1, width >= 1024 ? 4 : width >= 430 ? 2 : 1], `Section columns at ${width}px`);
      assert.equal(await page.locator('.footer__grid').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length), width >= 1024 ? 4 : width >= 768 ? 2 : 1);
      for (const carousel of await page.locator('.content-carousel').all()) {
        assert.equal(await carousel.evaluate((element) => element.swiper.params.slidesPerView), width >= 1024 ? 3 : width >= 768 ? 2 : 1);
      }
      await page.evaluate(() => document.querySelector('.hero-section__slider').swiper.slideTo(0, 0));
      if ([375, 768, 1440].includes(width)) {
        await page.evaluate(() => {
          document.activeElement?.blur();
          window.scrollTo(0, 0);
        });
        await page.screenshot({ path: path.join(output, `home-${width}.png`), fullPage: true });
      }
      if ([375, 430, 768, 1440].includes(width)) {
        await page.evaluate(() => document.activeElement?.blur());
        await page.locator('.products-section').screenshot({ path: path.join(output, `products-${width}.png`) });
      }
      if ([375, 1440].includes(width)) {
        for (const [name, selector] of [['reviews', '.testimonials-section'], ['news', '.news-section'], ['contact', '.contact-cta'], ['footer', 'footer']]) {
          await page.locator(selector).screenshot({ path: path.join(output, `${name}-${width}.png`) });
        }
      }
    }
    await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));

    for (const selector of ['#danh-gia', '#tin-tuc']) {
      const section = page.locator(selector);
      await section.locator('.carousel-arrow--next').click();
      await page.waitForFunction((selector) => document.querySelector(`${selector} .content-carousel`).swiper.activeIndex === 1, selector);
      await page.waitForFunction((selector) => !document.querySelector(`${selector} .content-carousel`).swiper.animating, selector);
      assert.equal(await section.locator('.swiper-slide').first().evaluate((slide) => slide.inert), true);
      await section.locator('.carousel-arrow--prev').click();
      await page.waitForFunction((selector) => document.querySelector(`${selector} .content-carousel`).swiper.activeIndex === 0, selector);
    }
    await page.getByRole('navigation', { name: 'Điều hướng chính', exact: true }).getByRole('link', { name: 'Tin tức - Sự kiện' }).click();
    assert.ok(page.url().endsWith('#tin-tuc'));
    await page.getByRole('navigation', { name: 'Điều hướng chính', exact: true }).getByRole('link', { name: 'Liên hệ' }).click();
    assert.ok(page.url().endsWith('#lien-he'));

    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
    await page.locator('#mobile-menu').evaluate((dialog) => Promise.all(dialog.getAnimations().map((animation) => animation.finished)));
    const drawerBounds = await page.locator('#mobile-menu').boundingBox();
    assert.ok(drawerBounds.x >= 0 && drawerBounds.x + drawerBounds.width <= 375, 'Drawer fits the mobile viewport');
    assert.equal(await page.locator('#mobile-menu').evaluate((dialog) => dialog.open), true);
    assert.equal(await page.locator('.header__menu-toggle').getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('body').evaluate((body) => getComputedStyle(body).overflow), 'hidden');
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.querySelector('#mobile-menu').contains(document.activeElement)), true, 'Focus must stay in drawer');
    }
    await page.screenshot({ path: path.join(output, 'mobile-menu.png'), fullPage: true });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.body.classList.contains('has-dialog'));
    assert.equal(await page.locator('.header__menu-toggle').evaluate((button) => button === document.activeElement), true);

    await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
    await page.mouse.click(5, 300);
    assert.equal(await page.locator('#mobile-menu').evaluate((dialog) => dialog.open), false, 'Backdrop closes drawer');
    await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForFunction(() => !document.querySelector('#mobile-menu').open);
    await page.getByRole('navigation', { name: 'Điều hướng chính', exact: true }).getByRole('link', { name: 'Giới thiệu' }).click();
    assert.ok(page.url().endsWith('#gioi-thieu'));
    assert.equal(await page.locator('#gioi-thieu').evaluate((section) => document.activeElement === section), true);

    await page.getByRole('button', { name: 'Mở tìm kiếm', exact: true }).click();
    await page.getByRole('searchbox').fill('mi gion');
    assert.equal(await page.locator('.search__results a').count(), 5, 'Search finds the banner, category, two breads and noodles without accents');
    await page.screenshot({ path: path.join(output, 'search.png'), fullPage: true });
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.search__results a').first().evaluate((link) => link === document.activeElement), true);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('.hero-section__slider').swiper.activeIndex === 1);
    assert.equal(await page.locator('#search-dialog').evaluate((dialog) => dialog.open), false);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(output, 'slide-2-desktop.png'), fullPage: true });
    await page.getByRole('button', { name: 'Xem banner 1', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.hero-section__slider').swiper.activeIndex === 0);

    await page.getByRole('button', { name: 'Mở tìm kiếm', exact: true }).click();
    await page.getByRole('searchbox').fill('khong-co-san-pham-nay');
    assert.equal(await page.locator('.search__results a').count(), 0);
    assert.match(await page.locator('.search__status').textContent(), /Chưa tìm thấy/);
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Mở tìm kiếm', exact: true }).click();
    await page.getByRole('searchbox').fill('ISO');
    await page.getByRole('link', { name: 'Câu chuyện thương hiệu Maneko' }).click();
    assert.ok(page.url().endsWith('#gioi-thieu'));
    assert.equal(await page.locator('#gioi-thieu').evaluate((section) => section === document.activeElement), true);

    await page.getByRole('button', { name: 'Mở tìm kiếm', exact: true }).click();
    await page.getByRole('searchbox').fill('caramel');
    assert.equal(await page.locator('.search__results a').count(), 1);
    await page.locator('.search__results a').click();
    assert.ok(page.url().endsWith('#product-banh-mi-gion-vi-caramel-hop-32g'));
    assert.equal(await page.locator('.product-card').first().evaluate((card) => card === document.activeElement), true);
    await page.locator('.product-card__link').first().hover();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.product-card__action')).opacity === '1');
    await page.locator('.product-card').first().screenshot({ path: path.join(output, 'product-hover.png') });
    await page.mouse.move(0, 0);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: 'Mở menu', exact: true }).click();
    await page.getByRole('navigation', { name: 'Điều hướng trên điện thoại' }).getByRole('link', { name: 'Sản phẩm', exact: true }).click();
    assert.ok(page.url().endsWith('#san-pham'));
    assert.equal(await page.locator('#mobile-menu').evaluate((dialog) => dialog.open), false);
    assert.equal(await page.locator('#san-pham').evaluate((section) => section === document.activeElement), true);

    const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    const mobilePage = await mobile.newPage();
    await mobilePage.goto(url, { waitUntil: 'networkidle' });
    await mobilePage.waitForFunction(() => document.querySelector('.hero-section__slider').swiper);
    const cdp = await mobile.newCDPSession(mobilePage);
    const banner = await mobilePage.locator('.hero-section__banner').boundingBox();
    const y = banner.y + banner.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 325, y }] });
    for (const x of [285, 245, 205, 165, 125, 85, 45]) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
      await mobilePage.waitForTimeout(30);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await mobilePage.waitForFunction(() => document.querySelector('.hero-section__slider').swiper.activeIndex === 1);
    await mobilePage.waitForFunction(() => !document.querySelector('.hero-section__slider').swiper.animating);
    await mobilePage.screenshot({ path: path.join(output, 'slide-2-mobile.png'), fullPage: true });
    await mobile.close();

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('.hero-section__slider').swiper.params.speed === 0);
    assert.equal(await page.locator('.content-carousel').first().evaluate((element) => element.swiper.params.speed), 0);

    const fallback = await browser.newPage();
    await fallback.route('https://cdn.jsdelivr.net/npm/swiper@*/**', (route) => route.abort());
    await fallback.goto(url, { waitUntil: 'networkidle' });
    assert.equal(await fallback.locator('.hero-section__banner').isVisible(), true);
    await fallback.getByRole('button', { name: 'Mở tìm kiếm', exact: true }).click();
    assert.equal(await fallback.locator('#search-dialog').evaluate((dialog) => dialog.open), true);
    await fallback.getByRole('searchbox').fill('mi gion');
    await fallback.locator('.search__results a').first().click();
    assert.equal(await fallback.locator('.hero-section__slide--selection').isVisible(), true, 'Search can show a banner without Swiper');
    assert.equal(await fallback.locator('#tin-tuc .content-carousel').evaluate((element) => getComputedStyle(element).overflowX), 'auto');
    assert.equal(await fallback.locator('#tin-tuc .carousel-controls').isVisible(), false);
    assert.equal(await fallback.locator('.news-card__link').count(), 4);
    await fallback.close();

    const noSwiperStyles = await browser.newPage();
    await noSwiperStyles.route('https://cdn.jsdelivr.net/npm/swiper@*/swiper-bundle.min.css', (route) => route.abort());
    await noSwiperStyles.goto(url, { waitUntil: 'networkidle' });
    await noSwiperStyles.getByRole('button', { name: 'Xem banner 2', exact: true }).click();
    await noSwiperStyles.waitForFunction(() => document.querySelector('.hero-section__slider').swiper.activeIndex === 1);
    assert.equal(await noSwiperStyles.locator('.swiper-wrapper').evaluateAll((wrappers) => wrappers.every((wrapper) => getComputedStyle(wrapper).display === 'flex')), true);
    assert.equal(await noSwiperStyles.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await noSwiperStyles.close();

    const noProductData = await browser.newPage();
    await noProductData.route('**/assets/js/data.js', (route) => route.abort());
    await noProductData.goto(url, { waitUntil: 'networkidle' });
    assert.equal(await noProductData.locator('.product-card').count(), 0);
    assert.equal(await noProductData.locator('#products-status').isVisible(), true);
    assert.equal(await noProductData.locator('.products__view-all').getAttribute('href'), 'https://maneko.vn/tat-ca-san-pham');
    await noProductData.getByRole('button', { name: 'Mở tìm kiếm', exact: true }).click();
    assert.equal(await noProductData.locator('#search-dialog').evaluate((dialog) => dialog.open), true, 'Other interactions work when product data is missing');
    await noProductData.close();

    // Verify keyboard activation reaches the intended external URL without depending on the remote page UI.
    const firstProduct = page.locator('.product-card').first();
    await firstProduct.focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.product-card__link').first().evaluate((link) => link === document.activeElement), true);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.product-card__action')).opacity === '1');
    const destination = referenceProducts[0].url;
    await page.route(destination, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><html><head><title>Product destination</title></head><body>Product destination</body></html>' }));
    await page.keyboard.press('Enter');
    await page.waitForURL(destination);

    assert.deepEqual(pageErrors, [], 'No browser JavaScript errors');
    assert.deepEqual(networkErrors, [], 'No failed HTTP assets');
    console.log('PASS: 8 responsive widths, product grids, reviews/news carousels and arrows, contact/footer links and grids, product search/hover/keyboard navigation, missing-data fallback, H1, touch swipe, drawer, pagination, reduced motion, JS/CSS CDN fallback.');
    console.log(`Screenshots: ${output}`);
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
