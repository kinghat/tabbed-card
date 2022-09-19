import { LitElement, html, unsafeCSS, PropertyValueMap } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import {
  getLovelace,
  hasConfigOrEntityChanged,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
  LovelaceConfig,
} from "custom-card-helpers";
import "./tabbed-card-editor";

// const _HELPERS = (window as any).loadCardHelpers()
const HELPERS = (window as any).loadCardHelpers
  ? (window as any).loadCardHelpers()
  : undefined;

// use mwc-tab-bar/mwc-tab that probably always exists, otherwise import them.
if (!customElements.get("mwc-tab-bar")) {
  import("@material/mwc-tab-bar");
}
if (!customElements.get("mwc-tab")) {
  import("@material/mwc-tab");
}

interface mwcTabBarEvent extends Event {
  detail: {
    index: number;
  };
}

interface TabbedCardConfig extends LovelaceCardConfig {
  options: {};
  tabs: Tab[];
}

interface Tab {
  name: string;
  card: LovelaceCardConfig;
}

@customElement("tabbed-card")
export class TabbedCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() protected selectedTabIndex = 0;
  // @property() private _helpers: any;

  @state() private _config!: TabbedCardConfig;
  @state() private _tabs!: Tab[];

  // protected async loadCardHelpers() {
  //   this._helpers = await (window as any).loadCardHelpers();
  // }

  static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement("tabbed-card-editor");
  }

  static getStubConfig() {
    return {
      options: {},
      tabs: [{ name: "Sun", card: { type: "entity", entity: "sun.sun" } }],
    };
  }

  public setConfig(config: TabbedCardConfig) {
    if (!config) {
      throw new Error("No configuration.");
    }

    this._config = config;

    this._createTabs(this._config);
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("hass") && this._tabs?.length) {
      this._tabs.forEach((tab) => (tab.card.hass = this.hass));
    }
  }

  async _createTabs(config: TabbedCardConfig) {
    const tabs = await Promise.all(
      config.tabs.map(async (tab) => {
        return { name: tab.name, card: await this._createCard(tab.card) };
      }),
    );

    this._tabs = tabs;
  }

  async _createCard(cardConfig: LovelaceCardConfig) {
    // const cardElement = await this._helpers.createCardElement(cardConfig);
    const cardElement = (await HELPERS).createCardElement(cardConfig);

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

    // const newCardElement = await this._helpers.createCardElement(cardConfig);
    const newCardElement = (await HELPERS).createCardElement(cardConfig);

    cardElement.replaceWith(newCardElement);

    // TODO: figure out a way to update the tabs array with the rebuilt card
    this._tabs.splice(this._tabs.indexOf(cardElement), 1, newCardElement);
  }

  render() {
    if (!this.hass || !this._config || !this._tabs?.length) {
      return html``;
    }

    return html`
      <mwc-tab-bar
        @MDCTabBar:activated=${(ev: mwcTabBarEvent) =>
          (this.selectedTabIndex = ev.detail.index)}
      >
        <!-- no horizontal scrollbar shown when tabs overflow in chrome -->
        ${this._tabs.map(
          (tab) => html` <mwc-tab label="${tab.name}"></mwc-tab> `,
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
