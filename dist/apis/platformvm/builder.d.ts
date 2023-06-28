/**
 * @packageDocumentation
 * @module API-PlatformVM-Builder
 */
import BN from "bn.js";
import { Buffer } from "buffer/";
import { OutputOwners } from "../../common";
import { AssetAmountDestination, ClaimAmountParams, MultisigAliasParams, UnsignedTx, UTXO } from ".";
import { GenesisData } from "../avm";
import { Offer } from "../../apis/platformvm/adddepositoffertx";
export type LockMode = "Unlocked" | "Bond" | "Deposit" | "Stake";
export interface MinimumSpendable {
    getMinimumSpendable(aad: AssetAmountDestination, asOf: BN, locktime: BN, lockMode: LockMode): Promise<Error>;
}
export type FromSigner = {
    from: Buffer[];
    signer: Buffer[];
};
export type NodeOwner = {
    address: Buffer;
    auth: [number, Buffer][];
};
export type Auth = {
    addresses: Buffer[];
    threshold: number;
    signer: [number, Buffer][];
};
export declare class Builder {
    spender: MinimumSpendable;
    caminoEnabled: boolean;
    constructor(spender: MinimumSpendable, caminoEnabled: boolean);
    /**
     * Creates an [[UnsignedTx]] wrapping a [[BaseTx]]. For more granular control, you may create your own
     * [[UnsignedTx]] wrapping a [[BaseTx]] manually (with their corresponding [[TransferableInput]]s and [[TransferableOutput]]s).
     *
     * @param networkID The number representing NetworkID of the node
     * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
     * @param amount The amount of the asset to be spent in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}.
     * @param assetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for the UTXO
     * @param toAddresses The addresses to send the funds
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs. Default: toAddresses
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned. Default: assetID
     * @param memo Optional. Contains arbitrary data, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param locktime Optional. The locktime field created in the resulting outputs
     * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned transaction created from the passed in parameters.
     *
     */
    buildBaseTx: (networkID: number, blockchainID: Buffer, amount: BN, amountAssetID: Buffer, toAddresses: Buffer[], fromSigner: FromSigner, changeAddresses?: Buffer[], fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, lockTime?: BN, toThreshold?: number, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Creates an unsigned ImportTx transaction.
     *
     * @param networkID The number representing NetworkID of the node
     * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
     * @param toAddresses The addresses to send the funds
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs. Default: toAddresses
     * @param importIns An array of [[TransferableInput]]s being imported
     * @param sourceChain A {@link https://github.com/feross/buffer|Buffer} for the chainid where the imports are coming from.
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}. Fee will come from the inputs first, if they can.
     * @param feeAssetID Optional. The assetID of the fees being burned.
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param locktime Optional. The locktime field created in the resulting outputs
     * @param toThreshold Optional. The number of signatures required to spend the funds in the received UTXO
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned transaction created from the passed in parameters.
     *
     */
    buildImportTx: (networkID: number, blockchainID: Buffer, toAddresses: Buffer[], fromSigner: FromSigner, changeAddresses: Buffer[], atomics: UTXO[], sourceChain?: Buffer, fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, locktime?: BN, toThreshold?: number, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Creates an unsigned ExportTx transaction.
     *
     * @param networkID The number representing NetworkID of the node
     * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
     * @param amount The amount being exported as a {@link https://github.com/indutny/bn.js/|BN}
     * @param avaxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for AVAX
     * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who recieves the AVAX
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover of the AVAX
     * @param destinationChain Optional. A {@link https://github.com/feross/buffer|Buffer} for the chainid where to send the asset.
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned.
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param locktime Optional. The locktime field created in the resulting outputs
     * @param toThreshold Optional. The number of signatures required to spend the funds in the received UTXO
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned transaction created from the passed in parameters.
     *
     */
    buildExportTx: (networkID: number, blockchainID: Buffer, amount: BN, amountAssetID: Buffer, toAddresses: Buffer[], fromSigner: FromSigner, destinationChain: Buffer, changeAddresses?: Buffer[], fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, locktime?: BN, toThreshold?: number, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Class representing an unsigned [[AddSubnetValidatorTx]] transaction.
     *
     * @param networkID Networkid, [[DefaultNetworkID]]
     * @param blockchainID Blockchainid, default undefined
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
     * @param nodeID The node ID of the validator being added.
     * @param startTime The Unix time when the validator starts validating the Primary Network.
     * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
     * @param weight The amount of weight for this subnet validator.
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned.
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param subnetAuth Optional. An Auth struct which contains the subnet Auth and the signers.
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned transaction created from the passed in parameters.
     */
    buildAddSubnetValidatorTx: (networkID: number, blockchainID: Buffer, fromSigner: FromSigner, changeAddresses: Buffer[], nodeID: Buffer, startTime: BN, endTime: BN, weight: BN, subnetID: string, fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, subnetAuth?: Auth, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Class representing an unsigned [[AddDelegatorTx]] transaction.
     *
     * @param networkID Networkid, [[DefaultNetworkID]]
     * @param blockchainID Blockchainid, default undefined
     * @param avaxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for AVAX
     * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} recieves the stake at the end of the staking period
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the staking payment
     * @param nodeID The node ID of the validator being added.
     * @param startTime The Unix time when the validator starts validating the Primary Network.
     * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
     * @param stakeAmount A {@link https://github.com/indutny/bn.js/|BN} for the amount of stake to be delegated in nAVAX.
     * @param rewardLocktime The locktime field created in the resulting reward outputs
     * @param rewardThreshold The number of signatures required to spend the funds in the resultant reward UTXO
     * @param rewardAddresses The addresses the validator reward goes.
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned.
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param toThreshold Optional. The number of signatures required to spend the funds in the stake UTXO
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the change UTXO
     *
     * @returns An unsigned transaction created from the passed in parameters.
     */
    buildAddDelegatorTx: (networkID: number, blockchainID: Buffer, avaxAssetID: Buffer, toAddresses: Buffer[], fromSigner: FromSigner, changeAddresses: Buffer[], nodeID: Buffer, startTime: BN, endTime: BN, stakeAmount: BN, rewardLocktime: BN, rewardThreshold: number, rewardAddresses: Buffer[], fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, toThreshold?: number, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Class representing an unsigned [[AddValidatorTx]] transaction.
     *
     * @param networkID NetworkID, [[DefaultNetworkID]]
     * @param blockchainID BlockchainID, default undefined
     * @param avaxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for AVAX
     * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} recieves the stake at the end of the staking period
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the staking payment
     * @param nodeID The node ID of the validator being added.
     * @param startTime The Unix time when the validator starts validating the Primary Network.
     * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
     * @param stakeAmount A {@link https://github.com/indutny/bn.js/|BN} for the amount of stake to be delegated in nAVAX.
     * @param rewardLocktime The locktime field created in the resulting reward outputs
     * @param rewardThreshold The number of signatures required to spend the funds in the resultant reward UTXO
     * @param rewardAddresses The addresses the validator reward goes.
     * @param delegationFee A number for the percentage of reward to be given to the validator when someone delegates to them. Must be between 0 and 100.
     * @param minStake A {@link https://github.com/indutny/bn.js/|BN} representing the minimum stake required to validate on this network.
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned.
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param toThreshold Optional. The number of signatures required to spend the funds in the stake UTXO
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the change UTXO
     */
    buildAddValidatorTx: (networkID: number, blockchainID: Buffer, toAddresses: Buffer[], fromSigner: FromSigner, changeAddresses: Buffer[], nodeID: Buffer, startTime: BN, endTime: BN, stakeAmount: BN, stakeAssetID: Buffer, rewardLocktime: BN, rewardThreshold: number, rewardAddresses: Buffer[], delegationFee: number, fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, toThreshold?: number, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Class representing an unsigned [[CreateSubnetTx]] transaction.
     *
     * @param networkID Networkid, [[DefaultNetworkID]]
     * @param blockchainID Blockchainid, default undefined
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
     * @param subnetOwnerAddresses An array of {@link https://github.com/feross/buffer|Buffer} for the addresses to add to a subnet
     * @param subnetOwnerThreshold The number of owners's signatures required to add a validator to the network
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned transaction created from the passed in parameters.
     */
    buildCreateSubnetTx: (networkID: number, blockchainID: Buffer, fromSigner: FromSigner, changeAddresses: Buffer[], subnetOwnerAddresses: Buffer[], subnetOwnerThreshold: number, fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Build an unsigned [[CreateChainTx]].
     *
     * @param networkID Networkid, [[DefaultNetworkID]]
     * @param blockchainID Blockchainid, default undefined
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
     * @param subnetID Optional ID of the Subnet that validates this blockchain
     * @param chainName Optional A human readable name for the chain; need not be unique
     * @param vmID Optional ID of the VM running on the new chain
     * @param fxIDs Optional IDs of the feature extensions running on the new chain
     * @param genesisData Optional Byte representation of genesis state of the new chain
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param subnetAuth Optional. An Auth struct to sign for the Subnet.
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned CreateChainTx created from the passed in parameters.
     */
    buildCreateChainTx: (networkID: number, blockchainID: Buffer, fromSigner: FromSigner, changeAddresses: Buffer[], subnetID?: string | Buffer, chainName?: string, vmID?: string, fxIDs?: string[], genesisData?: string | GenesisData, fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, subnetAuth?: Auth, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Helper function which creates an unsigned [[CaminoAddValidatorTx]]. For more granular control, you may create your own
     * [[UnsignedTx]] manually and import the [[CaminoAddValidatorTx]] class directly.
     *
     * @param networkID Networkid, [[DefaultNetworkID]]
     * @param blockchainID Blockchainid, default undefined
     * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who received the staked tokens at the end of the staking period
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
     * @param nodeID The node ID of the validator being added.
     * @param nodeOwner The address and signature indices of the registered nodeId owner.
     * @param startTime The Unix time when the validator starts validating the Primary Network.
     * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
     * @param stakeAmount The amount being delegated as a {@link https://github.com/indutny/bn.js/|BN}
     * @param rewardAddresses The addresses which will recieve the rewards from the delegated stake.
     * @param rewardLocktime Optional. The locktime field created in the resulting reward outputs
     * @param rewardThreshold Opional. The number of signatures required to spend the funds in the resultant reward UTXO. Default 1.
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param toThreshold Optional. The number of signatures required to spend the funds in the received UTXO
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned transaction created from the passed in parameters.
     */
    buildCaminoAddValidatorTx: (networkID: number, blockchainID: Buffer, to: Buffer[], fromSigner: FromSigner, change: Buffer[], nodeID: Buffer, nodeOwner: NodeOwner, startTime: BN, endTime: BN, stakeAmount: BN, stakeAssetID: Buffer, rewards: Buffer[], rewardLocktime?: BN, rewardThreshold?: number, memo?: Buffer, asOf?: BN, toThreshold?: number, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Build an unsigned [[AddressStateTx]].
     *
     * @param version Optional. Transaction version number, default 0.
     * @param networkID Networkid, [[DefaultNetworkID]]
     * @param blockchainID Blockchainid, default undefined
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
     * @param address The address to alter state.
     * @param state The state to set or remove on the given address
     * @param remove Optional. Flag if state should be applied or removed
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned AddressStateTx created from the passed in parameters.
     */
    buildAddressStateTx: (version: number, networkID: number, blockchainID: Buffer, fromSigner: FromSigner, changeAddresses: Buffer[], address: Buffer, state: number, remove?: boolean, fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Build an unsigned [[RegisterNodeTx]].
     *
     * @param networkID Networkid, [[DefaultNetworkID]]
     * @param blockchainID Blockchainid, default undefined
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
     * @param oldNodeID Optional. ID of the existing NodeID to replace or remove.
     * @param newNodeID Optional. ID of the newNodID to register address.
     * @param address The consortiumMemberAddress, single or multi-sig.
     * @param addressAuths An array of index and address to verify ownership of address.
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned RegisterNodeTx created from the passed in parameters.
     */
    buildRegisterNodeTx: (networkID: number, blockchainID: Buffer, fromSigner: FromSigner, changeAddresses: Buffer[], oldNodeID?: Buffer, newNodeID?: Buffer, address?: Buffer, addressAuths?: [number, Buffer][], fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Build an unsigned [[DepositTx]].
     *
     * @param version Optional. Transaction version number, default 0.
     * @param networkID Networkid, [[DefaultNetworkID]]
     * @param blockchainID Blockchainid, default undefined
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
     * @param depositOfferID ID of the deposit offer.
     * @param depositDuration Duration of the deposit
     * @param rewardsOwner Optional The owners of the reward. If omitted, all inputs must have the same owner
     * @param depositCreatorAddress Address that is authorized to create deposit with given offer. Could be empty, if offer owner is empty.
     * @param depositCreatorAuth Auth for deposit creator address
     * @param depositOfferOwnerSigs Signatures which recover to depositOfferOwner address(es)
     * @param depositOfferOwnerAuth Auth for deposit offer owner
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned DepositTx created from the passed in parameters.
     */
    buildDepositTx: (version: number, networkID: number, blockchainID: Buffer, fromSigner: FromSigner, changeAddresses: Buffer[], depositOfferID: Buffer, depositDuration: number, rewardsOwner: OutputOwners, depositCreatorAddress: Buffer, depositCreatorAuth: [number, Buffer][], depositOfferOwnerSigs: Buffer[], depositOfferOwnerAuth: [number, Buffer][], fee: BN, feeAssetID: Buffer, memo: Buffer, asOf: BN, amountToLock: BN, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Build an unsigned [[UnlockDepositTx]].
     *
     * @param networkID Networkid, [[DefaultNetworkID]]
     * @param blockchainID Blockchainid, default undefined
     * @param fromSigner @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned UnlockDepositTx created from the passed in parameters.
     */
    buildUnlockDepositTx: (networkID: number, blockchainID: Buffer, fromSigner: FromSigner, changeAddresses: Buffer[], fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, changeThreshold?: number) => Promise<UnsignedTx>;
    /**
     * Build an unsigned [[ClaimTx]].
     *
     * @param networkID NetworkID, [[DefaultNetworkID]]
     * @param blockchainID BlockchainID, default undefined
     * @param fromSigner @param fromSigner The addresses being used to send and verify the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
     * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
     * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
     * @param feeAssetID Optional. The assetID of the fees being burned
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
     * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
     * @param claimAmounts The specification and authentication what and how much to claim
     * @param claimTo The address to claimed rewards will be directed to
     *
     * @returns An unsigned ClaimTx created from the passed in parameters.
     */
    buildClaimTx: (networkID: number, blockchainID: Buffer, fromSigner: FromSigner, changeAddresses: Buffer[], fee: BN, feeAssetID: Buffer, memo: Buffer, asOf: BN, changeThreshold: number, claimAmounts: ClaimAmountParams[], claimTo?: OutputOwners) => Promise<UnsignedTx>;
    /**
     * Build an unsigned [[MultisigAliasTx]].
     *
     * @param networkID Network ID, default [[DefaultNetworkID]]
     * @param blockchainID Blockchain ID, default undefined
     * @param fromSigner The addresses being used to send and verify the funds from the UTXOs
     * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
     * @param multisigAliasParams Parameters of MultisigAliasTx. multisigAliasParams.ID must be empty if it's the new alias
     * @param fee Optional amount of fees to burn in its smallest denomination, represented as BN
     * @param feeAssetID Optional asset ID of the fees being burned
     * @param memo Optional contains arbitrary bytes, up to 256 bytes
     * @param asOf Optional timestamp to verify the transaction against, as BN
     * @param changeThreshold Optional number of signatures required to spend the funds in the resultant change UTXO
     *
     * @returns An unsigned MultisigAliasTx created from the passed-in parameters.
     */
    buildMultisigAliasTx: (networkID: number, blockchainID: Buffer, fromSigner: FromSigner, changeAddresses: Buffer[], multisigAliasParams: MultisigAliasParams, fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, changeThreshold?: number) => Promise<UnsignedTx>;
    _feeCheck(fee: BN, feeAssetID: Buffer): boolean;
    /**
     * Build an unsigned [[AddDepositOfferTx]].
     *
     * @param networkID
     * @param blockchainID
     * @param fromSigner
     * @param changeAddresses
     * @param depositOffer
     * @param depositOfferCreatorAddress
     * @param depositOfferCreatorAuth
     * @param fee
     * @param feeAssetID
     * @param memo
     * @param asOf
     * @param changeThreshold
     */
    buildAddDepositOfferTx: (networkID: number, blockchainID: Buffer, fromSigner: FromSigner, changeAddresses: Buffer[], offer: Offer, depositOfferCreatorAddress: Buffer, depositOfferCreatorAuth?: [number, Buffer][], fee?: BN, feeAssetID?: Buffer, memo?: Buffer, asOf?: BN, changeThreshold?: number) => Promise<UnsignedTx>;
}
//# sourceMappingURL=builder.d.ts.map