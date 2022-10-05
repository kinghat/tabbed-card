# Tabbed Card

A custom card for home assistant that utilizes tabs to segregate individual cards.

⚠️ CURRENTLY ONLY LOOKS ACCEPTABLE IN DARK MODE ⚠️

![Tabbed Card](assets/tabs.png)

## Installation

[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

Use [HACS](https://hacs.xyz) or follow this [guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins)

## Card Schema

```yaml
type: custom:tabbed-card
options?:
  defaultTabIndex?: number
styles?:
attributes?:
  label?: string
  icon?: string
  isFadingIndicator?: boolean
  minWidth?: boolean
  isMinWidthIndicator?: boolean
  stacked?: boolean
tabs:
  - card:
      type:
    styles?:
    attributes?:
      label?: string
      icon?: string
      isFadingIndicator?: boolean
      minWidth?: boolean
      isMinWidthIndicator?: boolean
      stacked?: boolean
```

### Eample

```yaml
- type: custom:tabbed-card
  tabs:
    - card:
        type: button
        entity: light.bed_light
        tap_action:
          action: toggle
        show_name: true
        show_icon: true
        show_state: true
      attributes:
        label: Button
    - card:
        type: entities
        title: Air Quality
        entities:
          - air_quality.demo_air_quality_home
          - air_quality.demo_air_quality_office
      attributes:
        label: Air Quality
    - card:
        type: entities
        title: Binary sensor
        entities:
          - binary_sensor.basement_floor_wet
          - binary_sensor.movement_backyard
      attributes:
        label: Binary Sensor
    - card:
        type: entities
        title: Calendar
        entities:
          - entity: calendar.calendar_1
            name: "1"
          - entity: calendar.calendar_2
            name: "2"
      attributes:
        label: Calendar
```

<!-- TODO: options -->
<!-- ## Options -->

## Styling

This card tries to closely match home assistants default tab styles. You can override and apply additional styling to the card via provided material web components custom properties.

### Default Custom Properties

| Name                                 | Default                    | Description                                                                                                                                                    |
| ------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--mdc-theme-primary`                | `--primary-text-color`     | Color of the activated tab's text, indicator, and ripple.                                                                                                      |
| `--mdc-tab-text-label-color-default` | `rgba(225, 225, 225, 0.8)` | Color of an unactivated tab label. **_If you want transpareny on the unactivated tabs, you need to use an `rgba` value incorporating the 4th alpha channel._** |
| `--mdc-typography-button-font-size`  | `14px`                     | Font size of the tab label.                                                                                                                                    |

![Styling](assets/styling.png)

```yaml
type: custom:tabbed-card
styles:
  --mdc-theme-primary: yellow
  --mdc-tab-text-label-color-default: orange
tabs: ...
```

See the full list of exposed custom properties: [`<mwc-tab>`](https://github.com/material-components/material-web/blob/mwc/packages/tab/README.md#css-custom-properties)

<!-- TODO: implement customizing tabs attributes -->
<!-- TODO: credits -->
