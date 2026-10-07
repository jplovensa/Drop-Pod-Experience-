const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.BASE_URL || 'http://localhost:3001') + '/experience-v3.html?style=el');
 await page.click('#begin');
 await page.waitForFunction(()=>document.querySelector('#earthyCinematic').currentTime>0.2);
 assert.equal(await page.locator('#capTitle').textContent(),'The Destination Collection');
 assert.equal(await page.locator('#earthyCinematic').evaluate(v=>v.duration),152);
 const chapters=JSON.parse(fs.readFileSync(require('node:path').join(__dirname, '../assets/earthy-luxe/film/chapters.json'))).chapters;
 for(let i=0;i<chapters.length;i++){
  await page.locator('.seg').nth(i).click({force:true});
  await page.waitForFunction(({t})=>{const v=document.querySelector('#earthyCinematic');return !v.seeking&&v.currentTime>=t&&v.currentTime<t+2&&v.readyState>=2},{t:chapters[i].start});
  assert.equal(await page.locator('#capTitle').textContent(),chapters[i].title);
  assert.equal(await page.locator('#counterCur').textContent(),String(i+1).padStart(2,'0'));
  assert.equal(await page.locator('#earthyCinematic').evaluate(v=>v.paused),false);
  if(i<chapters.length-1){
   await page.evaluate(t=>document.querySelector('#earthyCinematic').currentTime=t,chapters[i+1].start-0.2);
   await page.waitForFunction(title=>document.querySelector('#capTitle').textContent===title,chapters[i+1].title);
  }
  console.log('PASS chapter '+(i+1)+': '+chapters[i].title);
 }
 await page.click('#btnPlay',{force:true});
 const stopped=await page.locator('#earthyCinematic').evaluate(v=>v.currentTime);
 await page.waitForTimeout(250);
 assert.equal(await page.locator('#earthyCinematic').evaluate(v=>v.currentTime),stopped);
 await page.click('#btnPlay',{force:true});
 await page.waitForFunction(t=>document.querySelector('#earthyCinematic').currentTime>t,stopped);
 await page.locator('.seg').nth(4).click({force:true});
 await page.click('#mdExplore',{force:true});
 assert.equal(await page.locator('#earthyCinematic').isVisible(),false);
 assert.match(await page.locator('.scene.active video.show').getAttribute('src'),/entry-v3/);
 await page.click('#mdFilm',{force:true});
 await page.waitForFunction(()=>document.querySelector('#earthyCinematic').currentTime>=43&&document.querySelector('#earthyCinematic').currentTime<45);
 await page.click('#swMed',{force:true});
 assert.equal(await page.locator('#earthyCinematic').isVisible(),false);
 assert.match(await page.locator('.scene.active video.show').getAttribute('src'),/walkthrough-entry/);
 await page.click('#swWo',{force:true});
 await page.locator('.seg').nth(0).click({force:true});
 assert.equal(await page.locator('#capTitle').textContent(),chapters[0].title);
 assert.match(await page.locator('.scene.active video.show').getAttribute('src'),/destination-collection/);
 await page.click('#swEl',{force:true});
 await page.waitForFunction(()=>document.querySelector('#earthyCinematic').currentTime<2);
 await page.evaluate(()=>document.querySelector('#earthyCinematic').currentTime=151.8);
 await page.waitForFunction(()=>document.querySelector('#endcard').classList.contains('show'));
 await page.click('#replay');
 await page.waitForFunction(()=>{const v=document.querySelector('#earthyCinematic');return !v.paused&&v.currentTime<2});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);
 console.log('PASS pause/resume, palette switches, Explore, end/replay, mobile and JS errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
