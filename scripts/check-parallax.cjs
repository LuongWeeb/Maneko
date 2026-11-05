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
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector('#hero').classList.contains('is-parallax-active'));
    assert.ok(await page.locator('.floating-snack').evaluateAll(elements => elements.every(element => element.closest('[aria-hidden="true"]') && getComputedStyle(element).pointerEvents === 'none' && element.tabIndex === -1)));
    assert.deepEqual(await page.locator('#hero > .snack-particles .floating-snack__art').evaluateAll(elements => elements.map(element => getComputedStyle(element).animationDuration).sort()), ['3.5s', '4.8s', '6s']);

    const offsets = selector => page.locator(`${selector} [data-parallax-speed]`).evaluateAll(elements => elements.map(element => ({ speed: Number(element.dataset.parallaxSpeed), y: new DOMMatrix(getComputedStyle(element).transform).m42 })));
    const scrollTo = async top => {
      await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
      await page.waitForTimeout(120);
    };
    const verifyDelta = (before, after, distance) => before.forEach((layer, index) => {
      assert.ok(Math.abs(after[index].y - layer.y - distance * layer.speed) < 0.1, `Layer ${layer.speed} should move ${distance * layer.speed}px`);
    });
    await scrollTo(0);
    const heroBefore = await offsets('#hero');
    await scrollTo(200);
    verifyDelta(heroBefore, await offsets('#hero'), 200);
    const output = path.resolve(__dirname, '../artifacts/parallax');
    fs.mkdirSync(output, { recursive: true });
    await page.screenshot({ path: path.join(output, 'hero-scroll-desktop.png') });
    await page.locator('.hero-section__slider').evaluate(element => element.swiper.slideTo(1, 0));
    await scrollTo(0);
    await page.waitForFunction(() => document.querySelector('.hero-section__selection-image').complete);
    await page.screenshot({ path: path.join(output, 'hero-layers-desktop.png') });

    const productTop = await page.locator('.products-section').evaluate(element => element.getBoundingClientRect().top + scrollY);
    await scrollTo(Math.ceil(productTop));
    await page.waitForFunction(() => document.querySelector('.products-section').classList.contains('is-parallax-active'));
    const productsBefore = await offsets('.products-section');
    await scrollTo(Math.ceil(productTop) + 100);
    verifyDelta(productsBefore, await offsets('.products-section'), 100);
    assert.ok(await page.locator('#hero .floating-snack__art').evaluateAll(elements => elements.every(element => getComputedStyle(element).animationPlayState === 'paused')), 'Offscreen scene stops floating');
    assert.ok(await page.locator('.products-section .floating-snack__art').evaluateAll(elements => elements.every(element => getComputedStyle(element).animationPlayState === 'running')));
    const coverage = await page.locator('.products__backdrop').evaluate(element => {
      const background = element.getBoundingClientRect();
      const section = element.parentElement.getBoundingClientRect();
      return background.top <= section.top && background.bottom >= section.bottom;
    });
    assert.ok(coverage, 'Moving background still covers its section');
    await page.screenshot({ path: path.join(output, 'products-scroll-desktop.png') });
    await page.locator('.button--add-cart').first().click();
    assert.equal(await page.locator('[data-cart-count]').textContent(), '1');

    for (let iteration = 0; iteration < 2; iteration++) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.querySelectorAll('.is-parallax-active').length === 0);
      assert.ok(await page.locator('[data-parallax-speed]').evaluateAll(elements => elements.every(element => getComputedStyle(element).transform === 'none' && !element.style.getPropertyValue('--parallax-y'))));
      assert.ok(await page.locator('.floating-snack__art').evaluateAll(elements => elements.every(element => getComputedStyle(element).animationName === 'none')));
      await scrollTo(Math.ceil(productTop) + iteration * 100);
      assert.ok(await page.locator('[data-parallax-speed]').evaluateAll(elements => elements.every(element => !element.style.getPropertyValue('--parallax-y'))));
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => document.querySelector('.products-section').classList.contains('is-parallax-active'));
    }

    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await scrollTo(0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (width === 375) {
        await page.screenshot({ path: path.join(output, 'hero-layers-mobile.png') });
        assert.equal(await page.locator('#hero .floating-snack--mascot').evaluate(element => getComputedStyle(element).display), 'none');
      }
    }
    await page.locator('.hero-section__slider').evaluate(element => element.swiper.slideTo(0, 0));
    await scrollTo(220);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => Math.abs(parseFloat(document.querySelector('#hero [data-parallax-speed="0.12"]').style.getPropertyValue('--parallax-y')) - scrollY * 0.12) < 0.1);
    assert.deepEqual(errors, [], 'No JS or resource errors');
    console.log('PASS: float timing, independent parallax speeds, offscreen pause, background coverage, click-through decoration, reduced-motion toggles, responsive layout and restored scroll.');
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
