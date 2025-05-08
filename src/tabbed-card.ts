import { LitElement, html, PropertyValueMap, nothing } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import {
  getLovelace,
  hasConfigOrEntityChanged,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
  LovelaceConfig,
} from "custom-card-helpers";
import "./registry-patch.ts";
import "./tabbed-card-editor";
import "@material/mwc-tab-bar";
import "@material/mwc-tab";

interface mwcTabBarEvent extends Event {
  detail: {
    index: number;
  };
}

interface TabbedCardConfig extends LovelaceCardConfig {
  options?: options;
  styles?: {};
  attributes?: {};
  tabs: Tab[];
}

interface options {
  defaultTabIndex?: number;
}

interface Tab {
  styles?: {};
  attributes?: {
    label?: string;
    icon?: string;
    isFadingIndicator?: boolean;
    minWidth?: boolean;
    isMinWidthIndicator?: boolean;
    stacked?: boolean;
  };
  card: LovelaceCardConfig;
}

@customElement("tabbed-card")
export class TabbedCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() protected selectedTabIndex = 0;
  @property() private _helpers: any;

  @state() private _config!: TabbedCardConfig;
  @state() private _tabs!: Tab[];
  @property() protected _styles = {
    "--mdc-theme-primary": "var(--primary-text-color)", // Color of the activated tab's text, indicator, and ripple.
    "--mdc-tab-text-label-color-default":
      "rgba(var(--rgb-primary-text-color), 0.8)", // Color of an unactivated tab label.
    "--mdc-tab-color-default": "rgba(var(--rgb-primary-text-color), 0.7)", // Color of an unactivated icon.
    "--mdc-typography-button-font-size": "14px",
  };

  private async loadCardHelpers() {
    this._helpers = await (window as any).loadCardHelpers();
  }

  static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement("tabbed-card-editor");
  }

  static getStubConfig() {
    return {
      options: {},
      tabs: [{ card: { type: "entity", entity: "sun.sun" }, attributes: { label: "Sun" } }],
    };
  }

  public setConfig(config: TabbedCardConfig) {
    if (!config) {
      throw new Error("No configuration.");
    }

    this._config = config;

    this._styles = {
      ...this._styles,
      ...this._config.styles,
    };

    this.loadCardHelpers();
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("_helpers")) {
      this._createTabs(this._config);
    }
    if (_changedProperties.has("hass") && this._tabs?.length) {
      this._tabs.forEach((tab) => (tab.card.hass = this.hass));
    }
  }

  async _createTabs(config: TabbedCardConfig) {
    const tabs = await Promise.all(
      config.tabs.map(async (tab) => {
        return {
          styles: tab?.styles,
          attributes: { ...config?.attributes, ...tab?.attributes },
          card: await this._createCard(tab.card),
        };
      }),
    );

    this._tabs = tabs;
  }

  async _createCard(cardConfig: LovelaceCardConfig) {
    const cardElement = await this._helpers.createCardElement(cardConfig);

    cardElement.hass = this.hass;

    cardElement.addEventListener(
      "ll-rebuild",
      (ev: Event) => {
        ev.stopPropagation();
        this._rebuildCard(cardElement, cardConfig);
      },
      { once: true },
    );

    return cardElement;
  }

  async _rebuildCard(
    cardElement: LovelaceCard,
    cardConfig: LovelaceCardConfig,
  ) {
    console.log("_rebuildCard: ", cardElement, cardConfig);

    const newCardElement = await this._helpers.createCardElement(cardConfig);

    cardElement.replaceWith(newCardElement);

    // TODO: figure out a way to update the tabs array with the rebuilt card
    // this._tabs.splice(this._tabs.indexOf(cardElement), 1, newCardElement);
  }

  parseVariables(content: string){
    const TEMPLATE_REGEX = /\[\[.*?\]\]/gm;
    let outputContent = content.replace(/\r?\n|\r/g, "");
    let m;

    while ((m = TEMPLATE_REGEX.exec(content)) !== null) {
        if (m.index === TEMPLATE_REGEX.lastIndex) {
            TEMPLATE_REGEX.lastIndex++;
        }
        m.forEach(match => {
            let e = match.replace("[[", "").replace("]]", "").replace(/\s/gm, "");
            let split = e.split(".");
            let dots = split.length - 1;
            let output;
            if (dots === 1 || dots === 2 && split[2] === "state") {
                let id = split[0] + "." + split[1];
                output = this.hass.states[id].state;
            } else if (dots === 3 && split[2] === "attributes") {
                let id = split[0] + "." + split[1];
                let attribute = split[3];
                output = this.hass.states[id].attributes[attribute];
            } else {
                output = match;
            }
            outputContent = outputContent.replace(match, output);
        });
    }

    return outputContent;    
  }

  render() {
    if (!this.hass || !this._config || !this._helpers || !this._tabs?.length) {
      return html``;
    }

    return html`
      <mwc-tab-bar
        @MDCTabBar:activated=${(ev: mwcTabBarEvent) =>
        (this.selectedTabIndex = ev.detail.index)}
        style=${styleMap(this._styles)}
        activeIndex=${ifDefined(this._config?.options?.defaultTabIndex)}
      >
        <!-- no horizontal scrollbar shown when tabs overflow in chrome -->
        ${this._tabs.map(
          (tab) =>
            html`
              <mwc-tab
                style=${ifDefined(styleMap(tab?.styles || {}))}
                label="${this.parseVariables(tab?.attributes?.label || '') || nothing}"
                ?hasImageIcon=${tab?.attributes?.icon}
                ?isFadingIndicator=${tab?.attributes?.isFadingIndicator}
                ?minWidth=${tab?.attributes?.minWidth}
                ?isMinWidthIndicator=${tab?.attributes?.isMinWidthIndicator}
                ?stacked=${tab?.attributes?.stacked}
              >
                ${tab?.attributes?.icon
                ? html`<ha-icon
                      slot="icon"
                      icon="${tab?.attributes?.icon}"
                    ></ha-icon>`
                : html``}
              </mwc-tab>
            `,
        )}
      </mwc-tab-bar>
      <section>
        <article>
          ${this._tabs.find((_, index) => index == this.selectedTabIndex)?.card}
        </article>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tabbed-card": TabbedCard;
  }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "tabbed-card",
  name: "Tabbed Card",
  description: "A tabbed card of cards.",
});
