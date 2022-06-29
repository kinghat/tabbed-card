import { LitElement } from "lit";
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class TabbedCard extends LitElement {
  static styles: import("lit").CSSResult;
  /**
   * The name to say "Hello" to.
   */
  name: string;
  /**
   * The number of times the button has been clicked.
   */
  count: number;
  render(): import("lit").TemplateResult<1>;
  private _onClick;
  foo(): string;
}
declare global {
  interface HTMLElementTagNameMap {
    "tabbed-card": TabbedCard;
  }
}
