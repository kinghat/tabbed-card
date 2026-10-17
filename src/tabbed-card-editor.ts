import type { HomeAssistant, LovelaceConfig } from "custom-card-helpers";
import type { CardConfig, ConfigPath, TabConfig, TabbedCardConfig } from "./types";
import { caption, editList, readAt, replaceAt } from "./editor-model";

const CONTAINERS = new Set([
  'custom:tabbed-card', 'custom:expander-card', 'custom:vertical-stack-in-card',
  'vertical-stack', 'horizontal-stack', 'grid',
]);
const LABELS = {
  'custom:tabbed-card': 'Tabbed Card', 'picture-elements': 'Picture elements',
  'custom:expander-card': 'Expander', 'custom:vertical-stack-in-card': 'Stack in card',
  'vertical-stack': 'Vertical stack', 'horizontal-stack': 'Horizontal stack', 'grid': 'Grid',
};

export class TabbedCardEditor extends HTMLElement {
  private _config!: TabbedCardConfig;
  private _path: ConfigPath = [];
  private _trail: {path: ConfigPath; name: string}[] = [];
  private _sequence = 0;
  private _emitted?: string;
  private _hass!: HomeAssistant;
  private _lovelace?: LovelaceConfig;
  private _native?: any;
  private _picker?: any;
  private _code = false;
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._path = [];
    this._trail = [];
    this._sequence = 0;
  }

  setConfig(config: TabbedCardConfig) {
    if (!config || !Array.isArray(config.tabs)) throw new Error('A tabs array is required.');
    this._config = structuredClone(config);
    if (!readAt(this._config, this._path)) { this._path = []; this._trail = []; }
    // HA echoes emitted configurations; keep the child editor and focus intact.
    if (this._emitted === JSON.stringify(config) && this._native) return;
    this._render();
  }

  connectedCallback() {
    if (this._config) this._render();
  }

  disconnectedCallback() {
    this._sequence++;
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (this._native) this._native.hass = hass;
    if (this._picker) this._picker.hass = hass;
  }
  get hass() { return this._hass; }
  set lovelace(value: LovelaceConfig | undefined) {
    this._lovelace = value;
    if (this._native) this._native.lovelace = value;
  }

  _emit() {
    this._emitted = JSON.stringify(this._config);
    this.dispatchEvent(new CustomEvent('config-changed', {
      bubbles: true, composed: true,
      detail: {config: structuredClone(this._config)},
    }));
  }

  _change(path: ConfigPath, value: unknown) {
    this._config = replaceAt(this._config, path, value);
    this._emit();
  }

  _button(text: string, handler: () => void, parent: HTMLElement, secondary = false) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = text;
    if (secondary) button.className = 'secondary';
    button.addEventListener('click', handler); parent.append(button);
    return button;
  }

  _input(label: string, path: ConfigPath, parent: HTMLElement, kind = 'text', fallback: string | number | boolean = '') {
    const wrapper = document.createElement('label');
    const text = document.createElement('span'); text.textContent = label;
    const input = document.createElement('input');
    input.type = kind; input.setAttribute('aria-label', label);
    const current = readAt(this._config, path);
    if (kind === 'checkbox') input.checked = Boolean(current ?? fallback);
    else input.value = String(current ?? fallback);
    input.addEventListener('change', () => {
      if (kind === 'number' && (!Number.isInteger(input.valueAsNumber) || input.valueAsNumber < 0 || input.valueAsNumber > Number(input.max || Infinity))) { input.setCustomValidity('Use a non-negative integer'); input.reportValidity(); return; }
      input.setCustomValidity('');
      this._change(path, kind === 'checkbox' ? input.checked :
        kind === 'number' ? input.valueAsNumber : input.value);
    });
    wrapper.append(text, input); parent.append(wrapper); return input;
  }

  _navigate(path: ConfigPath, text: string) {
    this._trail.push({path: this._path, name: text});
    this._path = path; this._code = false; this._render();
  }

  _child(label: string, path: ConfigPath, parent: HTMLElement, listPath?: ConfigPath, index = 0) {
    const row = document.createElement('div'); row.className = 'row';
    this._button('Edit · ' + label, () => this._navigate(path, label), row);
    if (listPath) {
      for (const [operation, name] of [['up', 'Up'], ['down', 'Down'], ['copy', 'Copy'], ['delete', 'Delete']] as const) {
        const button = this._button(name, () => {
          this._config = editList(this._config, listPath, index, operation);
          this._emit(); this._render();
        }, row, true);
        button.disabled = operation === 'up' ? index === 0 :
          operation === 'down' ? index === readAt(this._config, listPath).length - 1 : false;
        button.setAttribute('aria-label', label + ' ' + name);
      }
    }
    parent.append(row);
  }

  async _render() {
    if (!this.shadowRoot || !this._config) return;
    const sequence = ++this._sequence;
    this._native = undefined; this._picker = undefined;
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;color:var(--primary-text-color);font:14px var(--paper-font-body1_-_font-family,system-ui)}
      .body{display:grid;gap:12px}p{margin:0;color:var(--secondary-text-color);line-height:1.6}
      h3{font-size:16px;margin:4px 0}label{display:grid;gap:6px}input,select{font:inherit;color:inherit;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:8px;padding:10px;min-width:0}
      input[type=checkbox]{justify-self:start;width:20px;height:20px;accent-color:var(--primary-color)}
      button{font:inherit;text-align:left;cursor:pointer;color:var(--primary-text-color);background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:9px;padding:10px 12px;min-height:42px}
      button:hover{border-color:var(--primary-color)}button:focus-visible,input:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
      button:disabled{opacity:.35;cursor:default}.row{display:flex;flex-wrap:wrap;gap:6px}.row>button:first-child{flex:1;min-width:130px}.secondary{font-size:12px;padding:8px}
      .fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.native{border-top:1px solid var(--divider-color);padding-top:12px;min-width:0}
    </style><div class="body"></div>`;
    const body = this.shadowRoot.querySelector<HTMLElement>('.body')!;
    const node = readAt(this._config, this._path);
    if (this._trail.length) this._button('← Back', () => {
      this._path = this._trail.pop()!.path; this._code = false; this._render();
    }, body);
    const heading = document.createElement('h3');
    heading.textContent = this._trail.at(-1)?.name || (LABELS as Record<string, string>)[node.type] || caption(node);
    body.append(heading);
    if (CONTAINERS.has(node.type)) {
      this._button(this._code ? 'Back to container form' : 'Edit container YAML', () => {
        this._code = !this._code; this._render();
      }, body, true);
      if (this._code) {
        const host = document.createElement('div'); host.className = 'native'; body.append(host);
        await this._mountNative(host, node, sequence, true); return;
      }
    }
    const fields = document.createElement('div'); fields.className = 'fields'; body.append(fields);

    if (node.type === 'custom:tabbed-card') {
      const note = document.createElement('p');
      note.textContent = 'Select a tab, then navigate into its child cards. Save changes with the dashboard editor.'; body.append(note);
      const defaultInput = this._input('Default tab index (starting at 0)', [...this._path, 'options', 'defaultTabIndex'], fields, 'number', 0);
      defaultInput.max = String(Math.max(0, node.tabs.length - 1));
      // Missing options is created only when the field is changed.
      this._button('Add tab', () => {
        this._change([...this._path, 'tabs'], [...node.tabs, {
          attributes: {label: 'New tab'}, card: {type: 'vertical-stack', cards: []},
        }]); this._render();
      }, body, true);
      node.tabs.forEach((tab: TabConfig, index: number) => this._child(tab.attributes?.label || `Tab ${index + 1}`,
        [...this._path, 'tabs', index, 'card'], body, [...this._path, 'tabs'], index));
      return;
    }

    const end = this._path.length;
    if (this._path[end - 1] === 'card' && this._path[end - 3] === 'tabs') {
      const tabPath = this._path.slice(0, -1);
      this._input('Tab label', [...tabPath, 'attributes', 'label'], fields);
      this._input('Tab icon', [...tabPath, 'attributes', 'icon'], fields);
    }
    if (node.type === 'custom:expander-card') {
      this._input('Title (when no title card is configured)', [...this._path, 'title'], fields);
      this._input('Initially expanded', [...this._path, 'expanded'], fields, 'checkbox', false);
      this._input('Animate expansion', [...this._path, 'animation'], fields, 'checkbox', true);
    }
    if (node['title-card']) this._child('Title card', [...this._path, 'title-card'], body);
    if (node.card?.type) this._child('Child card', [...this._path, 'card'], body);
    if (Array.isArray(node.cards)) {
      node.cards.forEach((card: CardConfig, index: number) => this._child(`${index + 1}. ${caption(card)}`,
        [...this._path, 'cards', index], body, [...this._path, 'cards'], index));
      this._button('Add child card', () => this._showPicker(body, [...this._path, 'cards']), body, true);
    }

    if (CONTAINERS.has(node.type)) return;
    const host = document.createElement('div'); host.className = 'native'; body.append(host);
    await this._mountNative(host, node, sequence);
  }

  async _mountNative(host: HTMLElement, node: CardConfig, sequence: number, yaml = false) {
    try {
      const helpers = await (window as any).loadCardHelpers();
      const stack = helpers.createCardElement({type: 'vertical-stack', cards: []});
      await stack.constructor.getConfigElement();
      if (sequence !== this._sequence || !this.isConnected) return;
      const editor = document.createElement('hui-card-element-editor') as any;
      this._native = editor;
      editor.hass = this.hass; editor.lovelace = this._lovelace;
      if (yaml) editor.GUImode = false;
      editor.value = structuredClone(node);
      editor.addEventListener('config-changed', (event: CustomEvent) => {
        event.stopPropagation();
        const detail = event.detail;
        if (sequence !== this._sequence || !detail?.config || detail.error) return;
        // HA emits on initialization and mode changes as well as real edits.
        if (JSON.stringify(detail.config) === JSON.stringify(readAt(this._config, this._path))) return;
        this._change(this._path, detail.config);
      });
      editor.addEventListener('GUImode-changed', (event: CustomEvent) => event.stopPropagation());
      if (!yaml) this._button('Toggle child form / YAML', () => editor.toggleMode(), host, true);
      host.append(editor);
    } catch (error: any) {
      const message = document.createElement('p');
      message.textContent = 'Cannot load child editor: ' + error.message; host.append(message);
    }
  }

  async _showPicker(parent: HTMLElement, path: ConfigPath) {
    if (this._picker) return;
    const sequence = this._sequence;
    const helpers = await (window as any).loadCardHelpers();
    await helpers.createCardElement({type:'vertical-stack',cards:[]}).constructor.getConfigElement();
    if (sequence !== this._sequence || !this.isConnected) return;
    const picker = document.createElement('hui-card-picker') as any; this._picker = picker;
    picker.hass = this.hass; picker.lovelace = this._lovelace;
    picker.addEventListener('config-changed', (event: CustomEvent) => {
      event.stopPropagation(); if (sequence !== this._sequence || !(event as CustomEvent).detail?.config) return;
      this._change(path, [...readAt(this._config, path), (event as CustomEvent).detail.config]); this._render();
    });
    parent.append(picker);
  }
}


customElements.define('tabbed-card-editor', TabbedCardEditor);
declare global {
  interface HTMLElementTagNameMap { 'tabbed-card-editor': TabbedCardEditor; }
}
