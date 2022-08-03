import { LitElement, html, unsafeCSS, PropertyValueMap } from "lit";
import {
  customElement,
  query,
  queryAll,
  state,
  property,
} from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import {
  getLovelace,
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
} from "custom-card-helpers";
import { MDCTabBar } from "@material/tab-bar";
import styles from "./styles.scss?inline";
import "./tabbed-card-editor";

@customElement("tabbed-card")
export class TabbedCard extends LitElement {
  // https://lit.dev/docs/components/properties/
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() private _helpers: any;

  @state() private _config!: LovelaceCardConfig;
  @state() private _cards: any;
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

  @query(".content--active") private activeContentElement!: HTMLElement;
  @queryAll(".content") private contentElements!: NodeListOf<HTMLElement>;
  @query(".mdc-tab-bar") private tabBarElement!: HTMLDivElement;

  @state() private tabBar!: MDCTabBar;
  @state() private isActiveTab = (index: number) =>
    index === this._config.options.defaultCardIndex;
  @state() private tabElement = (
    index: number,
    tabName: string,
  ) => html` <button
    class="mdc-tab ${this.isActiveTab(index) ? "mdc-tab--active" : ""}"
    role="tab"
  >
    <span class="mdc-tab__content">
      <span class="mdc-tab__text-label">${tabName}</span>
    </span>
    <span
      class="mdc-tab-indicator ${this.isActiveTab(index)
        ? "mdc-tab-indicator--active"
        : ""}"
    >
      <span
        class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"
      ></span>
    </span>
    <span class="mdc-tab__ripple"></span>
  </button>`;
  @state() private cardElement = (card: LovelaceCard, cardIndex: number) =>
    html`
      <article class="content ${cardIndex == 0 ? "content--active" : ""}">
        ${card}
      </article>
    `;

  firstUpdated() {
    if (this._cards) {
      this.tabBar = new MDCTabBar(this.tabBarElement);

      this.tabBar.listen(
        "MDCTabBar:activated",
        (event: CustomEvent<{ index: number }>) => {
          this.activeContentElement.classList.remove("content--active");
          this.contentElements[event.detail.index].classList.add(
            "content--active",
          );
        },
      );
    }
  }

  async _createCards(config: LovelaceCardConfig) {
    const cardElements = await Promise.all(
      config.cards.map(async (cardConfig: LovelaceCardConfig) => {
        const cardElement = await this._helpers?.createCardElement(cardConfig);

        cardElement.hass = this.hass;

        return cardElement;
      }),
    );

    this._cards = cardElements;
    console.log("_cards: ", this._cards);
    console.log("_config: ", this._config);
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    console.log("_changedProperties: ", _changedProperties);
    if (_changedProperties.has("_config")) this._createCards(this._config);
  }

  render() {
    if (!this.hass || !this._helpers || !this._config || !this._cards)
      return html``;

    return html`
      <div class="mdc-tab-bar" role="tablist">
        <div class="mdc-tab-scroller">
          <div class="mdc-tab-scroller__scroll-area">
            <div class="mdc-tab-scroller__scroll-content">
              ${repeat(
                this._cards.map((card, index) =>
                  this.tabElement(index, card.___config.title),
                ),
                (__, index) => index,
                (tab) => tab,
              )}
            </div>
          </div>
        </div>
      </div>
      <section>
        ${repeat(
          this._cards.map((card, index) => this.cardElement(card, index)),
          (__, index) => index,
          (cardElement) => cardElement,
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

// const cardElements = [
//   html` <article class="content content--active" id="mdc-content-1">
//     <h2>Content One</h2>
//     <p>Lorem ipsum dolor sit amet consectet adipisicing elit</p>
//     <h2>Lore sf</h2>
//     <p>Lorem ipsum dolor sit amet consectet adipisicing elit</p>
//     <p>Sit molestiae itaque rem optio molestias voluptati obcaecati!</p>
//     <p>
//       Ipsum, a? Tenetur aut a nisi, aspernatur earum eligendi id quam nihil sint
//       quas?
//     </p>
//     <p>nisi, aspernatur earum eligendi id quam nihil sint quas?</p>
//     <p>Sit molestiae itaque rem optio molestias voluptati obcaecati!</p>
//     <p>
//       Ipsum, a? Tenetur aut a nisi, aspernatur earum eligendi id quam nihil sint
//       quas?
//     </p>
//     <p>nisi, aspernatur earum eligendi id quam nihil sint quas?</p>
//   </article>`,
//   html`
//     <article class="content" id="mdc-content-2">
//       <h2>Content Two</h2>
//       <p>
//         Lorem ipsum dolor sit amet consectet adipisicing elit. Sit molestiae
//         itaque rem optio molestias voluptati obcaecati!
//       </p>
//       <h2>Tenet urs</h2>
//       <p>
//         Ipsum, a? Tenetur aut a nisi, aspernatur earum eligendi id quam nihil
//         sint quas?
//       </p>
//       <p>nisi, aspernatur earum eligendi id quam nihil sint quas?</p>
//       <h2>Lore s sdf</h2>
//       <p>Lorem ipsum dolor sit amet consectet adipisicing elit</p>
//       <p>Sit molestiae itaque rem optio molestias voluptati obcaecati!</p>
//       <p>
//         Ipsum, a? Tenetur aut a nisi, aspernatur earum eligendi id quam nihil
//         sint quas?
//       </p>
//       <p>nisi, aspernatur earum eligendi id quam nihil sint quas?</p>
//     </article>
//   `,
//   html` <article class="content" id="mdc-content-3">
//     <h2>Content Three</h2>
//     <p>Lorem ipsum dolor sit amet consectet adipisicing elit</p>
//     <p>Sit molestiae itaque rem optio molestias voluptati obcaecati!</p>
//     <p>nisi, aspernatur earum eligendi id quam nihil sint quas?</p>
//     <ul>
//       <li>Lorem</li>
//       <li>ipsum</li>
//       <li>dolor</li>
//     </ul>
//     <p>Sit molestiae itaque rem optio molestias voluptati obcaecati!</p>
//   </article>`,
//   html` <article class="content" id="mdc-content-4">
//     <h2>Content Four</h2>
//     <p>Lorem ipsum dolor sit amet consectet adipisicing elit</p>
//     <p>Sit molestiae itaque rem optio molestias voluptati obcaecati!</p>
//     <p>nisi, aspernatur earum eligendi id quam nihil sint quas?</p>
//     <ul>
//       <li>Lorem</li>
//       <li>ipsum</li>
//       <li>dolor</li>
//     </ul>
//     <p>Sit molestiae itaque rem optio molestias voluptati obcaecati!</p>
//   </article>`,
//   html` <article class="content" id="mdc-content-5">
//     <h2>Content Five</h2>
//     <p>Lorem ipsum dolor sit amet consectet adipisicing elit</p>
//     <p>Sit molestiae itaque rem optio molestias voluptati obcaecati!</p>
//     <p>nisi, aspernatur earum eligendi id quam nihil sint quas?</p>
//     <ul>
//       <li>Lorem</li>
//       <li>ipsum</li>
//       <li>dolor</li>
//     </ul>
//     <p>Sit molestiae itaque rem optio molestias voluptati obcaecati!</p>
//   </article>`,
//   html`
//     <article class="content" id="mdc-content-6">
//       <h2>Content Six</h2>
//       <p>Lorem ipsum dolor sit amet consectet adipisicing elit</p>
//       <p>Sit molestiae itaque rem optio molestias voluptati obcaecati!</p>
//       <p>nisi, aspernatur earum eligendi id quam nihil sint quas?</p>
//       <ul>
//         <li>Lorem</li>
//         <li>ipsum</li>
//         <li>dolor</li>
//       </ul>
//       <p>Sit molestiae itaque rem optio molestias voluptati obcaecati!</p>
//     </article>
//   `,
// ];
