import {
  ActionConfig,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
} from "custom-card-helpers";

declare global {
  interface HTMLElementTagNameMap {
    "boilerplate-card-editor": LovelaceCardEditor;
    "hui-error-card": LovelaceCard;
  }
}

export interface BoilerplateCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
