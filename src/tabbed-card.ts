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
  hasConfigOrEntityChanged,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
} from "custom-card-helpers";
// import "@material/mwc-tab-bar/mwc-tab-bar";
// import "@material/mwc-tab/mwc-tab";
import styles from "./styles.scss?inline";
import "./tabbed-card-editor";

// const _HELPERS = (window as any).loadCardHelpers()
const HELPERS = (window as any).loadCardHelpers
  ? (window as any).loadCardHelpers()
  : undefined;

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

interface ILovelaceCard extends LovelaceCard {
  _config?: LovelaceCardConfig;
}

@customElement("tabbed-card")
export class TabbedCard extends LitElement {
  // https://lit.dev/docs/components/properties/
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() private _helpers: any;

  @state() private _config!: LovelaceCardConfig;
  // @state() private _cards!: ILovelaceCard[];
  @state() private _cards: ILovelaceCard[] = [];
  // @state() private _isInitialized = false;

  static styles = [unsafeCSS(styles)];

  protected async loadCardHelpers() {
    this._helpers = await (window as any).loadCardHelpers();
    // this.requestUpdate();
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
      // name: "TabbedCard",
      ...config,
    };

    // this.loadCardHelpers();
    // this._createCards(this._config);
  }

  @query("mwc-tab-bar") private mwcTabBar!: HTMLDivElement;
  @query(".content--active") private activeContentElement!: HTMLElement;
  @queryAll(".content") private contentElements!: NodeListOf<HTMLElement>;

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    console.log("willUpdate: _changedProperties: ", _changedProperties);

    if (_changedProperties.has("hass") && this._cards.length) {
      this._cards.forEach((card) => (card.hass = this.hass));
    }
  }

  firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    console.log("firstUpdated: _changedProperties: ", _changedProperties);
    this._createCards(this._config);
  }

  updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    console.log("updated: _changedPropterties: ", _changedProperties);
    super.updated(_changedProperties);

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
        // const cardElement = await this._helpers.createCardElement(cardConfig);
        const cardElement = (await HELPERS).createCardElement(cardConfig);

        cardElement.hass = this.hass;

        cardElement.addEventListener(
          "ll-rebuild",
          (ev) => {
            ev.stopPropagation();
            this._rebuildCard(cardElement, config);
          },
          { once: true },
        );

        // await cardElement.updateComplete;
        console.log(
          "_createCards: cardElement: updateComplete: ",
          cardElement.updateComplete,
        );

        return cardElement;
      }),
    );

    this._cards = cardElements;

    console.log("_createCards: cards: ", this._cards);
  }

  async _rebuildCard(cardElement, cardConfig) {
    // const newCardElement = await this._helpers.createCardElement(cardConfig);
    const newCardElement = (await HELPERS).createCardElement(cardConfig);

    cardElement.replaceWith(newCardElement);

    this._cards.splice(this._cards.indexOf(cardElement), 1, newCardElement);
  }

  protected getTabLabel({ _config }: ILovelaceCard) {
    if (!_config) return new Error("No card configuration.");

    const { title, name, type } = _config;

    return title ? title : name ? name : type ? type : "Unset";
  }

  render() {
    if (!this.hass || !this._config || !this._cards.length) {
      console.log("render: not redde");

      return html``;
    }

    return html`
      <mwc-tab-bar>
        <!-- no horizontal scrollbar shown when tabs overflow in chrome -->
        ${this._cards.map(
          (card) =>
            html` <mwc-tab label="${this.getTabLabel(card)}"></mwc-tab> `,
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
