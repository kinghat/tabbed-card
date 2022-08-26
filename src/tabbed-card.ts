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

  // private initialize() {
  //   console.log("initialize:");
  //   // if (!this.hass || !this._config || !this._helpers || !this._cards) {
  //   //   // this.requestUpdate();

  //   //   return;
  //   // }

  //   if (!this._config) {
  //     return;
  //   }
  //   if (!this.hass) {
  //     // this.hass = this.hass;
  //     return;
  //   }
  //   if (!this._helpers) {
  //     this.loadCardHelpers();
  //     // this.requestUpdate();

  //     return;
  //   }
  //   if (!this._cards.length) {
  //     this._createCards(this._config);
  //     console.log("initialize: _createCards called");

  //     return;
  //   }

  //   // this.requestUpdate();

  //   this._isInitialized = true;
  // }

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
    console.log("setConfig: this: ", { this: this });

    if (!config) {
      throw new Error("No configuration.");
    }

    this._config = {
      // name: "TabbedCard",
      ...config,
    };

    // this.initialize();

    this.loadCardHelpers();
  }

  @query("mwc-tab-bar") private mwcTabBar!: HTMLDivElement;
  @query(".content--active") private activeContentElement!: HTMLElement;
  @queryAll(".content") private contentElements!: NodeListOf<HTMLElement>;

  protected shouldUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): boolean {
    console.log("shouldUpdate: _changedProperties: ", _changedProperties);

    // if (!this._isInitialized) {
    //   this.initialize();
    //   // this.requestUpdate();
    //   return false;
    // }

    // return hasConfigOrEntityChanged(this, _changedProperties, false);

    // if (!this.hass || !this._helpers || this._config) {
    //   console.log("shouldUpdate: this.initialized: ", this._initialized);

    //   this.initialize();
    //   // this.requestUpdate();

    //   return false;
    // }
    // if (_changedProperties.has("_helpers")) this._createCards(this._config);

    // if (this._helpers) {

    // this.loadCardHelpers();
    // this.requestUpdate();
    // return false;
    // }

    return true;
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    console.log("willUpdate: _changedProperties: ", _changedProperties);
    // if (this._initialized) this._createCards(this._config);
    if (_changedProperties.has("_helpers") && !this._cards.length) {
      // if (!this._cards.length && this._helpers) {
      // if (!this._config && !this._helpers && !this.hass) {
      //   console.log("willUpdate: hass: ", this.hass);
      this._createCards(this._config);
      // this.requestUpdate();
    }
    //   // console.log("willUpdate: _cards: ", this._cards);
    // }
    // if (this.hass && this._config && this._helpers) {
    // if (_changedProperties.has("_cards") && !this._cards && this.hass) {

    // if (this._isInitialized && !this._cards.length) {
    //   console.log("willUpdate: _createCards called");
    //   console.log("willUpdate: _isInitialized: ", this._isInitialized);
    //   this._createCards(this._config);

    //   // console.log("willUpdate: _cards: ", this._cards);
    // }

    // if (_changedProperties.has("_isInitialized") && !this._isInitialized)
    //   this.initialize();
    if (_changedProperties.has("_helpers")) this._createCards(this._config);

    if (
      _changedProperties.has("hass") &&
      // this._isInitialized &&
      this._cards.length
    ) {
      // this._cards.map((card) => (card.hass = this.hass));
      this._cards.forEach((card) => (card.hass = this.hass));
      // console.log("willUpdate: _cards: ", this._cards);
      // this.requestUpdate();
    }
  }

  firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    console.log("firstUpdated: _changedProperties: ", _changedProperties);
    // console.log("firstUpdated: _isInitialized: ", this._isInitialized);

    // if (this._isInitialized && this._cards.length) this.requestUpdate();
    // if (!this._isInitialized) this.initialize();
  }

  updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    console.log("updated: _changedPropterties: ", _changedProperties);
    // super.updated(_changedProperties);

    // if (!this._isInitialized) {
    //   this.initialize();
    //   // this.requestUpdate();
    // }
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
    // if (_changedProperties.has("hass") && this.hass && this._cards) {
    //   this._cards.map((card) => (card.hass = this.hass));
    // console.log("willUpdate: _cards: ", this._cards);
    // }
  }

  async _createCards(config: LovelaceCardConfig) {
    const cardElements = await Promise.all(
      config.cards.map(async (cardConfig: LovelaceCardConfig) => {
        const cardElement = await this._helpers.createCardElement(cardConfig);

        cardElement.hass = this.hass;
        // console.log("_createCards: this.hass: ", this.hass);
        // console.log(
        //   "_createCards: cardElement.isUpdatePending: ",
        //   cardElement.isUpdatePending,
        // );
        // console.log(
        //   "_createCards: cardElement.hasUpdated: ",
        //   cardElement.hasUpdated,
        // );
        // console.log("_createCards: cardElement.hass: ", cardElement.hass);

        cardElement.addEventListener(
          "ll-rebuild",
          (ev) => {
            ev.stopPropagation();
            this._rebuildCard(cardElement, config);
          },
          { once: true },
        );

        await cardElement.updateComplete;
        // console.log(
        //   "_createCards: cardElement.updateComplete: ",
        //   await cardElement.updateComplete,
        // );
        return cardElement;
      }),
    );

    console.log("_createCards: cardElements: ", cardElements);
    this._cards = cardElements;
    // cardElements.map((cardElement) => console.log(cardElement.hasUpdated));

    // console.log("createCards: hass: ", this.hass);
    // this.initialize();
    // this.requestUpdate();
  }

  async _rebuildCard(cardElement, cardConfig) {
    const newCardElement = await this._helpers.createCardElement(cardConfig);

    cardElement.replaceWith(newCardElement);

    this._cards.splice(this._cards.indexOf(cardElement), 1, newCardElement);
  }

  protected getTabLabel({ _config }: ILovelaceCard) {
    if (!_config) return new Error("No card configuration.");

    const { title, name, type } = _config;

    return title ? title : name ? name : type ? type : "Unset";
  }

  render() {
    // console.log("render: _isInitialized: ", this._isInitialized);

    // if (!this._isInitialized || !this._cards.length) {
    //   this.initialize();
    //   // this.requestUpdate();
    //   // throw new Error("No card configuration.");
    //   return html`Uninitialized`;
    // }
    if (!this.hass || !this._config || !this._helpers) {
      // if (!this.hass || !this._helpers || !this._config || !this._cards)
      // this.requestUpdate();
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
