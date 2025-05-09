import type {
  ConfigurationScope,
  // propertyState,
  TabConfig,
  TabbedCardConfig,
  TabAttributes,
  TabStyles,
  TabbedOptions,
} from "./types";
import { editorConfigProperties } from "./types";

type Configuration = TabConfig | TabbedCardConfig;
type SchemaScope = TabAttributes | TabStyles | TabbedOptions;

// property state ideas:
// "override" or ⬆ ▲ ↑
// "inherited" or ⬇ ▼ ↓
type propertyState = "*" | undefined;
// type propertyState = "⬇" | "⬆" | undefined;
// type propertyState = "inherited" | "override" | undefined;

const attributesSchema = [
  {
    type: "constant",
  },
  {
    type: "grid",
    name: "",
    column_min_width: "100px",
    schema: [
      {
        name: "label",
        label: "Tab Label",
        selector: { text: {} },
      },
      {
        name: "icon",
        label: "Tab Icon",
        selector: {
          icon: {
            placeholder: "mdi:home-assistant",
          },
        },
      },
    ],
  },
  {
    type: "grid",
    name: "",
    column_min_width: "200px",
    schema: [{ name: "stacked", label: "Stacked", selector: { boolean: {} } }],
  },
  {
    type: "constant",
    name: "Minimum Width:",
    value: "",
  },
  {
    type: "grid",
    name: "",
    column_min_width: "200px",
    schema: [
      { name: "minWidth", label: "Tab", selector: { boolean: {} } },
      {
        name: "isMinWidthIndicator",
        label: "Indicator",
        selector: { boolean: {} },
      },
    ],
  },
];

const stylesSchema = [
  {
    type: "constant",
  },
  // { name: "text", selector: { text: { multiline: false } } },
  // { name: "text_multiline", selector: { text: { multiline: true } } },
  // {
  //   name: "Color Temperature",
  //   selector: { color_temp: {} },
  // },
  // {
  //   name: "--mdc-theme-primary",
  //   label: "Tab Color",
  //   selector: { color_rgb: {} },
  // },
  // {
  //   name: "--mdc-tab-text-label-color-default",
  //   label: "Unactivated Text Color",
  //   selector: { color_rgb: {} },
  // },
  // {
  //   name: "--mdc-tab-color-default",
  //   label: "Unactivated Icon Color",
  //   selector: { color_rgb: {} },
  // },
  {
    type: "grid",
    name: "",
    column_min_width: "150px",
    schema: [
      {
        name: "--mdc-theme-primary",
        label: "Active Tab Color",
        selector: { color_rgb: {} },
      },
      {
        name: "--mdc-tab-text-label-color-default",
        label: "Inactive Text Color",
        selector: { color_rgb: {} },
      },
      {
        name: "--mdc-tab-color-default",
        label: "Inactive Icon Color",
        selector: { color_rgb: {} },
      },
    ],
  },
  {
    type: "grid",
    name: "",
    column_min_width: "150px",
    schema: [
      {
        name: "--unactivated-opacity",
        label: "Inactive Opacity",
        selector: {
          number: { min: 0, mode: "box" },
        },
      },
      {
        name: "--mdc-typography-button-font-size",
        label: "Label Text Size",
        selector: {
          number: { min: 0, mode: "box" },
        },
      },
    ],
  },
  {
    type: "constant",
  },
];

// --mdc-typography-button-font-size

function getStylesSchema(config: Configuration, schema) {
  if ("tabs" in config) return schema;

  const styles = config?.styles;

  if (styles) {
    const statedSelectors = schema.map(({ name, label, selector, ...rest }) => {
      if (label) {
        const selectorState = Object.hasOwn(styles, name) ? "*" : undefined;

        return {
          name,
          label: `${label}${selectorState ? `${selectorState}` : ""}`,
          selector,
        };
      }

      return rest;
    });

    return statedSelectors;
  }

  return schema;
}

const getOptionsSchema = (config: Configuration) => {
  return "tabs" in config
    ? [
        {
          type: "constant",
        },
        {
          type: "grid",
          name: "",
          column_min_width: "100px",
          schema: [
            {
              name: "defaultTabIndex",
              label: "Default Tab Index",
              selector: {
                number: { min: 0, max: config.tabs.length, mode: "box" },
              },
            },
          ],
        },
        {
          type: "constant",
        },
      ]
    : [
        {
          type: "constant",
        },
        {
          type: "grid",
          name: "",
          column_min_width: "200px",
          schema: [
            {
              name: "isDefaultTab",
              label: "Default Tab",
              selector: { boolean: {} },
            },
          ],
        },
        {
          type: "constant",
        },
      ];
};

// function getPropertyState(config: Configuration, schemaName): propertyState {
//   return Object.hasOwn(config, schemaName) ? "*" : undefined;
// }
function getLocalPropertyState(
  config: Configuration,
  propertySchema,
): propertyState {
  const propertyName = propertySchema.name;

  return Object.hasOwn(config, propertyName) ? "*" : undefined;
}

function getAttributesSchema(config: Configuration, schema) {
  if ("tabs" in config) return schema;
  if ("attributes" in config) {
    return schema.map((schemaItem) => {
      if (schemaItem.schema) {
        const newSchemaSelectors = schemaItem.schema.map((propertySchema) => {
          const propertyState = getLocalPropertyState(
            config["attributes"],
            propertySchema,
          );

          return {
            ...propertySchema,
            label: `${propertySchema.label}${
              propertyState ? `${propertyState}` : ""
            }`,
          };
        });

        return {
          ...schemaItem,
          schema: newSchemaSelectors,
        };
      }

      return schemaItem;
    });
  }

  return schema;
}

export const getSchema = (
  config: Configuration,
  schemaName: typeof editorConfigProperties[number],
) => {
  if (schemaName == "attributes")
    return getAttributesSchema(config, attributesSchema);
  if (schemaName == "styles") return getStylesSchema(config, stylesSchema);
  if (schemaName == "options") return getOptionsSchema(config);
};
