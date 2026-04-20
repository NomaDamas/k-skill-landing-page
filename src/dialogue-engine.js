import skillsData from './data/skills.json';

const GREETING_READ_PAUSE_MS = 1200;

export class DialogueEngine {
  constructor({ box }) {
    this.box = box;
    this.data = skillsData;
    this.currentCategory = null;
    this.currentSkill = null;

    this.categoryMap = new Map(this.data.categories.map((c) => [c.id, c]));
    this.skillMap = new Map(this.data.skills.map((s) => [s.id, s]));
    this.specialInstall = (this.data.installation && this.data.installation.special) || {};

    this.box.onChoice(({ action, value }) => this.handleChoice(action, value));
  }

  async start() {
    await this.transition('greeting');
  }

  handleChoice(action, value) {
    switch (action) {
      case 'go-categories':
        this.transition('category_select');
        break;
      case 'preamble-then-categories':
        this.transition('category_select', { preamble: true });
        break;
      case 'pick-category':
        this.transition('category_intro', { categoryId: value });
        break;
      case 'pick-skill':
        this.transition('skill_detail', { skillId: value });
        break;
      case 'show-install':
        this.transition('installation_global');
        break;
      case 'show-skill-install':
        this.transition('installation_skill', { skillId: value });
        break;
      case 'back-to-skill':
        this.transition('skill_detail', { skillId: this.currentSkill });
        break;
      case 'back-to-intro':
        this.transition('intro_question');
        break;
      case 'back-to-category':
        this.transition('category_intro', { categoryId: this.currentCategory });
        break;
      case 'back-to-categories':
        this.transition('category_select');
        break;
      case 'exit':
        this.transition('outro');
        break;
      case 'restart':
        this.transition('greeting');
        break;
      default:
        console.warn('[DialogueEngine] Unknown action:', action);
    }
  }

  async transition(state, context = {}) {
    document.body.dataset.state = state;
    this.box.clearChoices();

    switch (state) {
      case 'greeting':
        await this.renderGreeting();
        break;
      case 'intro_question':
        await this.renderIntroQuestion();
        break;
      case 'category_select':
        await this.renderCategorySelect(context.preamble);
        break;
      case 'category_intro':
        this.currentCategory = context.categoryId;
        await this.renderCategoryIntro(context.categoryId);
        break;
      case 'skill_detail':
        this.currentSkill = context.skillId;
        await this.renderSkillDetail(context.skillId);
        break;
      case 'installation_global':
        await this.renderInstallationGlobal();
        break;
      case 'installation_skill':
        this.currentSkill = context.skillId;
        await this.renderInstallationSkill(context.skillId);
        break;
      case 'outro':
        await this.renderOutro();
        break;
      default:
        console.warn('[DialogueEngine] Unknown state:', state);
    }
  }

  async renderGreeting() {
    this.box.setMood('환영');
    await this.box.typeText(
      '조선의 궁궐에 당도한 것을 환영하오 낯선이여. 나는 나의 훌륭한 백성들을 굽어 살피는 깨우친 임금 세종이오.'
    );
    await new Promise((resolve) => setTimeout(resolve, GREETING_READ_PAUSE_MS));
    if (document.body.dataset.state === 'greeting') {
      await this.transition('intro_question');
    }
  }

  async renderIntroQuestion() {
    this.box.setMood('호기심');
    await this.box.typeText(
      '조선의 제일 가는 인공 지능 기술 모음집에 대해서 알아보겠는가?'
    );
    this.box.setChoices([
      { label: '예, 알고 싶소', action: 'go-categories' },
      { label: '더 자세히 듣고 싶소', action: 'preamble-then-categories' },
      { label: '먼저 설치 방법을 알고 싶소', action: 'show-install' },
    ]);
  }

  async renderCategorySelect(preamble = false) {
    this.box.setMood('중립적');
    let text = '어느 분야가 궁금하시오? 짐이 그 분야의 도구들을 일러드리겠소.';
    if (preamble) {
      text =
        '좋소. 이 모음집은 조선의 학자들이 모은 도구의 보고(寶庫)요. 길흉화복(吉凶禍福)을 점치는 일부터 백성의 일상사까지 두루 다루오.\n\n어느 분야가 궁금하시오?';
    }
    await this.box.typeText(text);

    const choices = this.data.categories.map((cat) => ({
      label: `${cat.icon} ${cat.name_ko}`,
      action: 'pick-category',
      value: cat.id,
    }));
    choices.push({ label: '물러가겠소', action: 'exit' });
    this.box.setChoices(choices);
  }

  async renderCategoryIntro(categoryId) {
    const cat = this.categoryMap.get(categoryId);
    if (!cat) {
      console.warn('[DialogueEngine] Unknown category:', categoryId);
      return this.transition('category_select');
    }

    this.box.setMood('설명');
    const text = `${cat.sejong_intro}\n\n이 분야에는 다음과 같은 도구들이 있소:`;
    await this.box.typeText(text);

    const skillButtons = cat.skill_ids
      .map((sid) => {
        const skill = this.skillMap.get(sid);
        if (!skill) return null;
        return {
          label: skill.name_ko + (skill.deprecated ? ' (지원 중단)' : ''),
          action: 'pick-skill',
          value: skill.id,
          deprecated: !!skill.deprecated,
        };
      })
      .filter(Boolean);

    skillButtons.push({ label: '다른 분야를 보겠소', action: 'back-to-categories' });
    skillButtons.push({ label: '물러가겠소', action: 'exit' });
    this.box.setChoices(skillButtons);
  }

  async renderSkillDetail(skillId) {
    const skill = this.skillMap.get(skillId);
    if (!skill) {
      console.warn('[DialogueEngine] Unknown skill:', skillId);
      return this.transition('category_select');
    }

    this.box.setMood(skill.deprecated ? '아쉬움' : '설명');
    const features = (skill.features_ko || []).map((f) => `• ${f}`).join('\n');
    const text = `[${skill.name_ko}]\n\n${skill.description_ko}\n\n[이 도구의 기능]\n${features}`;
    await this.box.typeText(text);

    const choices = [];
    if (!skill.deprecated) {
      choices.push({
        label: '설치 방법을 보겠소',
        action: 'show-skill-install',
        value: skill.id,
      });
    }
    choices.push({ label: '이 분야 다른 기술을 보겠소', action: 'back-to-category' });
    choices.push({ label: '다른 분야로', action: 'back-to-categories' });
    choices.push({ label: '물러가겠소', action: 'exit' });
    this.box.setChoices(choices);
  }

  async renderInstallationGlobal() {
    this.box.setMood('가르침');
    const inst = this.data.installation || {};
    const intro = inst.global_intro_ko || '';
    const steps = (inst.global_steps_ko || []).join('\n\n');
    const notes = inst.global_notes_ko || '';
    const prereq = inst.prerequisites_ko
      ? `\n\n[갖추어야 할 것]\n${inst.prerequisites_ko.map((p) => `• ${p}`).join('\n')}`
      : '';
    const secrets = inst.secrets_ko ? `\n\n[자격 증명]\n${inst.secrets_ko}` : '';
    const text = `${intro}\n\n${steps}\n\n${notes}${prereq}${secrets}`;
    await this.box.typeText(text, { instant: true });

    this.box.setChoices([
      { label: '도구를 살펴보겠소', action: 'go-categories' },
      { label: '처음 안내로 돌아가겠소', action: 'back-to-intro' },
      { label: '물러가겠소', action: 'exit' },
    ]);
  }

  async renderInstallationSkill(skillId) {
    const skill = this.skillMap.get(skillId);
    if (!skill) {
      console.warn('[DialogueEngine] Unknown skill:', skillId);
      return this.transition('category_select');
    }

    this.box.setMood('가르침');
    const baseLine =
      '먼저 짐의 도구 모음집을 한 줄로 깃들이시오:\n  npx --yes skills add NomaDamas/k-skill --all -g';
    const special = this.specialInstall[skillId];
    const extra = special
      ? `\n\n[이 도구만의 추가 준비]\n${special}`
      : '\n\n이 도구는 모음집 설치만으로 바로 쓸 수 있소. 추가 준비는 필요치 않소.';
    const text = `[${skill.name_ko} 설치 방법]\n\n${baseLine}${extra}`;
    await this.box.typeText(text, { instant: true });

    const choices = [
      { label: '이 도구의 설명을 다시 보겠소', action: 'back-to-skill' },
      { label: '이 분야 다른 기술을 보겠소', action: 'back-to-category' },
      { label: '다른 분야로', action: 'back-to-categories' },
      { label: '물러가겠소', action: 'exit' },
    ];
    this.box.setChoices(choices);
  }

  async renderOutro() {
    this.box.setMood('작별');
    await this.box.typeText(
      '또 만나기를 고대하겠소. 부디 평안히 가시오. 짐의 도구들이 그대의 길을 밝히기를.'
    );
    this.box.setChoices([{ label: '다시 알현을 청하오', action: 'restart' }]);
  }
}

export default DialogueEngine;
