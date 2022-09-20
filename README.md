# Tabbed Card

a custom card for home assistant that utilizes tabs to segregate individual cards.

![Tabbed Card](assets/tabs.png)

## Installation

[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

Use [HACS](https://hacs.xyz) or follow this [guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins)

## Eample

```yaml
type: custom:tabbed-card
tabs:
  - name: Air
    card:
      type: entities
      title: Air Quality
      entities:
        - air_quality.demo_air_quality_home
        - air_quality.demo_air_quality_office
  - name: Grid
    card:
      type: grid
      square: false
      columns: 1
      cards:
        - type: humidifier
          entity: humidifier.dehumidifier
        - type: humidifier
          entity: humidifier.humidifier
        - type: humidifier
          entity: humidifier.hygrostat
  - name: Button
    card:
      type: button
      entity: light.bed_light
      tap_action:
        action: toggle
      show_name: true
      show_icon: true
      show_state: true
```

<!-- TODO -->
<!-- ## Options -->
