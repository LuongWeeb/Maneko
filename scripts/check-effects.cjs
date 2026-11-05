const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');
const { createServer } = require('./serve.cjs');

(async () => {
  const executablePath = [process.env.BROWSER_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/chromium', '/usr/bin/google-chrome'].filter(Boolean).find(fs.existsSync);
  assert.ok(executablePath, 'Install Chrome/Edge or set BROWSER_PATH.');
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    const url = `http://127.0.0.1:${server.address().port}`;
    const output = path.resolve(__dirname, '../artifacts/effects-3d');
    fs.mkdirSync(output, { recursive: true });
    const errors = [];
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const cards = page.locator('.product-card, .category-card');
    assert.equal(await cards.count(), 10);
    assert.ok(await cards.evaluateAll(elements => elements.every(element => Boolean(element.vanillaTilt))));
    assert.equal(await page.locator('.js-tilt-glare').count(), 10);

    const product = page.locator('.product-card').first();
    await product.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.product-card__image').complete);
    assert.ok(await product.locator('.product-card__media').evaluate(element => Math.abs(element.offsetWidth - element.offsetHeight) <= 1), '3D layers retain the square image frame');
    const box = await product.boundingBox();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.25);
    await page.waitForTimeout(450);
    const tilted = await product.evaluate(element => {
      const style = getComputedStyle(element);
      const transform = new DOMMatrix(style.transform);
      const image = new DOMMatrix(getComputedStyle(element.querySelector('.product-card__image')).transform);
      const glare = getComputedStyle(element.querySelector('.js-tilt-glare-inner'));
      return {
        tilted: Math.abs(transform.m13) > 0.01 || Math.abs(transform.m23) > 0.01,
        depth: image.m43, scale: image.m11,
        glare: Number(glare.opacity),
        preserved: [element, element.querySelector('.product-card__link'), element.querySelector('.product-card__media')].every(node => getComputedStyle(node).transformStyle === 'preserve-3d'),
        shimmer: getComputedStyle(element, '::before').animationName,
        shimmerDuration: getComputedStyle(element, '::before').animationDuration,
        hit: element.contains(document.elementFromPoint(element.getBoundingClientRect().x + element.offsetWidth / 2, element.getBoundingClientRect().y + 80)),
      };
    });
    assert.ok(tilted.tilted && tilted.preserved && tilted.hit);
    assert.equal(tilted.depth, 28);
    assert.ok(Math.abs(tilted.scale - 1.05) < 0.001);
    assert.ok(tilted.glare > 0 && tilted.glare <= 0.25);
    assert.equal(tilted.shimmer, 'product-shimmer');
    assert.equal(tilted.shimmerDuration, '0.6s');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(output, 'product-tilt.png') });
    await page.mouse.move(0, 0);
    await page.waitForTimeout(450);
    assert.ok(await product.evaluate(element => {
      const matrix = new DOMMatrix(getComputedStyle(element).transform);
      return Math.abs(matrix.m13) < 0.001 && Math.abs(matrix.m23) < 0.001;
    }));

    const category = page.locator('.category-card').first();
    await category.scrollIntoViewIfNeeded();
    await category.hover({ position: { x: 50, y: 80 } });
    await page.waitForTimeout(450);
    assert.ok(await category.evaluate(element => Math.abs(new DOMMatrix(getComputedStyle(element).transform).m13) > 0.01));
    await page.screenshot({ path: path.join(output, 'category-tilt.png') });

    const button = page.locator('.products__view-all');
    await button.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(250);
    const bounds = await button.boundingBox();
    await page.mouse.move(bounds.x + bounds.width + 10, bounds.y + bounds.height / 2);
    await page.waitForTimeout(250);
    const offset = await button.evaluate(element => getComputedStyle(element).translate.split(' ').map(parseFloat));
    assert.ok(offset[0] > 0, 'Magnet responds within 20px outside the button');
    assert.ok(Math.hypot(...offset) <= 20.01, 'Movement stays within a 20px radius');
    await page.mouse.move(0, 0);
    await page.waitForTimeout(250);
    assert.ok(await button.evaluate(element => getComputedStyle(element).translate.split(' ').every(value => parseFloat(value) === 0)));
    await button.focus();
    await page.keyboard.press('Tab');
    assert.ok(await button.evaluate(element => !element.style.getPropertyValue('--magnetic-x')));

    for (let iteration = 0; iteration < 3; iteration++) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => !document.querySelector('.product-card').vanillaTilt);
      assert.equal(await page.locator('.js-tilt-glare').count(), 0);
      assert.equal(await page.locator('.button--magnetic').count(), 0);
      await product.hover();
      assert.equal(await product.locator('img').evaluate(image => getComputedStyle(image).transform), 'none');
      assert.equal(await product.evaluate(element => getComputedStyle(element, '::before').animationName), 'none');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => Boolean(document.querySelector('.product-card').vanillaTilt));
      assert.equal(await page.locator('.js-tilt-glare').count(), 10, 'Re-enabling must not duplicate glare layers');
    }
    await page.mouse.move(0, 0);

    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
    const mobile = await mobileContext.newPage();
    mobile.on('pageerror', error => errors.push(error.message));
    await mobile.goto(url, { waitUntil: 'networkidle' });
    assert.ok(await mobile.locator('.product-card, .category-card').evaluateAll(elements => elements.every(element => !element.vanillaTilt)));
    assert.equal(await mobile.locator('.js-tilt-glare, .button--magnetic').count(), 0);
    await mobile.locator('.button--add-cart').first().tap();
    assert.equal(await mobile.locator('[data-cart-count]').textContent(), '1');
    assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await mobileContext.close();

    const fallback = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    fallback.on('pageerror', error => errors.push(error.message));
    await fallback.route('**/vanilla-tilt/**', route => route.abort());
    await fallback.goto(url, { waitUntil: 'networkidle' });
    assert.equal(await fallback.locator('.js-tilt-glare').count(), 0);
    await fallback.locator('.button--add-cart').first().click();
    assert.equal(await fallback.locator('[data-cart-count]').textContent(), '1');
    await fallback.locator('[data-open-search]').click();
    assert.ok(await fallback.locator('#search-dialog').evaluate(dialog => dialog.open));
    assert.deepEqual(errors, [], 'No browser errors, including repeated tilt teardown');
    console.log('PASS: product/category tilt, layered image, glare, shimmer, magnetic proximity/reset, reduced-motion changes, touch shopping and missing-CDN fallback.');
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
