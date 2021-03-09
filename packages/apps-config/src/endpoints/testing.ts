// Copyright 2017-2021 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TFunction } from 'i18next';
import type { LinkOption } from '../settings/types';

import { expandEndpoints } from './util';

/* eslint-disable sort-keys */

// The available endpoints that will show in the dropdown. For the most part (with the exception of
// Polkadot) we try to keep this to live chains only, with RPCs hosted by the community/chain vendor
//   info: The chain logo name as defined in ../ui/logos/index.ts in namedLogos (this also needs to align with @polkadot/networks)
//   text: The text to display on the dropdown
//   value: The actual hosted secure websocket endpoint

export function createTesting(t: TFunction): LinkOption[] {
  return expandEndpoints(t, [
    // alphabetical based on chain name, e.g. Amber, Arcadia, Beresheet, ...
    {
      info: 'bifrost',
      text: t('rpc.bifrost', 'Bifrost Asgard n1', { ns: 'apps-config' }),
      providers: {
        Bifrost: 'wss://n1.testnet.liebi.com'
      }
    },
    {
      info: 'bifrost',
      text: t('rpc.bifrost', 'Bifrost Asgard n2', { ns: 'apps-config' }),
      providers: {
        Bifrost: 'wss://n2.testnet.liebi.com'
      }
    },
    {
      info: 'bifrost',
      text: t('rpc.bifrost', 'Bifrost Asgard n3', { ns: 'apps-config' }),
      providers: {
        Bifrost: 'wss://n3.testnet.liebi.com'
      }
    }
  ]);
}
