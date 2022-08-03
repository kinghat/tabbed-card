import "lit";
import { LovelaceCardEditor, LovelaceCard } from "custom-card-helpers";
declare global {
    interface HTMLElementTagNameMap {
        "tabbed-card-editor": LovelaceCardEditor;
        "hui-error-card": LovelaceCard;
    }
}
