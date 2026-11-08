const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const message = 'Duke paraqitur kete Chips qe ke ne dore, mund te marash pjese ne turneun 5M';
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:8767/promo');
    assert.equal(await page.locator('.card').count(), 2);
    assert.equal(await page.locator('#promo-result').isVisible(), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    for (const choice of ['raise', 'all-in', 'raise']) {
      await page.locator(`[data-choice="${choice}"]`).click();
      assert.equal(await page.locator('#promo-result').isVisible(), true);
      assert.equal(await page.locator('#promo-result p').textContent(), message);
      assert.equal(await page.locator('#promo-result').evaluate(el => el === document.activeElement), true);
    }
    await page.reload();
    assert.equal(await page.locator('#promo-result').isVisible(), false);
    await page.locator('[data-choice="all-in"]').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#promo-result').isVisible(), true);
    await page.screenshot({path: `/tmp/poker-promo-${width}.png`, fullPage:true});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:8767/promo/');
  await page.locator('[data-choice="raise"]').focus();
  await page.keyboard.press('Space');
  assert.equal(await page.locator('#promo-result').isVisible(), true);
  const noJs = await browser.newPage({javaScriptEnabled:false});
  await noJs.goto('http://127.0.0.1:8767/promo/');
  assert.equal(await noJs.locator('.noscript').textContent(), message);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('PASS: both choices, repeated clicks, keyboard, reload reset, no-JS fallback, 320/390/768/1440px, no overflow or page/resource errors');
})().catch(error => { console.error(error); process.exitCode = 1; });
