import { LitElement } from "lit";
import { LovelaceCardEditor, LovelaceCard } from "custom-card-helpers";
import { BoilerplateCardConfig } from "../types/tabbed-card";
export declare class TabbedCardEditor extends LitElement {
    private _config?;
    private _helpers?;
    setConfig(config: BoilerplateCardConfig): void;
    private loadCardHelpers;
}
declare global {
    interface HTMLElementTagNameMap {
        "tabbed-card-editor": LovelaceCardEditor;
        "hui-error-card": LovelaceCard;
    }
}
