// Scroll edges fade, never cut off: the rail list and a library scroller carry the theme's fade-y. At rest the first
// row is whole (no top fade) with a 24px fade at the bottom; scrolled 200px both edges fade 24px; at the end the bottom
// fade is gone. Code that scrolls both ways fades on both axes; framed scrollers (popover, the toggle tray, prose code)
// keep their drop on the frame. Run from check-docs.mjs against a production docs server.
import assert from 'node:assert/strict';

const frames = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const fadeOf = locator => locator.evaluate(element => {
  const style = getComputedStyle(element);
  const value = name => style.getPropertyValue(name).trim();
  return { mask: style.maskImage || style.webkitMaskImage, start: value('--fade-start'), end: value('--fade-end'), xStart: value('--fade-x-start'), xEnd: value('--fade-x-end'), more: element.scrollHeight - element.clientHeight, wider: element.scrollWidth - element.clientWidth };
});
const shadowOf = locator => locator.evaluate(element => getComputedStyle(element).boxShadow.split(/,(?![^(]*\))/).some(layer => !/rgba\(0, 0, 0, 0\)|^none$/.test(layer.trim())));

// A sideways scroller: no fade at the start at rest, both sides once scrolled, none at the end. fade-x drives
// --fade-start/--fade-end; fade-xy drives --fade-x-start/--fade-x-end.
async function checkSideways(page, locator, name, keys = ['start', 'end']) {
  const [a, b] = keys;
  await locator.evaluate(element => { element.scrollLeft = 0; });
  await frames(page);
  const rest = await fadeOf(locator);
  assert.ok(rest.wider > 48, `${name}: scrolls sideways (${rest.wider})`);
  assert.match(rest.mask, /linear-gradient/, `${name}: has the fade mask`);
  assert.deepEqual([rest[a], rest[b]], ['0px', '24px'], `${name}: only the far side fades at rest`);
  await locator.evaluate(element => { element.scrollLeft = 24; });
  await frames(page);
  const scrolled = await fadeOf(locator);
  assert.deepEqual([scrolled[a], scrolled[b]], ['24px', '24px'], `${name}: both sides fade when scrolled`);
  await locator.evaluate(element => { element.scrollLeft = element.scrollWidth; });
  await frames(page);
  const end = await fadeOf(locator);
  assert.deepEqual([end[a], end[b]], ['24px', '0px'], `${name}: no far fade at the end`);
  await locator.evaluate(element => { element.scrollLeft = 0; });
}

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

  // The docs code block scrolls down and sideways: both axes fade.
  await page.goto(`${base}/components/button`);
  const code = page.locator('#source pre').first();
  await checkScroller(page, code, 'docs code (down)');
  await checkSideways(page, code, 'docs code (sideways)', ['xStart', 'xEnd']);

  // Framed scrollers keep their drop on the frame while the inner box scrolls and fades.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/preview/prose/Site`);
  const prose = page.locator('[data-slot="prose-code"]').first();
  await prose.evaluate(element => { element.style.width = '100px'; });
  assert.ok(await shadowOf(prose), 'prose code keeps its drop on the wrapper');
  await checkSideways(page, prose.locator('pre'), 'prose code');
  await page.goto(`${base}/preview/toggle-group/Site`);
  const tray = page.locator('[data-slot="toggle-group-frame"]').first();
  await tray.evaluate(element => { element.style.maxWidth = '120px'; });
  assert.ok(await shadowOf(tray), 'the toggle tray keeps its drop on the frame');
  await checkSideways(page, tray.locator('[data-slot="toggle-group"]'), 'toggle tray');
  await page.setViewportSize({ width: 1440, height: 150 });
  await page.goto(`${base}/preview/popover/Site`);
  await page.getByRole('button', { name: 'What are limits?' }).click();
  const popover = page.locator('[data-slot="popover-content"]');
  await popover.waitFor();
  assert.ok(await shadowOf(popover), 'the popover keeps its drop');
  const body = page.locator('[data-slot="popover-body"]');
  await frames(page);
  const rest = await fadeOf(body);
  assert.ok(rest.more > 0, `popover: scrolls in a short viewport (${rest.more})`);
  assert.deepEqual([rest.start, rest.end], ['0px', '24px'], 'popover: only the bottom fades at rest');
  assert.ok(await body.evaluate(element => Number.parseFloat(getComputedStyle(element).paddingLeft) >= 4), 'popover: focus rings fit inside the scroller');
  await page.setViewportSize({ width: 1440, height: 1000 });
  console.log('PASS: the rail and library scrollers fade at an edge with more past it, tied to the scroll, on both axes where code scrolls both ways, with framed scrollers keeping their drop.');
}
