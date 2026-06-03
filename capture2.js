// Retake broken shots 07-14 with correct closeAll
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');

const BASE      = 'http://localhost:8899';
const SHOTS_DIR = '/home/user/Intel-scrape-/screenshots';

const wait = ms => new Promise(r => setTimeout(r, ms));

async function closeAll(page) {
  await page.evaluate(() => {
    // Remove 'open' class from ALL overlays (catches class-toggled ones)
    document.querySelectorAll('[id$="-overlay"]').forEach(el => {
      el.classList.remove('open');
      // Also clear inline style if set
      if (el.style.display && el.style.display !== 'none') {
        el.style.display = 'none';
      }
    });
    // Catch overlays that show via display:flex/block without class
    document.querySelectorAll('[id*="overlay"]').forEach(el => {
      el.classList.remove('open');
      if (el.style.display && el.style.display !== 'none') {
        el.style.display = 'none';
      }
    });
  });
  await wait(500);
}

async function openAndShot(page, openFn, shotPath, waitMs) {
  try {
    await closeAll(page);
    await page.evaluate(openFn);
    await wait(waitMs || 4000);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  saved: ${shotPath}`);
    return true;
  } catch (e) {
    console.log(`  error ${shotPath}: ${e.message.split('\n')[0]}`);
    return false;
  } finally {
    await closeAll(page);
    await wait(300);
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();

  console.log('Loading app for retake...');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await wait(6000);

  // RETAKE 07 — Cyber Breach (was broken, now with proper close)
  await openAndShot(page, () => { openCyberBreach && openCyberBreach(); },
    `${SHOTS_DIR}/07-cyber-breach.png`, 4000);

  // RETAKE 08 — IC Brief
  await openAndShot(page, () => { openICBrief && openICBrief(); },
    `${SHOTS_DIR}/08-ic-brief.png`, 4000);

  // RETAKE 09 — SITREP
  await openAndShot(page, () => { openSITREP && openSITREP(); },
    `${SHOTS_DIR}/09-sitrep.png`, 4000);

  // RETAKE 10 — Intel Matrix
  await openAndShot(page, () => { openIntelMatrix && openIntelMatrix(); },
    `${SHOTS_DIR}/10-intel-matrix.png`, 4000);

  // RETAKE 11 — Country intel USA
  await openAndShot(page, () => { openCountry && openCountry('USA'); },
    `${SHOTS_DIR}/11-country-usa.png`, 3500);

  // RETAKE 12 — Country intel Russia
  await openAndShot(page, () => { openCountry && openCountry('RUS'); },
    `${SHOTS_DIR}/12-country-russia.png`, 3500);

  // RETAKE 13 — Foreign SIGINT
  await openAndShot(page, () => { openForeignSIG && openForeignSIG(); },
    `${SHOTS_DIR}/13-foreign-sig.png`, 4000);

  // RETAKE 14 — UNSC
  await openAndShot(page, () => { openUNSC && openUNSC(); },
    `${SHOTS_DIR}/14-unsc-overlay.png`, 4000);

  await ctx.close();
  await browser.close();

  // Verify uniqueness
  const { execSync } = require('child_process');
  const hashes = execSync(`md5sum ${SHOTS_DIR}/*.png`).toString();
  console.log('\nHash check:\n', hashes);
  console.log('Done.');
})();
