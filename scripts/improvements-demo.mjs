import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'tests', 'improvements-demo');
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

await page.goto(URL, { waitUntil: 'networkidle' });

await waitForState(page, 'greeting', 10000);
await waitForTypingDone(page);
await page.screenshot({ path: `${OUT}/01-bright-greeting-with-hyeonpan.png` });
console.log('[demo] 01: bright greeting + hyeonpan visible');

await waitForState(page, 'intro_question', 12000);
await waitForTypingDone(page);
await page.screenshot({ path: `${OUT}/02-intro-with-install-option.png` });
console.log('[demo] 02: intro_question with new 설치 방법 button');

await page.locator('[data-action="show-install"]').click();
await waitForState(page, 'installation_global', 8000);
await waitForTypingDone(page);
await page.screenshot({ path: `${OUT}/03-installation-global.png` });
console.log('[demo] 03: global installation guide');

await page.locator('[data-action="go-categories"]').click();
await waitForState(page, 'category_select', 8000);
await waitForTypingDone(page);
await page.locator('[data-action="pick-category"][data-value="transport"]').click();
await waitForState(page, 'category_intro', 8000);
await waitForTypingDone(page);
await page.locator('[data-action="pick-skill"][data-value="ktx-booking"]').click();
await waitForState(page, 'skill_detail', 8000);
await waitForTypingDone(page);
await page.screenshot({ path: `${OUT}/04-skill-detail-with-install-button.png` });
console.log('[demo] 04: skill detail with 설치 방법 button');

await page.locator('[data-action="show-skill-install"]').click();
await waitForState(page, 'installation_skill', 8000);
await waitForTypingDone(page);
await page.screenshot({ path: `${OUT}/05-ktx-installation.png` });
console.log('[demo] 05: KTX 설치 (pip install korail2)');

await browser.close();
console.log(`\n[demo] done. screenshots → ${OUT}`);
