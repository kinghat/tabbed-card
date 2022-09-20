import { LitElement, PropertyValueMap } from "lit";
import { HomeAssistant, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from "custom-card-helpers";
import "./tabbed-card-editor";
interface TabbedCardConfig extends LovelaceCardConfig {
    options: {};
    tabs: Tab[];
}
interface Tab {
    name: string;
    card: LovelaceCardConfig;
}
export declare class TabbedCard extends LitElement {
    hass: HomeAssistant;
    protected selectedTabIndex: number;
    private _config;
    private _tabs;
    static getConfigElement(): Promise<LovelaceCardEditor>;
    static getStubConfig(): {
        options: {};
        tabs: {
            name: string;
            card: {
                type: string;
                entity: string;
            };
        }[];
    };
    setConfig(config: TabbedCardConfig): void;
    protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    _createTabs(config: TabbedCardConfig): Promise<void>;
    _createCard(cardConfig: LovelaceCardConfig): Promise<any>;
    _rebuildCard(cardElement: LovelaceCard, cardConfig: LovelaceCardConfig): Promise<void>;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "tabbed-card": TabbedCard;
    }
}
export {};
