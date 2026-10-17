// Synthetic cards only. Do not copy HA storage, personal entities or image assets.
export const fixture = {
  type: 'custom:tabbed-card',
  options: {defaultTabIndex: 1, futureOption: {keep: true}},
  styles: {'--mdc-theme-primary': 'var(--primary-color)'},
  tabs: [
    {attributes: {label: 'Rooms', icon: 'mdi:floor-plan', extra: 5}, card: {
      type: 'vertical-stack', cards: [
        {type: 'picture-elements', image: '/local/example-off.png', elements: [
          {type: 'conditional', conditions: [{entity: 'light.example', state: 'on'}], elements: [
            {type: 'image', image: '/local/example-on.png', style: {'clip-path': 'polygon(0% 0%,50% 0%,50% 100%)', opacity: 0.38}},
          ]},
        ], uix: {style: 'ha-card { border: none; }'}},
        {type: 'custom:expander-card', expanded: false, padding: '0em',
          'title-card': {type: 'custom:vertical-stack-in-card', cards: [
            {type: 'custom:example-title', title: 'Room A', extra: {preserve: true}},
          ]}, cards: [{type: 'grid', columns: 2, square: false, cards: [
            {type: 'custom:example-control', entity: 'light.example', name: 'Lamp',
              tap_action: {action: 'more-info'}, card_mod: {style: ':host { opacity: .9; }'}},
          ]}]},
      ],
    }},
    {attributes: {label: 'Other', icon: 'mdi:home'}, card: {type: 'entities', entities: ['sensor.example']}},
  ],
};
