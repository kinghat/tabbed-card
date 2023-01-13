import type {
  ConfigurationScope,
  // propertyState,
  TabConfig,
  TabbedCardConfig,
  TabAttributes,
  TabStyles,
  TabbedOptions,
} from "./types";

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

// TODO: implement styles
const stylesSchema = [
  {
    type: "constant",
    name: "STYLES NOT IMPLEMENTED",
    value: "wat?",
  },
];

const optionsSchema = (globalOptions: TabbedOptions, config: Configuration) => {
  // console.log("optionsSchema: config: ", config);

  return "tabs" in config
    ? // scope == "global"
      [
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
      ]
    : [
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
      ];
};

const getLocalPropertyState = (
  globalConfigProperty: SchemaScope,
  config: Configuration,
  propertySchema,
): propertyState => {
  // if ("tabs" in config) return;
  // const globalHasProperty = Object.hasOwn(globalConfigProperty, propertySchema.name);
  const propertyName = propertySchema.name;
  const globalPropertyValue = globalConfigProperty?.[propertyName];
  const localPropertyValue = config?.[propertyName];
  // let propertyState: propertyState;

  // console.log("getPropertyState: config: ", config);
  // console.log("getPropertyState: propertyName: ", propertyName);
  // console.log("getPropertyState: globalProperty: ", globalPropertyValue);
  // console.log("getPropertyState: localProperty: ", localPropertyValue);

  return Object.hasOwn(config, propertyName) ? "*" : undefined;
};

const attributes = (globalConfig, config, schema) => {
  if ("tabs" in config) return schema;
  if ("attributes" in config) {
    // console.log("attributes: schema: ", schema);

    return schema.map((schemaItem) => {
      // const newSchema = schema.map((schemaItem) => {
      if (schemaItem.schema) {
        const newSchemaSelectors = schemaItem.schema.map((propertySchema) => {
          const propertyState = getLocalPropertyState(
            globalConfig,
            config["attributes"],
            propertySchema,
          );
          // const newSelectorSchema = {
          //   ...propertySchema,
          //   label: `${propertySchema.label}${
          //     propertyState ? ` (${propertyState})` : ""
          //   }`,
          // };

          // console.log("attributes: newSelectorSchema: ", newSelectorSchema);
          // return newSelectorSchema;
          return {
            ...propertySchema,
            label: `${propertySchema.label}${
              propertyState ? `${propertyState}` : ""
            }`,
          };
        });

        // const newSchemaItem = {
        //   ...schemaItem,
        //   schema: newSchemaSelectors,
        // };
        // // console.log("attributes: schemaSelectors: ", newSchemaSelectors);
        // return newSchemaItem;
        return {
          ...schemaItem,
          schema: newSchemaSelectors,
        };
      }

      return schemaItem;
    });
    // console.log("attributes: statedSchema: ", statedSchema);

    // return newSchema;
  }

  // console.log("attributes: schema: ", schema);

  return schema;
};

export const getSCHEMA = (
  globalConfigProp: SchemaScope,
  config: Configuration,
) => {
  // if (scope == "global" && key == "options") {
  //   return [];
  // }
  // return SCHEMA[selection](scope);
  // console.log(
  //   "getSCHEMA: ",
  //   attributes(globalConfigProp, config, attributesSchema),
  // );

  return [
    attributes(globalConfigProp, config, attributesSchema),
    stylesSchema,
    optionsSchema(globalConfigProp, config),
  ];
};

// export const SCHEMA = [attributesSchema, stylesSchema, optionsSchema];
