/**
 * @packageDocumentation
 * @module Utils-Constants
 */
import BN from "bn.js";
export declare const DefaultNetworkID = 1;
export declare const DefaultTransactionVersionNumber: number;
export declare const PrivateKeyPrefix: string;
export declare const NodeIDPrefix: string;
export declare const XChainAlias: string;
export declare const CChainAlias: string;
export declare const PChainAlias: string;
export declare const XChainVMName: string;
export declare const CChainVMName: string;
export declare const PChainVMName: string;
export declare const TestHRP = "local";
export declare const TestNetworkID = 12345;
export declare const TestAvaxAssetID = "2fombhL7aGPwj3KH4bfrmJwW6PVnMobf9Y2fn9GwxiAAJyFDbe";
export declare const DefaultPlatformChainID: string;
export declare const TestXBlockchainID = "2eNy1mUFdmaxXNj1eQHUe7Np4gju9sJsEtWQ4MX3ToiNKuADed";
export declare const TestCBlockchainID = "2CA6j5zYzasynPsFeNoqWkmTCt3VScMvXUZHbfDJ8k3oGzAPtU";
export declare const TestCChainID = 42112;
export declare const DummyBlockchainID = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
export declare const DummyPlatformChainID: string;
export declare const DefaultLocalGenesisPrivateKey: string;
export declare const DefaultLocalGenesisPrivateKey2: string;
export declare const DefaultEVMLocalGenesisPrivateKey: string;
export declare const DefaultEVMLocalGenesisAddress: string;
export declare const mnemonic: string;
export declare const ONEAVAX: BN;
export declare const DECIAVAX: BN;
export declare const CENTIAVAX: BN;
export declare const MILLIAVAX: BN;
export declare const MICROAVAX: BN;
export declare const NANOAVAX: BN;
export declare const WEI: BN;
export declare const GWEI: BN;
export declare const AVAXGWEI: BN;
export declare const AVAXSTAKECAP: BN;
/**
 * Rules used when merging sets
 */
export type MergeRule = "intersection" | "differenceSelf" | "differenceNew" | "symDifference" | "union" | "unionMinusNew" | "unionMinusSelf" | "ERROR";
//# sourceMappingURL=constants.d.ts.map