// Copyright 2017-2020 @polkadot/apps-config authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// defaults
const defaultColor = undefined; // '#f19135'
const emptyColor = '#999';

// based on chain name
// alphabetical
const chainCrab = '#7C30DD';
const chainCrust = '#ff8812';
const chainKulupu = '#003366';
const chainPhala = '#4dc56a';
const chainPolkadot = '#e6007a';
const chainKusama = '#000'; // '#d32e79';
const chainRocco = '#6f36dc';
const chainRoccoAcala = '#173DC9';
const chainRoccoDarwinia = '#7C30DD';
const chainRococoLaminar = '#004FFF';
const chainRoccoTick = '#22bb22';
const chainRoccoTrack = '#bb2222';
const chainRoccoTrick = '#2222bb';
const chainWestend = '#da68a7';
const chainBifrost = '#002cc3';

// based on node name
// alphabetical
const nodeCentrifuge = '#fcc367';
const nodeEdgeware = '#0a95df';
const nodeNodle = '#1ab394';
const nodeKilt = '#eb5b2a';
const nodeSubsocial = '#b9018c';
const nodeBifrost = '#002cc3';

// overrides based on the actual matched chain name
const chainColors: Record<string, any> = [
  ['Kulupu', chainKulupu],
  ['Kusama', chainKusama],
  ['Kusama CC1', chainKusama],
  ['Kusama CC2', chainKusama],
  ['Kusama CC3', chainKusama],
  ['Polkadot', chainPolkadot],
  ['Polkadot CC1', chainPolkadot],
  ['Westend', chainWestend],
  ['Bifrost', chainBifrost]
].reduce((colors, [chain, color]): Record<string, any> => ({
  ...colors,
  [chain.toLowerCase()]: color
}), {});

// overrides based on the actual software node type (all '-' converted to ' ')
// alphabetical
const nodeColors: Record<string, any> = [
  ['centrifuge chain', nodeCentrifuge],
  ['edgeware node', nodeEdgeware],
  ['nodle chain node', nodeNodle],
  ['bifrost node', nodeBifrost]
  // ['node template', emptyColor],
  // ['parity polkadot', emptyColor],
  // ['substrate node', emptyColor]
].reduce((colors, [node, color]): Record<string, any> => ({
  ...colors,
  [node.toLowerCase().replace(/-/g, ' ')]: color
}), {});

export {
  defaultColor,
  chainColors,
  emptyColor,
  nodeColors
};
