// Copyright 2017-2021 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

// setup these right at front
import './initSettings';
import 'semantic-ui-css/semantic.min.css';
import '@polkadot/react-components/i18n';

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Api } from '@polkadot/react-api';
import Queue from '@polkadot/react-components/Status/Queue';
import { BlockAuthors, Events } from '@polkadot/react-query';
import settings from '@polkadot/ui-settings';
import ReactGA from 'react-ga';
import Apps from './Apps';
import WindowDimensions from './WindowDimensions';

import Root from './Root';

const rootId = 'root';
const rootElement = document.getElementById(rootId);

ReactGA.initialize('UA-143666394-2');
ReactGA.pageview(window.location.pathname + window.location.search);
if (!rootElement) {
  throw new Error(`Unable to find element with id '${rootId}'`);
}

ReactDOM.render(
  <Root />,
  rootElement
);
