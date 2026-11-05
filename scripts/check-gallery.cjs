const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright-core');
const { createServer } = require('./serve.cjs');

(async () => {
  const executablePath = [process.env.BROWSER_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/chromium', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean).find(p => fs.existsSync(p));
  assert.ok(executablePath, 'Install Chrome/Edge or set BROWSER_PATH.');
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const output = path.resolve(__dirname, '../artifacts/day5-5');
  fs.mkdirSync(output, { recursive: true });
  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    const questions = page.locator('.qa__question');
    assert.equal(await questions.count(), 4);
    assert.equal(await page.locator('.qa__answer:visible').count(), 1);
    assert.ok(await page.locator('#qa-answer-1').isVisible());
    assert.equal(await page.locator('a[href="#qa"]').count(), 3);
    await page.locator('.header__nav a[href="#qa"]').click();
    assert.ok(page.url().endsWith('#qa'));
    assert.equal(await page.locator('#qa').evaluate(e => e === document.activeElement), true);
    await questions.nth(1).click();
    await page.waitForFunction(() => !jQuery('.qa__answer').is(':animated'));
    assert.equal(await page.locator('.qa__answer:visible').count(), 1);
    assert.ok(await page.locator('#qa-answer-2').isVisible());
    assert.equal(await page.locator('#qa-answer-1').evaluate(e => e.inert), true);
    await questions.nth(1).click();
    await page.waitForFunction(() => !jQuery('.qa__answer').is(':animated'));
    assert.equal(await page.locator('.qa__answer:visible').count(), 0);
    await questions.first().focus();
    await page.keyboard.press('End');
    assert.equal(await questions.last().evaluate(e => e === document.activeElement), true);
    await page.keyboard.press('Space');
    await page.waitForFunction(() => !jQuery('.qa__answer').is(':animated'));
    assert.ok(await page.locator('#qa-answer-4').isVisible());
    await page.evaluate(() => { for (const index of [0, 2, 2, 1, 3, 0]) document.querySelectorAll('.qa__question')[index].click(); });
    await page.waitForFunction(() => !jQuery('.qa__answer').is(':animated'));
    assert.equal(await page.locator('.qa__answer:visible').count(), 1);
    assert.ok(await page.locator('#qa-answer-1').isVisible());
    assert.deepEqual(await questions.evaluateAll(buttons => buttons.map(b => b.getAttribute('aria-expanded'))), ['true', 'false', 'false', 'false']);
    await page.locator('#qa').screenshot({ path: path.join(output, 'qa-desktop.png') });
    console.log('PASS accordion: default state, single-open, collapse, rapid clicks, keyboard and accessible state.');

    const articleLinks = await page.locator('.news-card__link').evaluateAll(links => links.map(a => a.href));
    assert.equal(articleLinks.length, 4);
    assert.ok(articleLinks.every(href => href.startsWith('https://maneko.vn/blog/')));
    const waitImage = async index => {
      await page.waitForFunction(index => lightbox.currentImageIndex === index && !document.querySelector('.lb-outerContainer').classList.contains('animating') && document.querySelector('.lb-image').complete, index);
      await page.locator('.lb-image').waitFor();
      await page.waitForFunction(() => !jQuery('#lightbox, #lightbox *, #lightboxOverlay').is(':animated'));
    };
    const news = page.locator('[data-lightbox="news-gallery"]');
    await news.first().focus();
    await page.keyboard.press('Enter');
    await waitImage(0);
    assert.equal(await page.locator('#lightbox').getAttribute('role'), 'dialog');
    assert.equal(await page.locator('main').evaluate(e => e.inert), true);
    assert.ok(await page.locator('body').evaluate(e => e.classList.contains('lb-disable-scrolling')));
    assert.equal(await page.evaluate(() => lightbox.album.length), 4);
    for (let index = 0; index < 4; index++) {
      if (index) { await page.keyboard.press('ArrowRight'); await waitImage(index); }
      assert.equal(await page.locator('.lb-caption').textContent(), await news.nth(index).getAttribute('data-title'));
      assert.equal(await page.locator('.lb-image').getAttribute('alt'), await news.nth(index).getAttribute('data-alt'));
      assert.ok((await page.locator('.lb-number').textContent()).includes(`Ảnh ${index + 1} / 4`));
    }
    await page.keyboard.press('ArrowRight');
    await waitImage(0);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      assert.ok(await page.locator('#lightbox').evaluate(e => e.contains(document.activeElement)));
    }
    await page.screenshot({ path: path.join(output, 'gallery-desktop.png') });
    await page.keyboard.press('Escape');
    await page.locator('#lightbox').waitFor({ state: 'hidden' });
    await page.waitForFunction(() => document.activeElement === document.querySelector('[data-lightbox="news-gallery"]'));
    assert.equal(await page.locator('main').evaluate(e => e.inert), false);
    assert.deepEqual(await page.locator('.news-card__link').evaluateAll(links => links.map(a => a.href)), articleLinks);

    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 812 });
      await page.locator('#qa').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}`);
      if (width === 375) await page.locator('#qa').screenshot({ path: path.join(output, 'qa-mobile.png') });
      await page.locator('[data-lightbox="about-gallery"]').click();
      await waitImage(0);
      assert.equal(await page.evaluate(() => lightbox.album.length), 1);
      assert.ok(await page.locator('.lb-outerContainer').evaluate(e => e.getBoundingClientRect().right <= innerWidth), `Image overflow at ${width}`);
      if (width === 375) await page.screenshot({ path: path.join(output, 'gallery-mobile.png') });
      await page.locator('.lb-close').click();
      await page.locator('#lightbox').waitFor({ state: 'hidden' });
    }
    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator('.header__menu-toggle').click();
    await page.locator('.header__mobile-links a[href="#qa"]').click();
    assert.ok(page.url().endsWith('#qa'));
    assert.equal(await page.locator('#mobile-menu').evaluate(e => e.open), false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await questions.nth(2).click();
    assert.equal(await page.evaluate(() => jQuery('.qa__answer').is(':animated')), false);
    assert.equal(await page.evaluate(() => lightbox.options.fadeDuration), 0);
    assert.deepEqual(errors, []);
    console.log('PASS galleries: all images/captions, separate article links, keyboard cycling, focus trap/return, mobile navigation, responsive layout and reduced motion.');

    const noJs = await browser.newPage({ javaScriptEnabled: false });
    await noJs.goto(url, { waitUntil: 'load' });
    assert.equal(await noJs.locator('.qa__answer:visible').count(), 4);
    await noJs.locator('[data-lightbox="about-gallery"]').click();
    await noJs.waitForURL('**/assets/images/about-maneko.jpg');
    await noJs.close();
    const noLightbox = await browser.newPage();
    await noLightbox.route('**/lightbox.min.js', route => route.abort());
    await noLightbox.goto(url, { waitUntil: 'networkidle' });
    await noLightbox.locator('.qa__question').nth(1).click();
    assert.equal(await noLightbox.locator('.qa__question').nth(1).getAttribute('aria-expanded'), 'true');
    await noLightbox.locator('[data-lightbox="about-gallery"]').click();
    await noLightbox.waitForURL('**/assets/images/about-maneko.jpg');
    await noLightbox.close();
    console.log('PASS no-JavaScript and missing-Lightbox fallbacks.');
    console.log(`Screenshots: ${output}`);
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
