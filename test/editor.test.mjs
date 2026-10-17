import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {fixture} from './fixture.mjs';
const window = new Window();
for (const name of ['window', 'document', 'HTMLElement', 'customElements', 'CustomEvent', 'Event']) {
  globalThis[name] = name === 'window' ? window : window[name];
}
class ChildEditor extends HTMLElement {
  set value(value) { this._value = value; queueMicrotask(() => this.dispatchEvent(new CustomEvent('config-changed', {detail:{config:this._value}}))); }
  get value() { return this._value; }
  toggleMode() { this.yaml = !this.yaml; }
}
class Picker extends HTMLElement {}
customElements.define('hui-card-element-editor', ChildEditor);
customElements.define('hui-card-picker', Picker);
let delay;
window.loadCardHelpers = async () => {
  if (delay) await delay;
  return {createCardElement: () => ({constructor: {getConfigElement: async () => document.createElement('div')}})};
};
await import('../.test-build/tabbed-card-editor.js');
const tick = () => new Promise(resolve => setImmediate(resolve));
function create() {
  const editor = document.createElement('tabbed-card-editor');
  editor.hass = {states: {}}; document.body.append(editor); editor.setConfig(fixture);
  return editor;
}
function click(editor, label) {
  const button = [...editor.shadowRoot.querySelectorAll('button')].find(b => b.textContent === label);
  assert.ok(button, label); button.click();
}
const leafPath = ['tabs', 0, 'card', 'cards', 1, 'cards', 0, 'cards', 0];

test('opening, navigating, closing and reopening emits no changes', () => {
  const editor = create(); const events = [];
  editor.addEventListener('config-changed', e => events.push(e.detail));
  editor.setConfig(fixture); click(editor, 'Edit · Rooms'); click(editor, '← Back');
  editor.remove(); document.body.append(editor); editor.setConfig(fixture);
  assert.deepEqual(editor._config, fixture); assert.equal(events.length, 0); editor.remove();
});

test('native child events emit the full root; YAML toggles and echo preserve the native editor', async () => {
  const editor = create(); const changes = [];
  editor.addEventListener('config-changed', e => changes.push(e.detail.config));
  editor._navigate(leafPath, 'Lamp'); await tick();
  const native = editor.shadowRoot.querySelector('hui-card-element-editor'); assert.ok(native);
  native.dispatchEvent(new CustomEvent('config-changed', {bubbles:true,composed:true,detail:{config:{...native.value,name:'New'}}}));
  assert.equal(changes.length, 1); assert.equal(changes[0].type, 'custom:tabbed-card');
  assert.deepEqual(changes[0].tabs[1], fixture.tabs[1]);
  assert.deepEqual(changes[0].tabs[0].card.cards[0], fixture.tabs[0].card.cards[0]);
  editor.setConfig(changes[0]); assert.equal(editor._native, native);
  click(editor, 'Toggle child form / YAML'); assert.equal(native.yaml, true);
  const reopened = create(); reopened.setConfig(changes[0]); assert.deepEqual(reopened._config, changes[0]);
  editor.remove(); reopened.remove();
});

test('stale asynchronous child creation and old child events cannot write into another card', async () => {
  const editor = create(); const events=[]; editor.addEventListener('config-changed',e=>events.push(e.detail));
  let release; delay = new Promise(resolve => release = resolve);
  editor._navigate(leafPath, 'Lamp'); click(editor, '← Back'); release(); delay = undefined; await tick();
  assert.equal(editor.shadowRoot.querySelector('hui-card-element-editor'), null);
  editor._navigate(leafPath, 'Lamp'); await tick(); const old = editor._native;
  editor._navigate(['tabs',1,'card'], 'Other'); await tick();
  old.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{type:'markdown',content:'stale'}}}));
  assert.equal(events.length,0); assert.deepEqual(editor._config,fixture); editor.remove();
});

test('pickers, tab operations, optional parent fields and invalid numeric input are safe', async () => {
  const editor = create(); let config;
  editor.addEventListener('config-changed', e => config = e.detail.config);
  click(editor, 'Add tab'); assert.equal(config.tabs.length, 3);
  editor.shadowRoot.querySelector('[aria-label="New tab Delete"]').click(); assert.equal(config.tabs.length, 2);
  editor._navigate(['tabs',0,'card'], 'Rooms'); click(editor,'Add child card'); await tick();
  editor._picker.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{type:'markdown',content:'Synthetic'}}}));
  assert.equal(config.tabs[0].card.cards.at(-1).content,'Synthetic');
  assert.deepEqual(config.tabs[1],fixture.tabs[1]);
  editor.setConfig(fixture); editor._path=[]; editor._trail=[]; editor._render();
  const input=editor.shadowRoot.querySelector('input[type=number]'); input.value='-1';
  const previous=structuredClone(editor._config); input.dispatchEvent(new Event('change'));
  assert.deepEqual(editor._config,previous); editor.remove();
});

test('HA initialization, invalid YAML and container YAML round trips preserve the root', async () => {
  const editor=create();const changes=[];editor.addEventListener('config-changed',e=>changes.push(e.detail.config));
  click(editor,'Edit container YAML');await tick();
  assert.equal(editor._native.GUImode,false);assert.equal(changes.length,0);
  editor._native.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{type:'invalid'},error:'Invalid YAML'}}));
  assert.equal(changes.length,0);
  const changed=structuredClone(fixture);changed.styles['--example']='preserved';
  editor._native.dispatchEvent(new CustomEvent('config-changed',{detail:{config:changed}}));
  assert.deepEqual(changes,[changed]);click(editor,'Back to container form');
  assert.deepEqual(editor._config,changed);editor.remove();
});
