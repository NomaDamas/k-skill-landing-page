import './styles/main.css';

import Scene from './components/Scene.js';
import Door from './components/Door.js';
import DialogueBox from './components/DialogueBox.js';
import { DialogueEngine } from './dialogue-engine.js';

const APP_ROOT_ID = 'app';
const DOOR_HOLD_MS = 600;
const DIALOGUE_FADE_IN_MS = 150;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function boot() {
  const app = document.getElementById(APP_ROOT_ID);
  if (!app) {
    console.error(`[main] #${APP_ROOT_ID} not found`);
    return;
  }

  const scene = new Scene();
  scene.mount(app);

  const box = new DialogueBox();
  box.mount(app);
  box.hide();

  const door = new Door();
  door.mount(app);

  document.body.dataset.state = 'door_opening';

  await wait(DOOR_HOLD_MS);

  try {
    await door.open();
  } catch (err) {
    console.warn('[main] Door animation failed:', err);
  }

  box.show();
  await wait(DIALOGUE_FADE_IN_MS);

  const engine = new DialogueEngine({ box });

  try {
    await engine.start();
  } catch (err) {
    console.error('[main] Dialogue engine failed to start:', err);
  }

  if (import.meta.env?.DEV) {
    window.__sejongEngine = engine;
    window.__sejongBox = box;
    window.__sejongDoor = door;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
