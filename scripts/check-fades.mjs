// Scroll edges fade, never cut off: the rail list and a library scroller carry the theme's fade-y. At rest the first
// row is whole (no top fade) with a 24px fade at the bottom; scrolled 200px both edges fade 24px; at the end the bottom
// fade is gone. Run from check-docs.mjs against a production docs server.
import assert from 'node:assert/strict';

const frames = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const fadeOf = locator => locator.evaluate(element => {
  const style = getComputedStyle(element);
  return { mask: style.maskImage || style.webkitMaskImage, start: style.getPropertyValue('--fade-start').trim(), end: style.getPropertyValue('--fade-end').trim(), more: element.scrollHeight - element.clientHeight };
});

async function checkScroller(page, locator, name) {
  await locator.evaluate(element => { element.scrollTop = 0; });
  await frames(page);
  const rest = await fadeOf(locator);
  assert.ok(rest.more > 224, `${name}: has more than 224px to scroll (${rest.more})`);
  assert.match(rest.mask, /linear-gradient/, `${name}: has the fade mask`);
  assert.equal(rest.start, '0px', `${name}: the first row is whole at rest`);
  assert.equal(rest.end, '24px', `${name}: the bottom fades at rest`);
  await locator.evaluate(element => { element.scrollTop = 200; });
  await frames(page);
  const scrolled = await fadeOf(locator);
  assert.deepEqual([scrolled.start, scrolled.end], ['24px', '24px'], `${name}: both edges fade when scrolled`);
  await locator.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await frames(page);
  const end = await fadeOf(locator);
  assert.deepEqual([end.start, end.end], ['24px', '0px'], `${name}: no bottom fade at the end`);
  await locator.evaluate(element => { element.scrollTop = 0; });
}

export async function checkFades(page, base) {
  const rail = page.locator('nav[aria-label="Library"] > div:has(a[data-item])');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width > 600 ? 1000 : 844 });
    await page.goto(`${base}/components/button`);
    await page.evaluate(() => document.fonts.ready);
    if (width < 1024) await page.getByRole('button', { name: 'Open the library' }).click();
    await checkScroller(page, rail, `rail at ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/preview/scroll-area/Site`);
  await checkScroller(page, page.locator('[data-slot="scroll-area-viewport"]'), 'scroll area');
  await page.goto(`${base}/preview/command/Site`);
  const list = page.locator('[data-slot="command-list"]').first();
  if ((await list.evaluate(element => element.scrollHeight - element.clientHeight)) > 224) await checkScroller(page, list, 'command list');
  console.log('PASS: the rail and library scrollers fade at an edge with more past it, tied to the scroll.');
}
