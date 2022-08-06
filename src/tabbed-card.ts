import { LitElement, html, unsafeCSS, PropertyValueMap } from "lit";
import {
  customElement,
  query,
  queryAll,
  state,
  property,
  queryAsync,
} from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import {
  getLovelace,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
} from "custom-card-helpers";
// import "@material/mwc-tab-bar/mwc-tab-bar";
// import "@material/mwc-tab/mwc-tab";
import styles from "./styles.scss?inline";
import "./tabbed-card-editor";

// use mwc-tab-bar/mwc-tab that probably always exist otherwise import them
if (!customElements.get("mwc-tab-bar")) {
  import("@material/mwc-tab-bar");
}
// if (!customElements.get("mwc-tab-scroller")) {
//   import("@material/mwc-tab-scroller");
// }
if (!customElements.get("mwc-tab")) {
  import("@material/mwc-tab");
}

interface mwcTabBarCustomEvent extends Event {
  detail?: {
    index: number;
  };
}

interface LovelaceCard extends HTMLElement {
  hass: any;
  setConfig(config: any): void;
  // getCardSize?(): number;
}

@customElement("tabbed-card")
export class TabbedCard extends LitElement {
  // https://lit.dev/docs/components/properties/
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() private _helpers: any;

  @state() private _config!: LovelaceCardConfig;
  @state() private _cards!: LovelaceCard[];
  @state() private _initialized!: boolean;

  static styles = [unsafeCSS(styles)];

  private initialize() {
    if (!this.hass && !this._config && !this._helpers) return;
    this._initialized = true;
  }

  // protected shouldUpdate() {
  //   if (!this._initialized) this.initialize();

  //   return true;
  // }

  protected async loadCardHelpers() {
    this._helpers = await (window as any).loadCardHelpers();
  }

  static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement("tabbed-card-editor");
  }

  static getStubConfig() {
    return { cards: [] };
  }

  // https://lit.dev/docs/components/properties/#accessors-custom
  public setConfig(config: LovelaceCardConfig) {
    if (!config) {
      throw new Error("No configuration.");
    }

    this._config = {
      name: "TabbedCard",
      ...config,
    };

    this.loadCardHelpers();
  }

  @query("mwc-tab-bar") private mwcTabBar!: HTMLDivElement;
  @query(".content--active") private activeContentElement!: HTMLElement;
  @queryAll(".content") private contentElements!: NodeListOf<HTMLElement>;

  firstUpdated() {}

  updated() {
    if (this.mwcTabBar && this.contentElements.length) {
      this.mwcTabBar.addEventListener(
        "MDCTabBar:activated",
        (event: mwcTabBarCustomEvent) => {
          if (event?.detail) {
            this.activeContentElement.classList.remove("content--active");
            this.contentElements[event.detail.index].classList.add(
              "content--active",
            );
          }
        },
      );
    }
  }

  async _createCards(config: LovelaceCardConfig) {
    const cardElements = await Promise.all(
      config.cards.map(async (cardConfig: LovelaceCardConfig) => {
        const cardElement = await this._helpers.createCardElement(cardConfig);

        cardElement.hass = this.hass;

        return cardElement;
      }),
    );

    this._cards = cardElements;
    console.log(cardElements);
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("_helpers")) this._createCards(this._config);
  }

  render() {
    if (!this.hass || !this._helpers || !this._config || !this._cards)
      return html``;

    return html`
      <mwc-tab-bar>
        <!-- no horizontal scrollbar shown when tabs overflow in chrome -->
        ${this._cards.map(
          (card) => html` <mwc-tab label="${card.___config.title}"></mwc-tab> `,
        )}
      </mwc-tab-bar>
      <section>
        ${this._cards.map(
          (card, index) => html`
            <article class="content ${index == 0 ? "content--active" : ""}">
              ${card}
            </article>
          `,
        )}
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
