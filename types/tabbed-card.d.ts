import { LitElement } from "lit";
import { HomeAssistant, LovelaceCardConfig, LovelaceCardEditor } from "custom-card-helpers";
import "./tabbed-card-editor";
export declare class TabbedCard extends LitElement {
    static styles: import("lit").CSSResult[];
    static getConfigElement(): Promise<LovelaceCardEditor>;
    static getStubConfig(): {
        entity: string;
    };
    hass: HomeAssistant;
    private config;
    setConfig(config: LovelaceCardConfig): void;
    private activeContentElement;
    private contentElements;
    private tabBarElement;
    private tabBar;
    private isActiveTab;
    private tabElement;
    firstUpdated(): void;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "tabbed-card": TabbedCard;
    }
}
