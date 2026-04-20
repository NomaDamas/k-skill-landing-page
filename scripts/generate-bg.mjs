import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve API key: env var > scripts/.api-key file (gitignored)
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

const PROMPT = `A wide cinematic photograph of an EMPTY Joseon dynasty Korean royal palace throne room interior, at golden hour dusk. The aesthetic should match Civilization V's Sejong the Great leader meeting scene — painterly, regal, atmospheric.

COMPOSITION (the camera faces the back wall, centered):
- BACK WALL CENTER: A large traditional Korean mountain landscape painting (산수화) — jagged blue-and-purple mountains with golden mist, a pale full moon disc, distant rolling hills, dawn sky gradient from deep indigo to soft amber
- TOP HORIZONTAL BAND: an ornate Dancheong (단청) painted beam in vivid red, royal blue, green, and gold geometric pattern stretching across the entire top of the frame — this is the iconic Korean palace ceiling decoration
- LEFT AND RIGHT EDGES: tall vertical red-lacquered palace pillars (홍기둥) with gold ring bands at top and bottom — keep these very simple and at the literal edges of the frame so they crop cleanly on different aspect ratios
- MID-BACK ON EITHER SIDE OF THE PAINTING: tall hanji paper windows (한지창) glowing with warm amber light from inside, cross-lattice wood grid pattern visible
- UPPER CORNERS: hanging brass Korean palace lanterns with soft warm glow halos
- FLOOR (lower 30%): dark polished wood planks receding in subtle perspective toward the back wall
- THE GEOMETRIC CENTER OF THE FRAME (where a throne would sit) MUST BE COMPLETELY EMPTY — no throne, no chair, no figures, just the back wall painting visible. A CSS-rendered throne and king will be overlaid here.
- THE BOTTOM CENTER 30% should be subdued and uncluttered (this is where a UI dialogue box will sit)

LIGHTING:
- Golden hour / dusk warm illumination
- Soft amber glow from hanji windows and lanterns
- Gentle warm cinematic vignette
- Atmospheric depth, slight haze

STYLE:
- Painterly Korean traditional Minhwa folk-painting aesthetic with subtle photographic depth
- Civilization V game cutscene quality
- Rich saturated palette (palace red #C60C30, gold #F4D03F, dancheong blue #1E3A8A, green #1B5E20)
- Sharp focus on architectural details
- Cinematic 16:9 widescreen composition
- Symmetrical, balanced

STRICT EXCLUSIONS:
- NO people, NO figures, NO Sejong, NO king, NO humans whatsoever
- NO thrones, NO chairs, NO furniture in the center
- NO text, NO characters, NO writing, NO watermarks, NO signatures
- NO modern elements, NO Western architecture, NO Japanese elements
- NO objects in the central foreground area

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
    console.error(`[gen] ${model} FAILED in ${dt}s:`, errText.slice(0, 500));
    return null;
  }

  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart) {
    console.error(`[gen] ${model} no image in response:`, JSON.stringify(json).slice(0, 400));
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
results.push(await generate('gemini-3-pro-image-preview', 'nano-banana-pro.png'));
results.push(await generate('imagen-4.0-ultra-generate-001', 'imagen-4-ultra.png'));

console.log('\nGenerated:', results.filter(Boolean).length, 'images');
