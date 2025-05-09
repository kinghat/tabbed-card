import "@total-typescript/ts-reset";
import { LitElement, html, PropertyValueMap, nothing, css } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import {
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
  fireEvent
  // HASSDomEvent
} from "custom-card-helpers";
import type { HASSDomEvent, ValidHassDomEvent } from "custom-card-helpers";
import type { TabbedCardConfig, TabConfig } from "./types";
import "./tabbed-card-editor";
import { globalStyles, testProps } from "./styles";

interface mwcTabBarEvent extends Event {
  detail: {
    index: number;
  };
}

@customElement("tabbed-card")
export class TabbedCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Number }) protected selectedTabIndex = 0;
  @property({ type: Number }) protected selectedEditorTabIndex!: number;
  @property() private _helpers: any;
  @property({ type: Boolean }) private focusOnActivate: boolean = true;

  @state() private _config!: TabbedCardConfig;
  @state() private _tabs!: TabConfig[];
  @state() protected _styles = {};

  controller!: AbortController;

  connectedCallback() {
    super.connectedCallback();
    // set a listener to be controlled by the card editor
    if (this.parentNode?.nodeName == "HUI-CARD-PREVIEW") {
      this.focusOnActivate = false;

      this.controller = new AbortController();

      document.body.addEventListener(
        "tabbed-card",
        (ev) => this._handleSelectedTab(ev),
        { signal: this.controller.signal },
      );
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // remove the listener
    if (this.controller) this.controller.abort();
  }

  // private _handleSelectedTab(ev: CustomEvent) {
  private _handleSelectedTab(ev: HASSDomEvents) {
    if ("selectedTab" in ev.detail) {
      console.log(ev);

      setTimeout(() => {
        this.selectedEditorTabIndex = ev.detail.selectedTab;
      }, 1);
    }
  }

  private async loadCardHelpers() {
    this._helpers = await (window as any).loadCardHelpers();

    if (!customElements.get("mwc-tab-bar")) this._helpers.importMoreInfoControl("weather")
  }

  static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement("tabbed-card-editor");
  }

  static getStubConfig() {
    return {
      tabs: [],
    };
  }

  public setConfig(config: TabbedCardConfig) {
    // TODO: implement proper config validation
    if (!config || !config?.tabs)
      throw new Error("No or incomplete configuration.");

    if (config.tabs.some((tab) => Object.is(tab?.card, undefined || null)))
      throw new Error("No or incomplete configuration.");

    this._config = config;
    this._styles = {
      ...this._config.styles,
    };

    this._createTabs(config);
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("hass") && this._tabs?.length) {
      this._tabs.forEach((tab) => (tab.card.hass = this.hass));
    }
  }

  private async _createTabs(config: TabbedCardConfig) {
    await this.loadCardHelpers();

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

  private async _createCard(cardConfig: LovelaceCardConfig) {
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

  private async _rebuildCard(
    cardElement: LovelaceCard,
    cardConfig: LovelaceCardConfig,
  ) {
    console.log("_rebuildCard: ", cardElement, cardConfig);

    const newCardElement = await this._createCard(cardConfig);

    cardElement.replaceWith(newCardElement);

    // TODO: figure out a way to update the tabs array with the rebuilt card
    // this._tabs.splice(this._tabs.indexOf(cardElement), 1, newCardElement);

    this._tabs = this._tabs.map((tab) =>
      tab.card === cardElement ? { ...tab, card: newCardElement } : tab,
    );
  }

  protected render() {
    if (!this.hass || !this._config || !this._helpers) return html``;

    if (!this._tabs?.length)
      // TODO: think about returning a ha-card or hui-error-card here
      return html`<div class="no-config">
        No cards have been added to Tabbed Card
      </div>`;
    // console.log("render: ", globalStyles);


    return html`
      <mwc-tab-bar
        @MDCTabBar:activated=${(ev: mwcTabBarEvent) =>
        (this.selectedTabIndex = ev.detail.index)}
        style=${styleMap(this._styles)}
        activeIndex=${ifDefined(
          this.selectedEditorTabIndex ??
          this._config?.options?.defaultTabIndex ??
          undefined,
        )}
      >
        <!-- no horizontal scrollbar shown when tabs overflow in chrome -->
        ${this._tabs.map(
          (tab) =>
            html`
              <mwc-tab
                style=${styleMap(tab?.styles || {})}
                label="${tab?.attributes?.label || nothing}"
                ?hasImageIcon=${tab?.attributes?.icon}
                ?isFadingIndicator=${tab?.attributes?.isFadingIndicator}
                ?minWidth=${tab?.attributes?.minWidth}
                ?isMinWidthIndicator=${tab?.attributes?.isMinWidthIndicator}
                ?stacked=${tab?.attributes?.stacked}
                .focusOnActivate=${this.focusOnActivate}
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

  static styles = [
    globalStyles,
    css`
      .no-config {
        text-align: center;
      }
      mwc-tab {
        --ha-icon-display: inline;
      }
    `,
  ];
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
