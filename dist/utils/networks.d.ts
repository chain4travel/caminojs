/**
 * @packageDocumentation
 * @module Utils-Networks
 */
import BN from "bn.js";
export interface C {
    blockchainID: string;
    alias: string;
    vm: string;
    fee?: BN;
    gasPrice: BN | number;
    chainID?: number;
    minGasPrice?: BN;
    maxGasPrice?: BN;
    txBytesGas?: number;
    costPerSignature?: number;
    txFee?: BN;
}
export interface X {
    blockchainID: string;
    alias: string;
    vm: string;
    createAssetTxFee: BN | number;
    avaxAssetID: string;
    avaxAssetAlias: string;
    txFee?: BN | number;
    fee?: BN;
    mintTxFee?: BN | number;
}
export interface P {
    blockchainID: string;
    alias: string;
    vm: string;
    createAssetTxFee: BN | number;
    createSubnetTx: BN | number;
    createChainTx: BN | number;
    minConsumption: number;
    maxConsumption: number;
    maxStakingDuration: BN;
    maxSupply: BN;
    minStake: BN;
    minStakeDuration: number;
    maxStakeDuration: number;
    minDelegationStake: BN;
    minDelegationFee: BN;
    txFee?: BN | number;
    fee?: BN;
    verifyNodeSignature: boolean;
    lockModeBondDeposit: boolean;
}
export interface Network {
    preDefined?: boolean;
    hrp: string;
    C: C;
    X: X;
    P: P;
}
export interface Chain {
    alias: string;
    id: string;
}
/**
 * A class for storing predefined / fetched networks
 */
declare class Networks {
    registry: Map<string, Network>;
    constructor();
    registerNetwork(networkID: number, network: Network): void;
    getNetwork(networkID: number): Network;
    isPredefined(networkID: number): boolean;
}
declare const _default: Networks;
export default _default;
//# sourceMappingURL=networks.d.ts.map