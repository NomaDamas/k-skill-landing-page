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

async function navigateToCategory(page, categoryLabel) {
  await page.goto('/');
  await waitForState(page, 'intro_question', 12000);
  await waitForTypingDone(page);
  await page.locator('[data-testid="choice-btn"]').first().click();
  await waitForState(page, 'category_select', 8000);
  await waitForTypingDone(page);
  await page.locator('[data-testid="choice-btn"]', { hasText: categoryLabel }).click();
  await waitForState(page, 'category_intro', 8000);
  await waitForTypingDone(page);
}

const cases = [
  {
    category: '교통/예약',
    expectedNew: ['고속버스 예매', '시외버스 예매', '항공권 검색', '마이리얼트립 검색', '대중교통 길찾기'],
  },
  { category: '음식/생활', expectedNew: ['강남언니 병원 조회'] },
  { category: '쇼핑/가격', expectedNew: ['당근 중고거래 검색', '다나와 가격비교'] },
  {
    category: '정부/공공',
    expectedNew: ['사업자등록 진위확인', 'KOSIS 국가통계 조회', '서울 실시간 혼잡도 조회', '기부처 조회'],
  },
  { category: '스포츠/엔터', expectedNew: ['한국 마라톤·철인3종 일정 조회', '공연 잔여석 조회'] },
  {
    category: '부동산/금융',
    expectedNew: ['당근중고차 검색', '당근부동산 검색', '개별공시지가 조회', '대신증권 리포트 조회'],
  },
  { category: '기타', expectedNew: ['당근알바 검색'] },
];

test.describe('K-Skill new skill registrations render in UI', () => {
  for (const { category, expectedNew } of cases) {
    test(`"${category}" renders ${expectedNew.length} new skill(s)`, async ({ page }) => {
      await navigateToCategory(page, category);

      const labels = (await page.locator('[data-testid="choice-btn"]').allTextContents()).map((t) =>
        t.trim(),
      );

      for (const name of expectedNew) {
        const found = labels.some((l) => l.includes(name));
        expect(
          found,
          `Skill "${name}" missing from "${category}". Labels seen: ${labels.join(' | ')}`,
        ).toBe(true);
      }
    });
  }

  test('clicking a new skill shows its hao-che description', async ({ page }) => {
    await navigateToCategory(page, '교통/예약');
    await page.locator('[data-testid="choice-btn"]', { hasText: '고속버스 예매' }).click();
    await waitForState(page, 'skill_detail', 8000);
    await waitForTypingDone(page);

    const text = await page.locator('[data-testid="dialogue-text"]').textContent();
    expect(text).toBeTruthy();
    expect(/짐|그대|하오|이오|드리겠소|드리리라/.test(text || '')).toBe(true);
    expect(/KOBUS|고속버스|우등|프리미엄|시간표|좌석/.test(text || '')).toBe(true);
  });
});
