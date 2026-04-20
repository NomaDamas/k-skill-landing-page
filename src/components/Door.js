export default class Door {
  constructor() {
    this.element = null;
    this._opened = false;
  }

  mount(parent) {
    if (this.element) return;
    this.element = document.createElement('div');
    this.element.id = 'door';
    this.element.setAttribute('data-state', 'closed');
    this.element.setAttribute('aria-label', '궁궐의 문');
    this.element.innerHTML = `
      <div class="door-frame">
        <div class="door-panel" data-side="left">
          <div class="door-lattice"></div>
          <div class="door-trim"></div>
          <div class="door-handle"></div>
        </div>
        <div class="door-panel" data-side="right">
          <div class="door-lattice"></div>
          <div class="door-trim"></div>
          <div class="door-handle"></div>
        </div>
      </div>
      <div class="door-shadow"></div>
    `;
    parent.appendChild(this.element);
  }

  open() {
    return new Promise((resolve) => {
      if (!this.element || this._opened) return resolve();
      this._opened = true;
      this.element.setAttribute('data-state', 'open');

      const panel = this.element.querySelector('.door-panel');
      if (!panel) return resolve();

      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        resolve();
      };

      panel.addEventListener(
        'transitionend',
        (e) => {
          if (e.propertyName === 'transform') finish();
        },
        { once: true }
      );

      setTimeout(finish, 3000);
    });
  }

  close() {
    if (!this.element) return;
    this.element.setAttribute('data-state', 'closed');
    this._opened = false;
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
