import type { Blip } from './types';

const spriteCategories = [
  {
    name: 'General',
    sprites: [
      { id: 1, name: 'Standard' },
      { id: 8, name: 'Waypoint' },
      { id: 38, name: 'Race Flag' },
      { id: 280, name: 'Friend' },
    ],
  },
  {
    name: 'Locations',
    sprites: [
      { id: 40, name: 'Safehouse' },
      { id: 60, name: 'Police Station' },
      { id: 61, name: 'Hospital' },
      { id: 71, name: 'Barber' },
      { id: 73, name: 'Clothing Store' },
      { id: 110, name: 'Ammunation' },
    ],
  },
  {
    name: 'Vehicles',
    sprites: [
      { id: 64, name: 'Helicopter' },
      { id: 225, name: 'Car' },
      { id: 226, name: 'Bike' },
      { id: 410, name: 'Boat' },
    ],
  },
];

const commonColors = [
  { id: 0, name: 'White' },
  { id: 1, name: 'Red' },
  { id: 2, name: 'Green' },
  { id: 3, name: 'Blue' },
  { id: 5, name: 'Light Blue' },
  { id: 84, name: 'Gold' },
];

export function installDevMock() {
  let blips: Blip[] = [];
  let nextId = 1;

  const sync = () => setTimeout(() => window.postMessage({ action: 'updateBlips', blips }, '*'), 30);
  const reply = (data: unknown) => Promise.resolve(new Response(JSON.stringify(data)));
  const realFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (!url.startsWith('https://jaydev_blipcreator/')) {
      return realFetch(input, init);
    }

    const event = url.split('/').pop();
    const body = JSON.parse(String(init?.body ?? '{}'));

    switch (event) {
      case 'createBlip':
        blips = [...blips, { ...body, id: nextId++, coords: { x: 0, y: 0, z: 0 } }];
        sync();
        return reply({ success: true });
      case 'updateBlip':
        blips = blips.map((blip) => (blip.id === body.id ? { ...blip, ...body } : blip));
        sync();
        return reply({ success: true });
      case 'deleteBlip':
        blips = blips.filter((blip) => blip.id !== body.id);
        sync();
        return reply({ success: true });
      case 'getNearestBlip':
        return reply(blips[0] ? { success: true, blip: blips[0] } : { success: false });
      default:
        return reply({});
    }
  };

  document.body.style.setProperty('background', '#1b1c22', 'important');

  setTimeout(() => {
    window.postMessage({ action: 'openMenu', blips, commonColors, spriteCategories }, '*');
  }, 50);
}
