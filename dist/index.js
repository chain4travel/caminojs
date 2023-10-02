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
                    createAssetTxFee: fees.createAssetTxFee,
                    txFee: fees.txFee
                },
                P: {
                    alias: constants_1.PChainAlias,
                    blockchainID: utils_1.DefaultPlatformChainID,
                    createAssetTxFee: fees.createAssetTxFee,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxzREFBb0M7QUFtUDNCLHdCQW5QRixnQkFBYSxDQW1QRTtBQWxQdEIsMENBQTJDO0FBQzNDLHlDQUF5QztBQUN6Qyx3Q0FBdUM7QUFDdkMsd0NBQXVDO0FBQ3ZDLDBEQUFzRDtBQW9QN0MsNkZBcFBBLDJCQUFZLE9Bb1BBO0FBblByQix3REFBb0Q7QUFvUDNDLDRGQXBQQSx5QkFBVyxPQW9QQTtBQW5QcEIsMkNBQTZDO0FBQzdDLDBDQUEyQztBQUMzQyx5Q0FBeUM7QUFDekMsNkNBQWlEO0FBQ2pELDRDQUErQztBQUMvQyxnREFBcUQ7QUFDckQsaURBQTZDO0FBZ1BwQyx1RkFoUEEsZUFBTSxPQWdQQTtBQS9PZixnRUFBdUM7QUFzTzlCLG1CQXRPRixrQkFBUSxDQXNPRTtBQXJPakIsb0RBQTJCO0FBd09sQixhQXhPRixZQUFFLENBd09FO0FBdk9YLGdFQUF1QztBQTJPOUIsbUJBM09GLGtCQUFRLENBMk9FO0FBMU9qQiw0REFBbUM7QUEyTzFCLGlCQTNPRixnQkFBTSxDQTJPRTtBQTFPZiw0REFBbUM7QUFzTzFCLGlCQXRPRixnQkFBTSxDQXNPRTtBQXJPZixrREFBc0I7QUFrT2IsYUFsT0YsZUFBRSxDQWtPRTtBQWpPWCxvQ0FBZ0M7QUFrT3ZCLHVGQWxPQSxlQUFNLE9Ba09BO0FBak9mLGdFQUF1QztBQUN2QyxpREFTMEI7QUFDMUIsbUNBQWdEO0FBR2hEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBcUIsU0FBVSxTQUFRLGdCQUFhO0lBb0RsRDs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUNILFlBQ0UsSUFBWSxFQUNaLElBQVksRUFDWixRQUFnQixFQUNoQixZQUFvQixTQUFTLEVBQzdCLFdBQW1CLFNBQVMsRUFDNUIsV0FBbUIsU0FBUztRQUU1QixLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUE7UUExRXhDOztXQUVHO1FBQ0gsVUFBSyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBaUIsQ0FBQTtRQUV6Qzs7V0FFRztRQUNILFNBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQWUsQ0FBQTtRQUV0Qzs7V0FFRztRQUNILFdBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQWdCLENBQUE7UUFFekM7O1dBRUc7UUFDSCxXQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFnQixDQUFBO1FBRXpDOztXQUVHO1FBQ0gsV0FBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBbUIsQ0FBQTtRQUU1Qzs7V0FFRztRQUNILFVBQUssR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQWlCLENBQUE7UUFFekM7O1dBRUc7UUFDSCxTQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFlLENBQUE7UUFFdEM7O1dBRUc7UUFDSCxZQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFxQixDQUFBO1FBRS9DOzs7V0FHRztRQUNILGFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQXVCLENBQUE7UUFFbEQ7O1dBRUc7UUFDSCxXQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUF1QixDQUFBO1FBa0NoRCx5QkFBb0IsR0FBRyxHQUEyQixFQUFFO1lBQ2xELG9DQUFvQztZQUNwQyxJQUFJLElBQUksQ0FBQyxPQUFPO2dCQUFFLE9BQU8sSUFBSSxDQUFBO1lBQzdCLDZDQUE2QztZQUM3QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsb0JBQWEsQ0FBQyxDQUFBO1lBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGFBQU8sQ0FBQyxDQUFBO1lBRTVCLDRCQUE0QjtZQUM1QixJQUFJLFFBQWtDLENBQUE7WUFFdEMsSUFBSTtnQkFDRixRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtnQkFDakQsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFBO2FBQ3BDO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQTthQUNsRDtZQUVELElBQUksa0JBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsT0FBTyxHQUFHLGtCQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtnQkFDbEQsT0FBTyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUE7YUFDeEI7WUFFRCxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNiLGVBQWU7Z0JBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUE7Z0JBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFBO2dCQUV4QixNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUE7YUFDMUM7WUFFRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFBO1lBQ3hFLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUE7WUFFeEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUE7WUFFekMsSUFBSSxDQUFDLE9BQU8sR0FBRztnQkFDYixHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUc7Z0JBQ2pCLENBQUMsRUFBRTtvQkFDRCxLQUFLLEVBQUUsdUJBQVc7b0JBQ2xCLFdBQVcsRUFBRSxRQUFRLENBQUMsT0FBTztvQkFDN0IsY0FBYyxFQUFFLFFBQVEsQ0FBQyxXQUFXO29CQUNwQyxZQUFZLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQztvQkFDMUIsRUFBRSxFQUFFLHdCQUFZO29CQUNoQixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO29CQUN2QyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7aUJBQ2xCO2dCQUNELENBQUMsRUFBRTtvQkFDRCxLQUFLLEVBQUUsdUJBQVc7b0JBQ2xCLFlBQVksRUFBRSw4QkFBc0I7b0JBQ3BDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0I7b0JBQ3ZDLGNBQWMsRUFBRSxJQUFJLENBQUMsaUJBQWlCO29CQUN0QyxhQUFhLEVBQUUsSUFBSSxDQUFDLHFCQUFxQjtvQkFDekMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxrQkFBa0I7b0JBQzNDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxnQkFBZ0I7b0JBQzNDLGtCQUFrQixFQUFFLElBQUksZUFBRSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDckQsU0FBUyxFQUFFLFFBQVEsQ0FBQyxTQUFTO29CQUM3QixjQUFjLEVBQUUsUUFBUSxDQUFDLGtCQUFrQjtvQkFDM0MsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLGdCQUFnQjtvQkFDM0Msa0JBQWtCLEVBQUUsUUFBUSxDQUFDLGlCQUFpQjtvQkFDOUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxpQkFBaUI7b0JBQ3BDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxnQkFBZ0I7b0JBQzNDLEVBQUUsRUFBRSx3QkFBWTtvQkFDaEIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO29CQUNqQixtQkFBbUIsRUFBRSxRQUFRLENBQUMsbUJBQW1CO29CQUNqRCxtQkFBbUIsRUFBRSxRQUFRLENBQUMsbUJBQW1CO2lCQUNsRDtnQkFDRCxDQUFDLEVBQUU7b0JBQ0QsS0FBSyxFQUFFLHVCQUFXO29CQUNsQixZQUFZLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQztvQkFDMUIsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsZ0JBQWdCLEVBQUUsSUFBSTtvQkFDdEIsUUFBUSxFQUFFLGdCQUFJLENBQUMsR0FBRyxDQUFDLElBQUksZUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUMvQixXQUFXLEVBQUUsZ0JBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25DLFdBQVcsRUFBRSxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDakMsVUFBVSxFQUFFLENBQUM7b0JBQ2IsS0FBSyxFQUFFLHFCQUFTO29CQUNoQixFQUFFLEVBQUUsd0JBQVk7aUJBQ2pCO2FBQ0YsQ0FBQTtZQUVELGtCQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBRXRELE9BQU8sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQ3pCLENBQUMsQ0FBQSxDQUFBO1FBRVMsY0FBUyxHQUFHLENBQUMsUUFBaUIsRUFBRSxRQUFpQixFQUFXLEVBQUU7WUFDdEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsY0FBUSxDQUFDLENBQUE7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsYUFBTyxDQUFDLENBQUE7WUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsZUFBUyxDQUFDLENBQUE7WUFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsYUFBTyxDQUFDLENBQUE7WUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsY0FBUSxDQUFDLENBQUE7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsaUJBQVcsQ0FBQyxDQUFBO1lBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLGdCQUFVLENBQUMsQ0FBQTtZQUVsQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxvQkFBYSxDQUFDLENBQUE7WUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FDVCxRQUFRLEVBQ1IsWUFBTSxFQUNOLFdBQVcsRUFDWCxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUNsRCxDQUFBO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FDVCxRQUFRLEVBQ1IsWUFBTSxFQUNOLGdCQUFnQixFQUNoQixRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUNsRCxDQUFBO1lBRUQsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDLENBQUE7UUF0SEMsSUFBSSxTQUFTLElBQUksa0JBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDakQsSUFBSSxDQUFDLE9BQU8sR0FBRyxrQkFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUM3QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtZQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtTQUNuQztJQUNILENBQUM7Q0FrSEY7QUFwTUQsNEJBb01DO0FBRVEsOEJBQVM7QUFhbEIsc0RBQXFDO0FBQ3JDLG9EQUFtQztBQUNuQyxrREFBaUM7QUFDakMsbURBQWtDO0FBQ2xDLGtEQUFpQztBQUNqQyx3REFBdUM7QUFDdkMsc0RBQXFDO0FBQ3JDLG9EQUFtQztBQUNuQyw0REFBMkM7QUFDM0MsMERBQXlDO0FBQ3pDLGdFQUErQztBQUMvQyxpREFBZ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBdmFsYW5jaGVcbiAqL1xuaW1wb3J0IEF2YWxhbmNoZUNvcmUgZnJvbSBcIi4vY2FtaW5vXCJcbmltcG9ydCB7IEFkbWluQVBJIH0gZnJvbSBcIi4vYXBpcy9hZG1pbi9hcGlcIlxuaW1wb3J0IHsgQXV0aEFQSSB9IGZyb20gXCIuL2FwaXMvYXV0aC9hcGlcIlxuaW1wb3J0IHsgQVZNQVBJIH0gZnJvbSBcIi4vYXBpcy9hdm0vYXBpXCJcbmltcG9ydCB7IEVWTUFQSSB9IGZyb20gXCIuL2FwaXMvZXZtL2FwaVwiXG5pbXBvcnQgeyBHZW5lc2lzQXNzZXQgfSBmcm9tIFwiLi9hcGlzL2F2bS9nZW5lc2lzYXNzZXRcIlxuaW1wb3J0IHsgR2VuZXNpc0RhdGEgfSBmcm9tIFwiLi9hcGlzL2F2bS9nZW5lc2lzZGF0YVwiXG5pbXBvcnQgeyBIZWFsdGhBUEkgfSBmcm9tIFwiLi9hcGlzL2hlYWx0aC9hcGlcIlxuaW1wb3J0IHsgSW5kZXhBUEkgfSBmcm9tIFwiLi9hcGlzL2luZGV4L2FwaVwiXG5pbXBvcnQgeyBJbmZvQVBJIH0gZnJvbSBcIi4vYXBpcy9pbmZvL2FwaVwiXG5pbXBvcnQgeyBLZXlzdG9yZUFQSSB9IGZyb20gXCIuL2FwaXMva2V5c3RvcmUvYXBpXCJcbmltcG9ydCB7IE1ldHJpY3NBUEkgfSBmcm9tIFwiLi9hcGlzL21ldHJpY3MvYXBpXCJcbmltcG9ydCB7IFBsYXRmb3JtVk1BUEkgfSBmcm9tIFwiLi9hcGlzL3BsYXRmb3Jtdm0vYXBpXCJcbmltcG9ydCB7IFNvY2tldCB9IGZyb20gXCIuL2FwaXMvc29ja2V0L3NvY2tldFwiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IERCIGZyb20gXCIuL3V0aWxzL2RiXCJcbmltcG9ydCBNbmVtb25pYyBmcm9tIFwiLi91dGlscy9tbmVtb25pY1wiXG5pbXBvcnQgUHViU3ViIGZyb20gXCIuL3V0aWxzL3B1YnN1YlwiXG5pbXBvcnQgSEROb2RlIGZyb20gXCIuL3V0aWxzL2hkbm9kZVwiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBuZXR3b3JrcyBmcm9tIFwiLi91dGlscy9uZXR3b3Jrc1wiXG5pbXBvcnQge1xuICBDQ2hhaW5BbGlhcyxcbiAgQ0NoYWluVk1OYW1lLFxuICBHV0VJLFxuICBNSUxMSUFWQVgsXG4gIFBDaGFpbkFsaWFzLFxuICBQQ2hhaW5WTU5hbWUsXG4gIFhDaGFpbkFsaWFzLFxuICBYQ2hhaW5WTU5hbWVcbn0gZnJvbSBcIi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IERlZmF1bHRQbGF0Zm9ybUNoYWluSUQgfSBmcm9tIFwiLi91dGlsc1wiXG5pbXBvcnQgeyBHZXRDb25maWd1cmF0aW9uUmVzcG9uc2UgfSBmcm9tIFwiLi9hcGlzL3BsYXRmb3Jtdm0vaW50ZXJmYWNlc1wiXG5cbi8qKlxuICogQ2FtaW5vSlMgaXMgbWlkZGxld2FyZSBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBDYW1pbm8gbm9kZSBSUEMgQVBJcy5cbiAqXG4gKiBFeGFtcGxlIHVzYWdlOlxuICogYGBganNcbiAqIGNvbnN0IGF2YWxhbmNoZTogQXZhbGFuY2hlID0gbmV3IEF2YWxhbmNoZShcIjEyNy4wLjAuMVwiLCA5NjUwLCBcImh0dHBzXCIpXG4gKiBgYGBcbiAqXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF2YWxhbmNoZSBleHRlbmRzIEF2YWxhbmNoZUNvcmUge1xuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgQWRtaW4gUlBDLlxuICAgKi9cbiAgQWRtaW4gPSAoKSA9PiB0aGlzLmFwaXMuYWRtaW4gYXMgQWRtaW5BUElcblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgQXV0aCBSUEMuXG4gICAqL1xuICBBdXRoID0gKCkgPT4gdGhpcy5hcGlzLmF1dGggYXMgQXV0aEFQSVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBFVk1BUEkgUlBDIHBvaW50ZWQgYXQgdGhlIEMtQ2hhaW4uXG4gICAqL1xuICBDQ2hhaW4gPSAoKSA9PiB0aGlzLmFwaXMuY2NoYWluIGFzIEVWTUFQSVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBBVk0gUlBDIHBvaW50ZWQgYXQgdGhlIFgtQ2hhaW4uXG4gICAqL1xuICBYQ2hhaW4gPSAoKSA9PiB0aGlzLmFwaXMueGNoYWluIGFzIEFWTUFQSVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBIZWFsdGggUlBDIGZvciBhIG5vZGUuXG4gICAqL1xuICBIZWFsdGggPSAoKSA9PiB0aGlzLmFwaXMuaGVhbHRoIGFzIEhlYWx0aEFQSVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBJbmRleCBSUEMgZm9yIGEgbm9kZS5cbiAgICovXG4gIEluZGV4ID0gKCkgPT4gdGhpcy5hcGlzLmluZGV4IGFzIEluZGV4QVBJXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIEluZm8gUlBDIGZvciBhIG5vZGUuXG4gICAqL1xuICBJbmZvID0gKCkgPT4gdGhpcy5hcGlzLmluZm8gYXMgSW5mb0FQSVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBNZXRyaWNzIFJQQy5cbiAgICovXG4gIE1ldHJpY3MgPSAoKSA9PiB0aGlzLmFwaXMubWV0cmljcyBhcyBNZXRyaWNzQVBJXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIEtleXN0b3JlIFJQQyBmb3IgYSBub2RlLiBXZSBsYWJlbCBpdCBcIk5vZGVLZXlzXCIgdG8gcmVkdWNlXG4gICAqIGNvbmZ1c2lvbiBhYm91dCB3aGF0IGl0J3MgYWNjZXNzaW5nLlxuICAgKi9cbiAgTm9kZUtleXMgPSAoKSA9PiB0aGlzLmFwaXMua2V5c3RvcmUgYXMgS2V5c3RvcmVBUElcblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgUGxhdGZvcm1WTSBSUEMgcG9pbnRlZCBhdCB0aGUgUC1DaGFpbi5cbiAgICovXG4gIFBDaGFpbiA9ICgpID0+IHRoaXMuYXBpcy5wY2hhaW4gYXMgUGxhdGZvcm1WTUFQSVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEF2YWxhbmNoZSBpbnN0YW5jZS4gU2V0cyB0aGUgYWRkcmVzcyBhbmQgcG9ydCBvZiB0aGUgbWFpbiBBdmFsYW5jaGUgQ2xpZW50LlxuICAgKlxuICAgKiBAcGFyYW0gaG9zdCBUaGUgaG9zdG5hbWUgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBSUEMgQVBJc1xuICAgKiBAcGFyYW0gcG9ydCBUaGUgcG9ydCB0byByZXNvbHZlIHRvIHJlYWNoIHRoZSBBdmFsYW5jaGUgQ2xpZW50IFJQQyBBUElzXG4gICAqIEBwYXJhbSBwcm90b2NvbCBUaGUgcHJvdG9jb2wgc3RyaW5nIHRvIHVzZSBiZWZvcmUgYSBcIjovL1wiIGluIGEgcmVxdWVzdCxcbiAgICogZXg6IFwiaHR0cFwiLCBcImh0dHBzXCIsIFwiZ2l0XCIsIFwid3NcIiwgZXRjLiBEZWZhdWx0cyB0byBodHRwXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgU2V0cyB0aGUgTmV0d29ya0lEIG9mIHRoZSBjbGFzcy4gRGVmYXVsdCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gWENoYWluSUQgU2V0cyB0aGUgYmxvY2tjaGFpbklEIGZvciB0aGUgQVZNLiBXaWxsIHRyeSB0byBhdXRvLWRldGVjdCxcbiAgICogb3RoZXJ3aXNlIGRlZmF1bHQgXCIyZU55MW1VRmRtYXhYTmoxZVFIVWU3TnA0Z2p1OXNKc0V0V1E0TVgzVG9pTkt1QURlZFwiXG4gICAqIEBwYXJhbSBDQ2hhaW5JRCBTZXRzIHRoZSBibG9ja2NoYWluSUQgZm9yIHRoZSBFVk0uIFdpbGwgdHJ5IHRvIGF1dG8tZGV0ZWN0LFxuICAgKiBvdGhlcndpc2UgZGVmYXVsdCBcIjJDQTZqNXpZemFzeW5Qc0ZlTm9xV2ttVEN0M1ZTY012WFVaSGJmREo4azNvR3pBUHRVXCJcbiAgICogQHBhcmFtIGhycCBUaGUgaHVtYW4tcmVhZGFibGUgcGFydCBvZiB0aGUgYmVjaDMyIGFkZHJlc3Nlc1xuICAgKiBAcGFyYW0gc2tpcGluaXQgU2tpcHMgY3JlYXRpbmcgdGhlIEFQSXMuIERlZmF1bHRzIHRvIGZhbHNlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBob3N0OiBzdHJpbmcsXG4gICAgcG9ydDogbnVtYmVyLFxuICAgIHByb3RvY29sOiBzdHJpbmcsXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgWENoYWluSUQ6IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICBDQ2hhaW5JRDogc3RyaW5nID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKGhvc3QsIHBvcnQsIHByb3RvY29sLCBuZXR3b3JrSUQpXG5cbiAgICBpZiAobmV0d29ya0lEICYmIG5ldHdvcmtzLmlzUHJlZGVmaW5lZChuZXR3b3JrSUQpKSB7XG4gICAgICB0aGlzLm5ldHdvcmsgPSBuZXR3b3Jrcy5nZXROZXR3b3JrKG5ldHdvcmtJRClcbiAgICAgIHRoaXMubmV0d29ya0lEID0gbmV0d29ya0lEXG4gICAgICB0aGlzLnNldHVwQVBJcyhYQ2hhaW5JRCwgQ0NoYWluSUQpXG4gICAgfVxuICB9XG5cbiAgZmV0Y2hOZXR3b3JrU2V0dGluZ3MgPSBhc3luYyAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgLy8gTm90aGluZyB0byBkbyBpZiBuZXR3b3JrIGlzIGtub3duXG4gICAgaWYgKHRoaXMubmV0d29yaykgcmV0dXJuIHRydWVcbiAgICAvLyBXZSBuZWVkIHRoaXMgdG8gYmUgYWJsZSB0byBtYWtlIGluaXQgY2FsbHNcbiAgICBjb25zdCBwQVBJID0gdGhpcy5hcGlzW1wicGNoYWluXCJdXG4gICAgY29uc3QgaUFQSSA9IHRoaXMuYXBpc1tcImluZm9cIl1cbiAgICB0aGlzLmFkZEFQSShcInBjaGFpblwiLCBQbGF0Zm9ybVZNQVBJKVxuICAgIHRoaXMuYWRkQVBJKFwiaW5mb1wiLCBJbmZvQVBJKVxuXG4gICAgLy9HZXQgcGxhdGZvcm0gY29uZmlndXJhdGlvblxuICAgIGxldCByZXNwb25zZTogR2V0Q29uZmlndXJhdGlvblJlc3BvbnNlXG5cbiAgICB0cnkge1xuICAgICAgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLlBDaGFpbigpLmdldENvbmZpZ3VyYXRpb24oKVxuICAgICAgdGhpcy5uZXR3b3JrSUQgPSByZXNwb25zZS5uZXR3b3JrSURcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5uZXR3b3JrSUQgPSBhd2FpdCB0aGlzLkluZm8oKS5nZXROZXR3b3JrSUQoKVxuICAgIH1cblxuICAgIGlmIChuZXR3b3Jrcy5pc1ByZWRlZmluZWQodGhpcy5uZXR3b3JrSUQpKSB7XG4gICAgICB0aGlzLm5ldHdvcmsgPSBuZXR3b3Jrcy5nZXROZXR3b3JrKHRoaXMubmV0d29ya0lEKVxuICAgICAgcmV0dXJuIHRoaXMuc2V0dXBBUElzKClcbiAgICB9XG5cbiAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICAvLyByZXN0b3JlIGFwaXNcbiAgICAgIHRoaXMuYXBpc1tcInBjaGFpblwiXSA9IHBBUElcbiAgICAgIHRoaXMuYXBpc1tcImluZm9cIl0gPSBpQVBJXG5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvbmZpZ3VyYXRpb24gcmVxdWlyZWRcIilcbiAgICB9XG5cbiAgICBjb25zdCB4Y2hhaW4gPSByZXNwb25zZS5ibG9ja2NoYWlucy5maW5kKChiKSA9PiBiW1wibmFtZVwiXSA9PT0gXCJYLUNoYWluXCIpXG4gICAgY29uc3QgY2NoYWluID0gcmVzcG9uc2UuYmxvY2tjaGFpbnMuZmluZCgoYikgPT4gYltcIm5hbWVcIl0gPT09IFwiQy1DaGFpblwiKVxuXG4gICAgY29uc3QgZmVlcyA9IGF3YWl0IHRoaXMuSW5mbygpLmdldFR4RmVlKClcblxuICAgIHRoaXMubmV0d29yayA9IHtcbiAgICAgIGhycDogcmVzcG9uc2UuaHJwLFxuICAgICAgWDoge1xuICAgICAgICBhbGlhczogWENoYWluQWxpYXMsXG4gICAgICAgIGF2YXhBc3NldElEOiByZXNwb25zZS5hc3NldElELFxuICAgICAgICBhdmF4QXNzZXRBbGlhczogcmVzcG9uc2UuYXNzZXRTeW1ib2wsXG4gICAgICAgIGJsb2NrY2hhaW5JRDogeGNoYWluW1wiaWRcIl0sXG4gICAgICAgIHZtOiBYQ2hhaW5WTU5hbWUsXG4gICAgICAgIGNyZWF0ZUFzc2V0VHhGZWU6IGZlZXMuY3JlYXRlQXNzZXRUeEZlZSxcbiAgICAgICAgdHhGZWU6IGZlZXMudHhGZWVcbiAgICAgIH0sXG4gICAgICBQOiB7XG4gICAgICAgIGFsaWFzOiBQQ2hhaW5BbGlhcyxcbiAgICAgICAgYmxvY2tjaGFpbklEOiBEZWZhdWx0UGxhdGZvcm1DaGFpbklELFxuICAgICAgICBjcmVhdGVBc3NldFR4RmVlOiBmZWVzLmNyZWF0ZUFzc2V0VHhGZWUsXG4gICAgICAgIGNyZWF0ZVN1Ym5ldFR4OiBmZWVzLmNyZWF0ZVN1Ym5ldFR4RmVlLFxuICAgICAgICBjcmVhdGVDaGFpblR4OiBmZWVzLmNyZWF0ZUJsb2NrY2hhaW5UeEZlZSxcbiAgICAgICAgbWF4Q29uc3VtcHRpb246IHJlc3BvbnNlLm1heENvbnN1bXB0aW9uUmF0ZSxcbiAgICAgICAgbWF4U3Rha2VEdXJhdGlvbjogcmVzcG9uc2UubWF4U3Rha2VEdXJhdGlvbixcbiAgICAgICAgbWF4U3Rha2luZ0R1cmF0aW9uOiBuZXcgQk4ocmVzcG9uc2UubWF4U3Rha2VEdXJhdGlvbiksXG4gICAgICAgIG1heFN1cHBseTogcmVzcG9uc2Uuc3VwcGx5Q2FwLFxuICAgICAgICBtaW5Db25zdW1wdGlvbjogcmVzcG9uc2UubWluQ29uc3VtcHRpb25SYXRlLFxuICAgICAgICBtaW5EZWxlZ2F0aW9uRmVlOiByZXNwb25zZS5taW5EZWxlZ2F0aW9uRmVlLFxuICAgICAgICBtaW5EZWxlZ2F0aW9uU3Rha2U6IHJlc3BvbnNlLm1pbkRlbGVnYXRvclN0YWtlLFxuICAgICAgICBtaW5TdGFrZTogcmVzcG9uc2UubWluVmFsaWRhdG9yU3Rha2UsXG4gICAgICAgIG1pblN0YWtlRHVyYXRpb246IHJlc3BvbnNlLm1pblN0YWtlRHVyYXRpb24sXG4gICAgICAgIHZtOiBQQ2hhaW5WTU5hbWUsXG4gICAgICAgIHR4RmVlOiBmZWVzLnR4RmVlLFxuICAgICAgICB2ZXJpZnlOb2RlU2lnbmF0dXJlOiByZXNwb25zZS52ZXJpZnlOb2RlU2lnbmF0dXJlLFxuICAgICAgICBsb2NrTW9kZUJvbmREZXBvc2l0OiByZXNwb25zZS5sb2NrTW9kZUJvbmREZXBvc2l0XG4gICAgICB9LFxuICAgICAgQzoge1xuICAgICAgICBhbGlhczogQ0NoYWluQWxpYXMsXG4gICAgICAgIGJsb2NrY2hhaW5JRDogY2NoYWluW1wiaWRcIl0sXG4gICAgICAgIGNoYWluSUQ6IDQzMTEyLFxuICAgICAgICBjb3N0UGVyU2lnbmF0dXJlOiAxMDAwLFxuICAgICAgICBnYXNQcmljZTogR1dFSS5tdWwobmV3IEJOKDIyNSkpLFxuICAgICAgICBtYXhHYXNQcmljZTogR1dFSS5tdWwobmV3IEJOKDEwMDApKSxcbiAgICAgICAgbWluR2FzUHJpY2U6IEdXRUkubXVsKG5ldyBCTigyNSkpLFxuICAgICAgICB0eEJ5dGVzR2FzOiAxLFxuICAgICAgICB0eEZlZTogTUlMTElBVkFYLFxuICAgICAgICB2bTogQ0NoYWluVk1OYW1lXG4gICAgICB9XG4gICAgfVxuXG4gICAgbmV0d29ya3MucmVnaXN0ZXJOZXR3b3JrKHRoaXMubmV0d29ya0lELCB0aGlzLm5ldHdvcmspXG5cbiAgICByZXR1cm4gdGhpcy5zZXR1cEFQSXMoKVxuICB9XG5cbiAgcHJvdGVjdGVkIHNldHVwQVBJcyA9IChYQ2hhaW5JRD86IHN0cmluZywgQ0NoYWluSUQ/OiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgICB0aGlzLmFkZEFQSShcImFkbWluXCIsIEFkbWluQVBJKVxuICAgIHRoaXMuYWRkQVBJKFwiYXV0aFwiLCBBdXRoQVBJKVxuICAgIHRoaXMuYWRkQVBJKFwiaGVhbHRoXCIsIEhlYWx0aEFQSSlcbiAgICB0aGlzLmFkZEFQSShcImluZm9cIiwgSW5mb0FQSSlcbiAgICB0aGlzLmFkZEFQSShcImluZGV4XCIsIEluZGV4QVBJKVxuICAgIHRoaXMuYWRkQVBJKFwia2V5c3RvcmVcIiwgS2V5c3RvcmVBUEkpXG4gICAgdGhpcy5hZGRBUEkoXCJtZXRyaWNzXCIsIE1ldHJpY3NBUEkpXG5cbiAgICB0aGlzLmFkZEFQSShcInBjaGFpblwiLCBQbGF0Zm9ybVZNQVBJKVxuICAgIHRoaXMuYWRkQVBJKFxuICAgICAgXCJ4Y2hhaW5cIixcbiAgICAgIEFWTUFQSSxcbiAgICAgIFwiL2V4dC9iYy9YXCIsXG4gICAgICBYQ2hhaW5JRCA/IFhDaGFpbklEIDogdGhpcy5uZXR3b3JrLlguYmxvY2tjaGFpbklEXG4gICAgKVxuICAgIHRoaXMuYWRkQVBJKFxuICAgICAgXCJjY2hhaW5cIixcbiAgICAgIEVWTUFQSSxcbiAgICAgIFwiL2V4dC9iYy9DL2F2YXhcIixcbiAgICAgIENDaGFpbklEID8gQ0NoYWluSUQgOiB0aGlzLm5ldHdvcmsuQy5ibG9ja2NoYWluSURcbiAgICApXG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59XG5cbmV4cG9ydCB7IEF2YWxhbmNoZSB9XG5leHBvcnQgeyBBdmFsYW5jaGVDb3JlIH1cbmV4cG9ydCB7IEJpblRvb2xzIH1cbmV4cG9ydCB7IEJOIH1cbmV4cG9ydCB7IEJ1ZmZlciB9XG5leHBvcnQgeyBEQiB9XG5leHBvcnQgeyBIRE5vZGUgfVxuZXhwb3J0IHsgR2VuZXNpc0Fzc2V0IH1cbmV4cG9ydCB7IEdlbmVzaXNEYXRhIH1cbmV4cG9ydCB7IE1uZW1vbmljIH1cbmV4cG9ydCB7IFB1YlN1YiB9XG5leHBvcnQgeyBTb2NrZXQgfVxuXG5leHBvcnQgKiBhcyBhZG1pbiBmcm9tIFwiLi9hcGlzL2FkbWluXCJcbmV4cG9ydCAqIGFzIGF1dGggZnJvbSBcIi4vYXBpcy9hdXRoXCJcbmV4cG9ydCAqIGFzIGF2bSBmcm9tIFwiLi9hcGlzL2F2bVwiXG5leHBvcnQgKiBhcyBjb21tb24gZnJvbSBcIi4vY29tbW9uXCJcbmV4cG9ydCAqIGFzIGV2bSBmcm9tIFwiLi9hcGlzL2V2bVwiXG5leHBvcnQgKiBhcyBoZWFsdGggZnJvbSBcIi4vYXBpcy9oZWFsdGhcIlxuZXhwb3J0ICogYXMgaW5kZXggZnJvbSBcIi4vYXBpcy9pbmRleFwiXG5leHBvcnQgKiBhcyBpbmZvIGZyb20gXCIuL2FwaXMvaW5mb1wiXG5leHBvcnQgKiBhcyBrZXlzdG9yZSBmcm9tIFwiLi9hcGlzL2tleXN0b3JlXCJcbmV4cG9ydCAqIGFzIG1ldHJpY3MgZnJvbSBcIi4vYXBpcy9tZXRyaWNzXCJcbmV4cG9ydCAqIGFzIHBsYXRmb3Jtdm0gZnJvbSBcIi4vYXBpcy9wbGF0Zm9ybXZtXCJcbmV4cG9ydCAqIGFzIHV0aWxzIGZyb20gXCIuL3V0aWxzXCJcbiJdfQ==