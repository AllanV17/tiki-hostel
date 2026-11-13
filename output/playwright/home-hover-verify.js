async () => {
 const results = [];
 const assert = (ok, message) => { if (!ok) throw new Error(message); };
 for (const path of ['/tiki-hostel/', '/tiki-hostel/en/']) {
  await page.goto('http://localhost:4321' + path);
  await page.setViewportSize({width:1440,height:900});
  const image = page.locator('.human-experience__photo');
  const container = page.locator('.human-experience__media');
  const gallery = page.locator('.gallery-grid__item').first();
  const style = locator => locator.evaluate(el => { const s=getComputedStyle(el); return {transform:s.transform,transition:s.transition,radius:s.borderRadius,overflow:s.overflow,cursor:s.cursor}; });
  await container.scrollIntoViewIfNeeded(); await page.mouse.move(0,0); await page.waitForTimeout(650);
  const rest = await style(image);
  const bounds = await container.boundingBox();
  await container.hover(); await page.waitForTimeout(320);
  const hovered = await style(image);
  assert(hovered.transform === 'matrix(1.025, 0, 0, 1.025, 0, 0)', 'group scale');
  assert(hovered.transition === 'transform 0.28s', 'group transition');
  assert(JSON.stringify(bounds) === JSON.stringify(await container.boundingBox()), 'container moved');
  const clipping = await style(container);
  assert(clipping.radius === '24px' && clipping.overflow === 'hidden', 'clipping');
  assert(await container.evaluate(el => !el.closest('a,button') && !el.hasAttribute('tabindex')), 'static image');
  await page.screenshot({path:'output/playwright/home-hover-' + (path.includes('/en/')?'en':'es') + '.png'});
  await page.mouse.move(0,0); await page.waitForTimeout(70);
  const leaving = await style(image);
  assert(leaving.transform !== 'none' && leaving.transform !== hovered.transform, 'exit must animate');
  await page.waitForTimeout(300); assert((await style(image)).transform === 'none', 'exit completion');
  await gallery.hover(); await page.waitForTimeout(320);
  const reference = await style(gallery.locator('.home-photo'));
  assert(reference.transform === hovered.transform && reference.transition === hovered.transition, 'gallery parity');
  await page.emulateMedia({reducedMotion:'reduce'}); await container.hover(); await page.waitForTimeout(320);
  assert((await style(image)).transform === 'none', 'reduced motion');
  await page.emulateMedia({reducedMotion:'no-preference'});
  results.push({path,rest,hovered,leaving,clipping,reference,reducedMotion:'passed'});
 }
 const touch = await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const mobile = await touch.newPage();
 for (const path of ['/tiki-hostel/', '/tiki-hostel/en/']) {
  await mobile.goto('http://localhost:4321' + path);
  await mobile.locator('.human-experience__media').tap();
  const state = await mobile.locator('.human-experience__photo').evaluate(el => ({transform:getComputedStyle(el).transform,transition:getComputedStyle(el).transition,hover:matchMedia('(hover:hover) and (pointer:fine)').matches,overflow:document.documentElement.scrollWidth>innerWidth}));
  assert(state.transform==='none' && !state.hover && !state.overflow,'touch behavior');
  results.push({path,touch:state});
 }
 await touch.close(); return results;
}
