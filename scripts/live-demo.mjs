import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'tests', 'live-demo');
mkdirSync(OUT, { recursive: true });

const URL = 'http://localhost:5173/';

async function waitForState(page, state, timeout = 12000) {
  await page.waitForFunction(
    (s) => document.body.dataset.state === s,
    state,
    { timeout }
  );
}

async function waitForTypingDone(page, timeout = 8000) {
  await page.evaluate(
    (t) =>
      new Promise((resolve) => {
        const box = document.querySelector('#dialogue-box');
        if (!box) return resolve();
        box.addEventListener('typeit-done', () => resolve(), { once: true });
        setTimeout(resolve, t);
      }),
    timeout
  );
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

console.log(`[demo] navigating to ${URL}`);
await page.goto(URL, { waitUntil: 'networkidle' });

await page.waitForSelector('#door', { timeout: 5000 });
await page.screenshot({ path: `${OUT}/01-door-closed.png` });
console.log('[demo] 01: door closed');

await page.waitForFunction(
  () => document.querySelector('#door')?.dataset.state === 'open',
  { timeout: 8000 }
);
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/02-door-opening.png` });
console.log('[demo] 02: door opening');

await waitForState(page, 'greeting');
await waitForTypingDone(page);
await page.screenshot({ path: `${OUT}/03-greeting.png` });
console.log('[demo] 03: greeting');

await waitForState(page, 'intro_question', 12000);
await waitForTypingDone(page);
await page.screenshot({ path: `${OUT}/04-intro-question.png` });
console.log('[demo] 04: intro question');

await page.locator('[data-action="go-categories"]').click();
await waitForState(page, 'category_select');
await waitForTypingDone(page);
await page.screenshot({ path: `${OUT}/05-categories.png` });
console.log('[demo] 05: 8 categories visible');

await page.locator('[data-action="pick-category"][data-value="docs-search"]').click();
await waitForState(page, 'category_intro');
await waitForTypingDone(page);
await page.screenshot({ path: `${OUT}/06-docs-category.png` });
console.log('[demo] 06: docs-search category opened');

await page.locator('[data-action="pick-skill"][data-value="joseon-sillok-search"]').click();
await waitForState(page, 'skill_detail');
await waitForTypingDone(page);
await page.screenshot({ path: `${OUT}/07-sillok-detail.png` });
console.log('[demo] 07: 조선왕조실록 검색 detail');

await page.locator('[data-action="back-to-categories"]').click();
await waitForState(page, 'category_select');
await waitForTypingDone(page);
await page.locator('[data-action="exit"]').click();
await waitForState(page, 'outro');
await waitForTypingDone(page);
await page.screenshot({ path: `${OUT}/08-outro.png` });
console.log('[demo] 08: outro farewell');

await browser.close();
console.log(`\n[demo] done. screenshots → ${OUT}`);
