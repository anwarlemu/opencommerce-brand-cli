// Run against a production docs server: DOCS_URL=http://localhost:3000 npm run test:docs
// Requires the optional playwright-core dependency and its Chromium browser.
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { checkOverlays } from './check-overlays.mjs';
import { checkInteractions } from './check-interactions.mjs';

const base = process.env.DOCS_URL ?? 'http://localhost:4645';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) console.log(`HTTP ${response.status()}: ${response.url()}`); });
const nav = page.getByRole('navigation', { name: 'Library', exact: true });
// The rail and the page head must not move between routes: the rail is shared and keeps its scroll and filter.
const measure = () => page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Library"]');
  const list = nav.children[2];
  const main = document.querySelector('main');
  const head = main.querySelector('header');
  return { railScroll: list.scrollTop, railX: nav.getBoundingClientRect().x, railWidth: nav.getBoundingClientRect().width, mainX: main.getBoundingClientRect().x, headY: head.getBoundingClientRect().y };
});

try {
  await page.goto(`${base}/components/button`);
  await page.getByRole('heading', { name: 'Button', exact: true, level: 1 }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  assert.equal(await nav.evaluate(n => n.getBoundingClientRect().width), 288, 'the rail is 288px');
  const items = await nav.locator('a[data-item]').evaluateAll(links => links.map(link => ({ name: link.dataset.item, title: link.textContent.trim() })));
  assert.ok(items.length >= 60, `every item is listed (${items.length})`);
  const timings = [];
  for (const item of items) {
    const link = nav.locator(`a[data-item="${item.name}"]`);
    await link.scrollIntoViewIfNeeded();
    const before = await measure();
    const started = performance.now();
    await link.click();
    await page.waitForURL(`**/components/${item.name}`);
    await page.getByRole('heading', { name: item.title, exact: true, level: 1 }).waitFor();
    timings.push(performance.now() - started);
    await page.waitForTimeout(150);
    const after = await measure();
    for (const key of Object.keys(before)) assert.ok(Math.abs(before[key] - after[key]) < 1, `${item.name}: ${key} moved from ${before[key]} to ${after[key]}`);
    assert.equal(await nav.locator(`a[data-item="${item.name}"]`).getAttribute('aria-current'), 'page', `${item.name} is marked current`);
    if (timings.length % 16 === 0) console.log(`Checked ${timings.length}/${items.length} routes.`);
  }
  console.log(`PASS: stable rail and page head across ${items.length} component routes.`);
  timings.sort((a, b) => a - b);
  console.log(`Local production navigation: median ${Math.round(timings[Math.floor(timings.length / 2)])}ms, p95 ${Math.round(timings[Math.floor(timings.length * 0.95)])}ms (includes automation overhead).`);

  for (const route of ['/', '/components', '/theme']) {
    await page.goto(`${base}${route}`);
    // Thumbnails draw examples inert and hidden from assistive tech; only the page's own h1 counts.
    assert.equal(await page.locator('main h1:not([aria-hidden] h1)').count(), 1, `${route}: one h1`);
    assert.equal(await nav.locator(`a[href="${route}"][aria-current]`).getAttribute('aria-current'), 'page', `${route} is marked current`);
  }
  console.log('PASS: the home, index and theme pages sit in the same shell.');

  await page.goto(`${base}/components/button`);
  await nav.getByRole('searchbox').fill('card');
  await nav.locator('a[data-item="card"]').click();
  await page.waitForURL('**/components/card');
  assert.equal(await nav.getByRole('searchbox').inputValue(), 'card');
  await nav.getByRole('searchbox').fill('zzz');
  await nav.getByText('Nothing matches.').waitFor();
  console.log('PASS: the rail filter narrows the list and is kept after navigation.');

  await page.goto(`${base}/components/faq`);
  const iframe = page.locator('iframe').first();
  await page.waitForFunction(() => { const frame = document.querySelector('iframe'); return frame && frame.style.height !== '900px'; });
  assert.equal(await iframe.getAttribute('sandbox'), 'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox');
  const desktopHeight = await iframe.evaluate(frame => Number.parseFloat(frame.style.height));
  await page.getByRole('radio', { name: 'Phone', exact: true }).first().click();
  await page.waitForFunction(previous => { const frame = document.querySelector('iframe'); return frame?.style.width === '390px' && Number.parseFloat(frame.style.height) !== previous; }, desktopHeight);
  const frame = await iframe.contentFrame();
  // The first question opens its answer, whatever the example's copy.
  const question = frame.locator('summary, [aria-expanded]').first();
  await question.click();
  await frame.locator('details[open], [aria-expanded="true"]').first().waitFor();
  assert.equal(await frame.locator('html').evaluate(async () => { await document.fonts.ready; return [...document.fonts].every(font => font.status === 'loaded' || font.status === 'unloaded'); }), true);
  console.log('PASS: isolated previews render and resize at desktop and phone widths.');

  await page.goto(`${base}/components/button`);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copied = text; } } }));
  await page.locator('#example').getByRole('button', { name: 'Copy', exact: true }).click();
  await page.locator('#example').getByRole('button', { name: 'Copied', exact: true }).waitFor();
  assert.ok((await page.evaluate(() => window.__copied)).includes('Button'));
  await page.getByRole('button', { name: 'Copy command', exact: true }).first().click();
  assert.match(await page.evaluate(() => window.__copied), /add button/);
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Clipboard permission denied'); }; });
  await page.locator('#source').getByRole('button', { name: 'Copy', exact: true }).first().click();
  console.log('PASS: code and command copy handle success and denied clipboard access.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/components/button`);
  await page.getByRole('button', { name: 'Open the library' }).click();
  await nav.getByRole('searchbox').fill('checkbox');
  await nav.locator('a[data-item="checkbox"]').click();
  await page.waitForURL('**/components/checkbox');
  assert.equal(await page.getByRole('button', { name: 'Open the library' }).getAttribute('aria-expanded'), 'false');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  console.log('PASS: the mobile rail closes after choosing an item, without horizontal overflow.');
  await checkOverlays(page, base);
  await checkInteractions(page, base);
  assert.deepEqual(errors, [], 'Browser errors');
  console.log('PASS: no browser runtime or resource errors.');
} finally {
  await browser.close();
}
