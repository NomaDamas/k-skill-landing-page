import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'tests', 'dim-audit');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

await page.waitForFunction(() => document.body.dataset.state === 'greeting', null, { timeout: 10000 });
await page.waitForTimeout(4000);

const audit = await page.evaluate(() => {
  const layers = [
    '#door',
    '#door .door-shadow',
    '#door .door-frame::before',
    '#scene',
    '#scene .palace-backdrop',
    '#scene .mountain-painting',
    '#scene .palace-vignette',
    '#scene .palace-floor',
    '#dialogue-box',
    'body',
    'html',
  ];
  return layers.map((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { sel, present: false };
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      sel,
      present: true,
      opacity: cs.opacity,
      mixBlendMode: cs.mixBlendMode,
      backgroundColor: cs.backgroundColor,
      backdropFilter: cs.backdropFilter,
      filter: cs.filter,
      zIndex: cs.zIndex,
      visibility: cs.visibility,
      display: cs.display,
      width: rect.width,
      height: rect.height,
      isFullscreen: rect.width >= window.innerWidth - 5 && rect.height >= window.innerHeight - 5,
    };
  });
});

console.log('===== LAYER AUDIT (after door opens) =====');
for (const a of audit) {
  if (!a.present) {
    console.log(`[X] ${a.sel} — not in DOM`);
    continue;
  }
  const fs = a.isFullscreen ? '★FULLSCREEN' : '';
  console.log(`[${a.zIndex || 'auto'}] ${a.sel} ${fs}`);
  console.log(`     opacity=${a.opacity} blend=${a.mixBlendMode} bg=${a.backgroundColor}`);
  if (a.backdropFilter !== 'none') console.log(`     backdrop=${a.backdropFilter}`);
  if (a.filter !== 'none') console.log(`     filter=${a.filter}`);
}

await page.screenshot({ path: `${OUT}/01-current-state.png`, fullPage: false });
console.log('\nSaved current-state screenshot');

await page.evaluate(() => {
  const v = document.querySelector('#scene .palace-vignette');
  if (v) v.style.display = 'none';
});
await page.screenshot({ path: `${OUT}/02-no-vignette.png`, fullPage: false });
console.log('Saved no-vignette screenshot');

await page.evaluate(() => {
  const door = document.querySelector('#door');
  if (door) door.style.display = 'none';
});
await page.screenshot({ path: `${OUT}/03-no-vignette-no-door.png`, fullPage: false });
console.log('Saved no-vignette-no-door screenshot');

await page.evaluate(() => {
  const scene = document.querySelector('#scene');
  if (scene) scene.style.background = 'linear-gradient(180deg, #6b3328 0%, #3a2118 60%, #1f1410 100%)';
  const mp = document.querySelector('#scene .mountain-painting');
  if (mp) mp.style.filter = 'brightness(1.3) saturate(1.15)';
});
await page.screenshot({ path: `${OUT}/04-aggressive-bright.png`, fullPage: false });
console.log('Saved aggressive-bright screenshot');

await browser.close();
console.log('\nDone. Compare 4 images to see what each layer contributes.');
