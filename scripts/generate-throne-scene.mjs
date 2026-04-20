/**
 * generate-throne-scene.mjs
 *
 * Generates a Civ5 "Meet Sejong" cinematic — palace + throne + Sejong all in one frame.
 * Replaces the empty-throne palace-bg.png (v1) with a populated v2.
 *
 * Iconographic anchors (from librarian research):
 * - Face: Kim Ki-chang 1973 표준영정 / 만원권 portrait
 *   (full dark mid-chest beard, gentle scholarly eyes, oval face, high cheekbones)
 * - Headgear: 익선관 (NOT 면류관) — black gauze cap with two upright cicada-wing flaps
 * - Robe: RED 곤룡포 (NOT yellow — that's emperor post-1897), with GOLD-thread
 *   five-clawed dragon roundels (오조룡보) on chest and shoulders
 * - Belt: jade 옥대
 * - Throne: 용상 (Phoenix Throne) — red lacquer wood, gold dragon armrests,
 *   3-tiered stone dais
 * - Backdrop: 일월오봉도 (Irworobongdo) folding screen BEHIND throne
 *   (sun, moon, five sacred peaks)
 * - Setting: 근정전 (Geunjeongjeon) interior, golden hour, dancheong frieze top
 *
 * Run: node scripts/generate-throne-scene.mjs
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const keyFile = resolve(__dirname, '.api-key');
  if (existsSync(keyFile)) return readFileSync(keyFile, 'utf8').trim();
  return null;
}

const KEY = resolveKey();
if (!KEY) {
  console.error('No API key. Set GEMINI_API_KEY env var or write scripts/.api-key');
  process.exit(1);
}

const PROMPT = `A wide cinematic Civilization V "Meet Sejong the Great" diplomatic-screen scene.
A single regal seated portrait of King Sejong of Joseon on his royal throne, inside Geunjeongjeon (근정전) of Gyeongbokgung Palace, at warm golden-hour dusk.

═══ KING SEJONG (single figure, dead center, facing camera) ═══

FACE — match the canonical 1973 표준영정 / 10,000-won banknote portrait by Kim Ki-chang:
- Full dark beard reaching mid-chest, well-groomed, slightly gray at edges
- Calm, intelligent, gentle eyes — slight downward gaze conveying scholarly wisdom
- Oval face, high prominent cheekbones, dignified straight nose
- Serene closed mouth (NOT smiling, NOT stern)
- Smooth forehead, idealized middle-age (~50)
- Warm, slightly ruddy skin tone
- Recognizable as SEJONG specifically, not a generic Joseon king

HEADGEAR — 익선관 (ikseongwan), the king's everyday cap:
- Matte black silk-gauze cap covering the topknot
- TWO PROMINENT UPRIGHT FAN-SHAPED "CICADA WING" FLAPS rising vertically from the back of the cap (this is iconic and must be visible)
- NOT 면류관 (no flat board, no dangling bead curtains)

ROBE — 곤룡포 (gonryongpo), specifically the king's RED variant (홍룡포):
- Deep scarlet / crimson red silk (color critical: NOT yellow, NOT blue)
- Round collar (원령), straight flowing cut
- LARGE circular GOLD-EMBROIDERED FIVE-CLAWED DRAGON ROUNDEL (오조룡보) prominently visible on the chest, with the dragon facing forward, holding a magic pearl (여의주), surrounded by clouds — this patch is bright gold against red and instantly readable
- Matching dragon roundels on both shoulders
- Subtle woven cloud-and-jewel patterns in the fabric
- Pale jade 옥대 belt at the waist with ornate buckle

POSTURE & HANDS:
- Seated upright on the throne, dignified, shoulders back
- One hand resting on the armrest, the other gently holding a small bound book of Hunminjeongeum (훈민정음) — the Hangul book — at his lap
- Slight forward presence, as if just turning to acknowledge a visitor (Civ5 "leader greets you" energy)

═══ THE THRONE — 용상 (Phoenix Throne) ═══

- Ornate wooden throne, deep RED LACQUER finish with rich GOLD detailing
- Carved GOLD DRAGON HEADS on each armrest, dragons facing outward
- High carved backrest, crowned with a small dancheong frieze (red-blue-green-gold pattern)
- Red silk cushion on the seat
- Throne sits atop a 3-TIERED GRAY GRANITE DAIS / 월대 with carved stone balustrades
- Sejong's feet rest on the topmost tier

═══ BEHIND THE THRONE — 일월오봉도 (Irworobongdo screen) ═══

CRITICAL: The Irworobongdo is a MULTI-PANEL FOLDING SCREEN (병풍) standing UPRIGHT BEHIND THE THRONE — NOT painted onto the throne itself.
- Large screen filling most of the back wall behind Sejong
- Bright RED SUN disc on the upper LEFT
- Pale WHITE-SILVER MOON disc on the upper RIGHT
- FIVE SACRED MOUNTAIN PEAKS in the center, painted in deep blue-green with white snow accents
- Stylized white waves and curling water at the bottom of the screen
- Two slender pine trees flanking the peaks
- Background of the painting: warm gold leaf
- Traditional Korean Minhwa folk-painting style

═══ SURROUNDING ARCHITECTURE ═══

- TOP HORIZONTAL BAND: ornate Dancheong (단청) ceiling beam stretching across the entire top of the frame — vivid red, royal blue, green, and gold geometric pattern
- LEFT AND RIGHT EDGES: tall vertical RED-LACQUERED palace pillars with gold ring bands at top and bottom (kept simple, at literal edges so they crop cleanly on different aspect ratios)
- MID-BACK ON EITHER SIDE OF THE THRONE: tall hanji paper windows (한지창) glowing warm amber from inside, cross-lattice wood grid pattern visible
- UPPER CORNERS: small hanging brass Korean palace lanterns with soft warm glow halos
- FLOOR (lower 30%): dark polished wood planks receding in subtle perspective toward the throne dais
- THE BOTTOM CENTER 30% should be visually subdued and uncluttered (this is where a UI dialogue box will be overlaid)

═══ LIGHTING & ATMOSPHERE ═══

- Warm golden-hour dusk illumination
- Soft amber glow from hanji windows and lanterns
- Gentle warm cinematic vignette darkening the corners
- Soft rim-light on Sejong's shoulders separating him from the screen behind
- Atmospheric depth, faint warm haze

═══ STYLE ═══

- Painterly Korean traditional Minhwa folk-painting aesthetic with subtle photographic depth
- Civilization V leader-greeting cutscene quality (Firaxis art direction: detailed but slightly stylized, not photoreal)
- Rich saturated palette: palace red #C60C30, gold #F4D03F, dancheong blue #1E3A8A, dancheong green #1B5E20
- Sharp focus on Sejong's face and the dragon roundel
- Cinematic 16:9 widescreen composition
- Symmetrical, balanced, centered on the throne

═══ STRICT EXCLUSIONS ═══

- NO yellow / saffron / gold robe (Sejong wore RED — yellow is for emperors after 1897)
- NO 4-clawed dragon (kings wear FIVE-clawed only)
- NO 면류관 (the heavy crown with hanging beads — that's only for major rituals)
- NO Irworobongdo painted on the throne back itself — it MUST be a separate screen BEHIND
- NO additional figures, NO ministers, NO attendants — Sejong ALONE
- NO smiling expression — calm scholarly serenity only
- NO text, NO Korean / Chinese characters, NO writing, NO calligraphy, NO watermarks, NO signatures
- NO modern elements, NO Western architecture, NO Japanese / Chinese (Ming) elements
- NO chandeliers, NO electric lights
- NO weapons, NO swords (Sejong was a scholar-king, not a warrior)

ASPECT RATIO: 16:9 widescreen, highest possible resolution.`;

async function generate(model, outName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  console.log(`[gen] ${model}...`);
  const t0 = Date.now();

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '16:9' },
      },
    }),
  });

  const dt = ((Date.now() - t0) / 1000).toFixed(1);

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[gen] ${model} FAILED in ${dt}s:`, errText.slice(0, 800));
    return null;
  }

  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart) {
    console.error(`[gen] ${model} no image in response:`, JSON.stringify(json).slice(0, 600));
    return null;
  }

  const buf = Buffer.from(imagePart.inlineData.data, 'base64');
  const outPath = resolve(__dirname, '..', 'tests', 'bg-generation', outName);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, buf);
  const sizeKB = (buf.length / 1024).toFixed(1);
  console.log(`[gen] ${model} OK in ${dt}s — ${sizeKB} KB → ${outPath}`);
  return outPath;
}

const results = [];
results.push(await generate('gemini-3-pro-image-preview', 'throne-scene-nano-banana-pro.png'));
results.push(await generate('imagen-4.0-ultra-generate-001', 'throne-scene-imagen-4-ultra.png'));

const ok = results.filter(Boolean);
console.log(`\nGenerated ${ok.length}/2 candidates.`);
if (ok.length === 0) {
  process.exit(1);
}
ok.forEach((p) => console.log('  ↳', p));
