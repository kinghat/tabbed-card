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
    "--mdc-typography-button-text-transform": "none", // Remove default uppercase transformation
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

  render() {
    if (!this.hass || !this._config || !this._helpers || !this._tabs?.length) {
      return html``;
    }

    return html`
      <style>
        mwc-tab {
          --mdc-tab-height: 48px;
        }
        mwc-tab ha-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
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
                label="${tab?.attributes?.label || nothing}"
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
