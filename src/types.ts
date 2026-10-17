import type { LovelaceCardConfig } from "custom-card-helpers";

export type ConfigPath = (string | number)[];
export type CardConfig = LovelaceCardConfig & Record<string, any>;

export interface TabConfig {
  card: CardConfig;
  styles?: Record<string, string>;
  attributes?: {
    label?: string;
    icon?: string;
    isFadingIndicator?: boolean;
    minWidth?: boolean;
    isMinWidthIndicator?: boolean;
    stacked?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface TabbedCardConfig extends CardConfig {
  options?: { defaultTabIndex?: number; [key: string]: unknown };
  styles?: Record<string, string>;
  attributes?: TabConfig["attributes"];
  tabs: TabConfig[];
}
