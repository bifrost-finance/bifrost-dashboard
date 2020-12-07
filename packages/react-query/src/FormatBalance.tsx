// Copyright 2017-2020 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import React, { useState } from 'react';
import styled from 'styled-components';

import type { ThemeProps } from '@polkadot/react-components/types';
import type { Compact } from '@polkadot/types';
import { formatBalance } from '@polkadot/util';

import { useTranslation } from './translate';

interface Props {
  children?: React.ReactNode;
  className?: string;
  isShort?: boolean;
  label?: React.ReactNode;
  labelPost?: string;
  value?: Compact<any> | BN | string | null | 'all';
  withCurrency?: boolean;
  withSi?: boolean;
}

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;
const K_LENGTH = 3 + 1;

function format (value: Compact<any> | BN | string, currency: string, withCurrency = true, withSi?: boolean, _isShort?: boolean, labelPost?: string): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);
  const unitPost = withCurrency ? formatBalance.getDefaults().unit : '';

  if (prefix.length > M_LENGTH) {
    const [major, rest] = formatBalance(value, { withUnit: false }).split('.');
    const minor = rest.substr(0, 3);
    const unit = rest.substr(3);

    return `${formatBalance(value).substr(0, formatBalance(value).indexOf('ASG'))}${currency}${labelPost || ''}`;
  }

  return <>{`${prefix}${isShort ? '' : '.'}`}{!isShort && (<><span className='ui--FormatBalance-postfix'>{`000${postfix || ''}`.slice(-3)}</span></>)} {`${currency}${labelPost || ''}`}</>;
}

function FormatBalance ({ children, className = '', currency, isShort, label, labelPost, value, withCurrency, withSi }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  let inputcurrency;

  if (currency) {
    inputcurrency = currency;
  } else {
    [inputcurrency] = useState(formatBalance.getDefaults().unit);
  }

  // labelPost here looks messy, however we ensure we have one less text node
  return (
    <div className={`ui--FormatBalance ${className}`}>
      {label || ''}<span className='ui--FormatBalance-value'>{
        value
          ? value === 'all'
            ? t<string>('everything{{labelPost}}', { replace: { labelPost } })
            : format(value, inputcurrency, withSi, isShort, labelPost)
          : `0${labelPost || ''} ${inputcurrency || ''}`
      }</span>
    </div>
  );
}

export default React.memo(styled(FormatBalance)(({ theme }: ThemeProps) => `
  display: inline-block;
  vertical-align: baseline;
  white-space: nowrap;

  * {
    vertical-align: baseline !important;
  }

  > label,
  > .label {
    display: inline-block;
    margin-right: 0.25rem;
    vertical-align: baseline;
  }

  .ui--FormatBalance-unit {
    font-size: 0.825em;
  }

  .ui--FormatBalance-value {
    text-align: right;

    > .ui--FormatBalance-postfix {
      font-weight: ${theme.fontWeightLight};
      opacity: 0.7;
      vertical-align: baseline;
    }
  }

  > .ui--Button {
    margin-left: 0.25rem;
  }

  .ui--Icon {
    margin-bottom: -0.25rem;
    margin-top: 0.25rem;
  }

  .ui--Icon+.ui--FormatBalance-value {
    margin-left: 0.375rem;
  }
`));
