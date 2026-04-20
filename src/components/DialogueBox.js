import TypeIt from 'typeit';
import taegeukgiUrl from '../assets/taegeukgi.svg';

export default class DialogueBox {
  constructor() {
    this.element = null;
    this.textEl = null;
    this.choicesEl = null;
    this._typeit = null;
    this._choiceHandlers = [];
    this._onChoiceClick = this._onChoiceClick.bind(this);
  }

  mount(parent) {
    if (this.element) return;
    if (!parent || typeof parent.appendChild !== 'function') {
      throw new Error('DialogueBox.mount: parent must be an Element');
    }

    const box = document.createElement('div');
    box.id = 'dialogue-box';
    box.setAttribute('data-visible', 'false');
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', '세종대왕의 대화');
    box.innerHTML = `
      <div class="dialogue-leader-card">
        <div class="taeguk" data-testid="taeguk">
          <img src="${taegeukgiUrl}" alt="대한민국 태극기" />
        </div>
        <div class="leader-info">
          <div class="leader-name" data-testid="leader-name">한국 문명의 군주 <br>세종대왕</div>
        </div>
      </div>
      <div class="dialogue-content">
        <div class="dialogue-text" data-testid="dialogue-text"></div>
        <div class="dialogue-choices" data-testid="choices" role="group" aria-label="선택지"></div>
      </div>
    `;

    parent.appendChild(box);

    this.element = box;
    this.textEl = box.querySelector('[data-testid="dialogue-text"]');
    this.choicesEl = box.querySelector('[data-testid="choices"]');

    this.choicesEl.addEventListener('click', this._onChoiceClick);
  }

  _onChoiceClick(e) {
    const btn = e.target.closest('[data-testid="choice-btn"]');
    if (!btn || !this.choicesEl.contains(btn)) return;
    if (btn.getAttribute('data-deprecated') === 'true') return;
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    this._choiceHandlers.forEach((fn) => {
      try {
        fn({ action, value, button: btn });
      } catch (err) {
        console.error('[DialogueBox] choice handler threw:', err);
      }
    });
  }

  show() {
    if (!this.element) return;
    requestAnimationFrame(() => {
      this.element.setAttribute('data-visible', 'true');
    });
  }

  hide() {
    if (!this.element) return;
    this.element.setAttribute('data-visible', 'false');
  }

  typeText(text, { speed = 24, instant = false } = {}) {
    return new Promise((resolve) => {
      if (!this.textEl || !this.element) {
        resolve();
        return;
      }

      if (this._typeit) {
        try { this._typeit.destroy(); } catch (_) { /* noop */ }
        this._typeit = null;
      }
      this.textEl.textContent = '';
      this.textEl.scrollTop = 0;

      const reduced =
        typeof matchMedia === 'function' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduced || instant) {
        this.textEl.textContent = text;
        this.element.dispatchEvent(
          new CustomEvent('typeit-done', { bubbles: true, detail: { text } })
        );
        resolve();
        return;
      }

      this._typeit = new TypeIt(this.textEl, {
        strings: [text],
        speed,
        cursor: false,
        waitUntilVisible: false,
        afterComplete: () => {
          this.element.dispatchEvent(
            new CustomEvent('typeit-done', { bubbles: true, detail: { text } })
          );
          resolve();
        },
      }).go();
    });
  }

  setChoices(choices) {
    if (!this.choicesEl) return;
    this.choicesEl.innerHTML = '';
    if (!Array.isArray(choices) || choices.length === 0) return;

    const frag = document.createDocumentFragment();
    choices.forEach((choice) => {
      if (!choice || typeof choice !== 'object') return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.setAttribute('data-testid', 'choice-btn');
      btn.dataset.action = choice.action || '';
      if (choice.value !== undefined) btn.dataset.value = String(choice.value);
      if (choice.deprecated) {
        btn.dataset.deprecated = 'true';
        btn.setAttribute('aria-disabled', 'true');
      }
      btn.textContent = choice.label == null ? '' : String(choice.label);
      frag.appendChild(btn);
    });
    this.choicesEl.appendChild(frag);
  }

  clearChoices() {
    if (this.choicesEl) this.choicesEl.innerHTML = '';
  }

  onChoice(handler) {
    if (typeof handler === 'function') this._choiceHandlers.push(handler);
  }

}
