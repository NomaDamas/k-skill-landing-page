import { test } from '@playwright/test';

const SCREENSHOT_DIR = 'tests/visual-tour';

async function waitForState(page, state, timeout = 10000) {
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

test('captures screenshots of every dialogue state', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('/');

  await page.waitForSelector('#door', { timeout: 5000 });
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01-door-closed.png`, fullPage: false });

  await page.waitForFunction(
    () => document.querySelector('#door')?.dataset.state === 'open',
    { timeout: 8000 }
  );
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02-door-open.png`, fullPage: false });

  await waitForState(page, 'greeting');
  await waitForTypingDone(page);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/03-greeting.png`, fullPage: false });

  await waitForState(page, 'intro_question', 12000);
  await waitForTypingDone(page);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/04-intro-question.png`, fullPage: false });

  await page.locator('[data-action="go-categories"]').click();
  await waitForState(page, 'category_select');
  await waitForTypingDone(page);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/05-category-select.png`, fullPage: false });

  const categories = [
    { value: 'transport', name: '06-category-transport' },
    { value: 'food-life', name: '07-category-food-life' },
    { value: 'shopping', name: '08-category-shopping' },
    { value: 'gov-public', name: '09-category-gov-public' },
    { value: 'sports-ent', name: '10-category-sports-ent' },
    { value: 'docs-search', name: '11-category-docs-search' },
    { value: 'real-estate-finance', name: '12-category-real-estate-finance' },
    { value: 'misc', name: '13-category-misc' },
  ];

  for (const cat of categories) {
    await page.locator(`[data-action="pick-category"][data-value="${cat.value}"]`).click();
    await waitForState(page, 'category_intro');
    await waitForTypingDone(page);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${cat.name}.png`, fullPage: false });

    const skillBtn = page.locator('[data-action="pick-skill"]').first();
    await skillBtn.click();
    await waitForState(page, 'skill_detail');
    await waitForTypingDone(page);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/${cat.name}-detail.png`,
      fullPage: false,
    });

    await page.locator('[data-action="back-to-categories"]').click();
    await waitForState(page, 'category_select');
    await waitForTypingDone(page);
  }

  await page.locator('[data-action="exit"]').click();
  await waitForState(page, 'outro');
  await waitForTypingDone(page);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/14-outro.png`, fullPage: false });
});
