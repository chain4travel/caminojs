"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.platformvm = exports.metrics = exports.keystore = exports.info = exports.index = exports.health = exports.evm = exports.common = exports.avm = exports.auth = exports.admin = exports.Socket = exports.PubSub = exports.Mnemonic = exports.GenesisData = exports.GenesisAsset = exports.HDNode = exports.DB = exports.Buffer = exports.BN = exports.BinTools = exports.AvalancheCore = exports.Avalanche = void 0;
/**
 * @packageDocumentation
 * @module Avalanche
 */
const camino_1 = __importDefault(require("./camino"));
exports.AvalancheCore = camino_1.default;
const api_1 = require("./apis/admin/api");
const api_2 = require("./apis/auth/api");
const api_3 = require("./apis/avm/api");
const api_4 = require("./apis/evm/api");
const genesisasset_1 = require("./apis/avm/genesisasset");
Object.defineProperty(exports, "GenesisAsset", { enumerable: true, get: function () { return genesisasset_1.GenesisAsset; } });
const genesisdata_1 = require("./apis/avm/genesisdata");
Object.defineProperty(exports, "GenesisData", { enumerable: true, get: function () { return genesisdata_1.GenesisData; } });
const api_5 = require("./apis/health/api");
const api_6 = require("./apis/index/api");
const api_7 = require("./apis/info/api");
const api_8 = require("./apis/keystore/api");
const api_9 = require("./apis/metrics/api");
const api_10 = require("./apis/platformvm/api");
const socket_1 = require("./apis/socket/socket");
Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_1.Socket; } });
const bintools_1 = __importDefault(require("./utils/bintools"));
exports.BinTools = bintools_1.default;
const db_1 = __importDefault(require("./utils/db"));
exports.DB = db_1.default;
const mnemonic_1 = __importDefault(require("./utils/mnemonic"));
exports.Mnemonic = mnemonic_1.default;
const pubsub_1 = __importDefault(require("./utils/pubsub"));
exports.PubSub = pubsub_1.default;
const hdnode_1 = __importDefault(require("./utils/hdnode"));
exports.HDNode = hdnode_1.default;
const bn_js_1 = __importDefault(require("bn.js"));
exports.BN = bn_js_1.default;
const buffer_1 = require("buffer/");
Object.defineProperty(exports, "Buffer", { enumerable: true, get: function () { return buffer_1.Buffer; } });
const networks_1 = __importDefault(require("./utils/networks"));
const constants_1 = require("./utils/constants");
const utils_1 = require("./utils");
/**
 * CaminoJS is middleware for interacting with Camino node RPC APIs.
 *
 * Example usage:
 * ```js
 * const avalanche: Avalanche = new Avalanche("127.0.0.1", 9650, "https")
 * ```
 *
 */
class Avalanche extends camino_1.default {
    /**
     * Creates a new Avalanche instance. Sets the address and port of the main Avalanche Client.
     *
     * @param host The hostname to resolve to reach the Avalanche Client RPC APIs
     * @param port The port to resolve to reach the Avalanche Client RPC APIs
     * @param protocol The protocol string to use before a "://" in a request,
     * ex: "http", "https", "git", "ws", etc. Defaults to http
     * @param networkID Sets the NetworkID of the class. Default [[DefaultNetworkID]]
     * @param XChainID Sets the blockchainID for the AVM. Will try to auto-detect,
     * otherwise default "2eNy1mUFdmaxXNj1eQHUe7Np4gju9sJsEtWQ4MX3ToiNKuADed"
     * @param CChainID Sets the blockchainID for the EVM. Will try to auto-detect,
     * otherwise default "2CA6j5zYzasynPsFeNoqWkmTCt3VScMvXUZHbfDJ8k3oGzAPtU"
     * @param hrp The human-readable part of the bech32 addresses
     * @param skipinit Skips creating the APIs. Defaults to false
     */
    constructor(host, port, protocol, networkID = undefined, XChainID = undefined, CChainID = undefined) {
        super(host, port, protocol, networkID);
        /**
         * Returns a reference to the Admin RPC.
         */
        this.Admin = () => this.apis.admin;
        /**
         * Returns a reference to the Auth RPC.
         */
        this.Auth = () => this.apis.auth;
        /**
         * Returns a reference to the EVMAPI RPC pointed at the C-Chain.
         */
        this.CChain = () => this.apis.cchain;
        /**
         * Returns a reference to the AVM RPC pointed at the X-Chain.
         */
        this.XChain = () => this.apis.xchain;
        /**
         * Returns a reference to the Health RPC for a node.
         */
        this.Health = () => this.apis.health;
        /**
         * Returns a reference to the Index RPC for a node.
         */
        this.Index = () => this.apis.index;
        /**
         * Returns a reference to the Info RPC for a node.
         */
        this.Info = () => this.apis.info;
        /**
         * Returns a reference to the Metrics RPC.
         */
        this.Metrics = () => this.apis.metrics;
        /**
         * Returns a reference to the Keystore RPC for a node. We label it "NodeKeys" to reduce
         * confusion about what it's accessing.
         */
        this.NodeKeys = () => this.apis.keystore;
        /**
         * Returns a reference to the PlatformVM RPC pointed at the P-Chain.
         */
        this.PChain = () => this.apis.pchain;
        this.fetchNetworkSettings = () => __awaiter(this, void 0, void 0, function* () {
            // Nothing to do if network is known
            if (this.network)
                return true;
            // We need this to be able to make init calls
            const pAPI = this.apis["pchain"];
            const iAPI = this.apis["info"];
            this.addAPI("pchain", api_10.PlatformVMAPI);
            this.addAPI("info", api_7.InfoAPI);
            //Get platform configuration
            let response;
            try {
                response = yield this.PChain().getConfiguration();
                this.networkID = response.networkID;
            }
            catch (error) {
                this.networkID = yield this.Info().getNetworkID();
            }
            if (networks_1.default.isPredefined(this.networkID)) {
                this.network = networks_1.default.getNetwork(this.networkID);
                return this.setupAPIs();
            }
            if (!response) {
                // restore apis
                this.apis["pchain"] = pAPI;
                this.apis["info"] = iAPI;
                throw new Error("Configuration required");
            }
            const xchain = response.blockchains.find((b) => b["name"] === "X-Chain");
            const cchain = response.blockchains.find((b) => b["name"] === "C-Chain");
            const fees = yield this.Info().getTxFee();
            this.network = {
                hrp: response.hrp,
                X: {
                    alias: constants_1.XChainAlias,
                    avaxAssetID: response.assetID,
                    avaxAssetAlias: response.assetSymbol,
                    blockchainID: xchain["id"],
                    vm: constants_1.XChainVMName,
                    creationTxFee: fees.creationTxFee,
                    txFee: fees.txFee
                },
                P: {
                    alias: constants_1.PChainAlias,
                    blockchainID: utils_1.DefaultPlatformChainID,
                    creationTxFee: fees.creationTxFee,
                    createSubnetTx: fees.createSubnetTxFee,
                    createChainTx: fees.createBlockchainTxFee,
                    maxConsumption: response.maxConsumptionRate,
                    maxStakeDuration: response.maxStakeDuration,
                    maxStakingDuration: new bn_js_1.default(response.maxStakeDuration),
                    maxSupply: response.supplyCap,
                    minConsumption: response.minConsumptionRate,
                    minDelegationFee: response.minDelegationFee,
                    minDelegationStake: response.minDelegatorStake,
                    minStake: response.minValidatorStake,
                    minStakeDuration: response.minStakeDuration,
                    vm: constants_1.PChainVMName,
                    txFee: fees.txFee,
                    verifyNodeSignature: response.verifyNodeSignature,
                    lockModeBondDeposit: response.lockModeBondDeposit
                },
                C: {
                    alias: constants_1.CChainAlias,
                    blockchainID: cchain["id"],
                    chainID: 43112,
                    costPerSignature: 1000,
                    gasPrice: constants_1.GWEI.mul(new bn_js_1.default(225)),
                    maxGasPrice: constants_1.GWEI.mul(new bn_js_1.default(1000)),
                    minGasPrice: constants_1.GWEI.mul(new bn_js_1.default(25)),
                    txBytesGas: 1,
                    txFee: constants_1.MILLIAVAX,
                    vm: constants_1.CChainVMName
                }
            };
            networks_1.default.registerNetwork(this.networkID, this.network);
            return this.setupAPIs();
        });
        this.setupAPIs = (XChainID, CChainID) => {
            this.addAPI("admin", api_1.AdminAPI);
            this.addAPI("auth", api_2.AuthAPI);
            this.addAPI("health", api_5.HealthAPI);
            this.addAPI("info", api_7.InfoAPI);
            this.addAPI("index", api_6.IndexAPI);
            this.addAPI("keystore", api_8.KeystoreAPI);
            this.addAPI("metrics", api_9.MetricsAPI);
            this.addAPI("pchain", api_10.PlatformVMAPI);
            this.addAPI("xchain", api_3.AVMAPI, "/ext/bc/X", XChainID ? XChainID : this.network.X.blockchainID);
            this.addAPI("cchain", api_4.EVMAPI, "/ext/bc/C/avax", CChainID ? CChainID : this.network.C.blockchainID);
            return true;
        };
        if (networkID && networks_1.default.isPredefined(networkID)) {
            this.network = networks_1.default.getNetwork(networkID);
            this.networkID = networkID;
            this.setupAPIs(XChainID, CChainID);
        }
    }
}
exports.default = Avalanche;
exports.Avalanche = Avalanche;
exports.admin = __importStar(require("./apis/admin"));
exports.auth = __importStar(require("./apis/auth"));
exports.avm = __importStar(require("./apis/avm"));
exports.common = __importStar(require("./common"));
exports.evm = __importStar(require("./apis/evm"));
exports.health = __importStar(require("./apis/health"));
exports.index = __importStar(require("./apis/index"));
exports.info = __importStar(require("./apis/info"));
exports.keystore = __importStar(require("./apis/keystore"));
exports.metrics = __importStar(require("./apis/metrics"));
exports.platformvm = __importStar(require("./apis/platformvm"));
exports.utils = __importStar(require("./utils"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxzREFBb0M7QUFtUDNCLHdCQW5QRixnQkFBYSxDQW1QRTtBQWxQdEIsMENBQTJDO0FBQzNDLHlDQUF5QztBQUN6Qyx3Q0FBdUM7QUFDdkMsd0NBQXVDO0FBQ3ZDLDBEQUFzRDtBQW9QN0MsNkZBcFBBLDJCQUFZLE9Bb1BBO0FBblByQix3REFBb0Q7QUFvUDNDLDRGQXBQQSx5QkFBVyxPQW9QQTtBQW5QcEIsMkNBQTZDO0FBQzdDLDBDQUEyQztBQUMzQyx5Q0FBeUM7QUFDekMsNkNBQWlEO0FBQ2pELDRDQUErQztBQUMvQyxnREFBcUQ7QUFDckQsaURBQTZDO0FBZ1BwQyx1RkFoUEEsZUFBTSxPQWdQQTtBQS9PZixnRUFBdUM7QUFzTzlCLG1CQXRPRixrQkFBUSxDQXNPRTtBQXJPakIsb0RBQTJCO0FBd09sQixhQXhPRixZQUFFLENBd09FO0FBdk9YLGdFQUF1QztBQTJPOUIsbUJBM09GLGtCQUFRLENBMk9FO0FBMU9qQiw0REFBbUM7QUEyTzFCLGlCQTNPRixnQkFBTSxDQTJPRTtBQTFPZiw0REFBbUM7QUFzTzFCLGlCQXRPRixnQkFBTSxDQXNPRTtBQXJPZixrREFBc0I7QUFrT2IsYUFsT0YsZUFBRSxDQWtPRTtBQWpPWCxvQ0FBZ0M7QUFrT3ZCLHVGQWxPQSxlQUFNLE9Ba09BO0FBak9mLGdFQUF1QztBQUN2QyxpREFTMEI7QUFDMUIsbUNBQWdEO0FBR2hEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBcUIsU0FBVSxTQUFRLGdCQUFhO0lBb0RsRDs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUNILFlBQ0UsSUFBWSxFQUNaLElBQVksRUFDWixRQUFnQixFQUNoQixZQUFvQixTQUFTLEVBQzdCLFdBQW1CLFNBQVMsRUFDNUIsV0FBbUIsU0FB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QW9NQztBQUVRLDhCQUFTO0FBYWxCLHNEQUFxQztBQUNyQyxvREFBbUM7QUFDbkMsa0RBQWlDO0FBQ2pDLG1EQUFrQztBQUNsQyxrREFBaUM7QUFDakMsd0RBQXVDO0FBQ3ZDLHNEQUFxQztBQUNyQyxvREFBbUM7QUFDbkMsNERBQTJDO0FBQzNDLDBEQUF5QztBQUN6QyxnRUFBK0M7QUFDL0MsaURBQWdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQXZhbGFuY2hlXG4gKi9cbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gXCIuL2NhbWlub1wiXG5pbXBvcnQgeyBBZG1pbkFQSSB9IGZyb20gXCIuL2FwaXMvYWRtaW4vYXBpXCJcbmltcG9ydCB7IEF1dGhBUEkgfSBmcm9tIFwiLi9hcGlzL2F1dGgvYXBpXCJcbmltcG9ydCB7IEFWTUFQSSB9IGZyb20gXCIuL2FwaXMvYXZtL2FwaVwiXG5pbXBvcnQgeyBFVk1BUEkgfSBmcm9tIFwiLi9hcGlzL2V2bS9hcGlcIlxuaW1wb3J0IHsgR2VuZXNpc0Fzc2V0IH0gZnJvbSBcIi4vYXBpcy9hdm0vZ2VuZXNpc2Fzc2V0XCJcbmltcG9ydCB7IEdlbmVzaXNEYXRhIH0gZnJvbSBcIi4vYXBpcy9hdm0vZ2VuZXNpc2RhdGFcIlxuaW1wb3J0IHsgSGVhbHRoQVBJIH0gZnJvbSBcIi4vYXBpcy9oZWFsdGgvYXBpXCJcbmltcG9ydCB7IEluZGV4QVBJIH0gZnJvbSBcIi4vYXBpcy9pbmRleC9hcGlcIlxuaW1wb3J0IHsgSW5mb0FQSSB9IGZyb20gXCIuL2FwaXMvaW5mby9hcGlcIlxuaW1wb3J0IHsgS2V5c3RvcmVBUEkgfSBmcm9tIFwiLi9hcGlzL2tleXN0b3JlL2FwaVwiXG5pbXBvcnQgeyBNZXRyaWNzQVBJIH0gZnJvbSBcIi4vYXBpcy9tZXRyaWNzL2FwaVwiXG5pbXBvcnQgeyBQbGF0Zm9ybVZNQVBJIH0gZnJvbSBcIi4vYXBpcy9wbGF0Zm9ybXZtL2FwaVwiXG5pbXBvcnQgeyBTb2NrZXQgfSBmcm9tIFwiLi9hcGlzL3NvY2tldC9zb2NrZXRcIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCBEQiBmcm9tIFwiLi91dGlscy9kYlwiXG5pbXBvcnQgTW5lbW9uaWMgZnJvbSBcIi4vdXRpbHMvbW5lbW9uaWNcIlxuaW1wb3J0IFB1YlN1YiBmcm9tIFwiLi91dGlscy9wdWJzdWJcIlxuaW1wb3J0IEhETm9kZSBmcm9tIFwiLi91dGlscy9oZG5vZGVcIlxuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgbmV0d29ya3MgZnJvbSBcIi4vdXRpbHMvbmV0d29ya3NcIlxuaW1wb3J0IHtcbiAgQ0NoYWluQWxpYXMsXG4gIENDaGFpblZNTmFtZSxcbiAgR1dFSSxcbiAgTUlMTElBVkFYLFxuICBQQ2hhaW5BbGlhcyxcbiAgUENoYWluVk1OYW1lLFxuICBYQ2hhaW5BbGlhcyxcbiAgWENoYWluVk1OYW1lXG59IGZyb20gXCIuL3V0aWxzL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBEZWZhdWx0UGxhdGZvcm1DaGFpbklEIH0gZnJvbSBcIi4vdXRpbHNcIlxuaW1wb3J0IHsgR2V0Q29uZmlndXJhdGlvblJlc3BvbnNlIH0gZnJvbSBcIi4vYXBpcy9wbGF0Zm9ybXZtL2ludGVyZmFjZXNcIlxuXG4vKipcbiAqIENhbWlub0pTIGlzIG1pZGRsZXdhcmUgZm9yIGludGVyYWN0aW5nIHdpdGggQ2FtaW5vIG5vZGUgUlBDIEFQSXMuXG4gKlxuICogRXhhbXBsZSB1c2FnZTpcbiAqIGBgYGpzXG4gKiBjb25zdCBhdmFsYW5jaGU6IEF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGUoXCIxMjcuMC4wLjFcIiwgOTY1MCwgXCJodHRwc1wiKVxuICogYGBgXG4gKlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdmFsYW5jaGUgZXh0ZW5kcyBBdmFsYW5jaGVDb3JlIHtcbiAgLyoqXG4gICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIEFkbWluIFJQQy5cbiAgICovXG4gIEFkbWluID0gKCkgPT4gdGhpcy5hcGlzLmFkbWluIGFzIEFkbWluQVBJXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIEF1dGggUlBDLlxuICAgKi9cbiAgQXV0aCA9ICgpID0+IHRoaXMuYXBpcy5hdXRoIGFzIEF1dGhBUElcblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgRVZNQVBJIFJQQyBwb2ludGVkIGF0IHRoZSBDLUNoYWluLlxuICAgKi9cbiAgQ0NoYWluID0gKCkgPT4gdGhpcy5hcGlzLmNjaGFpbiBhcyBFVk1BUElcblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgQVZNIFJQQyBwb2ludGVkIGF0IHRoZSBYLUNoYWluLlxuICAgKi9cbiAgWENoYWluID0gKCkgPT4gdGhpcy5hcGlzLnhjaGFpbiBhcyBBVk1BUElcblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgSGVhbHRoIFJQQyBmb3IgYSBub2RlLlxuICAgKi9cbiAgSGVhbHRoID0gKCkgPT4gdGhpcy5hcGlzLmhlYWx0aCBhcyBIZWFsdGhBUElcblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgSW5kZXggUlBDIGZvciBhIG5vZGUuXG4gICAqL1xuICBJbmRleCA9ICgpID0+IHRoaXMuYXBpcy5pbmRleCBhcyBJbmRleEFQSVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBJbmZvIFJQQyBmb3IgYSBub2RlLlxuICAgKi9cbiAgSW5mbyA9ICgpID0+IHRoaXMuYXBpcy5pbmZvIGFzIEluZm9BUElcblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgTWV0cmljcyBSUEMuXG4gICAqL1xuICBNZXRyaWNzID0gKCkgPT4gdGhpcy5hcGlzLm1ldHJpY3MgYXMgTWV0cmljc0FQSVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBLZXlzdG9yZSBSUEMgZm9yIGEgbm9kZS4gV2UgbGFiZWwgaXQgXCJOb2RlS2V5c1wiIHRvIHJlZHVjZVxuICAgKiBjb25mdXNpb24gYWJvdXQgd2hhdCBpdCdzIGFjY2Vzc2luZy5cbiAgICovXG4gIE5vZGVLZXlzID0gKCkgPT4gdGhpcy5hcGlzLmtleXN0b3JlIGFzIEtleXN0b3JlQVBJXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFBsYXRmb3JtVk0gUlBDIHBvaW50ZWQgYXQgdGhlIFAtQ2hhaW4uXG4gICAqL1xuICBQQ2hhaW4gPSAoKSA9PiB0aGlzLmFwaXMucGNoYWluIGFzIFBsYXRmb3JtVk1BUElcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBBdmFsYW5jaGUgaW5zdGFuY2UuIFNldHMgdGhlIGFkZHJlc3MgYW5kIHBvcnQgb2YgdGhlIG1haW4gQXZhbGFuY2hlIENsaWVudC5cbiAgICpcbiAgICogQHBhcmFtIGhvc3QgVGhlIGhvc3RuYW1lIHRvIHJlc29sdmUgdG8gcmVhY2ggdGhlIEF2YWxhbmNoZSBDbGllbnQgUlBDIEFQSXNcbiAgICogQHBhcmFtIHBvcnQgVGhlIHBvcnQgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBSUEMgQVBJc1xuICAgKiBAcGFyYW0gcHJvdG9jb2wgVGhlIHByb3RvY29sIHN0cmluZyB0byB1c2UgYmVmb3JlIGEgXCI6Ly9cIiBpbiBhIHJlcXVlc3QsXG4gICAqIGV4OiBcImh0dHBcIiwgXCJodHRwc1wiLCBcImdpdFwiLCBcIndzXCIsIGV0Yy4gRGVmYXVsdHMgdG8gaHR0cFxuICAgKiBAcGFyYW0gbmV0d29ya0lEIFNldHMgdGhlIE5ldHdvcmtJRCBvZiB0aGUgY2xhc3MuIERlZmF1bHQgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgICogQHBhcmFtIFhDaGFpbklEIFNldHMgdGhlIGJsb2NrY2hhaW5JRCBmb3IgdGhlIEFWTS4gV2lsbCB0cnkgdG8gYXV0by1kZXRlY3QsXG4gICAqIG90aGVyd2lzZSBkZWZhdWx0IFwiMmVOeTFtVUZkbWF4WE5qMWVRSFVlN05wNGdqdTlzSnNFdFdRNE1YM1RvaU5LdUFEZWRcIlxuICAgKiBAcGFyYW0gQ0NoYWluSUQgU2V0cyB0aGUgYmxvY2tjaGFpbklEIGZvciB0aGUgRVZNLiBXaWxsIHRyeSB0byBhdXRvLWRldGVjdCxcbiAgICogb3RoZXJ3aXNlIGRlZmF1bHQgXCIyQ0E2ajV6WXphc3luUHNGZU5vcVdrbVRDdDNWU2NNdlhVWkhiZkRKOGszb0d6QVB0VVwiXG4gICAqIEBwYXJhbSBocnAgVGhlIGh1bWFuLXJlYWRhYmxlIHBhcnQgb2YgdGhlIGJlY2gzMiBhZGRyZXNzZXNcbiAgICogQHBhcmFtIHNraXBpbml0IFNraXBzIGNyZWF0aW5nIHRoZSBBUElzLiBEZWZhdWx0cyB0byBmYWxzZVxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgaG9zdDogc3RyaW5nLFxuICAgIHBvcnQ6IG51bWJlcixcbiAgICBwcm90b2NvbDogc3RyaW5nLFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIFhDaGFpbklEOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgQ0NoYWluSUQ6IHN0cmluZyA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihob3N0LCBwb3J0LCBwcm90b2NvbCwgbmV0d29ya0lEKVxuXG4gICAgaWYgKG5ldHdvcmtJRCAmJiBuZXR3b3Jrcy5pc1ByZWRlZmluZWQobmV0d29ya0lEKSkge1xuICAgICAgdGhpcy5uZXR3b3JrID0gbmV0d29ya3MuZ2V0TmV0d29yayhuZXR3b3JrSUQpXG4gICAgICB0aGlzLm5ldHdvcmtJRCA9IG5ldHdvcmtJRFxuICAgICAgdGhpcy5zZXR1cEFQSXMoWENoYWluSUQsIENDaGFpbklEKVxuICAgIH1cbiAgfVxuXG4gIGZldGNoTmV0d29ya1NldHRpbmdzID0gYXN5bmMgKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIC8vIE5vdGhpbmcgdG8gZG8gaWYgbmV0d29yayBpcyBrbm93blxuICAgIGlmICh0aGlzLm5ldHdvcmspIHJldHVybiB0cnVlXG4gICAgLy8gV2UgbmVlZCB0aGlzIHRvIGJlIGFibGUgdG8gbWFrZSBpbml0IGNhbGxzXG4gICAgY29uc3QgcEFQSSA9IHRoaXMuYXBpc1tcInBjaGFpblwiXVxuICAgIGNvbnN0IGlBUEkgPSB0aGlzLmFwaXNbXCJpbmZvXCJdXG4gICAgdGhpcy5hZGRBUEkoXCJwY2hhaW5cIiwgUGxhdGZvcm1WTUFQSSlcbiAgICB0aGlzLmFkZEFQSShcImluZm9cIiwgSW5mb0FQSSlcblxuICAgIC8vR2V0IHBsYXRmb3JtIGNvbmZpZ3VyYXRpb25cbiAgICBsZXQgcmVzcG9uc2U6IEdldENvbmZpZ3VyYXRpb25SZXNwb25zZVxuXG4gICAgdHJ5IHtcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgdGhpcy5QQ2hhaW4oKS5nZXRDb25maWd1cmF0aW9uKClcbiAgICAgIHRoaXMubmV0d29ya0lEID0gcmVzcG9uc2UubmV0d29ya0lEXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMubmV0d29ya0lEID0gYXdhaXQgdGhpcy5JbmZvKCkuZ2V0TmV0d29ya0lEKClcbiAgICB9XG5cbiAgICBpZiAobmV0d29ya3MuaXNQcmVkZWZpbmVkKHRoaXMubmV0d29ya0lEKSkge1xuICAgICAgdGhpcy5uZXR3b3JrID0gbmV0d29ya3MuZ2V0TmV0d29yayh0aGlzLm5ldHdvcmtJRClcbiAgICAgIHJldHVybiB0aGlzLnNldHVwQVBJcygpXG4gICAgfVxuXG4gICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgLy8gcmVzdG9yZSBhcGlzXG4gICAgICB0aGlzLmFwaXNbXCJwY2hhaW5cIl0gPSBwQVBJXG4gICAgICB0aGlzLmFwaXNbXCJpbmZvXCJdID0gaUFQSVxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb25maWd1cmF0aW9uIHJlcXVpcmVkXCIpXG4gICAgfVxuXG4gICAgY29uc3QgeGNoYWluID0gcmVzcG9uc2UuYmxvY2tjaGFpbnMuZmluZCgoYikgPT4gYltcIm5hbWVcIl0gPT09IFwiWC1DaGFpblwiKVxuICAgIGNvbnN0IGNjaGFpbiA9IHJlc3BvbnNlLmJsb2NrY2hhaW5zLmZpbmQoKGIpID0+IGJbXCJuYW1lXCJdID09PSBcIkMtQ2hhaW5cIilcblxuICAgIGNvbnN0IGZlZXMgPSBhd2FpdCB0aGlzLkluZm8oKS5nZXRUeEZlZSgpXG5cbiAgICB0aGlzLm5ldHdvcmsgPSB7XG4gICAgICBocnA6IHJlc3BvbnNlLmhycCxcbiAgICAgIFg6IHtcbiAgICAgICAgYWxpYXM6IFhDaGFpbkFsaWFzLFxuICAgICAgICBhdmF4QXNzZXRJRDogcmVzcG9uc2UuYXNzZXRJRCxcbiAgICAgICAgYXZheEFzc2V0QWxpYXM6IHJlc3BvbnNlLmFzc2V0U3ltYm9sLFxuICAgICAgICBibG9ja2NoYWluSUQ6IHhjaGFpbltcImlkXCJdLFxuICAgICAgICB2bTogWENoYWluVk1OYW1lLFxuICAgICAgICBjcmVhdGlvblR4RmVlOiBmZWVzLmNyZWF0aW9uVHhGZWUsXG4gICAgICAgIHR4RmVlOiBmZWVzLnR4RmVlXG4gICAgICB9LFxuICAgICAgUDoge1xuICAgICAgICBhbGlhczogUENoYWluQWxpYXMsXG4gICAgICAgIGJsb2NrY2hhaW5JRDogRGVmYXVsdFBsYXRmb3JtQ2hhaW5JRCxcbiAgICAgICAgY3JlYXRpb25UeEZlZTogZmVlcy5jcmVhdGlvblR4RmVlLFxuICAgICAgICBjcmVhdGVTdWJuZXRUeDogZmVlcy5jcmVhdGVTdWJuZXRUeEZlZSxcbiAgICAgICAgY3JlYXRlQ2hhaW5UeDogZmVlcy5jcmVhdGVCbG9ja2NoYWluVHhGZWUsXG4gICAgICAgIG1heENvbnN1bXB0aW9uOiByZXNwb25zZS5tYXhDb25zdW1wdGlvblJhdGUsXG4gICAgICAgIG1heFN0YWtlRHVyYXRpb246IHJlc3BvbnNlLm1heFN0YWtlRHVyYXRpb24sXG4gICAgICAgIG1heFN0YWtpbmdEdXJhdGlvbjogbmV3IEJOKHJlc3BvbnNlLm1heFN0YWtlRHVyYXRpb24pLFxuICAgICAgICBtYXhTdXBwbHk6IHJlc3BvbnNlLnN1cHBseUNhcCxcbiAgICAgICAgbWluQ29uc3VtcHRpb246IHJlc3BvbnNlLm1pbkNvbnN1bXB0aW9uUmF0ZSxcbiAgICAgICAgbWluRGVsZWdhdGlvbkZlZTogcmVzcG9uc2UubWluRGVsZWdhdGlvbkZlZSxcbiAgICAgICAgbWluRGVsZWdhdGlvblN0YWtlOiByZXNwb25zZS5taW5EZWxlZ2F0b3JTdGFrZSxcbiAgICAgICAgbWluU3Rha2U6IHJlc3BvbnNlLm1pblZhbGlkYXRvclN0YWtlLFxuICAgICAgICBtaW5TdGFrZUR1cmF0aW9uOiByZXNwb25zZS5taW5TdGFrZUR1cmF0aW9uLFxuICAgICAgICB2bTogUENoYWluVk1OYW1lLFxuICAgICAgICB0eEZlZTogZmVlcy50eEZlZSxcbiAgICAgICAgdmVyaWZ5Tm9kZVNpZ25hdHVyZTogcmVzcG9uc2UudmVyaWZ5Tm9kZVNpZ25hdHVyZSxcbiAgICAgICAgbG9ja01vZGVCb25kRGVwb3NpdDogcmVzcG9uc2UubG9ja01vZGVCb25kRGVwb3NpdFxuICAgICAgfSxcbiAgICAgIEM6IHtcbiAgICAgICAgYWxpYXM6IENDaGFpbkFsaWFzLFxuICAgICAgICBibG9ja2NoYWluSUQ6IGNjaGFpbltcImlkXCJdLFxuICAgICAgICBjaGFpbklEOiA0MzExMixcbiAgICAgICAgY29zdFBlclNpZ25hdHVyZTogMTAwMCxcbiAgICAgICAgZ2FzUHJpY2U6IEdXRUkubXVsKG5ldyBCTigyMjUpKSxcbiAgICAgICAgbWF4R2FzUHJpY2U6IEdXRUkubXVsKG5ldyBCTigxMDAwKSksXG4gICAgICAgIG1pbkdhc1ByaWNlOiBHV0VJLm11bChuZXcgQk4oMjUpKSxcbiAgICAgICAgdHhCeXRlc0dhczogMSxcbiAgICAgICAgdHhGZWU6IE1JTExJQVZBWCxcbiAgICAgICAgdm06IENDaGFpblZNTmFtZVxuICAgICAgfVxuICAgIH1cblxuICAgIG5ldHdvcmtzLnJlZ2lzdGVyTmV0d29yayh0aGlzLm5ldHdvcmtJRCwgdGhpcy5uZXR3b3JrKVxuXG4gICAgcmV0dXJuIHRoaXMuc2V0dXBBUElzKClcbiAgfVxuXG4gIHByb3RlY3RlZCBzZXR1cEFQSXMgPSAoWENoYWluSUQ/OiBzdHJpbmcsIENDaGFpbklEPzogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgdGhpcy5hZGRBUEkoXCJhZG1pblwiLCBBZG1pbkFQSSlcbiAgICB0aGlzLmFkZEFQSShcImF1dGhcIiwgQXV0aEFQSSlcbiAgICB0aGlzLmFkZEFQSShcImhlYWx0aFwiLCBIZWFsdGhBUEkpXG4gICAgdGhpcy5hZGRBUEkoXCJpbmZvXCIsIEluZm9BUEkpXG4gICAgdGhpcy5hZGRBUEkoXCJpbmRleFwiLCBJbmRleEFQSSlcbiAgICB0aGlzLmFkZEFQSShcImtleXN0b3JlXCIsIEtleXN0b3JlQVBJKVxuICAgIHRoaXMuYWRkQVBJKFwibWV0cmljc1wiLCBNZXRyaWNzQVBJKVxuXG4gICAgdGhpcy5hZGRBUEkoXCJwY2hhaW5cIiwgUGxhdGZvcm1WTUFQSSlcbiAgICB0aGlzLmFkZEFQSShcbiAgICAgIFwieGNoYWluXCIsXG4gICAgICBBVk1BUEksXG4gICAgICBcIi9leHQvYmMvWFwiLFxuICAgICAgWENoYWluSUQgPyBYQ2hhaW5JRCA6IHRoaXMubmV0d29yay5YLmJsb2NrY2hhaW5JRFxuICAgIClcbiAgICB0aGlzLmFkZEFQSShcbiAgICAgIFwiY2NoYWluXCIsXG4gICAgICBFVk1BUEksXG4gICAgICBcIi9leHQvYmMvQy9hdmF4XCIsXG4gICAgICBDQ2hhaW5JRCA/IENDaGFpbklEIDogdGhpcy5uZXR3b3JrLkMuYmxvY2tjaGFpbklEXG4gICAgKVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuXG5leHBvcnQgeyBBdmFsYW5jaGUgfVxuZXhwb3J0IHsgQXZhbGFuY2hlQ29yZSB9XG5leHBvcnQgeyBCaW5Ub29scyB9XG5leHBvcnQgeyBCTiB9XG5leHBvcnQgeyBCdWZmZXIgfVxuZXhwb3J0IHsgREIgfVxuZXhwb3J0IHsgSEROb2RlIH1cbmV4cG9ydCB7IEdlbmVzaXNBc3NldCB9XG5leHBvcnQgeyBHZW5lc2lzRGF0YSB9XG5leHBvcnQgeyBNbmVtb25pYyB9XG5leHBvcnQgeyBQdWJTdWIgfVxuZXhwb3J0IHsgU29ja2V0IH1cblxuZXhwb3J0ICogYXMgYWRtaW4gZnJvbSBcIi4vYXBpcy9hZG1pblwiXG5leHBvcnQgKiBhcyBhdXRoIGZyb20gXCIuL2FwaXMvYXV0aFwiXG5leHBvcnQgKiBhcyBhdm0gZnJvbSBcIi4vYXBpcy9hdm1cIlxuZXhwb3J0ICogYXMgY29tbW9uIGZyb20gXCIuL2NvbW1vblwiXG5leHBvcnQgKiBhcyBldm0gZnJvbSBcIi4vYXBpcy9ldm1cIlxuZXhwb3J0ICogYXMgaGVhbHRoIGZyb20gXCIuL2FwaXMvaGVhbHRoXCJcbmV4cG9ydCAqIGFzIGluZGV4IGZyb20gXCIuL2FwaXMvaW5kZXhcIlxuZXhwb3J0ICogYXMgaW5mbyBmcm9tIFwiLi9hcGlzL2luZm9cIlxuZXhwb3J0ICogYXMga2V5c3RvcmUgZnJvbSBcIi4vYXBpcy9rZXlzdG9yZVwiXG5leHBvcnQgKiBhcyBtZXRyaWNzIGZyb20gXCIuL2FwaXMvbWV0cmljc1wiXG5leHBvcnQgKiBhcyBwbGF0Zm9ybXZtIGZyb20gXCIuL2FwaXMvcGxhdGZvcm12bVwiXG5leHBvcnQgKiBhcyB1dGlscyBmcm9tIFwiLi91dGlsc1wiXG4iXX0=