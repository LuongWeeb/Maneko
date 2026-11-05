const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');
const { createServer } = require('./serve.cjs');

(async () => {
  const executablePath = [process.env.BROWSER_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/chromium', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean).find(p => fs.existsSync(p));
  assert.ok(executablePath, 'Install Chrome/Edge or set BROWSER_PATH.');
  const output = path.resolve(__dirname, '../artifacts/day5-3');
  fs.mkdirSync(output, { recursive: true });
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.product-card__buttons .button--add-cart').count(), 8);
    assert.equal(await page.locator('.product-card__buttons .button--quick-view').count(), 8);
    assert.equal(await page.locator('.product-card__link button').count(), 0);
    await page.locator('[data-open-cart]').click();
    assert.equal(await page.locator('.product-popup__cart li').count(), 0);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !Swal.isVisible());
    const first = page.locator('.button--add-cart').first();
    await first.click();
    await page.waitForFunction(() => document.querySelector('[data-cart-count]').textContent === '1');
    await page.locator('.toast-success').last().waitFor();
    assert.ok((await page.locator('.toast-success').last().textContent()).includes(await page.locator('.product-card__title').first().textContent()));
    await first.click();
    await page.waitForFunction(() => document.querySelector('[data-cart-count]').textContent === '2');
    await page.locator('.product-card__buttons .button--quick-view').last().click();
    await page.locator('.swal2-popup').waitFor();
    assert.equal(await page.locator('.swal2-title').textContent(), await page.locator('.product-card__title').last().textContent());
    assert.equal(await page.locator('.product-popup__price').textContent(), await page.locator('.product-card__price').last().textContent());
    assert.equal(await page.locator('.product-popup__order').getAttribute('href'), await page.locator('.product-card__link').last().getAttribute('href'));
    await page.waitForFunction(() => document.querySelector('.swal2-image').naturalWidth > 0);
    await page.waitForFunction(() => getComputedStyle(Swal.getPopup()).opacity === '1');
    await page.screenshot({ path: path.join(output, 'quick-view-desktop.png'), animations: 'disabled' });
    await page.locator('.swal2-confirm').click();
    await page.waitForFunction(() => document.querySelector('[data-cart-count]').textContent === '3');
    await page.locator('[data-open-cart]').click();
    assert.equal(await page.locator('.product-popup__cart li').count(), 2);
    assert.ok((await page.locator('.product-popup__cart li').first().textContent()).includes('× 2'));
    assert.ok((await page.locator('.product-popup__price').textContent()).includes('32.000'));
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('[data-open-cart]') === document.activeElement);
    console.log('PASS product actions: repeated adds, popup price/image/link, quantity, cart total, Escape and focus return.');

    for (const selector of ['.header .button--hotline', '.contact-cta [data-clipboard-text="0399366168"]', '.contact-cta [data-clipboard-text="nhamaymaneko@gmail.com"]']) {
      await page.evaluate(() => toastr.remove());
      const trigger = page.locator(selector);
      const expected = await trigger.getAttribute('data-clipboard-text');
      await trigger.click();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected);
      await page.locator('.toast-info').last().waitFor();
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator('.header__menu-toggle').click();
    await page.locator('#mobile-menu [data-clipboard-text]').click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), '0399366168');
    await page.locator('#mobile-menu .toast-info').last().waitFor();
    await page.keyboard.press('Escape');
    await page.evaluate(() => toastr.remove());
    // An empty payload makes ClipboardJS emit its error event without copying.
    const failedCopy = page.locator('.contact-cta a[href="tel:0399366168"]');
    await failedCopy.evaluate(e => e.dataset.clipboardText = '');
    await failedCopy.click();
    await page.locator('.toast-error').last().waitFor();
    await failedCopy.evaluate(e => e.dataset.clipboardText = '0399366168');
    await page.evaluate(() => toastr.remove());
    console.log('PASS clipboard: actual phone/email, mobile native dialog, failure feedback, no navigation.');

    const form = page.locator('#agency-form');
    const submit = form.locator('[type="submit"]');
    const name = page.locator('#agency-name');
    const phone = page.locator('#agency-phone');
    const email = page.locator('#agency-email');
    const cityControl = form.locator('[role="combobox"]');
    const formRequests = [];
    page.on('request', request => {
      if (request.method() === 'POST' || (request.isNavigationRequest() && request.frame() === page.mainFrame())) formRequests.push(request.url());
    });
    const originalUrl = page.url();
    await submit.click();
    assert.equal(await form.locator('.is-invalid').count(), 3);
    assert.equal(await name.evaluate(e => e === document.activeElement), true);
    assert.equal(await cityControl.getAttribute('aria-invalid'), 'true');
    assert.ok(await page.locator('#agency-city-error').isVisible(), 'Hidden Select2 source is validated');
    await name.fill(' ');
    await submit.click();
    assert.ok(await page.locator('#agency-name-error').isVisible());
    await name.fill('A');
    await submit.click();
    assert.ok((await page.locator('#agency-name-error').textContent()).includes('2'));
    await name.fill('Nguyễn Văn An');
    await phone.fill('0399366168');
    await email.fill('not-an-email');
    await submit.click();
    assert.ok(await page.locator('#agency-email-error').isVisible());
    await email.fill('');
    await submit.click();
    assert.equal(await cityControl.evaluate(e => e === document.activeElement), true, 'Focus visible Select2 when only city is invalid');
    await cityControl.click();
    const citySearch = page.locator('.select2-container--open .select2-search__field');
    await citySearch.fill('khong-co-khu-vuc');
    assert.ok((await page.locator('.select2-results__message').textContent()).includes('Không tìm thấy'));
    await citySearch.fill('ha noi');
    await page.locator('.select2-results__option--selectable').filter({ hasText: 'Hà Nội' }).click();
    assert.equal(await page.locator('#agency-city').inputValue(), 'ha-noi');
    assert.equal(await cityControl.getAttribute('aria-invalid'), 'false');
    for (const invalid of ['0123456789', '039936616', '03993661680', 'abc0399366168', '0|99366168', '+84399366168']) {
      await phone.fill(invalid);
      await submit.click();
      assert.ok(await page.locator('#agency-phone-error').isVisible(), `Reject ${invalid}`);
      assert.equal(await page.locator('.swal2-popup').count(), 0);
    }
    for (const valid of ['0399366168', '0599366168', '0799366168', '0899366168', '0999366168']) {
      await phone.fill(valid);
      assert.ok(await phone.evaluate(e => window.jQuery(e).valid()), `Accept ${valid}`);
    }
    await phone.fill(' 0399366168 ');
    await page.locator('#agency-message').fill('Tôi muốn tìm hiểu về đại lý.');
    await submit.click();
    await page.locator('.swal2-popup').waitFor();
    assert.ok((await page.locator('.swal2-title').textContent()).includes('Bản dùng thử'));
    assert.ok((await page.locator('.swal2-html-container').textContent()).includes('chưa được gửi'));
    await page.waitForFunction(() => getComputedStyle(Swal.getPopup()).opacity === '1');
    await page.screenshot({ path: path.join(output, 'agency-success-mobile.png') });
    await page.locator('.swal2-confirm').click();
    await page.waitForFunction(() => document.querySelector('#agency-name').value === '');
    assert.equal(await phone.inputValue(), '');
    assert.equal(await page.locator('#agency-message').inputValue(), '');
    assert.equal(await page.locator('#agency-city').inputValue(), '');
    assert.equal(await form.locator('.is-invalid').count(), 0);
    assert.equal(await form.locator('.agency-form__error:visible').count(), 0);
    assert.ok((await cityControl.textContent()).includes('Chọn tỉnh/thành phố'));
    assert.deepEqual(formRequests, [], 'Demo never transmits form data or navigates');
    assert.equal(page.url(), originalUrl);
    await name.fill('Nguyễn Văn An');
    await phone.fill('0399366168');
    await email.fill('an@example.com');
    await submit.click();
    assert.ok(await page.locator('#agency-city-error').isVisible(), 'City remains required after reset');
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await form.scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Form overflow at ${width}`);
      await cityControl.click();
      assert.ok(await page.locator('.select2-dropdown').evaluate(e => e.getBoundingClientRect().right <= innerWidth), `Dropdown overflow at ${width}`);
      await page.keyboard.press('Escape');
      if ([375, 1440].includes(width)) await form.screenshot({ path: path.join(output, `agency-form-${width}.png`) });
    }
    console.log('PASS agency form: Vietnamese validation, strict mobile numbers, optional email, searchable Select2, accessible error focus, demo submit without requests, clean reset and responsive layout.');

    for (const width of [320, 375, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator('#san-pham-noi-bat').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}`);
      assert.ok(await page.locator('.product-card__buttons .button').evaluateAll(buttons => buttons.every(b => b.scrollWidth <= b.clientWidth + 1)), `Button overflow at ${width}`);
      await page.locator('.product-card__buttons .button--quick-view').first().click();
      await page.locator('.swal2-popup').waitFor();
      await page.waitForFunction(() => getComputedStyle(Swal.getPopup()).opacity === '1');
      assert.ok(await page.locator('.swal2-popup').evaluate(e => e.getBoundingClientRect().width <= innerWidth && e.scrollWidth <= e.clientWidth + 1), `Modal overflow at ${width}`);
      if (width === 375) await page.screenshot({ path: path.join(output, 'quick-view-mobile.png') });
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !Swal.isVisible());
      if ([375, 430, 1440].includes(width)) await page.locator('#san-pham-noi-bat').screenshot({ path: path.join(output, `products-${width}.png`) });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await first.click();
    assert.equal(await page.locator('[data-cart-count]').evaluate(e => e.classList.contains('animate__rubberBand')), false);
    assert.deepEqual(errors, []);
    console.log('PASS six responsive widths, modal overflow, reduced motion, no JavaScript errors.');
    console.log(`Screenshots: ${output}`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
