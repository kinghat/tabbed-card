import type { StyleInfo } from "lit/directives/style-map.js";
import {
  ActionConfig,
  LovelaceCard,
  LovelaceCardConfig,
  LovelaceCardEditor,
} from "custom-card-helpers";

export const defaultCSSProperties = {
  "--default-unactivated-opacity": "0.8",
  "--default-activated-color": "var(--primary-text-color)",
  "--default-unactivated-color:": "rgb(var(--rgb-primary-text-color), var(--default-unactivated-opacity)",
  "--default-font-size": "14px"
} as const;
// export const defaultCSSProperties = [
//   "--default-unactivated-opacity",
//   "--default-activated-color",
//   "--default-unactivated-color",
//   "--default-font-size"
// ] as const;
export const defaultColorProperties = [
  "--mdc-theme-primary",
  "--mdc-tab-text-label-color-default",
  "--mdc-tab-color-default",
] as const;
export const defaultNonColorProperties = [
  "--mdc-typography-button-font-size",
  "--unactivated-opacity",
] as const;

export type DefaultColorProperty = typeof defaultColorProperties[number];

export type DefaultConfigColorProperties = Record<DefaultColorProperty, string>;

export type DefaultNonColorProperty = typeof defaultNonColorProperties[number];

export type DefaultConfigNonColorProperties = Record<
  DefaultNonColorProperty,
  string
>;

export const editorConfigProperties = [
  "attributes",
  "styles",
  "options",
] as const;

export type ConfigurationScope = "global" | "local";

export interface TabAttributes {
  label?: string;
  icon?: string;
  isFadingIndicator?: boolean;
  minWidth?: boolean;
  isMinWidthIndicator?: boolean;
  stacked?: boolean;
}
export interface TabStyles
  extends Partial<DefaultConfigColorProperties>,
  Partial<DefaultConfigNonColorProperties> {
  [x: string]: string;
}

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
