import type { StyleInfo } from "lit/directives/style-map.js";
import {
  ActionConfig,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
} from "custom-card-helpers";

export interface TabAttributes {
  label?: string;
  icon?: string;
  isFadingIndicator?: boolean;
  minWidth?: boolean;
  isMinWidthIndicator?: boolean;
  stacked?: boolean;
}

export interface TabStyles extends StyleInfo {}

export interface TabbedOptions {
  defaultTabIndex?: number;
  tabsAtTop?: boolean;
}

export interface TabConfig {
  styles?: TabStyles;
  attributes?: TabAttributes;
  card: LovelaceCardConfig;
}

export interface TabbedCardConfig extends LovelaceCardConfig {
  options?: TabbedOptions;
  styles?: TabStyles;
  attributes?: TabAttributes;
  tabs: TabConfig[];
}

export type ConfigurationScope = "global" | "local";
export const editorConfigProperties = [
  "attributes",
  "styles",
  "options",
] as const;

// export type editorConfigurationProperties =
//   | { global: ["attributes", "styles", "options"] }
//   | { local: ["attributes", "styles"] };

// type EditorProperties<IConfiguration> = [
//   Key in keyof IConfiguration
// ];

// type localEditorProperties = EditorProperties<TabConfig>;

// export interface Tab extends Omit<TabConfig, "card"> {
//   card: LovelaceCard;
// }

// declare global {
//   interface HTMLElementTagNameMap {
//     "boilerplate-card-editor": LovelaceCardEditor;
//     "hui-error-card": LovelaceCard;
//   }
// }

// export interface BoilerplateCardConfig extends LovelaceCardConfig {
//   type: string;
//   name?: string;
//   show_warning?: boolean;
//   show_error?: boolean;
//   test_gui?: boolean;
//   entity?: string;
//   tap_action?: ActionConfig;
//   hold_action?: ActionConfig;
//   double_tap_action?: ActionConfig;
// }
