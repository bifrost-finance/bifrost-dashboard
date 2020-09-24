// Copyright 2017-2020 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { DeriveBalancesAll, DeriveDemocracyLock } from '@polkadot/api-derive/types';
import { ActionStatus } from '@polkadot/react-components/Status/types';
import { ProxyDefinition, RecoveryConfig } from '@polkadot/types/interfaces';
import { KeyringAddress } from '@polkadot/ui-keyring/types';
import { Delegation } from '../types';

import BN from 'bn.js';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ApiPromise } from '@polkadot/api';
import Api from '@polkadot/api/promise';
import { getLedger } from '@polkadot/react-api';
import { AddressInfo, AddressMini, AddressSmall, Badge, Button, ChainLock, CryptoType, Forget, Icon, IdentityIcon, LinkExternal, Menu, Popup, StatusContext, Tags } from '@polkadot/react-components';
import { useAccountInfo, useApi, useCall, useToggle } from '@polkadot/react-hooks';
import { Option } from '@polkadot/types';
import keyring from '@polkadot/ui-keyring';
import { BN_ZERO, formatBalance, formatNumber } from '@polkadot/util';

import { useTranslation } from '../translate';
import { createMenuGroup } from '../util';
import Backup from '../modals/Backup';
import ChangePass from '../modals/ChangePass';
import DelegateModal from '../modals/Delegate';
import Derive from '../modals/Derive';
import IdentityMain from '../modals/IdentityMain';
import IdentitySub from '../modals/IdentitySub';
import ProxyOverview from '../modals/ProxyOverview';
import MultisigApprove from '../modals/MultisigApprove';
import RecoverAccount from '../modals/RecoverAccount';
import RecoverSetup from '../modals/RecoverSetup';
import Transfer from '../modals/Transfer';
import UndelegateModal from '../modals/Undelegate';
import useMultisigApprovals from './useMultisigApprovals';
import useProxies from './useProxies';

interface Props {
  account: KeyringAddress;
  className?: string;
  delegation?: Delegation;
  filter: string;
  isFavorite: boolean;
  proxy?: [ProxyDefinition[], BN];
  setBalance: (address: string, value: BN) => void;
  toggleFavorite: (address: string) => void;
}

interface DemocracyUnlockable {
  democracyUnlockTx: SubmittableExtrinsic<'promise'> | null;
  ids: BN[];
}

function calcVisible (filter: string, name: string, tags: string[]): boolean {
  if (filter.length === 0) {
    return true;
  }

  const _filter = filter.toLowerCase();

  return tags.reduce((result: boolean, tag: string): boolean => {
    return result || tag.toLowerCase().includes(_filter);
  }, name.toLowerCase().includes(_filter));
}

function createClearDemocracyTx (api: ApiPromise, address: string, unlockableIds: BN[]): SubmittableExtrinsic<'promise'> {
  return api.tx.utility.batch(
    unlockableIds
      .map((id) => api.tx.democracy.removeVote(id))
      .concat(api.tx.democracy.unlock(address))
  );
}

const transformRecovery = {
  transform: (opt: Option<RecoveryConfig>) => opt.unwrapOr(null)
};

function Account ({ account: { address, meta }, className = '', delegation, filter, isFavorite, proxy, setBalance, toggleFavorite }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { queueExtrinsic } = useContext(StatusContext);
  const api = useApi();
  const bestNumber = useCall<BN>(api.api.derive.chain.bestNumber);
  const balancesAll = useCall<DeriveBalancesAll>(api.api.derive.balances.all, [address]);
  const democracyLocks = useCall<DeriveDemocracyLock[]>(api.api.derive.democracy?.locks, [address]);
  const recoveryInfo = useCall<RecoveryConfig | null>(api.api.query.recovery?.recoverable, [address], transformRecovery);
    const BNC = useCall<DeriveBalancesAll>(api.api.query.voucher.balancesVoucher,[address]);
  const multiInfos = useMultisigApprovals(address);
  const proxyInfo = useProxies(address);
  const { flags: { isDevelopment, isExternal, isHardware, isInjected, isMultisig, isProxied }, genesisHash, identity, name: accName, onSetGenesisHash, tags } = useAccountInfo(address);
  const [{ democracyUnlockTx }, setUnlockableIds] = useState<DemocracyUnlockable>({ democracyUnlockTx: null, ids: [] });
  const [vestingVestTx, setVestingTx] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [otherBalance, setotherBalance] = useState({});
  const [finishBalance,setFinishBalance] = useState(false);
  const [isBackupOpen, toggleBackup] = useToggle();
  const [isDeriveOpen, toggleDerive] = useToggle();
  const [isForgetOpen, toggleForget] = useToggle();
  const [isIdentityMainOpen, toggleIdentityMain] = useToggle();
  const [isIdentitySubOpen, toggleIdentitySub] = useToggle();
  const [isMultisigOpen, toggleMultisig] = useToggle();
  const [isProxyOverviewOpen, toggleProxyOverview] = useToggle();
  const [isPasswordOpen, togglePassword] = useToggle();
  const [isRecoverAccountOpen, toggleRecoverAccount] = useToggle();
  const [isRecoverSetupOpen, toggleRecoverSetup] = useToggle();
  const [isSettingsOpen, toggleSettings] = useToggle();
  const [isTransferOpen, toggleTransfer] = useToggle();
  const [isDelegateOpen, toggleDelegate] = useToggle();
  const [isUndelegateOpen, toggleUndelegate] = useToggle();

  useEffect((): void => {
    if (balancesAll) {
      setBalance(address, balancesAll.freeBalance.add(balancesAll.reservedBalance));

      api.api.tx.vesting?.vest && setVestingTx(() =>
        balancesAll.vestingLocked.isZero()
          ? null
          : api.api.tx.vesting.vest()
      );
    }
  }, [address, api, balancesAll, setBalance]);

    useEffect((): void => {
        let aUSD:any, DOT:any, vDOT:any, KSM:any, vKSM:any, EOS:any, vEOS:any;
        (async () => {
            // await api.api.query.voucher.balancesVoucher([address], (res) => {
            //     BNC = Number(res?.toJSON());
            // })
            // console.log('能获取到state吗？' + JSON.stringify(otherBalance))
            let otherBalanceCopy:any;
            await api.api.query.assets.accountAssets(['aUSD', address], (res:any) => {
                aUSD = new BN(Number(res['balance']).toString());
                // console.log('********aUSD' + aUSD);
                // console.log('能获取到state吗2？' + JSON.stringify(otherBalance))
                if (otherBalance) {
                    otherBalanceCopy = Object.assign(otherBalance, {aUSD});
                } else {
                    otherBalanceCopy = Object.assign({}, {aUSD});
                }
                setotherBalance(otherBalanceCopy);
            });
            await api.api.query.assets.accountAssets(['DOT', address], (res:any) => {
                DOT = new BN(Number(res['balance']).toString());
                // console.log('********DOT' + DOT + 'otherBalance**' + otherBalance);
                // console.log('能获取到state吗3？' + JSON.stringify(otherBalance))
                if (otherBalance) {
                    otherBalanceCopy = Object.assign(otherBalance, {DOT});
                } else {
                    otherBalanceCopy = Object.assign({}, {DOT});
                }
                setotherBalance(otherBalanceCopy);
            })
            await api.api.query.assets.accountAssets(['vDOT', address], (res:any) => {
                // console.log('能获取到state吗4？' + JSON.stringify(otherBalance))
                vDOT = new BN(Number(res['balance']).toString());
                // console.log('********vDOT' + vDOT);
                if (otherBalance) {
                    otherBalanceCopy = Object.assign(otherBalance, {vDOT});
                } else {
                    otherBalanceCopy = Object.assign({}, {vDOT});
                }
                setotherBalance(otherBalanceCopy);
            })
            await api.api.query.assets.accountAssets(['KSM', address], (res:any) => {
                KSM = new BN(Number(res['balance']).toString());
                // console.log('********KSM' + KSM);
                // console.log('能获取到state吗5？' + JSON.stringify(otherBalance))
                if (otherBalance) {
                    otherBalanceCopy = Object.assign(otherBalance, {KSM});
                } else {
                    otherBalanceCopy = Object.assign({}, {KSM});
                }
                setotherBalance(otherBalanceCopy);
            })
            await api.api.query.assets.accountAssets(['vKSM', address], (res:any) => {
                vKSM = new BN(Number(res['balance']).toString());
                // console.log('********vKSM' + vKSM);
                // console.log('能获取到state吗6？' + JSON.stringify(otherBalance))
                if (otherBalance) {
                    otherBalanceCopy = Object.assign(otherBalance, {vKSM});
                } else {
                    otherBalanceCopy = Object.assign({}, {vKSM});
                }
                setotherBalance(otherBalanceCopy);
            })
            await api.api.query.assets.accountAssets(['EOS', address], (res:any) => {
               EOS = new BN(Number(res['balance']).toString());
                // console.log('********EOS' + EOS);
                // console.log('能获取到state吗7？' + JSON.stringify(otherBalance))
                if (otherBalance) {
                    otherBalanceCopy = Object.assign(otherBalance, {EOS});
                } else {
                    otherBalanceCopy = Object.assign({}, {EOS});
                }
                setotherBalance(otherBalanceCopy);
            })
            await api.api.query.assets.accountAssets(['vEOS', address], (res:any) => {
               vEOS = new BN(Number(res['balance']).toString());
                // console.log('能获取到state吗8？' + JSON.stringify(otherBalance))
                if (otherBalance) {
                    otherBalanceCopy = Object.assign(otherBalance, {vEOS});
                } else {
                    otherBalanceCopy = Object.assign({}, {vEOS});
                }
                setotherBalance(otherBalanceCopy);
                setFinishBalance(true);
            })
            // setotherBalance(
            //   { aUSD, DOT, vDOT, KSM, vKSM, EOS, vEOS }
            // )
        })();
    }, []);

  useEffect((): void => {
    bestNumber && democracyLocks && setUnlockableIds(
      (prev): DemocracyUnlockable => {
        const ids = democracyLocks
          .filter(({ isFinished, unlockAt }) => isFinished && bestNumber.gt(unlockAt))
          .map(({ referendumId }) => referendumId);

        if (JSON.stringify(prev.ids) === JSON.stringify(ids)) {
          return prev;
        }

        return {
          democracyUnlockTx: createClearDemocracyTx(api.api, address, ids),
          ids
        };
      }
    );
  }, [address, api, bestNumber, democracyLocks]);

  const isVisible = useMemo(
    () => calcVisible(filter, accName, tags),
    [accName, filter, tags]
  );

  const _onFavorite = useCallback(
    () => toggleFavorite(address),
    [address, toggleFavorite]
  );

  const _onForget = useCallback(
    (): void => {
      if (!address) {
        return;
      }

      const status: Partial<ActionStatus> = {
        account: address,
        action: 'forget'
      };

      try {
        keyring.forgetAccount(address);
        status.status = 'success';
        status.message = t<string>('account forgotten');
      } catch (error) {
        status.status = 'error';
        status.message = (error as Error).message;
      }
    },
    [address, t]
  );

  const _clearDemocracyLocks = useCallback(
    () => democracyUnlockTx && queueExtrinsic({
      accountId: address,
      extrinsic: democracyUnlockTx
    }),
    [address, democracyUnlockTx, queueExtrinsic]
  );

  const _vestingVest = useCallback(
    () => vestingVestTx && queueExtrinsic({
      accountId: address,
      extrinsic: vestingVestTx
    }),
    [address, queueExtrinsic, vestingVestTx]
  );

  const _showOnHardware = useCallback(
    // TODO: we should check the hardwareType from metadata here as well,
    // for now we are always assuming hardwareType === 'ledger'
    (): void => {
      getLedger()
        .getAddress(true, meta.accountOffset as number || 0, meta.addressOffset as number || 0)
        .catch((error): void => {
          console.error(`ledger: ${(error as Error).message}`);
        });
    },
    [meta]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <tr className={className}>
      <td className='favorite'>
        <Icon
          color={isFavorite ? 'orange' : 'gray'}
          icon='star'
          onClick={_onFavorite}
        />
      </td>
      <td className='together'>
        {recoveryInfo && (
          <Badge
            color='green'
            hover={
              <div>
                <p>{t<string>('This account is recoverable, with the following friends:')}</p>
                <div>
                  {recoveryInfo.friends.map((friend, index): React.ReactNode => (
                    <IdentityIcon
                      key={index}
                      value={friend}
                    />
                  ))}
                </div>
                <table>
                  <tbody>
                    <tr>
                      <td>{t<string>('threshold')}</td>
                      <td>{formatNumber(recoveryInfo.threshold)}</td>
                    </tr>
                    <tr>
                      <td>{t<string>('delay')}</td>
                      <td>{formatNumber(recoveryInfo.delayPeriod)}</td>
                    </tr>
                    <tr>
                      <td>{t<string>('deposit')}</td>
                      <td>{formatBalance(recoveryInfo.deposit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            }
            icon='shield'
          />
        )}
        {multiInfos && multiInfos.length !== 0 && (
          <Badge
            color='red'
            hover={t<string>('Multisig approvals pending')}
            info={multiInfos.length}
          />
        )}
        {isProxied && !proxyInfo.hasOwned && (
          <Badge
            color='red'
            hover={t<string>('Proxied account has no owned proxies')}
            info='0'
          />
        )}
        {delegation?.accountDelegated && (
          <Badge
            color='blue'
            hover={t<string>('This account has a governance delegation')}
            icon='calendar-check'
            onClick={toggleDelegate}
          />
        )}
        { !!proxy?.[0].length && (
          <Badge
            color='blue'
            hover={t<string>('This account has {{proxyNumber}} proxy set.', {
              replace: {
                proxyNumber: proxy[0].length
              }
            })}
            icon='arrow-right'
            onClick={toggleProxyOverview}
          />
        )}
      </td>
      <td className='address'>
        <AddressSmall value={address} />
        {isBackupOpen && (
          <Backup
            address={address}
            key='modal-backup-account'
            onClose={toggleBackup}
          />
        )}
        {isDelegateOpen && (
          <DelegateModal
            key='modal-delegate'
            onClose={toggleDelegate}
            previousAmount={delegation?.amount}
            previousConviction={delegation?.conviction}
            previousDelegatedAccount={delegation?.accountDelegated}
            previousDelegatingAccount={address}
          />
        )}
        {isDeriveOpen && (
          <Derive
            from={address}
            key='modal-derive-account'
            onClose={toggleDerive}
          />
        )}
        {isForgetOpen && (
          <Forget
            address={address}
            key='modal-forget-account'
            onClose={toggleForget}
            onForget={_onForget}
          />
        )}
        {isIdentityMainOpen && (
          <IdentityMain
            address={address}
            key='modal-identity-main'
            onClose={toggleIdentityMain}
          />
        )}
        {isIdentitySubOpen && (
          <IdentitySub
            address={address}
            key='modal-identity-sub'
            onClose={toggleIdentitySub}
          />
        )}
        {isPasswordOpen && (
          <ChangePass
            address={address}
            key='modal-change-pass'
            onClose={togglePassword}
          />
        )}
        {isTransferOpen && (
          <Transfer
            key='modal-transfer'
            onClose={toggleTransfer}
            senderId={address}
          />
        )}
        {isProxyOverviewOpen && (
          <ProxyOverview
            key='modal-proxy-overview'
            onClose={toggleProxyOverview}
            previousProxy={proxy}
            proxiedAccount={address}
          />
        )}
        {isMultisigOpen && multiInfos && (
          <MultisigApprove
            address={address}
            key='multisig-approve'
            onClose={toggleMultisig}
            ongoing={multiInfos}
            threshold={meta.threshold as number}
            who={meta.who as string[]}
          />
        )}
        {isRecoverAccountOpen && (
          <RecoverAccount
            address={address}
            key='recover-account'
            onClose={toggleRecoverAccount}
          />
        )}
        {isRecoverSetupOpen && (
          <RecoverSetup
            address={address}
            key='recover-setup'
            onClose={toggleRecoverSetup}
          />
        )}
        {isUndelegateOpen && (
          <UndelegateModal
            accountDelegating={address}
            key='modal-delegate'
            onClose={toggleUndelegate}
          />
        )}
      </td>
      <td className='address media--1400'>
        {meta.parentAddress && (
          <AddressMini value={meta.parentAddress} />
        )}
      </td>
      <td className='number'>
        <CryptoType accountId={address} />
      </td>
      <td className='all'>
        <div className='tags'>
          <Tags value={tags} />
        </div>
      </td>
      <td className='number media--1500'>
        {balancesAll?.accountNonce.gt(BN_ZERO) && formatNumber(balancesAll.accountNonce)}
      </td>
      <td className='number'>
        {
          otherBalance && finishBalance ?
              <AddressInfo
              address={address}
              withBalance
              withBalanceToggle
              withExtended={false}
              otherBalance={otherBalance}
              BNCVal={BNC || 0}
            />:
            <AddressInfo
              address={address}
              withBalance
              withBalanceToggle
              withExtended={false}
              BNCVal={BNC || 0}
            />
        }
      </td>
      <td className='button'>
        {api.api.tx.balances?.transfer && (
          <Button
            icon='paper-plane'
            label={t<string>('send')}
            onClick={toggleTransfer}
          />
        )}
        <Popup
          className='theme--default'
          isOpen={isSettingsOpen}
          onClose={toggleSettings}
          trigger={
            <Button
              icon='ellipsis-v'
              onClick={toggleSettings}
            />
          }
        >
          <Menu
            onClick={toggleSettings}
            text
            vertical
          >
            {createMenuGroup([
              api.api.tx.identity?.setIdentity && (
                <Menu.Item
                  key='identityMain'
                  onClick={toggleIdentityMain}
                >
                  {t('Set on-chain identity')}
                </Menu.Item>
              ),
              api.api.tx.identity?.setSubs && identity?.display && (
                <Menu.Item
                  key='identitySub'
                  onClick={toggleIdentitySub}
                >
                  {t('Set on-chain sub-identities')}
                </Menu.Item>
              ),
              api.api.tx.democracy?.unlock && democracyUnlockTx && (
                <Menu.Item
                  key='clearDemocracy'
                  onClick={_clearDemocracyLocks}
                >
                  {t('Clear expired democracy locks')}
                </Menu.Item>
              ),
              api.api.tx.vesting?.vest && vestingVestTx && (
                <Menu.Item
                  key='vestingVest'
                  onClick={_vestingVest}
                >
                  {t('Unlock vested amount')}
                </Menu.Item>
              )
            ])}
            {createMenuGroup([
              !(isExternal || isHardware || isInjected || isMultisig) && (
                <Menu.Item
                  key='deriveAccount'
                  onClick={toggleDerive}
                >
                  {t('Derive account via derivation path')}
                </Menu.Item>
              ),
              isHardware && (
                <Menu.Item
                  key='showHwAddress'
                  onClick={_showOnHardware}
                >
                  {t('Show address on hardware device')}
                </Menu.Item>
              )
            ])}
            {createMenuGroup([
              !(isExternal || isInjected || isMultisig || isDevelopment) && (
                <Menu.Item
                  key='backupJson'
                  onClick={toggleBackup}
                >
                  {t('Create a backup file for this account')}
                </Menu.Item>
              ),
              !(isExternal || isInjected || isMultisig || isDevelopment) && (
                <Menu.Item
                  key='changePassword'
                  onClick={togglePassword}
                >
                  {t("Change this account's password")}
                </Menu.Item>
              ),
              !(isInjected || isDevelopment) && (
                <Menu.Item
                  key='forgetAccount'
                  onClick={toggleForget}
                >
                  {t('Forget this account')}
                </Menu.Item>
              )
            ])}
            {api.api.tx.recovery?.createRecovery && createMenuGroup([
              !recoveryInfo && (
                <Menu.Item
                  key='makeRecoverable'
                  onClick={toggleRecoverSetup}
                >
                  {t('Make recoverable')}
                </Menu.Item>
              ),
              <Menu.Item
                key='initRecovery'
                onClick={toggleRecoverAccount}
              >
                {t('Initiate recovery for another')}
              </Menu.Item>
            ])}
            {api.api.tx.multisig?.asMulti && isMultisig && createMenuGroup([
              <Menu.Item
                disabled={!multiInfos || !multiInfos.length}
                key='multisigApprovals'
                onClick={toggleMultisig}
              >
                {t('Multisig approvals')}
              </Menu.Item>
            ])}
            {api.api.query.democracy?.votingOf && delegation?.accountDelegated && createMenuGroup([
              <Menu.Item
                key='changeDelegate'
                onClick={toggleDelegate}
              >
                {t('Change democracy delegation')}
              </Menu.Item>,
              <Menu.Item
                key='undelegate'
                onClick={toggleUndelegate}
              >
                {t('Undelegate')}
              </Menu.Item>
            ])}
            {api.api.query.democracy?.votingOf && !delegation?.accountDelegated && createMenuGroup([
              <Menu.Item
                key='delegate'
                onClick={toggleDelegate}
              >
                {t('Delegate democracy votes')}
              </Menu.Item>
            ])}
            {api.api.query.proxy?.proxies && createMenuGroup([
              <Menu.Item
                key='proxy-overview'
                onClick={toggleProxyOverview}
              >
                {proxy?.[0].length
                  ? t('Manage proxies')
                  : t('Add proxy')
                }
              </Menu.Item>
            ])}
            <ChainLock
              className='accounts--network-toggle'
              genesisHash={genesisHash}
              isDisabled={api.isDevelopment}
              onChange={onSetGenesisHash}
            />
          </Menu>
        </Popup>
      </td>
      <td className='links media--1400'>
        <LinkExternal
          className='ui--AddressCard-exporer-link'
          data={address}
          isLogo
          type='address'
        />
      </td>
    </tr>
  );
}

export default React.memo(styled(Account)`
  .tags {
    width: 100%;
    min-height: 1.5rem;
  }
`);
