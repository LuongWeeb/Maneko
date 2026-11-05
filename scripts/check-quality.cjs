const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium, request } = require('playwright-core');
const { createServer } = require('./serve.cjs');

(async () => {
  const root = path.resolve(__dirname, '..');
  const output = path.join(root, 'artifacts/phase-6');
  fs.mkdirSync(output, { recursive: true });
  const html = fs.readFileSync(path.join(root, 'index.html'));
  const api = await request.newContext();
  try {
    const response = await api.post('https://validator.w3.org/nu/?out=json', {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }, data: html, timeout: 45000,
    });
    assert.ok(response.ok(), `Nu Validator HTTP ${response.status()}`);
    const result = await response.json();
    fs.writeFileSync(path.join(output, 'nu-final.json'), JSON.stringify({
      ...result, sourceSha256: crypto.createHash('sha256').update(html).digest('hex'),
    }, null, 2));
    const errors = result.messages.filter(message => message.type === 'error');
    assert.deepEqual(errors, [], 'Nu Validator must report zero HTML errors');
    console.log(`PASS Nu Validator: ${errors.length} errors, ${result.messages.length} messages.`);
  } finally {
    await api.dispose();
  }

  const executablePath = [process.env.BROWSER_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/chromium', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean).find(p => fs.existsSync(p));
  assert.ok(executablePath, 'Install Chrome/Edge or set BROWSER_PATH.');
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
    const errors = [];
    const failedResources = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('requestfailed', request => failedResources.push({ url: request.url(), error: request.failure()?.errorText }));
    page.on('response', response => { if (response.status() >= 400) failedResources.push({ url: response.url(), status: response.status() }); });
    const url = `http://127.0.0.1:${server.address().port}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const semantics = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
      const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e => ({ level: Number(e.tagName[1]), text: e.textContent.trim() }));
      return {
        h1: document.querySelectorAll('h1').length,
        landmarks: ['header', 'nav', 'main', 'section', 'article', 'footer'].filter(tag => document.querySelector(tag)),
        duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
        missingAlt: document.querySelectorAll('img:not([alt])').length,
        unlabeledInputs: [...document.querySelectorAll('input,select,textarea')].filter(e => !e.labels?.length && !e.getAttribute('aria-label')).map(e => e.id),
        headingSkips: headings.filter((heading, index) => index && heading.level > headings[index-1].level + 1),
        fontLoaded: [...document.fonts].some(face => face.family.includes('Plus Jakarta Sans') && face.status === 'loaded'),
        brokenText: document.body.textContent.includes('\ufffd'),
        missingAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => a.hash && !document.getElementById(a.hash.slice(1))).map(a => a.hash),
      };
    });
    assert.equal(semantics.h1, 1);
    assert.equal(semantics.landmarks.length, 6);
    for (const key of ['duplicateIds', 'unlabeledInputs', 'headingSkips', 'missingAnchors']) assert.deepEqual(semantics[key], [], key);
    assert.equal(semantics.missingAlt, 0);
    assert.ok(semantics.fontLoaded);
    assert.equal(semantics.brokenText, false);
    for (const section of await page.locator('main > section, footer').all()) await section.scrollIntoViewIfNeeded();
    // Validate offscreen lazy assets too; this is not a page-load timing measurement.
    await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach(image => { image.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
    const viewports = [];
    for (const width of [375, 430, 768, 1366, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForFunction(() => document.querySelector('.hero-section__banner').complete);
      const measurement = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        heroSource: document.querySelector('.hero-section__banner').currentSrc.split('/').pop(),
        heroLoaded: document.querySelector('.hero-section__banner').naturalWidth > 0,
        font: getComputedStyle(document.body).fontFamily,
      }));
      assert.ok(measurement.scrollWidth <= width, `Overflow at ${width}`);
      assert.ok(measurement.heroSource.endsWith('.webp'));
      assert.ok(measurement.heroLoaded);
      viewports.push(measurement);
      await page.screenshot({ path: path.join(output, `home-${width}.png`), fullPage: true });
    }
    const webp = await page.request.get(`${url}/assets/images/products-background.webp`);
    assert.equal(webp.headers()['content-type'], 'image/webp');
    const imageRequests = await page.evaluate(() => performance.getEntriesByType('resource').filter(r => /\.(webp|jpg|png)(\?|$)/.test(r.name)).map(r => r.name.split('/').pop()));
    assert.ok(imageRequests.includes('products-background.webp'));
    assert.ok(imageRequests.includes('about-maneko.webp'));
    assert.ok(imageRequests.includes('news-3.webp'));
    assert.ok(imageRequests.includes('news-4.webp'));
    assert.deepEqual(errors, [], 'No browser console/runtime errors');
    assert.deepEqual(failedResources, [], 'No failed resources');
    const optimized = JSON.parse(fs.readFileSync(path.join(root, 'assets/images/OPTIMIZED.json'), 'utf8'));
    const images = { sourceBytes: optimized.reduce((sum, image) => sum + image.sourceBytes, 0), optimizedBytes: optimized.reduce((sum, image) => sum + image.bytes, 0), count: optimized.length };
    fs.writeFileSync(path.join(output, 'quality.json'), JSON.stringify({ browser: browser.version(), semantics, viewports, imageRequests, images, errors, failedResources }, null, 2));
    console.log('PASS quality: semantics, Vietnamese font, five required widths, actual WebP requests and MIME type, no console/network errors.');
    console.log(`Report: ${output}`);
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
