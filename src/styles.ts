import { css } from "lit";

export const globalStyles = css`
  :host {
    --activated-color: var(--primary-text-color);
    --unactivated-color: rgba(var(--rgb-primary-text-color), 0.8);
    /* Color of the activated tab's text, indicator, and ripple. */
    --mdc-theme-primary: var(--activated-color);
    /*Color of an unactivated tab label.*/
    --mdc-tab-text-label-color-default: var(--unactivated-color);
    /* Color of an unactivated icon. */
    --mdc-tab-color-default: var(--unactivated-color);
    --mdc-typography-button-font-size: 14px;
  }
`;
