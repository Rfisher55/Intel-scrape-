// LinkedIn showcase capture — no secrets, public data only
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');

const BASE      = 'http://localhost:8899';
const SHOTS_DIR = '/home/user/Intel-scrape-/screenshots';
const VIDS_DIR  = '/home/user/Intel-scrape-/videos';

const wait = ms => new Promise(r => setTimeout(r, ms));

// Force-close all overlay types via JS evaluation
async function closeAll(page) {
  await page.evaluate(() => {
    // class-toggled overlays
    ['icbrief-overlay','sitrep-overlay','matrix-overlay','foreignsig-overlay','unsc-overlay'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.classList.remove('open'); el.style.display = 'none'; }
    });
    // display:flex/block overlays
    document.querySelectorAll('[id$="-overlay"]').forEach(el => {
      if (el.style.display && el.style.display !== 'none') {
        el.style.display = 'none';
      }
    });
    // inline open divs
    document.querySelectorAll('.overlay.open,.panel.open').forEach(el => {
      el.classList.remove('open');
    });
  });
  await wait(400);
}

async function openAndShot(page, openFn, shotPath, waitMs) {
  try {
    await closeAll(page);
    await page.evaluate(openFn);
    await wait(waitMs || 3500);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  saved: ${shotPath}`);
    return true;
  } catch (e) {
    console.log(`  error ${shotPath}: ${e.message.split('\n')[0]}`);
    return false;
  } finally {
    await closeAll(page);
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  // ─── DESKTOP SCREENSHOTS + VIDEO ─────────────────────────────────────
  const ctx1 = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: VIDS_DIR, size: { width: 1920, height: 1080 } }
  });
  const page = await ctx1.newPage();
  console.log('Loading desktop app...');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await wait(6000); // globe + live feeds start loading

  // 01 — full dashboard with globe visible
  await page.screenshot({ path: `${SHOTS_DIR}/01-dashboard-globe.png` });
  console.log('Shot 01: main dashboard globe');

  // 02 — top bar: DEFCON + live ticker
  await page.screenshot({
    path: `${SHOTS_DIR}/02-defcon-ticker.png`,
    clip: { x: 0, y: 0, width: 1920, height: 130 }
  });
  console.log('Shot 02: DEFCON + news ticker');

  // 03 — Nuclear Intel overlay
  await openAndShot(page, () => { openNukeDash && openNukeDash(); },
    `${SHOTS_DIR}/03-nuclear-intel.png`, 4000);

  // 04 — Sanctions tracker
  await openAndShot(page, () => { openSanctions && openSanctions(); },
    `${SHOTS_DIR}/04-sanctions-tracker.png`, 4000);

  // 05 — Terror Watch
  await openAndShot(page, () => { openTerrorWatch && openTerrorWatch(); },
    `${SHOTS_DIR}/05-terror-watch.png`, 4000);

  // 06 — Maritime Intel
  await openAndShot(page, () => { openMaritime && openMaritime(); },
    `${SHOTS_DIR}/06-maritime-intel.png`, 4000);

  // 07 — Cyber Breach tracker
  await openAndShot(page, () => { openCyberBreach && openCyberBreach(); },
    `${SHOTS_DIR}/07-cyber-breach.png`, 4000);

  // 08 — IC Brief
  await openAndShot(page, () => { openICBrief && openICBrief(); },
    `${SHOTS_DIR}/08-ic-brief.png`, 4000);

  // 09 — SITREP
  await openAndShot(page, () => { openSITREP && openSITREP(); },
    `${SHOTS_DIR}/09-sitrep.png`, 4000);

  // 10 — Intel Matrix
  await openAndShot(page, () => { openIntelMatrix && openIntelMatrix(); },
    `${SHOTS_DIR}/10-intel-matrix.png`, 4000);

  // 11 — Country intel (USA)
  await openAndShot(page, () => { openCountry && openCountry('USA'); },
    `${SHOTS_DIR}/11-country-usa.png`, 3500);

  // 12 — Country intel (RUS for contrast)
  await openAndShot(page, () => { openCountry && openCountry('RUS'); },
    `${SHOTS_DIR}/12-country-russia.png`, 3500);

  // 13 — Foreign SIG
  await openAndShot(page, () => { openForeignSIG && openForeignSIG(); },
    `${SHOTS_DIR}/13-foreign-sig.png`, 4000);

  // 14 — UNSC overlay
  await openAndShot(page, () => { openUNSC && openUNSC(); },
    `${SHOTS_DIR}/14-unsc-overlay.png`, 4000);

  // 15 — live status bar at bottom
  await closeAll(page);
  await page.screenshot({
    path: `${SHOTS_DIR}/15-live-status-bar.png`,
    clip: { x: 0, y: 1035, width: 1920, height: 45 }
  });
  console.log('Shot 15: live status bar');

  // ── VIDEO WALKTHROUGH SEGMENT ──────────────────────────────────────
  console.log('Recording desktop video...');
  await closeAll(page);
  await wait(1000);

  // hover over globe to show interactivity
  await page.mouse.move(960, 540);  await wait(600);
  await page.mouse.move(1060, 450, { steps: 30 }); await wait(800);
  await page.mouse.move(880, 590, { steps: 30 }); await wait(800);
  await page.mouse.move(1020, 510, { steps: 30 }); await wait(600);

  // open Nuclear Intel
  await page.evaluate(() => { openNukeDash && openNukeDash(); });
  await wait(4000);
  await page.evaluate(() => { closeNukeDash && closeNukeDash(); });
  await wait(800);

  // open Sanctions
  await page.evaluate(() => { openSanctions && openSanctions(); });
  await wait(3500);
  await closeAll(page);
  await wait(800);

  // open Terror Watch
  await page.evaluate(() => { openTerrorWatch && openTerrorWatch(); });
  await wait(3000);
  await closeAll(page);
  await wait(500);

  await ctx1.close(); // saves video

  // ─── MOBILE VIEW ─────────────────────────────────────────────────────
  const ctx2 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: { dir: VIDS_DIR, size: { width: 390, height: 844 } },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const mob = await ctx2.newPage();
  console.log('Loading mobile view...');
  await mob.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await wait(5000);

  await mob.screenshot({ path: `${SHOTS_DIR}/16-mobile-dashboard.png` });
  console.log('Shot 16: mobile dashboard');

  const mobileToggle = mob.locator('#mobile-intel-toggle').first();
  if (await mobileToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
    await mobileToggle.click();
    await wait(1500);
    await mob.screenshot({ path: `${SHOTS_DIR}/17-mobile-intel-menu.png` });
    console.log('Shot 17: mobile INTEL MENU');

    // tap first module
    const firstBtn = mob.locator('.mobile-module-btn').first();
    if (await firstBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstBtn.click();
      await wait(3000);
      await mob.screenshot({ path: `${SHOTS_DIR}/18-mobile-module-open.png` });
      console.log('Shot 18: mobile module panel');
    }
  }

  await ctx2.close(); // saves mobile video

  await browser.close();

  // Rename videos
  const vids = fs.readdirSync(VIDS_DIR).filter(f => f.endsWith('.webm')).sort();
  console.log('Videos:', vids.length, vids);
  if (vids[0]) fs.renameSync(`${VIDS_DIR}/${vids[0]}`, `${VIDS_DIR}/video1-desktop-walkthrough.webm`);
  if (vids[1]) fs.renameSync(`${VIDS_DIR}/${vids[1]}`, `${VIDS_DIR}/video2-mobile-flow.webm`);

  console.log('\nCapture complete.');
  const shots = fs.readdirSync(SHOTS_DIR).sort();
  console.log(`Screenshots (${shots.length}):`, shots);
  console.log('Videos:', fs.readdirSync(VIDS_DIR).filter(f=>f.endsWith('.webm')).sort());
})();
