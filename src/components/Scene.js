const SEJONG_SVG = `
  <svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
    <defs>
      <linearGradient id="sejong-robe-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stop-color="#e0243a"/>
        <stop offset="55%" stop-color="#c60c30"/>
        <stop offset="100%" stop-color="#8b0000"/>
      </linearGradient>
      <radialGradient id="sejong-medallion-grad" cx="0.5" cy="0.45" r="0.6">
        <stop offset="0%"   stop-color="#fff3a8"/>
        <stop offset="55%"  stop-color="#f4d03f"/>
        <stop offset="100%" stop-color="#c9a227"/>
      </radialGradient>
      <linearGradient id="sejong-hat-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#2a2a2a"/>
        <stop offset="100%" stop-color="#0d0d0d"/>
      </linearGradient>
      <linearGradient id="sejong-skin-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#faf0e6"/>
        <stop offset="100%" stop-color="#e6d4ba"/>
      </linearGradient>
    </defs>

    <ellipse cx="100" cy="308" rx="92" ry="7" fill="#000" opacity="0.4"/>

    <path d="M 36 128 Q 100 108 164 128 L 188 302 L 12 302 Z" fill="url(#sejong-robe-grad)"/>
    <path d="M 54 138 Q 100 122 146 138 L 166 292 L 34 292 Z" fill="#6a0000" opacity="0.4"/>

    <path d="M 14 176 Q 6 206 14 244 Q 36 250 52 236 L 50 156 Q 28 162 14 176 Z"
          fill="url(#sejong-robe-grad)"/>
    <path d="M 186 176 Q 194 206 186 244 Q 164 250 148 236 L 150 156 Q 172 162 186 176 Z"
          fill="url(#sejong-robe-grad)"/>

    <path d="M 14 240 Q 32 248 52 236" stroke="#f4d03f" stroke-width="2.5" fill="none" opacity="0.9"/>
    <path d="M 186 240 Q 168 248 148 236" stroke="#f4d03f" stroke-width="2.5" fill="none" opacity="0.9"/>
    <path d="M 14 240 Q 32 248 52 236" stroke="#c9a227" stroke-width="1" fill="none"/>
    <path d="M 186 240 Q 168 248 148 236" stroke="#c9a227" stroke-width="1" fill="none"/>

    <path d="M 36 128 Q 100 108 164 128" stroke="#f4d03f" stroke-width="3" fill="none"/>
    <path d="M 12 302 L 188 302" stroke="#f4d03f" stroke-width="2.5" fill="none"/>
    <line x1="100" y1="132" x2="100" y2="296" stroke="#f4d03f" stroke-width="2.2" opacity="0.85"/>
    <line x1="100" y1="132" x2="100" y2="296" stroke="#c9a227" stroke-width="0.8" opacity="0.8"/>

    <ellipse cx="58" cy="144" rx="20" ry="10" fill="#f4d03f" opacity="0.9"/>
    <ellipse cx="58" cy="144" rx="20" ry="10" fill="none" stroke="#c9a227" stroke-width="1.2"/>
    <ellipse cx="142" cy="144" rx="20" ry="10" fill="#f4d03f" opacity="0.9"/>
    <ellipse cx="142" cy="144" rx="20" ry="10" fill="none" stroke="#c9a227" stroke-width="1.2"/>

    <circle cx="100" cy="196" r="34" fill="url(#sejong-medallion-grad)"/>
    <circle cx="100" cy="196" r="34" fill="none" stroke="#c9a227" stroke-width="2.5"/>
    <circle cx="100" cy="196" r="28" fill="none" stroke="#8b0000" stroke-width="1" opacity="0.55"/>
    <path d="M 86 196 Q 92 180 102 184 Q 114 190 110 202 Q 106 212 96 208 Q 90 204 92 196"
          fill="#8b0000" opacity="0.7"/>
    <path d="M 96 196 Q 102 186 110 192 Q 112 198 104 202 Q 98 200 96 196"
          fill="#6a0000" opacity="0.6"/>
    <circle cx="99" cy="190" r="2.2" fill="#f4d03f"/>
    <circle cx="105" cy="198" r="1.3" fill="#fff3a8" opacity="0.9"/>

    <rect x="28" y="240" width="144" height="14" fill="#8b0000" opacity="0.85"/>
    <rect x="28" y="240" width="144" height="3"  fill="#f4d03f" opacity="0.9"/>
    <rect x="28" y="251" width="144" height="2"  fill="#c9a227" opacity="0.8"/>

    <rect x="92" y="228" width="16" height="40" rx="2" fill="#f4d03f"/>
    <rect x="92" y="228" width="16" height="40" rx="2" fill="none" stroke="#c9a227" stroke-width="1.5"/>
    <line x1="100" y1="232" x2="100" y2="264" stroke="#8b0000" stroke-width="1" opacity="0.5"/>

    <ellipse cx="78" cy="262" rx="14" ry="10" fill="url(#sejong-skin-grad)"/>
    <ellipse cx="122" cy="262" rx="14" ry="10" fill="url(#sejong-skin-grad)"/>
    <path d="M 70 260 L 130 260" stroke="#c4a080" stroke-width="0.8" opacity="0.5"/>

    <path d="M 80 120 L 100 105 L 120 120 L 118 136 Q 100 128 82 136 Z" fill="url(#sejong-skin-grad)"/>
    <path d="M 82 130 Q 100 122 118 130" stroke="#a8926e" stroke-width="1" fill="none" opacity="0.6"/>

    <ellipse cx="100" cy="84" rx="27" ry="33" fill="url(#sejong-skin-grad)"/>
    <path d="M 73 78 Q 75 100 82 114 Q 86 116 86 112 Q 80 98 80 80 Z" fill="#d9bc96" opacity="0.4"/>

    <path d="M 83 74 Q 88 71 94 74" stroke="#0d0d0d" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M 106 74 Q 112 71 117 74" stroke="#0d0d0d" stroke-width="1.6" fill="none" stroke-linecap="round"/>

    <path d="M 83 84 Q 88 83 93 84" stroke="#0d0d0d" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M 107 84 Q 112 83 117 84" stroke="#0d0d0d" stroke-width="1.8" fill="none" stroke-linecap="round"/>

    <path d="M 100 90 Q 97 100 95 106 Q 100 109 105 106 Q 103 100 100 90 Z" fill="#d9bc96" opacity="0.55"/>

    <path d="M 94 110 Q 100 112 106 110" stroke="#6a2020" stroke-width="1.4" fill="none" stroke-linecap="round"/>

    <path d="M 87 106 Q 94 112 100 110 Q 106 112 113 106 L 111 114 Q 100 116 89 114 Z"
          fill="#0d0d0d" opacity="0.75"/>
    <path d="M 84 114 Q 100 140 116 114 L 114 128 Q 100 136 86 128 Z" fill="#0d0d0d" opacity="0.75"/>
    <line x1="100" y1="130" x2="100" y2="144" stroke="#0d0d0d" stroke-width="1.1" opacity="0.55"/>

    <ellipse cx="72" cy="88" rx="4" ry="7" fill="url(#sejong-skin-grad)"/>
    <ellipse cx="128" cy="88" rx="4" ry="7" fill="url(#sejong-skin-grad)"/>

    <path d="M 66 58 Q 68 46 100 44 Q 132 46 134 58 L 132 64 Q 100 60 68 64 Z"
          fill="url(#sejong-hat-grad)"/>
    <path d="M 70 48 Q 74 22 92 20 Q 100 12 108 20 Q 126 22 130 48 Q 118 52 100 50 Q 82 52 70 48 Z"
          fill="url(#sejong-hat-grad)"/>
    <ellipse cx="100" cy="24" rx="18" ry="13" fill="#1a1a1a"/>

    <circle cx="100" cy="28" r="4" fill="#f4d03f"/>
    <circle cx="100" cy="28" r="4" fill="none" stroke="#c9a227" stroke-width="0.8"/>

    <path d="M 66 60 Q 46 60 38 72 Q 52 74 70 66 Z" fill="url(#sejong-hat-grad)"/>
    <path d="M 134 60 Q 154 60 162 72 Q 148 74 130 66 Z" fill="url(#sejong-hat-grad)"/>
    <path d="M 66 60 Q 46 60 38 72" stroke="#c9a227" stroke-width="0.8" fill="none" opacity="0.75"/>
    <path d="M 134 60 Q 154 60 162 72" stroke="#c9a227" stroke-width="0.8" fill="none" opacity="0.75"/>

    <path d="M 68 58 L 132 58" stroke="#f4d03f" stroke-width="1" opacity="0.5"/>
  </svg>
`;

const SCENE_TEMPLATE = `
  <div class="palace-backdrop">
    <div class="mountain-painting"></div>
    <div class="hanji-window hanji-left"></div>
    <div class="hanji-window hanji-right"></div>
    <div class="lantern lantern-left"></div>
    <div class="lantern lantern-right"></div>
    <div class="dancheong-band"></div>
  </div>
  <a id="hyeonpan" class="palace-hyeonpan" data-testid="hyeonpan"
     href="https://github.com/NomaDamas/k-skill"
     target="_blank"
     rel="noopener noreferrer"
     aria-label="케이-스킬 GitHub 저장소 (NomaDamas/k-skill)로 이동">
    <div class="hyeonpan-rope hyeonpan-rope-left"></div>
    <div class="hyeonpan-rope hyeonpan-rope-right"></div>
    <div class="hyeonpan-board">
      <span class="hyeonpan-text">케이-스킬</span>
    </div>
  </a>
  <div class="palace-pillar pillar-left"></div>
  <div class="palace-pillar pillar-right"></div>
  <div class="palace-floor"></div>
  <div class="throne-dais">
    <div class="throne-back"></div>
    <div class="throne-seat"></div>
  </div>
  <div id="sejong" class="sejong-figure" aria-label="세종대왕" role="img">
    ${SEJONG_SVG}
  </div>
  <div class="palace-vignette"></div>
`;

export default class Scene {
  constructor() {
    this.element = null;
  }

  mount(parent) {
    if (!parent || this.element) return this.element;

    const root = document.createElement('div');
    root.id = 'scene';
    root.setAttribute('aria-hidden', 'false');
    root.setAttribute('role', 'img');
    root.setAttribute('aria-label', '조선 궁궐 어전 — 세종대왕 어좌');
    root.innerHTML = SCENE_TEMPLATE;

    parent.appendChild(root);
    this.element = root;
    return root;
  }

  unmount() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
