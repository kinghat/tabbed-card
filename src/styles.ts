import { css, unsafeCSS } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { defaultCSSProperties } from "./types";


// export const globalStyles = css`
//   :host {
//     --default-unactivated-opacity: 0.8;
//     --default-activated-color: var(--primary-text-color);
//     --default-unactivated-color: rgb(
//       var(--rgb-primary-text-color),
//       var(--default-unactivated-opacity)
//     --default-font-size: 14px;
//     );
//     /* Color of the activated tab's text, indicator, and ripple. */
//     --mdc-theme-primary: var(--default-activated-color);
//     /*Color of an unactivated tab label.*/
//     --mdc-tab-text-label-color-default: var(--default-unactivated-color);
//     /* Color of an unactivated icon. */
//     --mdc-tab-color-default: var(--default-unactivated-color);
//     --mdc-typography-button-font-size: var(--default-font-size);
//   }
// `;


export const testProps = {
  "--default-unactivated-opacity": "0.2",
  "--default-activated-color": "var(--primary-text-color)",
  "--default-unactivated-color:": "rgb(var(--rgb-primary-text-color), var(--default-unactivated-opacity)",
  "--default-font-size": "14px",
  "--mdc-theme-primary": "var(--default-activated-color)",
  "--mdc-tab-text-label-color-default": "var(--default-unactivated-color)",
  "--mdc-tab-color-default": "var(--default-unactivated-color)",
  "--mdc-typography-button-font-size": "var(--default-font-size)"
} as const;

// unsafeCSS(defaultCSSProperties)
// css`--unactivated-opacity: 0.2`
// [css`--unactivated-opacity: 0.8;`];
// Object.entries(defaultCSSProperties).map(([key, value]) => css`${key: value}`)
// css`defaultCSSProperties`
// css`--activated-color: var(--primary-text-color);
//   --unactivated-color: rgb(
//     var(--rgb-primary-text-color),
//     var(--unactivated-opacity)
//   );
//   /* Color of the activated tab's text, indicator, and ripple. */
//   --mdc-theme-primary: var(--activated-color);
//   /*Color of an unactivated tab label.*/
//   --mdc-tab-text-label-color-default: var(--unactivated-color);
//   /* Color of an unactivated icon. */
//   --mdc-tab-color-default: var(--unactivated-color);
const defaultProp1 = css`
      --mdc-typography-button-font-size: 25px`
const defaultProp2 = css`--mdc-theme-primary: red`

export const globalStyles = css`
  mwc-tab-bar {
   ${defaultProp1};
   ${defaultProp2};
  }
`;
// export const globalStyles = css`
//   mwc-tab-bar {
//     --unactivated-opacity: 0.8;
//     --activated-color: var(--primary-text-color);
//     --unactivated-color: rgb(
//       var(--rgb-primary-text-color),
//       var(--unactivated-opacity)
//     );
//     /* Color of the activated tab's text, indicator, and ripple. */
//     --mdc-theme-primary: var(--activated-color);
//     /*Color of an unactivated tab label.*/
//     --mdc-tab-text-label-color-default: var(--unactivated-color);
//     /* Color of an unactivated icon. */
//     --mdc-tab-color-default: var(--unactivated-color);
//     --mdc-typography-button-font-size: 14px;
//   }
// `;
