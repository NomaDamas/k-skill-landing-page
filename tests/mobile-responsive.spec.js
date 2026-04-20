import { test, expect } from '@playwright/test';

const VIEWPORTS = {
  iPhone13Pro: { width: 390, height: 844 },
  iPhoneSE: { width: 375, height: 667 },
  GalaxyS20: { width: 360, height: 800 },
  landscape: { width: 844, height: 390 },
};

async function armTypeItDone(page) {
  await page.evaluate(() => {
    window.__typeitDone = false;
    const box = document.querySelector('#dialogue-box');
    if (!box) return;
    box.addEventListener(
      'typeit-done',
      () => {
        window.__typeitDone = true;
      },
      { once: true },
    );
  });
}

async function waitForStateAndTypedText(page, expectedState, timeout = 15000) {
  await page.waitForFunction(
    (state) => document.body.dataset.state === state,
    expectedState,
    { timeout },
  );
  await page.waitForFunction(
    () => document.querySelectorAll('.choice-btn').length > 0,
    { timeout },
  );
}

async function clickAndAdvance(page, selector, expectedState, timeout = 8000) {
  await armTypeItDone(page);
  await page.locator(selector).click();
  await waitForStateAndTypedText(page, expectedState, timeout);
}

async function advanceToGreeting(page) {
  await page.goto('/');
  await page.waitForFunction(() => document.body.dataset.state === 'greeting', { timeout: 10000 });
}

async function advanceToIntroQuestion(page) {
  await advanceToGreeting(page);
  await armTypeItDone(page);
  await waitForStateAndTypedText(page, 'intro_question', 12000);
}

async function advanceToCategorySelect(page) {
  await advanceToIntroQuestion(page);
  await clickAndAdvance(page, '.choice-btn[data-action="go-categories"]', 'category_select');
}

async function advanceToSkillDetail(page) {
  await advanceToIntroQuestion(page);
  await clickAndAdvance(page, '.choice-btn[data-action="go-categories"]', 'category_select');
  await clickAndAdvance(page, '.choice-btn[data-value="transport"]', 'category_intro');
  await clickAndAdvance(page, '.choice-btn[data-value="ktx-booking"]', 'skill_detail');
}

async function getHyeonpanMetrics(page) {
  return page.locator('[data-testid="hyeonpan"]').boundingBox();
}

test.describe('Mobile responsive — hyeonpan', () => {
  test.use({ viewport: VIEWPORTS.iPhone13Pro });

  test('A1 iPhone 13 Pro keeps hyeonpan under 55% viewport width', async ({ page }) => {
    await advanceToGreeting(page);

    const box = await getHyeonpanMetrics(page);
    expect(box).not.toBeNull();
    expect(box.width / VIEWPORTS.iPhone13Pro.width).toBeLessThan(0.55);
  });
});

test.describe('Mobile responsive — hyeonpan iPhone SE', () => {
  test.use({ viewport: VIEWPORTS.iPhoneSE });

  test('A1 iPhone SE keeps hyeonpan under 55% viewport width', async ({ page }) => {
    await advanceToGreeting(page);

    const box = await getHyeonpanMetrics(page);
    expect(box).not.toBeNull();
    expect(box.width / VIEWPORTS.iPhoneSE.width).toBeLessThan(0.55);
  });
});

test.describe('Mobile responsive — hyeonpan Galaxy S20', () => {
  test.use({ viewport: VIEWPORTS.GalaxyS20 });

  test('A1 Galaxy S20 keeps hyeonpan under 55% viewport width', async ({ page }) => {
    await advanceToGreeting(page);

    const box = await getHyeonpanMetrics(page);
    expect(box).not.toBeNull();
    expect(box.width / VIEWPORTS.GalaxyS20.width).toBeLessThan(0.55);
  });
});

test.describe('Mobile responsive — dialogue-text readability', () => {
  test.use({ viewport: VIEWPORTS.iPhoneSE });

  test('A2 iPhone SE skill detail keeps dialogue text at least 150px tall', async ({ page }) => {
    await advanceToSkillDetail(page);

    const isReadable = await page.locator('.dialogue-text').evaluate((el) => el.clientHeight >= 150);
    expect(isReadable).toBe(true);
  });
});

test.describe('Mobile responsive — no horizontal overflow', () => {
  for (const [name, viewport] of [
    ['iPhone13Pro', VIEWPORTS.iPhone13Pro],
    ['iPhoneSE', VIEWPORTS.iPhoneSE],
    ['GalaxyS20', VIEWPORTS.GalaxyS20],
  ]) {
    test.describe(name, () => {
      test.use({ viewport });

      test(`A3 ${name} has no horizontal overflow across initial, intro_question, category_select, and skill_detail`, async ({ page }) => {
        await page.goto('/');

        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);

        await advanceToIntroQuestion(page);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);

        await clickAndAdvance(page, '.choice-btn[data-action="go-categories"]', 'category_select');
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);

        await clickAndAdvance(page, '.choice-btn[data-value="transport"]', 'category_intro');
        await clickAndAdvance(page, '.choice-btn[data-value="ktx-booking"]', 'skill_detail');
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
      });
    });
  }
});

test.describe('Mobile responsive — landscape', () => {
  test.use({ viewport: VIEWPORTS.landscape });

  test('A4 landscape greeting keeps hyeonpan above dialogue and dialogue under 273px', async ({ page }) => {
    await advanceToGreeting(page);

    const hyeonpan = await page.locator('[data-testid="hyeonpan"]').boundingBox();
    const dialogueBox = await page.locator('#dialogue-box').boundingBox();

    expect(hyeonpan).not.toBeNull();
    expect(dialogueBox).not.toBeNull();
    expect(hyeonpan.y + hyeonpan.height).toBeLessThan(dialogueBox.y);
    expect(dialogueBox.height).toBeLessThanOrEqual(273);
  });
});

test.describe('Mobile responsive — desktop regression', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('A5 desktop greeting keeps hyeonpan width within 315 to 319px baseline', async ({ page }) => {
    await advanceToGreeting(page);

    const hyeonpan = await page.locator('[data-testid="hyeonpan"]').boundingBox();
    expect(hyeonpan).not.toBeNull();
    expect(hyeonpan.width).toBeGreaterThanOrEqual(315);
    expect(hyeonpan.width).toBeLessThanOrEqual(319);
  });
});
