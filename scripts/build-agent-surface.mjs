/**
 * build-agent-surface.mjs
 *
 * Generates agent-friendly static surfaces from skills.json.
 * Run before vite build via package.json prebuild hook.
 *
 * Outputs (under public/, copied verbatim into dist/ by vite):
 *   - llms.txt        (llmstxt.org standard — concise LLM index)
 *   - llms-full.txt   (full content for agent context windows)
 *   - skills.json     (raw catalog for programmatic access)
 *   - sitemap.xml     (canonical urls for crawlers)
 *
 * Static surfaces shipped manually under public/ (not generated):
 *   - robots.txt
 *   - .well-known/agent.json
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'public');
const SITE = 'https://k-skill.nomadamas.org';
const REPO = 'https://github.com/NomaDamas/k-skill';

mkdirSync(PUBLIC, { recursive: true });

const data = JSON.parse(readFileSync(resolve(ROOT, 'src/data/skills.json'), 'utf8'));
const { meta, categories, skills, installation } = data;

const skillsByCategory = new Map(categories.map((c) => [c.id, []]));
skills.forEach((s) => {
  const arr = skillsByCategory.get(s.category);
  if (arr) arr.push(s);
});

// ─── llms.txt — concise index per llmstxt.org spec ───────────────────────────
const llms = [
  '# K-Skill',
  '',
  `> 한국 서비스(교통·예약, 음식·생활, 쇼핑, 정부·공공, 문서·검색, 부동산·금융, 스포츠·엔터 등)를 LLM 에이전트가 자연어 슬래시 명령으로 호출할 수 있게 해주는 한국형 스킬 모음. ${meta.total_skills}개 스킬, ${meta.total_categories}개 카테고리, NomaDamas 오픈소스.`,
  '',
  'K-Skill은 Claude Code, Cursor, OpenCode 등 모든 표준 LLM 에이전트가 한국 서비스에 접근할 수 있게 합니다. 각 스킬은 단일 SKILL.md + 보조 스크립트로 구성된 self-contained 패키지입니다. 다수 스킬은 별도 API 키 없이 작동하며, 일부는 사용자 인증 또는 공공데이터 키가 필요합니다.',
  '',
  '## Installation',
  '',
  '```',
  'npx --yes skills add NomaDamas/k-skill --all -g',
  '```',
  '',
  '## Categories',
  '',
  ...categories.map((c) => {
    const list = (skillsByCategory.get(c.id) || []).map((s) => s.command).join(', ');
    return `- **${c.icon} ${c.name_ko}** (${(skillsByCategory.get(c.id) || []).length}): ${list}`;
  }),
  '',
  '## Optional',
  '',
  `- [Full skill catalog (markdown)](${SITE}/llms-full.txt): 44개 스킬 전체 설명·기능·사용 시점`,
  `- [Skills data (JSON)](${SITE}/skills.json): 프로그래밍 접근용 raw catalog`,
  `- [GitHub repository](${REPO}): 소스 코드, SKILL.md, 이슈`,
  `- [Interactive landing](${SITE}/): 세종대왕 알현 컨셉 인터랙티브 탐색기 (사람용)`,
  '',
].join('\n');
writeFileSync(resolve(PUBLIC, 'llms.txt'), llms);

// ─── llms-full.txt — complete agent context ──────────────────────────────────
const sectionsFull = [];
sectionsFull.push('# K-Skill — Full Agent Context');
sectionsFull.push('');
sectionsFull.push(`Source: ${REPO}`);
sectionsFull.push(`Version: ${meta.version}`);
sectionsFull.push(`Total: ${meta.total_skills} skills across ${meta.total_categories} categories`);
sectionsFull.push('');
sectionsFull.push('## Installation');
sectionsFull.push('');
if (installation?.global_intro_ko) sectionsFull.push(installation.global_intro_ko, '');
if (Array.isArray(installation?.global_steps_ko)) {
  installation.global_steps_ko.forEach((s) => sectionsFull.push(s, ''));
}
if (installation?.global_notes_ko) sectionsFull.push(installation.global_notes_ko, '');
if (Array.isArray(installation?.prerequisites_ko)) {
  sectionsFull.push('### Prerequisites');
  installation.prerequisites_ko.forEach((p) => sectionsFull.push(`- ${p}`));
  sectionsFull.push('');
}
if (installation?.secrets_ko) {
  sectionsFull.push('### Credentials');
  sectionsFull.push(installation.secrets_ko, '');
}

sectionsFull.push('## Skills by Category');
sectionsFull.push('');
categories.forEach((cat) => {
  const inCat = skillsByCategory.get(cat.id) || [];
  if (inCat.length === 0) return;
  sectionsFull.push(`### ${cat.icon} ${cat.name_ko}`);
  sectionsFull.push('');
  inCat.forEach((s) => {
    sectionsFull.push(`#### ${s.command} — ${s.name_ko}${s.deprecated ? ' (deprecated)' : ''}`);
    sectionsFull.push('');
    sectionsFull.push(s.description_ko || '');
    sectionsFull.push('');
    if (Array.isArray(s.features_ko) && s.features_ko.length > 0) {
      sectionsFull.push('Features:');
      s.features_ko.forEach((f) => sectionsFull.push(`- ${f}`));
      sectionsFull.push('');
    }
    const special = installation?.special?.[s.id];
    if (special) {
      sectionsFull.push('Special install notes:');
      sectionsFull.push(special, '');
    }
  });
});

writeFileSync(resolve(PUBLIC, 'llms-full.txt'), sectionsFull.join('\n'));

// ─── skills.json — raw catalog ───────────────────────────────────────────────
copyFileSync(resolve(ROOT, 'src/data/skills.json'), resolve(PUBLIC, 'skills.json'));

// ─── og-image.png — derived from palace-bg ───────────────────────────────────
copyFileSync(resolve(ROOT, 'src/assets/palace-bg.png'), resolve(PUBLIC, 'og-image.png'));

// ─── sitemap.xml ─────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const urls = [
  '/',
  '/llms.txt',
  '/llms-full.txt',
  '/skills.json',
  '/.well-known/agent.json',
  '/robots.txt',
];
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(
    (u) =>
      `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`,
  ),
  '</urlset>',
  '',
].join('\n');
writeFileSync(resolve(PUBLIC, 'sitemap.xml'), sitemap);

console.log('[agent-surface] Generated:');
console.log('  public/llms.txt        ', llms.length, 'bytes');
console.log('  public/llms-full.txt   ', sectionsFull.join('\n').length, 'bytes');
console.log('  public/skills.json     (copied from src/data/skills.json)');
console.log('  public/sitemap.xml     ', sitemap.length, 'bytes');
