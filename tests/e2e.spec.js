import { test, expect } from '@playwright/test';

async function waitForTypingDone(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const box = document.querySelector('#dialogue-box');
        if (!box) return resolve();
        box.addEventListener('typeit-done', () => resolve(), { once: true });
        setTimeout(resolve, 8000);
      }),
  );
}

async function waitForState(page, state, timeout = 8000) {
  await expect(page.locator('body')).toHaveAttribute('data-state', state, { timeout });
}

async function waitForDoorOpen(page, timeout = 8000) {
  await expect
    .poll(
      async () => {
        const door = page.locator('#door');
        const openAttr = await door.getAttribute('data-state').catch(() => null);
        if (openAttr === 'open') return 'done';
        const visible = await door.isVisible().catch(() => true);
        return visible ? 'waiting' : 'done';
      },
      { timeout },
    )
    .toBe('done');
}

test.describe('K-Skill Landing Page — Civ5 Sejong Throne', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens hanok door on load', async ({ page }) => {
    await expect(page.locator('#door')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-state', 'door_opening');

    await waitForDoorOpen(page, 5000);

    await expect(page.locator('#scene')).toBeVisible();
  });

  test('reveals Sejong figure after door opens', async ({ page }) => {
    await waitForDoorOpen(page, 8000);

    await expect(page.locator('#scene')).toBeVisible();
    await expect(page.locator('[data-testid="leader-name"]')).toContainText(
      '한국 문명의 군주 세종대왕',
    );
    await expect(page.locator('[data-testid="taeguk"]')).toBeVisible();
  });

  test('greeting state shows first dialogue line', async ({ page }) => {
    await waitForState(page, 'greeting', 8000);
    await waitForTypingDone(page);
    await expect(page.locator('[data-testid="dialogue-text"]')).toContainText(
      '조선의 궁궐에 당도한 것을 환영하오',
      { timeout: 8000 },
    );
  });

  test('intro_question shows yes/tell-me-more choices', async ({ page }) => {
    await waitForState(page, 'greeting', 8000);
    await waitForTypingDone(page);

    const continueBtn = page.locator('[data-testid="choice-btn"]').first();
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click().catch(() => {});
    }

    await waitForState(page, 'intro_question', 8000);
    await waitForTypingDone(page);

    await expect(page.locator('[data-testid="dialogue-text"]')).toContainText(
      '조선의 제일 가는 인공 지능',
      { timeout: 8000 },
    );
    await expect(page.locator('[data-testid="choice-btn"]')).toHaveCount(3, { timeout: 8000 });
    await expect(page.locator('[data-testid="choice-btn"][data-action="show-install"]')).toBeVisible();
  });

  test('category_select shows 8 category buttons', async ({ page }) => {
    await waitForState(page, 'intro_question', 12000);
    await waitForTypingDone(page);

    await page.locator('[data-testid="choice-btn"]').first().click();

    await waitForState(page, 'category_select', 8000);
    await waitForTypingDone(page);

    const choices = page.locator('[data-testid="choices"] [data-testid="choice-btn"]');
    await expect(choices).toHaveCount(9, { timeout: 8000 });

    const expectedLabels = [
      '교통/예약',
      '음식/생활',
      '쇼핑/가격',
      '정부/공공',
      '스포츠/엔터',
      '문서/검색',
      '부동산/금융',
      '기타',
    ];
    const texts = (await choices.allTextContents()).map((t) => t.trim());
    for (const label of expectedLabels) {
      expect(texts.some((t) => t.includes(label))).toBe(true);
    }
  });

  test('category_intro lists skills for chosen category', async ({ page }) => {
    await waitForState(page, 'intro_question', 12000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]').first().click();

    await waitForState(page, 'category_select', 8000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]', { hasText: '교통/예약' }).click();

    await waitForState(page, 'category_intro', 8000);
    await waitForTypingDone(page);

    await expect(page.locator('[data-testid="dialogue-text"]')).not.toHaveText('', {
      timeout: 8000,
    });

    const choices = page.locator('[data-testid="choice-btn"]');
    expect(await choices.count()).toBeGreaterThanOrEqual(8);

    const texts = (await choices.allTextContents()).map((t) => t.trim());
    expect(texts.some((t) => t.includes('KTX 예매'))).toBe(true);
  });

  test('skill_detail shows description and features', async ({ page }) => {
    await waitForState(page, 'intro_question', 12000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]').first().click();

    await waitForState(page, 'category_select', 8000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]', { hasText: '교통/예약' }).click();

    await waitForState(page, 'category_intro', 8000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]', { hasText: 'KTX 예매' }).click();

    await waitForState(page, 'skill_detail', 8000);
    await waitForTypingDone(page);

    const dialogueText = await page.locator('[data-testid="dialogue-text"]').textContent();
    expect(dialogueText).toBeTruthy();
    expect(/KTX|철마|열차/.test(dialogueText || '')).toBe(true);

    const choices = page.locator('[data-testid="choice-btn"]');
    expect(await choices.count()).toBeGreaterThanOrEqual(3);
  });

  test('back navigation returns to previous state', async ({ page }) => {
    await waitForState(page, 'intro_question', 12000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]').first().click();

    await waitForState(page, 'category_select', 8000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]', { hasText: '교통/예약' }).click();

    await waitForState(page, 'category_intro', 8000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]', { hasText: 'KTX 예매' }).click();

    await waitForState(page, 'skill_detail', 8000);
    await waitForTypingDone(page);

    const backToCategory = page.locator('[data-action="back-to-category"]');
    if ((await backToCategory.count()) > 0) {
      await backToCategory.first().click();
    } else {
      await page
        .locator('[data-testid="choice-btn"]')
        .filter({ hasText: /이 분야 다른|다른 기술/ })
        .first()
        .click();
    }
    await waitForState(page, 'category_intro', 5000);
    await waitForTypingDone(page);

    const backToCategories = page.locator('[data-action="back-to-categories"]');
    if ((await backToCategories.count()) > 0) {
      await backToCategories.first().click();
    } else {
      await page
        .locator('[data-testid="choice-btn"]')
        .filter({ hasText: /다른 분야/ })
        .first()
        .click();
    }
    await waitForState(page, 'category_select', 5000);
  });

  test('outro state shows farewell', async ({ page }) => {
    await waitForState(page, 'intro_question', 12000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]').first().click();

    await waitForState(page, 'category_select', 8000);
    await waitForTypingDone(page);

    const exitByAction = page.locator('[data-action="exit"]');
    if ((await exitByAction.count()) > 0) {
      await exitByAction.first().click();
    } else {
      await page.locator('[data-testid="choice-btn"]', { hasText: '물러가' }).first().click();
    }

    await waitForState(page, 'outro', 8000);
    await waitForTypingDone(page);

    await expect(page.locator('[data-testid="dialogue-text"]')).toContainText('또 만나기를', {
      timeout: 8000,
    });
  });

  test('hyeonpan name plate shows 케이-스킬', async ({ page }) => {
    await waitForState(page, 'greeting', 8000);
    const hyeonpan = page.locator('[data-testid="hyeonpan"]');
    await expect(hyeonpan).toBeVisible({ timeout: 8000 });
    await expect(hyeonpan).toContainText('케이-스킬');
  });

  test('global installation guide explains npx skills add command', async ({ page }) => {
    await waitForState(page, 'intro_question', 12000);
    await waitForTypingDone(page);

    await page.locator('[data-action="show-install"]').click();
    await waitForState(page, 'installation_global', 8000);
    await waitForTypingDone(page);

    await expect(page.locator('[data-testid="dialogue-text"]')).toContainText(
      'npx --yes skills add NomaDamas/k-skill --all -g',
      { timeout: 8000 },
    );
    await expect(page.locator('[data-testid="dialogue-text"]')).toContainText('k-skill-setup');
  });

  test('per-skill installation shows special requirements', async ({ page }) => {
    await waitForState(page, 'intro_question', 12000);
    await waitForTypingDone(page);
    await page.locator('[data-action="go-categories"]').click();

    await waitForState(page, 'category_select', 8000);
    await waitForTypingDone(page);
    await page.locator('[data-action="pick-category"][data-value="transport"]').click();

    await waitForState(page, 'category_intro', 8000);
    await waitForTypingDone(page);
    await page.locator('[data-action="pick-skill"][data-value="ktx-booking"]').click();

    await waitForState(page, 'skill_detail', 8000);
    await waitForTypingDone(page);
    await page.locator('[data-action="show-skill-install"]').click();

    await waitForState(page, 'installation_skill', 8000);
    await waitForTypingDone(page);

    await expect(page.locator('[data-testid="dialogue-text"]')).toContainText(
      'KTX 예매 설치 방법',
      { timeout: 8000 },
    );
    await expect(page.locator('[data-testid="dialogue-text"]')).toContainText(
      'pip install korail2 pycryptodome',
    );
  });

  test('visual snapshot at greeting state', async ({ page }) => {
    await waitForState(page, 'greeting', 8000);
    await waitForTypingDone(page);

    await expect
      .poll(
        async () => {
          const first = await page
            .locator('[data-testid="dialogue-text"]')
            .textContent()
            .catch(() => '');
          await page.waitForTimeout(300);
          const second = await page
            .locator('[data-testid="dialogue-text"]')
            .textContent()
            .catch(() => '');
          return first && first === second ? 'stable' : 'waiting';
        },
        { timeout: 10000 },
      )
      .toBe('stable');

    await expect(page).toHaveScreenshot('greeting.png', { maxDiffPixelRatio: 0.05 });
  });

  test('no console errors during full flow', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/');

    await waitForState(page, 'greeting', 10000);
    await waitForTypingDone(page);

    await waitForState(page, 'intro_question', 12000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]').first().click();

    await waitForState(page, 'category_select', 8000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]', { hasText: '교통/예약' }).click();

    await waitForState(page, 'category_intro', 8000);
    await waitForTypingDone(page);
    await page.locator('[data-testid="choice-btn"]', { hasText: 'KTX 예매' }).click();

    await waitForState(page, 'skill_detail', 8000);
    await waitForTypingDone(page);

    const backToCategories = page.locator('[data-action="back-to-categories"]');
    if ((await backToCategories.count()) > 0) {
      await backToCategories.first().click();
    } else {
      const backToCategory = page.locator('[data-action="back-to-category"]');
      if ((await backToCategory.count()) > 0) {
        await backToCategory.first().click();
        await waitForState(page, 'category_intro', 5000);
        await waitForTypingDone(page);
        await page
          .locator('[data-testid="choice-btn"]')
          .filter({ hasText: /다른 분야/ })
          .first()
          .click();
      }
    }
    await waitForState(page, 'category_select', 8000);
    await waitForTypingDone(page);

    const exitByAction = page.locator('[data-action="exit"]');
    if ((await exitByAction.count()) > 0) {
      await exitByAction.first().click();
    } else {
      await page.locator('[data-testid="choice-btn"]', { hasText: '물러가' }).first().click();
    }
    await waitForState(page, 'outro', 8000);
    await waitForTypingDone(page);

    expect(consoleErrors, `console errors: ${consoleErrors.join(' | ')}`).toHaveLength(0);
    expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
  });
});
