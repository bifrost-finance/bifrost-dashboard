// Copyright 2017-2020 @polkadot/apps-config authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default {
    // chain-specific
    "Token": {
        "symbol": "Vec<u8>",
        "precision": "u16",
        "totalSupply": "u128"
    },
    "VersionId": "u32",
    "Action": {
        "account": "AccountName",
        "name": "ActionName",
        "authorization": "Vec<PermissionLevel>",
        "data": "Vec<u8>"
    },
    "ActionReceipt": {
        "receiver": "AccountName",
        "act_digest": "Checksum256",
        "global_sequence": "u64",
        "recv_sequence": "u64",
        "auth_sequence": "FlatMap<AccountName, u64>",
        "code_sequence": "UnsignedInt",
        "abi_sequence": "UnsignedInt"
    },
    "Checksum256": "([u8;32])",
    "BlockchainType": {
        "_enum": [
            "BIFROST",
            "EOS"
        ]
    },
    "Precision": "u32",
    "BridgeAssetSymbol": {
        "blockchain": "BlockchainType",
        "symbol": "Vec<u8>",
        "precision": "Precision"
    },
    "ProducerSchedule": {
        "version": "u32",
        "producers": "Vec<ProducerKey>"
    },
    "ProducerKey": {
        "producer_name": "AccountName",
        "block_signing_key": "PublicKey"
    },
    "AccountName": "u64",
    "ActionName": "u64",
    "PublicKey": {
        "type_": "UnsignedInt",
        "data": "[u8;33]"
    },
    "UnsignedInt": "u32",
    "SignedBlockHeader": {
        "block_header": "BlockHeader"
    },
    "BlockHeader": {
        "timestamp": "BlockTimestamp",
        "producer": "AccountName",
        "confirmed": "u16",
        "previous": "Checksum256",
        "transaction_mroot": "Checksum256",
        "action_mroot": "Checksum256",
        "schedule_version": "u32",
        "new_producers": "Option<ProducerSchedule>",
        "header_extensions": "Vec<Extension>"
    },
    "BlockTimestamp": "(u32)",
    "Extension": "(u16, Vec<u8>)",
    "IncrementalMerkle": {
        "_node_count": "u64",
        "_active_nodes": "Vec<Checksum256>"
    },
    "BalanceDuration": {
        "last_block": "BlockNumber",
        "last_balance": "Balance",
        "value": "Duration"
    },
    "FlatMap": {
        "map": "Vec<(ActionName, u64)>"
    },
    "TxOut": {},
    "ConvertPrice": "u128",
    "RatePerBlock": "u64",
    "Fee": "u64",
    "TokenPool": "Balance",
    "VTokenPool": "Balance",
    "InVariantPool": "Balance",
    "TokenType": {
        "_enum": ["Token", "VToken"]
    },
    "TokenPair": {
        "token": "Token",
        "vtoken": "Token"
    },
    "Cost": "u128",
    "Income": "u128",
    "Price": "u64",
    "AccountAsset": {
        "balance": "Balance",
        "cost": "Cost",
        "income": "Income"
    },
    "SpecIndex": "u32",
    "RequestIdentifier": "u64",
    "DataVersion": "u64",
    "AssetSymbol": {
        "_enum": [
            "DOT",
            "KSM",
            "EOS"
        ]
    },
    "ConvertPool": {
        "token_pool": "Balance",
        "vtoken_pool": "Balance",
        "current_reward": "Balance",
        "pending_reward": "Balance"
    },
    "ProducerAuthoritySchedule": {
        "version": "u32",
        "producers": "Vec<ProducerAuthority>"
    },
    "ProducerAuthority": {
        "producer_name": "ActionName",
        "authority": "BlockSigningAuthority"
    },
    "BlockSigningAuthority": "(UnsignedInt, BlockSigningAuthorityV0)",
    "BlockSigningAuthorityV0": {
        "threshold": "u32",
        "keys": "Vec<KeyWeight>"
    },
    "KeyWeight": {
        "key": "PublicKey",
        "weight": "u16"
    }
};
