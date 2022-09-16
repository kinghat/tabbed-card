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
  LovelaceConfig,
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
  @state() private _tabs!: ILovelaceCard[];
  // @state() private _cards!: ILovelaceCard[];

  static styles = [unsafeCSS(styles)];

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
      // name: "TabbedCard",
      ...config,
    };

    // this.loadCardHelpers();
    // this._createCards(this._config);
    this._createTabs(config);
  }

  @query("mwc-tab-bar") private mwcTabBar!: HTMLDivElement;
  @query(".content--active") private activeContentElement!: HTMLElement;
  @queryAll(".content") private contentElements!: NodeListOf<HTMLElement>;
  @property() protected selectedTabIndex = 0;

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    console.log("willUpdate: _changedProperties: ", _changedProperties);

    if (_changedProperties.has("hass") && this._tabs?.length) {
      this._tabs.forEach((tab) =>
        tab.cards.forEach((card) => (card.hass = this.hass)),
      );
    }
  }

  // updated(
  //   _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  // ): void {
  //   console.log("updated: _changedPropterties: ", _changedProperties);
  //   // super.updated(_changedProperties);

  //   // if (this.mwcTabBar && this.contentElements.length) {
  //   //   this.mwcTabBar.addEventListener(
  //   //     "MDCTabBar:activated",
  //   //     (event: mwcTabBarCustomEvent) => {
  //   //       if (event?.detail) {
  //   //         this.activeContentElement.classList.remove("content--active");
  //   //         this.contentElements[event.detail.index].classList.add(
  //   //           "content--active",
  //   //         );
  //   //       }
  //   //     },
  //   //   );
  //   // }
  // }

  async _createTabs(config: LovelaceCardConfig) {
    const tabs = await Promise.all(
      config.tabs.map(async (tab) => {
        return { name: tab.name, cards: await this._createCards(tab.cards) };
      }),
    );

    this._tabs = tabs;

    console.log("_createTabs: tabs", this._tabs);
  }

  async _createCards(cardConfigs: LovelaceCardConfig[]) {
    console.log("_createCards: tabConfig: ", cardConfigs);

    const cardElements = await Promise.all(
      cardConfigs.map(async (cardConfig) => {
        // const cardElement = await this._helpers.createCardElement(cardConfig);
        const cardElement = (await HELPERS).createCardElement(cardConfig);

        cardElement.hass = this.hass;

        cardElement.addEventListener(
          "ll-rebuild",
          (ev) => {
            ev.stopPropagation();
            this._rebuildCard(cardElement, cardConfig);
          },
          { once: true },
        );

        return cardElement;
      }),
    );

    // this._tabs = cardElements;

    console.log("_createCards: cards: ", cardElements);

    return cardElements;
  }

  async _rebuildCard(cardElement, cardConfig) {
    console.log("_rebuildCard: ", cardElement, cardConfig);

    // const newCardElement = await this._helpers.createCardElement(cardConfig);
    const newCardElement = (await HELPERS).createCardElement(cardConfig);

    cardElement.replaceWith(newCardElement);

    this._tabs.splice(this._tabs.indexOf(cardElement), 1, newCardElement);
  }

  // protected getTabLabel({ _config }: ILovelaceCard) {
  //   if (!_config) return new Error("No card configuration.");

  //   const { title, name, type } = _config;

  //   return title ? title : name ? name : type ? type : "Unset";
  // }

  render() {
    console.log("rendered:");

    if (!this.hass || !this._config || !this._tabs?.length) {
      console.log("render: not redde");

      return html``;
    }

    return html`
      <!-- <mwc-tab-bar> -->
      <mwc-tab-bar
        @MDCTabBar:activated=${(ev) =>
          (this.selectedTabIndex = ev.detail.index)}
      >
        <!-- no horizontal scrollbar shown when tabs overflow in chrome -->
        ${this._tabs.map(
          (tab) => html` <mwc-tab label="${tab.name}"></mwc-tab> `,
        )}
        <!-- ${this._tabs.map((tab) => html` ${tab}`)} -->
      </mwc-tab-bar>
      <section>
        <!-- ${this._tabs.map(
          (card, index) => html`
            <article class="content ${index == 0 ? "content--active" : ""}">
              ${card}
            </article>
          `,
        )} -->
        <article>
          <!-- ${this._tabs.find((tab, index) =>
            index == this.selectedTabIndex ? tab.cards : "",
          )} -->
          ${this._tabs.map((tab, index) =>
            index == this.selectedTabIndex ? tab.cards : "",
          )}
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
