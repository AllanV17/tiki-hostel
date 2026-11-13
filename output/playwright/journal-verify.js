async () => {
 const results = [];
 const assert = (ok, message) => { if (!ok) throw new Error(message); };
 const expected = ['chicas-columpio-lago-volcan', 'bosque-al-aire-libre', 'vida-compartida', 'paisaje-ometepe'];
 for (const language of ['es','en']) {
  await page.goto('http://localhost:4321/tiki-hostel/' + (language==='en'?'en/':''));
  for (const width of [390,768,1101,1440]) {
   await page.setViewportSize({width,height:900});
   await page.locator('.gallery-grid').scrollIntoViewIfNeeded(); await page.mouse.move(0,0); await page.waitForTimeout(650);
   const state = await page.locator('.gallery-grid__item img').evaluateAll(imgs => imgs.map(img => { const s=getComputedStyle(img); const r=img.getBoundingClientRect(); return {src:img.currentSrc,alt:img.alt,loaded:img.complete&&img.naturalWidth>0,width:r.width,height:r.height,position:s.objectPosition,fit:s.objectFit,transition:s.transition,srcset:img.srcset}; }));
   assert(state.length===4 && state.every((img,i)=>img.src.includes(expected[i])&&img.loaded&&img.alt&&img.srcset), 'order, loading or alt');
   assert(state.every(img=>img.fit==='cover'), 'fit changed');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth), 'horizontal overflow');
   if(width===390||width===1440) await page.screenshot({path:'output/playwright/journal-'+language+'-'+width+'.png'});
   await page.locator('.gallery-grid__item').first().hover(); await page.waitForTimeout(310);
   const transform = await page.locator('.gallery-grid__item img').first().evaluate(el=>getComputedStyle(el).transform);
   assert(transform==='matrix(1.025, 0, 0, 1.025, 0, 0)', 'hover changed');
   results.push({language,width,images:state.map(({srcset,...img})=>img),hover:transform});
  }
  await page.goto('http://localhost:4321/tiki-hostel/' + (language==='en'?'en/':'') + 'hostal/');
  const photo = page.locator('.hostel-rooms img[src*="detalle-hostal"]').first();
  assert(await photo.count()===1, 'hammock missing');
  await photo.scrollIntoViewIfNeeded(); await page.waitForTimeout(650);
  assert(await photo.evaluate(el=>el.complete&&el.naturalWidth>0), 'hammock failed loading');
  await page.screenshot({path:'output/playwright/journal-hammock-'+language+'.png'});
  results.push({language,hammock:await photo.getAttribute('src')});
 }
 return results;
}
