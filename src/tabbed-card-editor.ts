import { LitElement, html, css } from "lit";
import { customElement, state, property, query } from "lit/decorators.js";
import { HomeAssistant, fireEvent, LovelaceConfig } from "custom-card-helpers";
import type { TabbedCardConfig, TabConfig } from "./types";
import { editorConfigProperties } from "./types";
import { getSCHEMA } from "./schema";

@customElement("tabbed-card-editor")
export class TabbedCardEditor extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() public lovelace!: LovelaceConfig;

  @state() protected _config?: TabbedCardConfig;
  @state() private _localTabSelection = 0;
  @state() private _globalConfigTabSelection = 0;
  @state() private _localConfigTabSelection = 0;
  @state() private _isGlobalConfigExpanded = false;
  @state() private _isLocalConfigExpanded = false;
  @state() private _cardGUIMode = true;
  @state() private _cardGUIModeAvailable = true;

  @query("hui-card-element-editor") protected _cardEditorElement;

  setConfig(config: TabbedCardConfig) {
    if (!config) throw new Error("No configuration.");

    this._config = config;
  }

  private async _handleSelectedTab(ev) {
    if (!this._config) throw new Error("No configuration.");

    if (ev.target.id === "add-card") {
      this._localTabSelection = this._config.tabs.length;

      return;
    }

    if (ev.target.id == "local-tabs") {
      this._localConfigTabSelection = ev.detail.selected;

      return;
    }
    if (ev.target.id == "global-tabs") {
      this._globalConfigTabSelection = ev.detail.selected;

      return;
    }

    this._setMode(true);

    this._cardGUIModeAvailable = true;
    this._localTabSelection = ev.detail.selected;

    this._fireSelectedTabEvent();
  }

  protected _handleConfigChanged(ev: CustomEvent) {
    ev.stopPropagation();

    if (!this._config) return;

    const cardConfig = ev.detail.config;
    const { card, ...localConfig } = this._config.tabs[this._localTabSelection];
    const tab = { card: cardConfig, ...localConfig };
    const tabs = [...this._config.tabs];

    tabs[this._localTabSelection] = tab;
    this._config = { ...this._config, tabs };
    this._cardGUIModeAvailable = ev.detail.guiModeAvailable;

    fireEvent(this, "config-changed", { config: this._config });
  }

  private _handleExpandedFormConfigChanged(ev): void {
    // global or local property changes should never change each others configurations

    if (!this._config) return;

    const eventValue = ev.detail.value;

    if (ev.currentTarget?.id == "global-form") {
      const propertyKey =
        editorConfigProperties[this._globalConfigTabSelection];
      const newPropertyValue = {
        ...this._config?.[propertyKey],
        ...eventValue,
      };

      this._config = { ...this._config, [propertyKey]: newPropertyValue };
    } else {
      // isDefaultTab from the local config is specially handled because it doesnt ever exist
      // as a property in the local config. its only used to set the global config defaultTabIndex
      // property.
      const isDefaultTab = eventValue?.isDefaultTab;

      if (isDefaultTab) {
        this._config = {
          ...this._config,
          options: { defaultTabIndex: this._localTabSelection },
        };

        fireEvent(this, "config-changed", { config: this._config });

        return;
      }

      // TODO: sort out the handling of empty tab label(undefined) and tab icon as empty string("").

      const tabs = [...this._config?.tabs];
      let tab = tabs[this._localTabSelection];
      const propertyKey = editorConfigProperties[this._localConfigTabSelection];
      const localProperty = tab?.[propertyKey] ?? {};
      const globalProperty = this._config?.[propertyKey] ?? {};
      const tempProperty = { ...globalProperty, ...localProperty };
      const changedProperty = Object.fromEntries(
        Object.entries(eventValue).filter(
          ([key, value]) => !Object.is(tempProperty[key], value),
        ),
      );
      const newLocalProperty = {
        ...localProperty,
        ...changedProperty,
      };

      tab = { ...tab, [propertyKey]: newLocalProperty };
      tabs[this._localTabSelection] = tab;
      this._config = { ...this._config, tabs };
    }

    fireEvent(this, "config-changed", { config: this._config });
  }

  protected _handleGUIModeChanged(ev): void {
    ev.stopPropagation();

    this._cardGUIMode = ev.detail.guiMode;
    this._cardGUIModeAvailable = ev.detail.guiModeAvailable;
  }

  protected _handleCardPicked(ev) {
    ev.stopPropagation();
    if (!this._config) return;

    const cardConfig = ev.detail.config;
    const tabs = [...this._config.tabs, { card: cardConfig }];

    this._config = { ...this._config, tabs };

    fireEvent(this, "config-changed", { config: this._config });
    this._fireSelectedTabEvent();
  }

  protected _handleDeleteCard() {
    if (!this._config) return;

    const tabs = [...this._config.tabs];

    tabs.splice(this._localTabSelection, 1);

    this._config = { ...this._config, tabs };
    this._localTabSelection =
      this._localTabSelection == 0
        ? this._localTabSelection
        : this._localTabSelection - 1;

    fireEvent(this, "config-changed", { config: this._config });
    this._fireSelectedTabEvent();
  }

  protected _handleMove(ev: Event) {
    if (!this._config) return;

    const move = ev.currentTarget?.move;
    const source = this._localTabSelection;
    const target = source + move;
    const tabs = [...this._config.tabs];
    const tab = tabs.splice(this._localTabSelection, 1)[0];

    tabs.splice(target, 0, tab);

    this._config = {
      ...this._config,
      tabs,
    };
    this._localTabSelection = target;

    fireEvent(this, "config-changed", { config: this._config });
    this._fireSelectedTabEvent();
  }

  protected _setMode(value: boolean): void {
    this._cardGUIMode = value;

    if (this._cardEditorElement) {
      this._cardEditorElement!.GUImode = value;
    }
  }

  protected _toggleMode(): void {
    this._cardEditorElement?.toggleMode();
  }

  public focusYamlEditor() {
    this._cardEditorElement?.focusYamlEditor();
  }

  protected _fireSelectedTabEvent() {
    fireEvent(
      this,
      "tabbed-card",
      { selectedTab: this._localTabSelection },
      { bubbles: true, composed: true },
    );
  }

  private _handleExpansionPanelChanged(ev) {
    if (ev.currentTarget.id == "global-tab-configuration") {
      this._isGlobalConfigExpanded = !this._isGlobalConfigExpanded;
    }

    if (ev.currentTarget.id == "local-tab-configuration") {
      this._localConfigTabSelection = this._localConfigTabSelection;
      this._isLocalConfigExpanded = !this._isLocalConfigExpanded;
    }
  }

  private _renderConfigurationEditor(config: TabbedCardConfig | TabConfig) {
    const configurationScope = "tabs" in config ? "global" : "local";
    const selection =
      configurationScope == "global"
        ? this._globalConfigTabSelection
        : this._localConfigTabSelection;
    const configurationKey = editorConfigProperties[selection];
    const globalConfigProp = this._config?.[configurationKey];
    const getDefaultTabProperty = () => {
      const defaultTabIndex = this._config?.options?.defaultTabIndex || 0;

      if (configurationScope == "local" && configurationKey == "options") {
        const isDefaultTab = defaultTabIndex == this._localTabSelection;

        return { isDefaultTab };
      }
      if (configurationScope == "global" && configurationKey == "options") {
        return { defaultTabIndex };
      }

      return {};
    };
    const isDisabled = getDefaultTabProperty().isDefaultTab;
    const data = {
      ...globalConfigProp,
      ...config?.[configurationKey],
      ...getDefaultTabProperty(),
    };

    return html`
      <ha-form
        id="${configurationScope}-form"
        .hass=${this.hass}
        .data=${data}
        .disabled=${isDisabled}
        .schema=${getSCHEMA({ ...globalConfigProp }, config)[selection]}
        .computeLabel=${(s) => s.label ?? s.name}
        .label=${"This Forms Label"}
        @value-changed=${(ev) => this._handleExpandedFormConfigChanged(ev)}
      ></ha-form>
    `;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    return html`
      <div class="card-config">
        ${this._localTabSelection < this._config.tabs.length
          ? html`
              <div
                id="global-tab-configuration"
                @expanded-changed=${this._handleExpansionPanelChanged}
              >
                <ha-expansion-panel outlined>
                  <div slot="header">Global Tab Configuration</div>
                  <div class="content">
                    <div class="toolbar">
                      <paper-tabs
                        id="global-tabs"
                        .selected=${this._globalConfigTabSelection}
                        @iron-activate=${this._handleSelectedTab}
                      >
                        <!-- workaround to allow selectionBar to establish itself -->
                        ${this._isGlobalConfigExpanded
                          ? editorConfigProperties.map(
                              (tabName) =>
                                html`<paper-tab>${tabName}</paper-tab>`,
                            )
                          : ``}
                      </paper-tabs>
                    </div>
                    ${this._isGlobalConfigExpanded
                      ? this._renderConfigurationEditor(this._config)
                      : ``}
                  </div>
                </ha-expansion-panel>
              </div>

              <div class="toolbar">
                <paper-tabs
                  scrollable
                  .selected=${this._localTabSelection}
                  @iron-activate=${this._handleSelectedTab}
                >
                  ${this._config.tabs.map(
                    (_tab, tabIndex) =>
                      html` <paper-tab> ${tabIndex} </paper-tab> `,
                  )}
                </paper-tabs>
                <paper-tabs
                  id="add-card"
                  .selected=${this._localTabSelection ===
                  this._config.tabs.length
                    ? "0"
                    : undefined}
                  @iron-activate=${this._handleSelectedTab}
                >
                  <paper-tab>
                    <ha-icon icon="mdi:plus"></ha-icon>
                  </paper-tab>
                </paper-tabs>
              </div>
              <div id="editor">
                <div id="card-options">
                  <mwc-button
                    @click=${this._toggleMode}
                    .disabled=${!this._cardGUIModeAvailable}
                    class="gui-mode-button"
                  >
                    ${this.hass!.localize(
                      !this._cardEditorElement || this._cardGUIMode
                        ? "ui.panel.lovelace.editor.edit_card.show_code_editor"
                        : "ui.panel.lovelace.editor.edit_card.show_visual_editor",
                    )}
                  </mwc-button>
                  <ha-icon-button
                    .disabled=${this._localTabSelection === 0}
                    .label=${this.hass!.localize(
                      "ui.panel.lovelace.editor.edit_card.move_before",
                    )}
                    @click=${this._handleMove}
                    .move=${-1}
                  >
                    <ha-icon icon="mdi:arrow-left"></ha-icon>
                  </ha-icon-button>
                  <ha-icon-button
                    .label=${this.hass!.localize(
                      "ui.panel.lovelace.editor.edit_card.move_after",
                    )}
                    .disabled=${this._localTabSelection ===
                    this._config.tabs.length - 1}
                    @click=${this._handleMove}
                    .move=${1}
                  >
                    <ha-icon icon="mdi:arrow-right"></ha-icon>
                  </ha-icon-button>
                  <ha-icon-button
                    .label=${this.hass!.localize(
                      "ui.panel.lovelace.editor.edit_card.delete",
                    )}
                    @click=${this._handleDeleteCard}
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </ha-icon-button>
                </div>

                <div
                  id="local-tab-configuration"
                  @expanded-changed=${this._handleExpansionPanelChanged}
                >
                  <ha-expansion-panel outlined>
                    <div slot="header">Local Tab Configuration</div>
                    <div class="content">
                      <div class="toolbar">
                        <paper-tabs
                          id="local-tabs"
                          .selected=${this._localConfigTabSelection}
                          @iron-activate=${this._handleSelectedTab}
                        >
                          <!-- workaround to allow selectionBar to establish itself -->
                          ${this._isLocalConfigExpanded
                            ? editorConfigProperties.map(
                                (tabName) =>
                                  html`<paper-tab>${tabName}</paper-tab>`,
                              )
                            : ``}
                        </paper-tabs>
                      </div>
                      ${this._isLocalConfigExpanded
                        ? this._renderConfigurationEditor(
                            this._config.tabs[this._localTabSelection],
                          )
                        : ``}
                    </div>
                  </ha-expansion-panel>
                </div>

                <hui-card-element-editor
                  .hass=${this.hass}
                  .value=${this._config.tabs[this._localTabSelection]?.card}
                  .lovelace=${this.lovelace}
                  @config-changed=${this._handleConfigChanged}
                  @GUImode-changed=${this._handleGUIModeChanged}
                ></hui-card-element-editor>
              </div>
            `
          : html`
              <hui-card-picker
                .hass=${this.hass}
                .lovelace=${this.lovelace}
                @config-changed=${this._handleCardPicked}
              ></hui-card-picker>
            `}
      </div>
    `;
  }

  static styles = css`
    .toolbar {
      display: flex;
      --paper-tabs-selection-bar-color: var(--primary-color);
      --paper-tab-ink: var(--primary-color);
      text-transform: capitalize;
    }
    paper-tabs {
      display: flex;
      font-size: 14px;
      flex-grow: 1;
    }
    #add-card {
      max-width: 32px;
      padding: 0;
    }
    #card-options {
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }
    #editor {
      border: 1px solid var(--divider-color);
      padding: 12px;
    }
    @media (max-width: 450px) {
      #editor {
        margin: 0 -12px;
      }
    }
    .gui-mode-button {
      margin-right: auto;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "tabbed-card-editor": TabbedCardEditor;
    // "hui-error-card": LovelaceCard;
  }

  interface HASSDomEvents {
    "tabbed-card": {
      selectedTab: number;
    };
  }
}
