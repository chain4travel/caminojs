"use strict";
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
exports.PlatformVMAPI = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM
 */
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const common_1 = require("../../common");
const errors_1 = require("../../utils/errors");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const keychain_1 = require("./keychain");
const constants_1 = require("../../utils/constants");
const constants_2 = require("./constants");
const tx_1 = require("./tx");
const payload_1 = require("../../utils/payload");
const helperfunctions_1 = require("../../utils/helperfunctions");
const utxos_1 = require("../platformvm/utxos");
const errors_2 = require("../../utils/errors");
const inputs_1 = require("./inputs");
const outputs_1 = require("./outputs");
const utils_1 = require("../../utils");
const builder_1 = require("./builder");
const spender_1 = require("./spender");
const adddepositoffertx_1 = require("./adddepositoffertx");
const subnetauth_1 = require("./subnetauth");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = utils_1.Serialization.getInstance();
const NanoBN = new bn_js_1.default(1000000000);
const rewardPercentDenom = 1000000;
/**
 * Class for interacting with a node's PlatformVMAPI
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class PlatformVMAPI extends common_1.JRPCAPI {
    /**
     * @ignore
     */
    _cleanAddressArray(addresses, caller) {
        const addrs = [];
        const chainid = this.getBlockchainAlias()
            ? this.getBlockchainAlias()
            : this.getBlockchainID();
        if (addresses && addresses.length > 0) {
            for (let i = 0; i < addresses.length; i++) {
                if (typeof addresses[`${i}`] === "string") {
                    if (typeof this.parseAddress(addresses[`${i}`]) ===
                        "undefined") {
                        /* istanbul ignore next */
                        throw new errors_2.AddressError(`Error - Invalid address format (${caller})`);
                    }
                    addrs.push(addresses[`${i}`]);
                }
                else {
                    const bech32 = "bech32";
                    addrs.push(serialization.bufferToType(addresses[`${i}`], bech32, this.core.getHRP(), chainid));
                }
            }
        }
        return addrs;
    }
    _cleanAddressArrayBuffer(addresses, caller) {
        return this._cleanAddressArray(addresses, caller).map((a) => {
            return typeof a === "undefined"
                ? undefined
                : bintools.stringToAddress(a);
        });
    }
    _parseFromSigner(from, caller) {
        if (from.length > 0) {
            if (typeof from[0] === "string")
                return {
                    from: this._cleanAddressArrayBuffer(from, caller),
                    signer: []
                };
            else
                return {
                    from: this._cleanAddressArrayBuffer(from[0], caller),
                    signer: from.length > 1
                        ? this._cleanAddressArrayBuffer(from[1], caller)
                        : []
                };
        }
        return { from: [], signer: [] };
    }
    /**
     * This class should not be instantiated directly.
     * Instead use the [[Avalanche.addAPI]] method.
     *
     * @param core A reference to the Avalanche class
     * @param baseURL Defaults to the string "/ext/P" as the path to blockchain's baseURL
     */
    constructor(core, baseURL = "/ext/bc/P") {
        super(core, baseURL);
        /**
         * @ignore
         */
        this.keychain = new keychain_1.KeyChain("", "");
        this.blockchainID = "";
        this.blockchainAlias = undefined;
        this.AVAXAssetID = undefined;
        this.txFee = undefined;
        this.creationTxFee = undefined;
        this.minValidatorStake = undefined;
        this.minDelegatorStake = undefined;
        /**
         * Gets the alias for the blockchainID if it exists, otherwise returns `undefined`.
         *
         * @returns The alias for the blockchainID
         */
        this.getBlockchainAlias = () => {
            return this.core.getNetwork().P.alias;
        };
        /**
         * Gets the current network, fetched via avalanche.fetchNetworkSettings.
         *
         * @returns The current Network
         */
        this.getNetwork = () => {
            return this.core.getNetwork();
        };
        /**
         * Gets the blockchainID and returns it.
         *
         * @returns The blockchainID
         */
        this.getBlockchainID = () => this.blockchainID;
        /**
         * Takes an address string and returns its {@link https://github.com/feross/buffer|Buffer} representation if valid.
         *
         * @returns A {@link https://github.com/feross/buffer|Buffer} for the address if valid, undefined if not valid.
         */
        this.parseAddress = (addr) => {
            const alias = this.getBlockchainAlias();
            const blockchainID = this.getBlockchainID();
            return bintools.parseAddress(addr, blockchainID, alias, constants_2.PlatformVMConstants.ADDRESSLENGTH);
        };
        this.addressFromBuffer = (address) => {
            const chainid = this.getBlockchainAlias()
                ? this.getBlockchainAlias()
                : this.getBlockchainID();
            const type = "bech32";
            return serialization.bufferToType(address, type, this.core.getHRP(), chainid);
        };
        /**
         * Fetches the AVAX AssetID and returns it in a Promise.
         *
         * @param refresh This function caches the response. Refresh = true will bust the cache.
         *
         * @returns The the provided string representing the AVAX AssetID
         */
        this.getAVAXAssetID = (refresh = false) => __awaiter(this, void 0, void 0, function* () {
            if (typeof this.AVAXAssetID === "undefined" || refresh) {
                this.AVAXAssetID = bintools.cb58Decode(this.core.getNetwork().X.avaxAssetID);
            }
            return this.AVAXAssetID;
        });
        /**
         * Overrides the defaults and sets the cache to a specific AVAX AssetID
         *
         * @param avaxAssetID A cb58 string or Buffer representing the AVAX AssetID
         *
         * @returns The the provided string representing the AVAX AssetID
         */
        this.setAVAXAssetID = (avaxAssetID) => {
            if (typeof avaxAssetID === "string") {
                avaxAssetID = bintools.cb58Decode(avaxAssetID);
            }
            this.AVAXAssetID = avaxAssetID;
        };
        /**
         * Gets the default tx fee for this chain.
         *
         * @returns The default tx fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getDefaultTxFee = () => {
            return new bn_js_1.default(this.core.getNetwork().P.txFee);
        };
        /**
         * Gets the tx fee for this chain.
         *
         * @returns The tx fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getTxFee = () => {
            if (typeof this.txFee === "undefined") {
                this.txFee = this.getDefaultTxFee();
            }
            return this.txFee;
        };
        /**
         * Gets the CreateAssetTx fee.
         *
         * @returns The CreateAssetTx fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getCreateAssetTxFee = () => {
            var _a;
            return new bn_js_1.default((_a = this.core.getNetwork().P.createAssetTxFee) !== null && _a !== void 0 ? _a : 0);
        };
        /**
         * Gets the CreateSubnetTx fee.
         *
         * @returns The CreateSubnetTx fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getCreateSubnetTxFee = () => {
            var _a;
            return new bn_js_1.default((_a = this.core.getNetwork().P.createSubnetTx) !== null && _a !== void 0 ? _a : 0);
        };
        /**
         * Gets the CreateChainTx fee.
         *
         * @returns The CreateChainTx fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getCreateChainTxFee = () => {
            var _a;
            return new bn_js_1.default((_a = this.core.getNetwork().P.createChainTx) !== null && _a !== void 0 ? _a : 0);
        };
        /**
         * Sets the tx fee for this chain.
         *
         * @param fee The tx fee amount to set as {@link https://github.com/indutny/bn.js/|BN}
         */
        this.setTxFee = (fee) => {
            this.txFee = fee;
        };
        /**
         * Gets the default creation fee for this chain.
         *
         * @returns The default creation fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getDefaultCreationTxFee = () => {
            return new bn_js_1.default(this.core.getNetwork().P.createAssetTxFee);
        };
        /**
         * Gets the creation fee for this chain.
         *
         * @returns The creation fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getCreationTxFee = () => {
            if (typeof this.creationTxFee === "undefined") {
                this.creationTxFee = this.getDefaultCreationTxFee();
            }
            return this.creationTxFee;
        };
        /**
         * Sets the creation fee for this chain.
         *
         * @param fee The creation fee amount to set as {@link https://github.com/indutny/bn.js/|BN}
         */
        this.setCreationTxFee = (fee) => {
            this.creationTxFee = fee;
        };
        /**
         * Gets a reference to the keychain for this class.
         *
         * @returns The instance of [[]] for this class
         */
        this.keyChain = () => this.keychain;
        /**
         * @ignore
         */
        this.newKeyChain = () => {
            // warning, overwrites the old keychain
            const alias = this.getBlockchainAlias();
            if (alias) {
                this.keychain = new keychain_1.KeyChain(this.core.getHRP(), alias);
            }
            else {
                this.keychain = new keychain_1.KeyChain(this.core.getHRP(), this.blockchainID);
            }
            return this.keychain;
        };
        /**
         * Helper function which determines if a tx is a goose egg transaction.
         *
         * @param utx An UnsignedTx
         *
         * @returns boolean true if passes goose egg test and false if fails.
         *
         * @remarks
         * A "Goose Egg Transaction" is when the fee far exceeds a reasonable amount
         */
        this.checkGooseEgg = (utx, outTotal = common_1.ZeroBN) => __awaiter(this, void 0, void 0, function* () {
            const avaxAssetID = yield this.getAVAXAssetID();
            let outputTotal = outTotal.gt(common_1.ZeroBN)
                ? outTotal
                : utx.getOutputTotal(avaxAssetID);
            const fee = utx.getBurn(avaxAssetID);
            if (fee.lte(constants_1.ONEAVAX.mul(new bn_js_1.default(10))) || fee.lte(outputTotal)) {
                return true;
            }
            else {
                return false;
            }
        });
        /**
         * Retrieves an assetID for a subnet"s staking assset.
         *
         * @returns Returns a Promise string with cb58 encoded value of the assetID.
         */
        this.getStakingAssetID = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("platform.getStakingAssetID");
            return response.data.result.assetID;
        });
        /**
         * Creates a new blockchain.
         *
         * @param username The username of the Keystore user that controls the new account
         * @param password The password of the Keystore user that controls the new account
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer} or an cb58 serialized string for the SubnetID or its alias.
         * @param vmID The ID of the Virtual Machine the blockchain runs. Can also be an alias of the Virtual Machine.
         * @param fxIDs The ids of the FXs the VM is running.
         * @param name A human-readable name for the new blockchain
         * @param genesis The base 58 (with checksum) representation of the genesis state of the new blockchain. Virtual Machines should have a static API method named buildGenesis that can be used to generate genesisData.
         *
         * @returns Promise for the unsigned transaction to create this blockchain. Must be signed by a sufficient number of the Subnet’s control keys and by the account paying the transaction fee.
         */
        this.createBlockchain = (username, password, subnetID = undefined, vmID, fxIDs, name, genesis) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                fxIDs,
                vmID,
                name,
                genesisData: genesis
            };
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            const response = yield this.callMethod("platform.createBlockchain", params);
            return response.data.result.txID;
        });
        /**
         * Gets the status of a blockchain.
         *
         * @param blockchainID The blockchainID requesting a status update
         *
         * @returns Promise for a string of one of: "Validating", "Created", "Preferred", "Unknown".
         */
        this.getBlockchainStatus = (blockchainID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                blockchainID
            };
            const response = yield this.callMethod("platform.getBlockchainStatus", params);
            return response.data.result.status;
        });
        /**
         * Get the validators and their weights of a subnet or the Primary Network at a given P-Chain height.
         *
         * @param height The P-Chain height to get the validator set at.
         * @param subnetID Optional. A cb58 serialized string for the SubnetID or its alias.
         *
         * @returns Promise GetValidatorsAtResponse
         */
        this.getValidatorsAt = (height, subnetID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                height
            };
            if (typeof subnetID !== "undefined") {
                params.subnetID = subnetID;
            }
            const response = yield this.callMethod("platform.getValidatorsAt", params);
            return response.data.result;
        });
        /**
         * Gets the block at given height
         * @param height The P-Chain height to get the block at.
         * @param encoding
         *
         * @returns Promise GetBlockResponse
         */
        this.getBlockByHeight = (height, encoding) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                height,
                encoding
            };
            const response = yield this.callMethod("platform.getBlockByHeight", params);
            return response.data.result;
        });
        /**
         * Create an address in the node's keystore.
         *
         * @param username The username of the Keystore user that controls the new account
         * @param password The password of the Keystore user that controls the new account
         *
         * @returns Promise for a string of the newly created account address.
         */
        this.createAddress = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password
            };
            const response = yield this.callMethod("platform.createAddress", params);
            return response.data.result.address;
        });
        /**
         * Gets the balance of a particular asset.
         *
         * @param addresses The addresses to pull the asset balance from
         *
         * @returns Promise with the balance as a {@link https://github.com/indutny/bn.js/|BN} on the provided address.
         */
        this.getBalance = (addresses) => __awaiter(this, void 0, void 0, function* () {
            addresses.forEach((address) => {
                if (typeof this.parseAddress(address) === "undefined") {
                    /* istanbul ignore next */
                    throw new errors_2.AddressError("Error - PlatformVMAPI.getBalance: Invalid address format");
                }
            });
            const params = {
                addresses
            };
            const response = yield this.callMethod("platform.getBalance", params);
            const result = response.data.result;
            const parseDict = (input) => {
                let dict = {};
                for (const [k, v] of Object.entries(input))
                    dict[k] = new bn_js_1.default(v);
                return dict;
            };
            if (this.core.getNetwork().P.lockModeBondDeposit) {
                return {
                    balances: parseDict(result.balances),
                    unlockedOutputs: parseDict(result.unlockedOutputs),
                    bondedOutputs: parseDict(result.bondedOutputs),
                    depositedOutputs: parseDict(result.depositedOutputs),
                    bondedDepositedOutputs: parseDict(result.bondedDepositedOutputs),
                    utxoIDs: result.utxoIDs
                };
            }
            return {
                balance: new bn_js_1.default(result.balance),
                unlocked: new bn_js_1.default(result.unlocked),
                lockedStakeable: new bn_js_1.default(result.lockedStakeable),
                lockedNotStakeable: new bn_js_1.default(result.lockedNotStakeable),
                utxoIDs: result.utxoIDs
            };
        });
        /**
         * List the addresses controlled by the user.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         *
         * @returns Promise for an array of addresses.
         */
        this.listAddresses = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password
            };
            const response = yield this.callMethod("platform.listAddresses", params);
            return response.data.result.addresses;
        });
        /**
         * Lists the set of current validators.
         *
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer} or an
         * cb58 serialized string for the SubnetID or its alias.
         * @param nodeIDs Optional. An array of strings
         *
         * @returns Promise for an array of validators that are currently staking, see: {@link https://docs.avax.network/v1.0/en/api/platform/#platformgetcurrentvalidators|platform.getCurrentValidators documentation}.
         *
         */
        this.getCurrentValidators = (subnetID = undefined, nodeIDs = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            if (typeof nodeIDs != "undefined" && nodeIDs.length > 0) {
                params.nodeIDs = nodeIDs;
            }
            const response = yield this.callMethod("platform.getCurrentValidators", params);
            return response.data.result;
        });
        /**
         * A request that in address field accepts either a nodeID (and returns a bech32 address if it exists), or a bech32 address (and returns a NodeID if it exists).
         *
         * @param address A nodeID or a bech32 address
         *
         * @returns Promise for a string containing bech32 address that is the node owner or nodeID that the address passed is an owner of.
         */
        this.getRegisteredShortIDLink = (address) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                address
            };
            const response = yield this.callMethod("platform.getRegisteredShortIDLink", params);
            return response.data.result.address;
        });
        /**
         * Returns active or inactive deposit offers.
         *
         * @param active A boolean indicating whether to return active or inactive deposit offers.
         *
         * @returns Promise for a list containing deposit offers.
         */
        this.getAllDepositOffers = (timestamp) => __awaiter(this, void 0, void 0, function* () {
            if (!timestamp)
                timestamp = Math.floor(Date.now() / 1000);
            const params = {
                timestamp
            };
            const response = yield this.callMethod("platform.getAllDepositOffers", params);
            const offers = response.data.result;
            if (!offers.depositOffers)
                return [];
            return offers.depositOffers.map((offer) => {
                return {
                    upgradeVersion: offer.upgradeVersion,
                    id: offer.id,
                    interestRateNominator: new bn_js_1.default(offer.interestRateNominator),
                    start: new bn_js_1.default(offer.start),
                    end: new bn_js_1.default(offer.end),
                    minAmount: new bn_js_1.default(offer.minAmount),
                    totalMaxAmount: new bn_js_1.default(offer.totalMaxAmount),
                    depositedAmount: new bn_js_1.default(offer.depositedAmount),
                    minDuration: offer.minDuration,
                    maxDuration: offer.maxDuration,
                    unlockPeriodDuration: offer.unlockPeriodDuration,
                    noRewardsPeriodDuration: offer.noRewardsPeriodDuration,
                    memo: offer.memo,
                    flags: new bn_js_1.default(offer.flags),
                    totalMaxRewardAmount: new bn_js_1.default(offer.totalMaxRewardAmount),
                    rewardedAmount: new bn_js_1.default(offer.rewardedAmount),
                    ownerAddress: offer.ownerAddress
                };
            });
        });
        /**
         * Returns deposits corresponding to requested txIDs.
         *
         * @param depositTxIDs A list of txIDs (cb58) to request deposits for.
         *
         * @returns Promise for a GetDepositsResponse object.
         */
        this.getDeposits = (depositTxIDs) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                depositTxIDs
            };
            const response = yield this.callMethod("platform.getDeposits", params);
            const deposits = response.data.result;
            if (!deposits.deposits)
                return { deposits: [], availableRewards: [], timestamp: common_1.ZeroBN };
            return {
                deposits: deposits.deposits.map((deposit) => {
                    return {
                        depositTxID: deposit.depositTxID,
                        depositOfferID: deposit.depositOfferID,
                        unlockedAmount: new bn_js_1.default(deposit.unlockedAmount),
                        unlockableAmount: new bn_js_1.default(deposit.unlockableAmount),
                        claimedRewardAmount: new bn_js_1.default(deposit.claimedRewardAmount),
                        start: new bn_js_1.default(deposit.start),
                        duration: deposit.duration,
                        amount: new bn_js_1.default(deposit.amount),
                        rewardOwner: {
                            locktime: new bn_js_1.default(deposit.rewardOwner.locktime),
                            threshold: new bn_js_1.default(deposit.rewardOwner.threshold).toNumber(),
                            addresses: deposit.rewardOwner.addresses
                        }
                    };
                }),
                availableRewards: deposits.availableRewards.map((a) => new bn_js_1.default(a)),
                timestamp: new bn_js_1.default(deposits.timestamp)
            };
        });
        /**
         * List amounts that can be claimed: validator rewards, expired deposit rewards claimable at current time.
         *
         * @param owners RewardOwner of DepositTx or AddValidatorTx
         *
         * @returns Promise for an object containing the amounts that can be claimed.
         */
        this.getClaimables = (owners) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                Owners: owners
            };
            const response = yield this.callMethod("platform.getClaimables", params);
            const result = response.data.result;
            return {
                claimables: result.claimables.map((c) => {
                    return {
                        rewardOwner: c.rewardOwner
                            ? {
                                locktime: new bn_js_1.default(c.rewardOwner.locktime),
                                threshold: new bn_js_1.default(c.rewardOwner.threshold).toNumber(),
                                addresses: c.rewardOwner.addresses
                            }
                            : undefined,
                        validatorRewards: new bn_js_1.default(c.validatorRewards),
                        expiredDepositRewards: new bn_js_1.default(c.expiredDepositRewards)
                    };
                })
            };
        });
        /**
         * Lists the set of pending validators.
         *
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer}
         * or a cb58 serialized string for the SubnetID or its alias.
         * @param nodeIDs Optional. An array of strings
         *
         * @returns Promise for an array of validators that are pending staking, see: {@link https://docs.avax.network/v1.0/en/api/platform/#platformgetpendingvalidators|platform.getPendingValidators documentation}.
         *
         */
        this.getPendingValidators = (subnetID = undefined, nodeIDs = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            if (typeof nodeIDs != "undefined" && nodeIDs.length > 0) {
                params.nodeIDs = nodeIDs;
            }
            const response = yield this.callMethod("platform.getPendingValidators", params);
            return response.data.result;
        });
        /**
         * Retrieves the current phases.
         *
         * @returns Returns a Promise of a UpgradePhasesReply.
         */
        this.getUpgradePhases = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const response = yield this.callMethod("platform.getUpgradePhases");
            return {
                SunrisePhase: parseInt((_a = response.data.result) === null || _a === void 0 ? void 0 : _a.sunrisePhase),
                AthensPhase: parseInt((_b = response.data.result) === null || _b === void 0 ? void 0 : _b.athensPhase),
                BerlinPhase: parseInt((_c = response.data.result) === null || _c === void 0 ? void 0 : _c.berlinPhase),
                CairoPhase: parseInt((_d = response.data.result) === null || _d === void 0 ? void 0 : _d.cairoPhase)
            };
        });
        /**
         * Samples `Size` validators from the current validator set.
         *
         * @param sampleSize Of the total universe of validators, select this many at random
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer} or an
         * cb58 serialized string for the SubnetID or its alias.
         *
         * @returns Promise for an array of validator"s stakingIDs.
         */
        this.sampleValidators = (sampleSize, subnetID = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                size: sampleSize.toString()
            };
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            const response = yield this.callMethod("platform.sampleValidators", params);
            return response.data.result.validators;
        });
        /**
         * Add a validator to the Primary Network.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param nodeID The node ID of the validator
         * @param startTime Javascript Date object for the start time to validate
         * @param endTime Javascript Date object for the end time to validate
         * @param stakeAmount The amount of nAVAX the validator is staking as
         * a {@link https://github.com/indutny/bn.js/|BN}
         * @param rewardAddress The address the validator reward will go to, if there is one.
         * @param delegationFeeRate Optional. A {@link https://github.com/indutny/bn.js/|BN} for the percent fee this validator
         * charges when others delegate stake to them. Up to 4 decimal places allowed additional decimal places are ignored.
         * Must be between 0 and 100, inclusive. For example, if delegationFeeRate is 1.2345 and someone delegates to this
         * validator, then when the delegation period is over, 1.2345% of the reward goes to the validator and the rest goes
         * to the delegator.
         *
         * @returns Promise for a base58 string of the unsigned transaction.
         */
        this.addValidator = (username, password, nodeID, startTime, endTime, stakeAmount, rewardAddress, delegationFeeRate = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                nodeID,
                startTime: startTime.getTime() / 1000,
                endTime: endTime.getTime() / 1000,
                stakeAmount: stakeAmount.toString(10),
                rewardAddress
            };
            if (typeof delegationFeeRate !== "undefined") {
                params.delegationFeeRate = delegationFeeRate.toString(10);
            }
            const response = yield this.callMethod("platform.addValidator", params);
            return response.data.result.txID;
        });
        /**
         * Add a validator to a Subnet other than the Primary Network. The validator must validate the Primary Network for the entire duration they validate this Subnet.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param nodeID The node ID of the validator
         * @param subnetID Either a {@link https://github.com/feross/buffer|Buffer} or a cb58 serialized string for the SubnetID or its alias.
         * @param startTime Javascript Date object for the start time to validate
         * @param endTime Javascript Date object for the end time to validate
         * @param weight The validator’s weight used for sampling
         *
         * @returns Promise for the unsigned transaction. It must be signed (using sign) by the proper number of the Subnet’s control keys and by the key of the account paying the transaction fee before it can be issued.
         */
        this.addSubnetValidator = (username, password, nodeID, subnetID, startTime, endTime, weight) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                nodeID,
                startTime: startTime.getTime() / 1000,
                endTime: endTime.getTime() / 1000,
                weight
            };
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            const response = yield this.callMethod("platform.addSubnetValidator", params);
            return response.data.result.txID;
        });
        /**
         * Add a delegator to the Primary Network.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param nodeID The node ID of the delegatee
         * @param startTime Javascript Date object for when the delegator starts delegating
         * @param endTime Javascript Date object for when the delegator starts delegating
         * @param stakeAmount The amount of nAVAX the delegator is staking as
         * a {@link https://github.com/indutny/bn.js/|BN}
         * @param rewardAddress The address of the account the staked AVAX and validation reward
         * (if applicable) are sent to at endTime
         *
         * @returns Promise for an array of validator"s stakingIDs.
         */
        this.addDelegator = (username, password, nodeID, startTime, endTime, stakeAmount, rewardAddress) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                nodeID,
                startTime: startTime.getTime() / 1000,
                endTime: endTime.getTime() / 1000,
                stakeAmount: stakeAmount.toString(10),
                rewardAddress
            };
            const response = yield this.callMethod("platform.addDelegator", params);
            return response.data.result.txID;
        });
        /**
         * Create an unsigned transaction to create a new Subnet. The unsigned transaction must be
         * signed with the key of the account paying the transaction fee. The Subnet’s ID is the ID of the transaction that creates it (ie the response from issueTx when issuing the signed transaction).
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param controlKeys Array of platform addresses as strings
         * @param threshold To add a validator to this Subnet, a transaction must have threshold
         * signatures, where each signature is from a key whose address is an element of `controlKeys`
         *
         * @returns Promise for a string with the unsigned transaction encoded as base58.
         */
        this.createSubnet = (username, password, controlKeys, threshold) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                controlKeys,
                threshold
            };
            const response = yield this.callMethod("platform.createSubnet", params);
            return response.data.result.txID
                ? response.data.result.txID
                : response.data.result;
        });
        /**
         * Get the Subnet that validates a given blockchain.
         *
         * @param blockchainID Either a {@link https://github.com/feross/buffer|Buffer} or a cb58
         * encoded string for the blockchainID or its alias.
         *
         * @returns Promise for a string of the subnetID that validates the blockchain.
         */
        this.validatedBy = (blockchainID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                blockchainID
            };
            const response = yield this.callMethod("platform.validatedBy", params);
            return response.data.result.subnetID;
        });
        /**
         * Get the IDs of the blockchains a Subnet validates.
         *
         * @param subnetID Either a {@link https://github.com/feross/buffer|Buffer} or an AVAX
         * serialized string for the SubnetID or its alias.
         *
         * @returns Promise for an array of blockchainIDs the subnet validates.
         */
        this.validates = (subnetID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                subnetID
            };
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            const response = yield this.callMethod("platform.validates", params);
            return response.data.result.blockchainIDs;
        });
        /**
         * Get all the blockchains that exist (excluding the P-Chain).
         *
         * @returns Promise for an array of objects containing fields "id", "subnetID", and "vmID".
         */
        this.getBlockchains = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("platform.getBlockchains");
            return response.data.result.blockchains;
        });
        /**
         * Send AVAX from an account on the P-Chain to an address on the X-Chain. This transaction
         * must be signed with the key of the account that the AVAX is sent from and which pays the
         * transaction fee. After issuing this transaction, you must call the X-Chain’s importAVAX
         * method to complete the transfer.
         *
         * @param username The Keystore user that controls the account specified in `to`
         * @param password The password of the Keystore user
         * @param to The address on the X-Chain to send the AVAX to. Do not include X- in the address
         * @param amount Amount of AVAX to export as a {@link https://github.com/indutny/bn.js/|BN}
         *
         * @returns Promise for an unsigned transaction to be signed by the account the the AVAX is
         * sent from and pays the transaction fee.
         */
        this.exportAVAX = (username, password, amount, to) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                to,
                amount: amount.toString(10)
            };
            const response = yield this.callMethod("platform.exportAVAX", params);
            return response.data.result.txID
                ? response.data.result.txID
                : response.data.result;
        });
        /**
         * Send AVAX from an account on the P-Chain to an address on the X-Chain. This transaction
         * must be signed with the key of the account that the AVAX is sent from and which pays
         * the transaction fee. After issuing this transaction, you must call the X-Chain’s
         * importAVAX method to complete the transfer.
         *
         * @param username The Keystore user that controls the account specified in `to`
         * @param password The password of the Keystore user
         * @param to The ID of the account the AVAX is sent to. This must be the same as the to
         * argument in the corresponding call to the X-Chain’s exportAVAX
         * @param sourceChain The chainID where the funds are coming from.
         *
         * @returns Promise for a string for the transaction, which should be sent to the network
         * by calling issueTx.
         */
        this.importAVAX = (username, password, to, sourceChain) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                to,
                sourceChain,
                username,
                password
            };
            const response = yield this.callMethod("platform.importAVAX", params);
            return response.data.result.txID
                ? response.data.result.txID
                : response.data.result;
        });
        /**
         * Calls the node's issueTx method from the API and returns the resulting transaction ID as a string.
         *
         * @param tx A string, {@link https://github.com/feross/buffer|Buffer}, or [[Tx]] representing a transaction
         *
         * @returns A Promise string representing the transaction ID of the posted transaction.
         */
        this.issueTx = (tx) => __awaiter(this, void 0, void 0, function* () {
            let Transaction = "";
            if (typeof tx === "string") {
                Transaction = tx;
            }
            else if (tx instanceof buffer_1.Buffer) {
                const txobj = new tx_1.Tx();
                txobj.fromBuffer(tx);
                Transaction = txobj.toStringHex();
            }
            else if (tx instanceof tx_1.Tx) {
                Transaction = tx.toStringHex();
            }
            else {
                /* istanbul ignore next */
                throw new errors_2.TransactionError("Error - platform.issueTx: provided tx is not expected type of string, Buffer, or Tx");
            }
            const params = {
                tx: Transaction.toString(),
                encoding: "hex"
            };
            const response = yield this.callMethod("platform.issueTx", params);
            return response.data.result.txID;
        });
        /**
         * Returns an upper bound on the amount of tokens that exist along with the P-chain height. Not monotonically increasing because this number can go down if a staker"s reward is denied.
         */
        this.getCurrentSupply = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("platform.getCurrentSupply");
            return {
                supply: new bn_js_1.default(response.data.result.supply, 10),
                height: new bn_js_1.default(response.data.result.height, 10)
            };
        });
        /**
         * Returns the height of the platform chain.
         */
        this.getHeight = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("platform.getHeight");
            return new bn_js_1.default(response.data.result.height, 10);
        });
        /**
         * Gets the minimum staking amount.
         *
         * @param refresh A boolean to bypass the local cached value of Minimum Stake Amount, polling the node instead.
         */
        this.getMinStake = (refresh = false) => __awaiter(this, void 0, void 0, function* () {
            if (refresh !== true &&
                typeof this.minValidatorStake !== "undefined" &&
                typeof this.minDelegatorStake !== "undefined") {
                return {
                    minValidatorStake: this.minValidatorStake,
                    minDelegatorStake: this.minDelegatorStake
                };
            }
            const response = yield this.callMethod("platform.getMinStake");
            this.minValidatorStake = new bn_js_1.default(response.data.result.minValidatorStake, 10);
            this.minDelegatorStake = new bn_js_1.default(response.data.result.minDelegatorStake, 10);
            return {
                minValidatorStake: this.minValidatorStake,
                minDelegatorStake: this.minDelegatorStake
            };
        });
        /**
         * getTotalStake() returns the total amount staked on the Primary Network
         *
         * @returns A big number representing total staked by validators on the primary network
         */
        this.getTotalStake = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("platform.getTotalStake");
            return new bn_js_1.default(response.data.result.stake, 10);
        });
        /**
         * getMaxStakeAmount() returns the maximum amount of nAVAX staking to the named node during the time period.
         *
         * @param subnetID A Buffer or cb58 string representing subnet
         * @param nodeID A string representing ID of the node whose stake amount is required during the given duration
         * @param startTime A big number denoting start time of the duration during which stake amount of the node is required.
         * @param endTime A big number denoting end time of the duration during which stake amount of the node is required.
         * @returns A big number representing total staked by validators on the primary network
         */
        this.getMaxStakeAmount = (subnetID, nodeID, startTime, endTime) => __awaiter(this, void 0, void 0, function* () {
            const now = (0, helperfunctions_1.UnixNow)();
            if (startTime.gt(now) || endTime.lte(startTime)) {
                throw new errors_2.TimeError("PlatformVMAPI.getMaxStakeAmount -- startTime must be in the past and endTime must come after startTime");
            }
            const params = {
                nodeID: nodeID,
                startTime: startTime.toString(10),
                endTime: endTime.toString(10)
            };
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            const response = yield this.callMethod("platform.getMaxStakeAmount", params);
            return new bn_js_1.default(response.data.result.amount, 10);
        });
        /**
         * Sets the minimum stake cached in this class.
         * @param minValidatorStake A {@link https://github.com/indutny/bn.js/|BN} to set the minimum stake amount cached in this class.
         * @param minDelegatorStake A {@link https://github.com/indutny/bn.js/|BN} to set the minimum delegation amount cached in this class.
         */
        this.setMinStake = (minValidatorStake = undefined, minDelegatorStake = undefined) => {
            if (typeof minValidatorStake !== "undefined") {
                this.minValidatorStake = minValidatorStake;
            }
            if (typeof minDelegatorStake !== "undefined") {
                this.minDelegatorStake = minDelegatorStake;
            }
        };
        /**
         * Gets the total amount staked for an array of addresses.
         */
        this.getStake = (addresses, encoding = "hex") => __awaiter(this, void 0, void 0, function* () {
            const params = {
                addresses,
                encoding
            };
            const response = yield this.callMethod("platform.getStake", params);
            return {
                staked: new bn_js_1.default(response.data.result.staked, 10),
                stakedOutputs: response.data.result.stakedOutputs.map((stakedOutput) => {
                    const transferableOutput = new outputs_1.TransferableOutput();
                    let buf;
                    if (encoding === "cb58") {
                        buf = bintools.cb58Decode(stakedOutput);
                    }
                    else {
                        buf = buffer_1.Buffer.from(stakedOutput.replace(/0x/g, ""), "hex");
                    }
                    transferableOutput.fromBuffer(buf, 2);
                    return transferableOutput;
                })
            };
        });
        /**
         * Get all the subnets that exist.
         *
         * @param ids IDs of the subnets to retrieve information about. If omitted, gets all subnets
         *
         * @returns Promise for an array of objects containing fields "id",
         * "controlKeys", and "threshold".
         */
        this.getSubnets = (ids = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            if (typeof ids !== undefined) {
                params.ids = ids;
            }
            const response = yield this.callMethod("platform.getSubnets", params);
            return response.data.result.subnets;
        });
        /**
         * Exports the private key for an address.
         *
         * @param username The name of the user with the private key
         * @param password The password used to decrypt the private key
         * @param address The address whose private key should be exported
         *
         * @returns Promise with the decrypted private key as store in the database
         */
        this.exportKey = (username, password, address) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                address
            };
            const response = yield this.callMethod("platform.exportKey", params);
            return response.data.result.privateKey
                ? response.data.result.privateKey
                : response.data.result;
        });
        /**
         * Give a user control over an address by providing the private key that controls the address.
         *
         * @param username The name of the user to store the private key
         * @param password The password that unlocks the user
         * @param privateKey A string representing the private key in the vm"s format
         *
         * @returns The address for the imported private key.
         */
        this.importKey = (username, password, privateKey) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                privateKey
            };
            const response = yield this.callMethod("platform.importKey", params);
            return response.data.result.address
                ? response.data.result.address
                : response.data.result;
        });
        /**
         * Returns the treansaction data of a provided transaction ID by calling the node's `getTx` method.
         *
         * @param txID The string representation of the transaction ID
         * @param encoding sets the format of the returned transaction. Can be, "cb58", "hex" or "json". Defaults to "cb58".
         *
         * @returns Returns a Promise string or object containing the bytes retrieved from the node
         */
        this.getTx = (txID, encoding = "hex") => __awaiter(this, void 0, void 0, function* () {
            const params = {
                txID,
                encoding
            };
            const response = yield this.callMethod("platform.getTx", params);
            return response.data.result.tx
                ? response.data.result.tx
                : response.data.result;
        });
        /**
         * Returns the status of a provided transaction ID by calling the node's `getTxStatus` method.
         *
         * @param txid The string representation of the transaction ID
         * @param includeReason Return the reason tx was dropped, if applicable. Defaults to true
         *
         * @returns Returns a Promise string containing the status retrieved from the node and the reason a tx was dropped, if applicable.
         */
        this.getTxStatus = (txid, includeReason = true) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                txID: txid,
                includeReason: includeReason
            };
            const response = yield this.callMethod("platform.getTxStatus", params);
            return response.data.result;
        });
        /**
         * Retrieves the UTXOs related to the addresses provided from the node's `getUTXOs` method.
         *
         * @param addresses An array of addresses as cb58 strings or addresses as {@link https://github.com/feross/buffer|Buffer}s
         * @param sourceChain A string for the chain to look for the UTXO"s. Default is to use this chain, but if exported UTXOs exist from other chains, this can used to pull them instead.
         * @param limit Optional. Returns at most [limit] addresses. If [limit] == 0 or > [maxUTXOsToFetch], fetches up to [maxUTXOsToFetch].
         * @param startIndex Optional. [StartIndex] defines where to start fetching UTXOs (for pagination.)
         * UTXOs fetched are from addresses equal to or greater than [StartIndex.Address]
         * For address [StartIndex.Address], only UTXOs with IDs greater than [StartIndex.Utxo] will be returned.
         * @param persistOpts Options available to persist these UTXOs in local storage
         * @param encoding Optional.  is the encoding format to use for the payload argument. Can be either "cb58" or "hex". Defaults to "hex".
         *
         * @remarks
         * persistOpts is optional and must be of type [[PersistanceOptions]]
         *
         */
        this.getUTXOs = (addresses, sourceChain = undefined, limit = 0, startIndex = undefined, persistOpts = undefined, encoding = "hex") => __awaiter(this, void 0, void 0, function* () {
            if (typeof addresses === "string") {
                addresses = [addresses];
            }
            const params = {
                addresses: addresses,
                limit,
                encoding
            };
            if (typeof startIndex !== "undefined" && startIndex) {
                params.startIndex = startIndex;
            }
            if (typeof sourceChain !== "undefined") {
                params.sourceChain = sourceChain;
            }
            const response = yield this.callMethod("platform.getUTXOs", params);
            const utxos = new utxos_1.UTXOSet();
            let data = response.data.result.utxos;
            if (persistOpts && typeof persistOpts === "object") {
                if (this.db.has(persistOpts.getName())) {
                    const selfArray = this.db.get(persistOpts.getName());
                    if (Array.isArray(selfArray)) {
                        utxos.addArray(data);
                        const self = new utxos_1.UTXOSet();
                        self.addArray(selfArray);
                        self.mergeByRule(utxos, persistOpts.getMergeRule());
                        data = self.getAllUTXOStrings();
                    }
                }
                this.db.set(persistOpts.getName(), data, persistOpts.getOverwrite());
            }
            if (data.length > 0 && data[0].substring(0, 2) === "0x") {
                const cb58Strs = [];
                data.forEach((str) => {
                    cb58Strs.push(bintools.cb58Encode(buffer_1.Buffer.from(str.slice(2), "hex")));
                });
                utxos.addArray(cb58Strs, false);
            }
            else {
                utxos.addArray(data, false);
            }
            response.data.result.utxos = utxos;
            response.data.result.numFetched = parseInt(response.data.result.numFetched);
            return response.data.result;
        });
        /**
         * getAddressStates() returns an 64 bit bitmask of states applied to address
         *
         * @returns A big number representing the states applied to given address
         */
        this.getAddressStates = (address) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                address: address
            };
            const response = yield this.callMethod("platform.getAddressStates", params);
            return new bn_js_1.default(response.data.result, 10);
        });
        /**
         * getMultisigAlias() returns a MultisigAliasReply
         *
         * @returns A MultiSigAlias
         */
        this.getMultisigAlias = (address) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                address: address
            };
            const response = yield this.callMethod("platform.getMultisigAlias", params);
            return {
                memo: response.data.result.memo,
                locktime: new bn_js_1.default(response.data.result.locktime),
                threshold: new bn_js_1.default(response.data.result.threshold).toNumber(),
                addresses: response.data.result.addresses
            };
        });
        /**
         * Helper function which creates an unsigned transaction. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param amount The amount of AssetID to be spent in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}.
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[BaseTx]].
         *
         * @remarks
         * This helper exists because the endpoint API should be the primary point of entry for most functionality.
         */
        this.buildBaseTx = (utxoset, amount, toAddresses, fromAddresses, changeAddresses, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)(), locktime = new bn_js_1.default(0), toThreshold = 1, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildBaseTx";
            const to = this._cleanAddressArrayBuffer(toAddresses, caller);
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const networkID = this.core.getNetworkID();
            const blockchainIDBuf = bintools.cb58Decode(this.blockchainID);
            const fee = this.getTxFee();
            const feeAssetID = yield this.getAVAXAssetID();
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildBaseTx(networkID, blockchainIDBuf, amount, feeAssetID, to, fromSigner, change, fee, feeAssetID, memo, asOf, locktime, toThreshold, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned Import Tx. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param ownerAddresses The addresses being used to import
         * @param sourceChain The chainid for where the import is coming from.
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[ImportTx]].
         *
         * @remarks
         * This helper exists because the endpoint API should be the primary point of entry for most functionality.
         */
        this.buildImportTx = (utxoset, ownerAddresses, sourceChain, toAddresses, fromAddresses, changeAddresses = undefined, memo = undefined, asOf = common_1.ZeroBN, locktime = common_1.ZeroBN, toThreshold = 1, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildAddValidatorTx";
            const to = this._cleanAddressArrayBuffer(toAddresses, caller);
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            let srcChain = undefined;
            if (typeof sourceChain === "undefined") {
                throw new errors_2.ChainIdError("Error - PlatformVMAPI.buildImportTx: Source ChainID is undefined.");
            }
            else if (typeof sourceChain === "string") {
                srcChain = sourceChain;
                sourceChain = bintools.cb58Decode(sourceChain);
            }
            else if (!(sourceChain instanceof buffer_1.Buffer)) {
                throw new errors_2.ChainIdError("Error - PlatformVMAPI.buildImportTx: Invalid destinationChain type: " +
                    typeof sourceChain);
            }
            const atomicUTXOs = yield (yield this.getUTXOs(ownerAddresses, srcChain, 0, undefined)).utxos;
            const avaxAssetID = yield this.getAVAXAssetID();
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const atomics = atomicUTXOs.getAllUTXOs();
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildImportTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), to, fromSigner, change, atomics, sourceChain, this.getTxFee(), avaxAssetID, memo, asOf, locktime, toThreshold, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned Export Tx. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param amount The amount being exported as a {@link https://github.com/indutny/bn.js/|BN}
         * @param destinationChain The chainid for where the assets will be sent.
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains an [[ExportTx]].
         */
        this.buildExportTx = (utxoset, amount, destinationChain, toAddresses, fromAddresses, changeAddresses = undefined, memo = undefined, asOf = common_1.ZeroBN, locktime = common_1.ZeroBN, toThreshold = 1, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildExportTx";
            let prefixes = {};
            toAddresses.map((a) => {
                prefixes[a.split("-")[0]] = true;
            });
            if (Object.keys(prefixes).length !== 1) {
                throw new errors_2.AddressError("Error - PlatformVMAPI.buildExportTx: To addresses must have the same chainID prefix.");
            }
            if (typeof destinationChain === "undefined") {
                throw new errors_2.ChainIdError("Error - PlatformVMAPI.buildExportTx: Destination ChainID is undefined.");
            }
            else if (typeof destinationChain === "string") {
                destinationChain = bintools.cb58Decode(destinationChain); //
            }
            else if (!(destinationChain instanceof buffer_1.Buffer)) {
                throw new errors_2.ChainIdError("Error - PlatformVMAPI.buildExportTx: Invalid destinationChain type: " +
                    typeof destinationChain);
            }
            if (destinationChain.length !== 32) {
                throw new errors_2.ChainIdError("Error - PlatformVMAPI.buildExportTx: Destination ChainID must be 32 bytes in length.");
            }
            let to = [];
            toAddresses.map((a) => {
                to.push(bintools.stringToAddress(a));
            });
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildExportTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), amount, avaxAssetID, to, fromSigner, destinationChain, change, this.getTxFee(), avaxAssetID, memo, asOf, locktime, toThreshold, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned [[AddSubnetValidatorTx]]. For more granular control, you may create your own
         * [[UnsignedTx]] manually and import the [[AddSubnetValidatorTx]] class directly.
         *
         * @param utxoset A set of UTXOs that the transaction is built on.
         * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees in AVAX
         * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
         * @param nodeID The node ID of the validator being added.
         * @param startTime The Unix time when the validator starts validating the Primary Network.
         * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
         * @param weight The amount of weight for this subnet validator.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param subnetAuth Optional. An Auth struct which contains the subnet Auth and the signers.
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildAddSubnetValidatorTx = (utxoset, fromAddresses, changeAddresses, nodeID, startTime, endTime, weight, subnetID, memo = undefined, asOf = common_1.ZeroBN, subnetAuth = { addresses: [], threshold: 0, signer: [] }, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildAddSubnetValidatorTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const now = (0, helperfunctions_1.UnixNow)();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new Error("PlatformVMAPI.buildAddSubnetValidatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildAddSubnetValidatorTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), fromSigner, change, (0, helperfunctions_1.NodeIDStringToBuffer)(nodeID), startTime, endTime, weight, subnetID, this.getDefaultTxFee(), avaxAssetID, memo, asOf, subnetAuth, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new Error("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned [[AddDelegatorTx]]. For more granular control, you may create your own
         * [[UnsignedTx]] manually and import the [[AddDelegatorTx]] class directly.
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who received the staked tokens at the end of the staking period
         * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who own the staking UTXOs the fees in AVAX
         * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
         * @param nodeID The node ID of the validator being added.
         * @param startTime The Unix time when the validator starts validating the Primary Network.
         * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
         * @param stakeAmount The amount being delegated as a {@link https://github.com/indutny/bn.js/|BN}
         * @param rewardAddresses The addresses which will recieve the rewards from the delegated stake.
         * @param rewardLocktime Optional. The locktime field created in the resulting reward outputs
         * @param rewardThreshold Opional. The number of signatures required to spend the funds in the resultant reward UTXO. Default 1.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildAddDelegatorTx = (utxoset, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardAddresses, rewardLocktime = common_1.ZeroBN, rewardThreshold = 1, memo = undefined, asOf = common_1.ZeroBN, toThreshold = 1, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildAddDelegatorTx";
            const to = this._cleanAddressArrayBuffer(toAddresses, caller);
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            const rewards = this._cleanAddressArrayBuffer(rewardAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const minStake = (yield this.getMinStake())["minDelegatorStake"];
            if (stakeAmount.lt(minStake)) {
                throw new errors_2.StakeError("PlatformVMAPI.buildAddDelegatorTx -- stake amount must be at least " +
                    minStake.toString(10));
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const now = (0, helperfunctions_1.UnixNow)();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new errors_2.TimeError("PlatformVMAPI.buildAddDelegatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            if (this.core.getNetwork().P.lockModeBondDeposit) {
                throw new errors_1.UTXOError("PlatformVMAPI.buildAddDelegatorTx -- not supported in lockmodeBondDeposit");
            }
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildAddDelegatorTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), avaxAssetID, to, fromSigner, change, (0, helperfunctions_1.NodeIDStringToBuffer)(nodeID), startTime, endTime, stakeAmount, rewardLocktime, rewardThreshold, rewards, common_1.ZeroBN, avaxAssetID, memo, asOf, toThreshold, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned [[AddValidatorTx]]. For more granular control, you may create your own
         * [[UnsignedTx]] manually and import the [[AddValidatorTx]] class directly.
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who received the staked tokens at the end of the staking period
         * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who own the staking UTXOs the fees in AVAX
         * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
         * @param nodeID The node ID of the validator being added.
         * @param startTime The Unix time when the validator starts validating the Primary Network.
         * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
         * @param stakeAmount The amount being delegated as a {@link https://github.com/indutny/bn.js/|BN}
         * @param rewardAddresses The addresses which will recieve the rewards from the delegated stake.
         * @param delegationFee A number for the percentage of reward to be given to the validator when someone delegates to them. Must be between 0 and 100.
         * @param rewardLocktime Optional. The locktime field created in the resulting reward outputs
         * @param rewardThreshold Opional. The number of signatures required to spend the funds in the resultant reward UTXO. Default 1.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildAddValidatorTx = (utxoset, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardAddresses, delegationFee, rewardLocktime = common_1.ZeroBN, rewardThreshold = 1, memo = undefined, asOf = common_1.ZeroBN, toThreshold = 1, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildAddValidatorTx";
            const to = this._cleanAddressArrayBuffer(toAddresses, caller);
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            const rewards = this._cleanAddressArrayBuffer(rewardAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const minStake = (yield this.getMinStake())["minValidatorStake"];
            if (stakeAmount.lt(minStake)) {
                throw new errors_2.StakeError(`PlatformVMAPI.${caller} -- stake amount must be at least ` +
                    minStake.toString(10));
            }
            if (typeof delegationFee !== "number" ||
                delegationFee > 100 ||
                delegationFee < 0) {
                throw new errors_2.DelegationFeeError(`PlatformVMAPI.${caller} -- delegationFee must be a number between 0 and 100`);
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const now = (0, helperfunctions_1.UnixNow)();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new errors_2.TimeError(`PlatformVMAPI.${caller} -- startTime must be in the future and endTime must come after startTime`);
            }
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildAddValidatorTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), to, fromSigner, change, (0, helperfunctions_1.NodeIDStringToBuffer)(nodeID), startTime, endTime, stakeAmount, avaxAssetID, rewardLocktime, rewardThreshold, rewards, delegationFee, common_1.ZeroBN, avaxAssetID, memo, asOf, toThreshold, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Class representing an unsigned [[CreateSubnetTx]] transaction.
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param subnetOwnerAddresses An array of addresses for owners of the new subnet
         * @param subnetOwnerThreshold A number indicating the amount of signatures required to add validators to a subnet
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildCreateSubnetTx = (utxoset, fromAddresses, changeAddresses, subnetOwnerAddresses, subnetOwnerThreshold, memo = undefined, asOf = common_1.ZeroBN, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildCreateSubnetTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            const owners = this._cleanAddressArrayBuffer(subnetOwnerAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const fee = this.getCreateSubnetTxFee();
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildCreateSubnetTx(networkID, blockchainID, fromSigner, change, owners, subnetOwnerThreshold, fee, avaxAssetID, memo, asOf, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Build an unsigned [[CreateChainTx]].
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param subnetID Optional ID of the Subnet that validates this blockchain
         * @param chainName Optional A human readable name for the chain; need not be unique
         * @param vmID Optional ID of the VM running on the new chain
         * @param fxIDs Optional IDs of the feature extensions running on the new chain
         * @param genesisData Optional Byte representation of genesis state of the new chain
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param subnetAuthCredentials Optional. An array of index and address to sign for each SubnetAuth.
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildCreateChainTx = (utxoset, fromAddresses, changeAddresses, subnetID = undefined, chainName = undefined, vmID = undefined, fxIDs = undefined, genesisData = undefined, memo = undefined, asOf = common_1.ZeroBN, subnetAuth = { addresses: [], threshold: 0, signer: [] }, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildCreateChainTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            fxIDs = fxIDs.sort();
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const fee = this.getCreateChainTxFee();
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildCreateChainTx(networkID, blockchainID, fromSigner, change, subnetID, chainName, vmID, fxIDs, genesisData, fee, avaxAssetID, memo, asOf, subnetAuth, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned [[CaminoAddValidatorTx]]. For more granular control, you may create your own
         * [[UnsignedTx]] manually and import the [[CaminoAddValidatorTx]] class directly.
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who received the staked tokens at the end of the staking period
         * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who own the staking UTXOs the fees in AVAX
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
         * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildCaminoAddValidatorTx = (utxoset, fromAddresses, changeAddresses, nodeID, nodeOwner, startTime, endTime, stakeAmount, rewardAddresses, rewardLocktime = common_1.ZeroBN, rewardThreshold = 1, memo = undefined, asOf = common_1.ZeroBN, toThreshold = 1, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildCaminoAddValidatorTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            const rewards = this._cleanAddressArrayBuffer(rewardAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const minStake = (yield this.getMinStake())["minValidatorStake"];
            if (stakeAmount.lt(minStake)) {
                throw new errors_2.StakeError(`PlatformVMAPI.${caller} -- stake amount must be at least ` +
                    minStake.toString(10));
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const now = (0, helperfunctions_1.UnixNow)();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new errors_2.TimeError(`PlatformVMAPI.${caller} -- startTime must be in the future and endTime must come after startTime`);
            }
            const auth = {
                address: this.parseAddress(nodeOwner.address),
                auth: []
            };
            nodeOwner.auth.forEach((o) => {
                auth.auth.push([o[0], this.parseAddress(o[1])]);
            });
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildCaminoAddValidatorTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), fromSigner, change, (0, helperfunctions_1.NodeIDStringToBuffer)(nodeID), auth, startTime, endTime, stakeAmount, avaxAssetID, rewards, rewardLocktime, rewardThreshold, memo, asOf, toThreshold, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Build an unsigned [[AddressStateTx]].
         *
         * @param version Optional. Transaction version number, default 0.
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
         * @param address The address to alter state.
         * @param state The state to set or remove on the given address
         * @param remove Optional. Flag if state should be applied or removed
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned AddressStateTx created from the passed in parameters.
         */
        this.buildAddressStateTx = (version = constants_1.DefaultTransactionVersionNumber, utxoset, fromAddresses, changeAddresses, address, state, remove = false, memo = undefined, asOf = common_1.ZeroBN, changeThreshold = 1, executorAddress = undefined, executorAuth = []) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildAddressStateTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            const addressBuf = typeof address === "string" ? this.parseAddress(address) : address;
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const fee = this.getTxFee();
            var authAddress;
            var auth = [];
            if (executorAddress) {
                authAddress = this.parseAddress(executorAddress);
                executorAuth.forEach((o) => {
                    auth.push([o[0], this.parseAddress(o[1])]);
                });
            }
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildAddressStateTx(version, networkID, blockchainID, fromSigner, change, addressBuf, state, remove, fee, avaxAssetID, memo, asOf, changeThreshold, authAddress, auth);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Build an unsigned [[RegisterNodeTx]].
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param oldNodeID Optional. ID of the existing NodeID to replace or remove.
         * @param newNodeID Optional. ID of the newNodID to register address.
         * @param address The consortiumMemberAddress, single or multi-sig.
         * @param addressAuths An array of index and address to verify ownership of address.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildRegisterNodeTx = (utxoset, fromAddresses, changeAddresses = undefined, oldNodeID = undefined, newNodeID = undefined, address = undefined, addressAuths = [], memo = undefined, asOf = common_1.ZeroBN, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildRegisterNodeTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            const addrBuf = typeof address === "string" ? this.parseAddress(address) : address;
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const auth = [];
            addressAuths.forEach((c) => {
                auth.push([
                    c[0],
                    typeof c[1] === "string" ? this.parseAddress(c[1]) : c[1]
                ]);
            });
            if (typeof oldNodeID === "string") {
                oldNodeID = (0, helperfunctions_1.NodeIDStringToBuffer)(oldNodeID);
            }
            if (typeof newNodeID === "string") {
                newNodeID = (0, helperfunctions_1.NodeIDStringToBuffer)(newNodeID);
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const fee = this.getTxFee();
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildRegisterNodeTx(networkID, blockchainID, fromSigner, change, oldNodeID, newNodeID, addrBuf, auth, fee, avaxAssetID, memo, asOf, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Build an unsigned [[DepositTx]].
         *
         * @param version Optional. Transaction version number, default 0.
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
         * @param depositOfferID ID of the deposit offer.
         * @param depositDuration Duration of the deposit
         * @param rewardsOwner Optional The owners of the reward. If omitted, all inputs must have the same owner
         * @param depositCreatorAddress Address that is authorized to create deposit with given offer. Could be empty, if offer owner is empty.
         * @param depositCreatorAuth Auth for deposit creator address
         * @param depositOfferOwnerSigs Signatures which recover to depositOfferOwner address(es)
         * @param depositOfferOwnerAuth Auth for deposit offer owner
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildDepositTx = (version = constants_1.DefaultTransactionVersionNumber, utxoset, fromAddresses, changeAddresses = undefined, depositOfferID, depositDuration, rewardsOwner = undefined, depositCreatorAddress = undefined, depositCreatorAuth = [], depositOfferOwnerSigs = [], depositOfferOwnerAuth = [], memo = undefined, asOf = common_1.ZeroBN, amountToLock, changeThreshold = 1, to = [], toThreshold = 0) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildDepositTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const fee = this.getTxFee();
            if (typeof depositOfferID === "string")
                depositOfferID = bintools.cb58Decode(depositOfferID);
            const dc_auth = [];
            depositCreatorAuth.forEach((c) => {
                dc_auth.push([
                    c[0],
                    typeof c[1] === "string" ? this.parseAddress(c[1]) : c[1]
                ]);
            });
            if (depositOfferOwnerAuth.length !== depositOfferOwnerSigs.length) {
                throw new Error("OwnerAuth length must mathch OwnerSigs length");
            }
            const o_auth = [];
            depositOfferOwnerAuth.forEach((c) => {
                o_auth.push([
                    c[0],
                    typeof c[1] === "string" ? this.parseAddress(c[1]) : c[1]
                ]);
            });
            if (typeof depositCreatorAddress === "string")
                depositCreatorAddress = this.parseAddress(depositCreatorAddress);
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildDepositTx(version, networkID, blockchainID, fromSigner, change, depositOfferID, depositDuration, rewardsOwner, depositCreatorAddress, dc_auth, depositOfferOwnerSigs, o_auth, fee, avaxAssetID, memo, asOf, amountToLock, changeThreshold, to, toThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Build an unsigned [[UnlockDepositTx]].
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildUnlockDepositTx = (utxoset, fromAddresses, changeAddresses = undefined, memo = undefined, asOf = common_1.ZeroBN, amountToLock, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildUnlockDepositTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const fee = this.getTxFee();
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildUnlockDepositTx(networkID, blockchainID, fromSigner, change, fee, avaxAssetID, memo, asOf, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Build an unsigned [[ClaimTx]].
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         * @param claimAmounts The specification and authentication what and how much to claim
         * @param claimTo The address to claimed rewards will be directed to
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildClaimTx = (utxoset, fromAddresses, changeAddresses = undefined, memo = undefined, asOf = common_1.ZeroBN, changeThreshold = 1, claimAmounts, claimTo = undefined) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildClaimTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            if (claimAmounts.length === 0) {
                throw new Error("Must provide at least one claimAmount");
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const fee = this.getTxFee();
            const unsignedClaimTx = yield this._getBuilder(utxoset).buildClaimTx(networkID, blockchainID, fromSigner, change, fee, avaxAssetID, memo, asOf, changeThreshold, claimAmounts, claimTo);
            if (!(yield this.checkGooseEgg(unsignedClaimTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return unsignedClaimTx;
        });
        /**
         * Build an unsigned [[MultisigAliasTx]].
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
         * @param multisigAliasParams An object containing the parameters for the multisigAliasTx
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildMultisigAliasTx = (utxoset, fromAddresses, changeAddresses, multisigAliasParams, memo = undefined, asOf = common_1.ZeroBN, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildMultisigAliasTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const fee = this.getTxFee();
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildMultisigAliasTx(networkID, blockchainID, fromSigner, change, multisigAliasParams, fee, avaxAssetID, memo, asOf, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        this.buildAddDepositOfferTx = (utxoset, fromAddresses, changeAddresses, depositOffer, depositOfferCreatorAddress, depositOfferCreatorAuth = [], memo = undefined, asOf = common_1.ZeroBN, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildAddDepositOfferTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const fee = this.getTxFee();
            const auth = [];
            depositOfferCreatorAuth.forEach((c) => {
                auth.push([
                    c[0],
                    typeof c[1] === "string" ? this.parseAddress(c[1]) : c[1]
                ]);
            });
            let ownerAddress;
            if (depositOffer.ownerAddress) {
                ownerAddress = this.parseAddress(depositOffer.ownerAddress);
            }
            const offer = new adddepositoffertx_1.Offer(depositOffer.upgradeVersion, depositOffer.interestRateNominator, depositOffer.start, depositOffer.end, depositOffer.minAmount, depositOffer.totalMaxAmount, depositOffer.depositedAmount, depositOffer.minDuration, depositOffer.maxDuration, depositOffer.unlockPeriodDuration, depositOffer.noRewardsPeriodDuration, buffer_1.Buffer.from(depositOffer.memo, "utf-8"), depositOffer.flags, depositOffer.totalMaxRewardAmount, depositOffer.rewardedAmount, ownerAddress);
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildAddDepositOfferTx(networkID, blockchainID, fromSigner, change, offer, this.parseAddress(depositOfferCreatorAddress), auth, fee, avaxAssetID, memo, asOf, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * @returns the current timestamp on chain.
         */
        this.getTimestamp = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("platform.getTimestamp");
            return response.data.result.timestamp;
        });
        /**
         * @returns the UTXOs that were rewarded after the provided transaction"s staking or delegation period ended.
         */
        this.getRewardUTXOs = (txID, encoding) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                txID,
                encoding
            };
            const response = yield this.callMethod("platform.getRewardUTXOs", params);
            return response.data.result;
        });
        /**
         * Get blockchains configuration (genesis)
         *
         * @returns Promise for an GetConfigurationResponse
         */
        this.getConfiguration = () => __awaiter(this, void 0, void 0, function* () {
            var _e, _f;
            const response = yield this.callMethod("platform.getConfiguration");
            const r = response.data.result;
            return {
                networkID: parseInt(r.networkID),
                assetID: r.assetID,
                assetSymbol: r.assetSymbol,
                hrp: r.hrp,
                blockchains: r.blockchains,
                minStakeDuration: new bn_js_1.default(r.minStakeDuration).div(NanoBN).toNumber(),
                maxStakeDuration: new bn_js_1.default(r.maxStakeDuration).div(NanoBN).toNumber(),
                minValidatorStake: new bn_js_1.default(r.minValidatorStake),
                maxValidatorStake: new bn_js_1.default(r.maxValidatorStake),
                minDelegationFee: new bn_js_1.default(r.minDelegationFee),
                minDelegatorStake: new bn_js_1.default(r.minDelegatorStake),
                minConsumptionRate: parseInt(r.minConsumptionRate) / rewardPercentDenom,
                maxConsumptionRate: parseInt(r.maxConsumptionRate) / rewardPercentDenom,
                supplyCap: new bn_js_1.default(r.supplyCap),
                verifyNodeSignature: (_e = r.verifyNodeSignature) !== null && _e !== void 0 ? _e : false,
                lockModeBondDeposit: (_f = r.lockModeBondDeposit) !== null && _f !== void 0 ? _f : false
            };
        });
        /**
         * Get blockchains configuration (genesis)
         *
         * @returns Promise for an GetConfigurationResponse
         */
        this.spend = (from, signer, to, toThreshold, toLockTime, change, changeThreshold, lockMode, amountToLock, amountToBurn, asOf, encoding) => __awaiter(this, void 0, void 0, function* () {
            if (!["Unlocked", "Deposit", "Bond"].includes(lockMode)) {
                throw new errors_1.ProtocolError("Error -- PlatformAPI.spend: invalid lockMode");
            }
            const params = {
                from,
                signer,
                to: to.length > 0
                    ? {
                        locktime: toLockTime.toString(10),
                        threshold: toThreshold,
                        addresses: to
                    }
                    : undefined,
                change: change.length > 0
                    ? { locktime: "0", threshold: changeThreshold, addresses: change }
                    : undefined,
                lockMode: lockMode === "Unlocked" ? 0 : lockMode === "Deposit" ? 1 : 2,
                amountToLock: amountToLock.toString(10),
                amountToBurn: amountToBurn.toString(10),
                asOf: asOf.toString(10),
                encoding: encoding !== null && encoding !== void 0 ? encoding : "hex"
            };
            const response = yield this.callMethod("platform.spend", params);
            const r = response.data.result;
            // We need to update signature index source here
            const ins = inputs_1.TransferableInput.fromArray(buffer_1.Buffer.from(r.ins.slice(2), "hex"));
            ins.forEach((e, idx) => e.getSigIdxs().forEach((s, sidx) => {
                s.setSource(bintools.cb58Decode(r.signers[`${idx}`][`${sidx}`]));
            }));
            return {
                ins,
                out: outputs_1.TransferableOutput.fromArray(buffer_1.Buffer.from(r.outs.slice(2), "hex")),
                owners: r.owners
                    ? common_1.OutputOwners.fromArray(buffer_1.Buffer.from(r.owners.slice(2), "hex"))
                    : []
            };
        });
        this._getBuilder = (utxoSet) => {
            if (this.core.getNetwork().P.lockModeBondDeposit) {
                return new builder_1.Builder(new spender_1.Spender(this), true);
            }
            return new builder_1.Builder(utxoSet, false);
        };
        /**
         * Build an unsigned [[AddProposalTx]].
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
         * @param proposalDescription Optional contains arbitrary bytes, up to 256 bytes
         * @param proposal The proposal content that will be created.
         * @param proposerAddress The P-address of proposer in Buffer.
         * @param version Optional. Transaction version number, default 0.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildAddProposalTx = (utxoset, fromAddresses, changeAddresses, proposalDescription, proposal, proposerAddress, version = constants_1.DefaultTransactionVersionNumber, memo = undefined, asOf = common_1.ZeroBN, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildAddProposalTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const fee = this.getTxFee();
            const proposerAuth = new subnetauth_1.SubnetAuth();
            const addressIdx = buffer_1.Buffer.alloc(4);
            proposerAuth.addAddressIndex(addressIdx);
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildAddProposalTx(networkID, blockchainID, fromSigner, change, proposalDescription, proposal, proposerAddress, proposerAuth, version, memo, fee, avaxAssetID, asOf, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Build an unsigned [[AddVoteTx]].
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
         * @param proposalID The proposalID of teh proposal in string
         * @param voteOptionIndex The index of vote option.
         * @param voterAddress The P-address of voter in Buffer.
         * @param version Optional. Transaction version number, default 0.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         */
        this.buildAddVoteTx = (utxoset, fromAddresses, changeAddresses, proposalID, voteOptionIndex, voterAddress, version = constants_1.DefaultTransactionVersionNumber, memo = undefined, asOf = common_1.ZeroBN, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildAddVoteTx";
            const fromSigner = this._parseFromSigner(fromAddresses, caller);
            const change = this._cleanAddressArrayBuffer(changeAddresses, caller);
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const fee = this.getTxFee();
            const proposalIDBuf = bintools.cb58Decode(proposalID);
            const voterAuth = new subnetauth_1.SubnetAuth();
            const addressIdx = buffer_1.Buffer.alloc(4);
            voterAuth.addAddressIndex(addressIdx);
            const builtUnsignedTx = yield this._getBuilder(utxoset).buildAddVoteTx(networkID, blockchainID, fromSigner, change, proposalIDBuf, voteOptionIndex, voterAddress, voterAuth, version, memo, fee, avaxAssetID, asOf, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_2.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        if (core.getNetwork()) {
            this.blockchainID = core.getNetwork().P.blockchainID;
            this.keychain = new keychain_1.KeyChain(core.getHRP(), core.getNetwork().P.alias);
        }
    }
}
exports.PlatformVMAPI = PlatformVMAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLGtEQUFzQjtBQUV0Qix5Q0FPcUI7QUFFckIsK0NBSTJCO0FBQzNCLG9FQUEyQztBQUMzQyx5Q0FBcUM7QUFDckMscURBQWdGO0FBQ2hGLDJDQUFpRDtBQUNqRCw2QkFBcUM7QUFDckMsaURBQWlEO0FBQ2pELGlFQUEyRTtBQUMzRSwrQ0FBbUQ7QUFFbkQsK0NBUTJCO0FBbUQzQixxQ0FBNEM7QUFDNUMsdUNBQThDO0FBQzlDLHVDQUEyRDtBQUUzRCx1Q0FBMEU7QUFFMUUsdUNBQW1DO0FBQ25DLDJEQUEyQztBQUUzQyw2Q0FBeUM7QUFFekM7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQixxQkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFLE1BQU0sTUFBTSxHQUFHLElBQUksZUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ2pDLE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFBO0FBUWxDOzs7Ozs7R0FNRztBQUNILE1BQWEsYUFBYyxTQUFRLGdCQUFPO0lBc3hGeEM7O09BRUc7SUFDTyxrQkFBa0IsQ0FDMUIsU0FBOEIsRUFDOUIsTUFBYztRQUVkLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQTtRQUMxQixNQUFNLE9BQU8sR0FBVyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDL0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUMzQixDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO1FBQzFCLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqRCxJQUFJLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxRQUFRLEVBQUU7b0JBQ3pDLElBQ0UsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFXLENBQUM7d0JBQ3JELFdBQVcsRUFDWDt3QkFDQSwwQkFBMEI7d0JBQzFCLE1BQU0sSUFBSSxxQkFBWSxDQUFDLG1DQUFtQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO3FCQUNyRTtvQkFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFXLENBQUMsQ0FBQTtpQkFDeEM7cUJBQU07b0JBQ0wsTUFBTSxNQUFNLEdBQW1CLFFBQVEsQ0FBQTtvQkFDdkMsS0FBSyxDQUFDLElBQUksQ0FDUixhQUFhLENBQUMsWUFBWSxDQUN4QixTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBVyxFQUMzQixNQUFNLEVBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFDbEIsT0FBTyxDQUNSLENBQ0YsQ0FBQTtpQkFDRjthQUNGO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQTtJQUNkLENBQUM7SUFFUyx3QkFBd0IsQ0FDaEMsU0FBOEIsRUFDOUIsTUFBYztRQUVkLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQ25ELENBQUMsQ0FBUyxFQUFVLEVBQUU7WUFDcEIsT0FBTyxPQUFPLENBQUMsS0FBSyxXQUFXO2dCQUM3QixDQUFDLENBQUMsU0FBUztnQkFDWCxDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQyxDQUFDLENBQ0YsQ0FBQTtJQUNILENBQUM7SUFFUyxnQkFBZ0IsQ0FBQyxJQUFjLEVBQUUsTUFBYztRQUN2RCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ25CLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUTtnQkFDN0IsT0FBTztvQkFDTCxJQUFJLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQWdCLEVBQUUsTUFBTSxDQUFDO29CQUM3RCxNQUFNLEVBQUUsRUFBRTtpQkFDWCxDQUFBOztnQkFFRCxPQUFPO29CQUNMLElBQUksRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBYSxFQUFFLE1BQU0sQ0FBQztvQkFDaEUsTUFBTSxFQUNKLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQzt3QkFDYixDQUFDLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQWEsRUFBRSxNQUFNLENBQUM7d0JBQzVELENBQUMsQ0FBQyxFQUFFO2lCQUNULENBQUE7U0FDSjtRQUNELE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQTtJQUNqQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsWUFBWSxJQUFtQixFQUFFLFVBQWtCLFdBQVc7UUFDNUQsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtRQW4yRnRCOztXQUVHO1FBQ08sYUFBUSxHQUFhLElBQUksbUJBQVEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFekMsaUJBQVksR0FBVyxFQUFFLENBQUE7UUFFekIsb0JBQWUsR0FBVyxTQUFTLENBQUE7UUFFbkMsZ0JBQVcsR0FBVyxTQUFTLENBQUE7UUFFL0IsVUFBSyxHQUFPLFNBQVMsQ0FBQTtRQUVyQixrQkFBYSxHQUFPLFNBQVMsQ0FBQTtRQUU3QixzQkFBaUIsR0FBTyxTQUFTLENBQUE7UUFFakMsc0JBQWlCLEdBQU8sU0FBUyxDQUFBO1FBRTNDOzs7O1dBSUc7UUFDSCx1QkFBa0IsR0FBRyxHQUFXLEVBQUU7WUFDaEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7UUFDdkMsQ0FBQyxDQUFBO1FBRUQ7Ozs7V0FJRztRQUNILGVBQVUsR0FBRyxHQUFZLEVBQUU7WUFDekIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQy9CLENBQUMsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxvQkFBZSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUE7UUFFakQ7Ozs7V0FJRztRQUNILGlCQUFZLEdBQUcsQ0FBQyxJQUFZLEVBQVUsRUFBRTtZQUN0QyxNQUFNLEtBQUssR0FBVyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtZQUMvQyxNQUFNLFlBQVksR0FBVyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7WUFDbkQsT0FBTyxRQUFRLENBQUMsWUFBWSxDQUMxQixJQUFJLEVBQ0osWUFBWSxFQUNaLEtBQUssRUFDTCwrQkFBbUIsQ0FBQyxhQUFhLENBQ2xDLENBQUE7UUFDSCxDQUFDLENBQUE7UUFFRCxzQkFBaUIsR0FBRyxDQUFDLE9BQWUsRUFBVSxFQUFFO1lBQzlDLE1BQU0sT0FBTyxHQUFXLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDL0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDM0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtZQUMxQixNQUFNLElBQUksR0FBbUIsUUFBUSxDQUFBO1lBQ3JDLE9BQU8sYUFBYSxDQUFDLFlBQVksQ0FDL0IsT0FBTyxFQUNQLElBQUksRUFDSixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUNsQixPQUFPLENBQ1IsQ0FBQTtRQUNILENBQUMsQ0FBQTtRQUVEOzs7Ozs7V0FNRztRQUNILG1CQUFjLEdBQUcsQ0FBTyxVQUFtQixLQUFLLEVBQW1CLEVBQUU7WUFDbkUsSUFBSSxPQUFPLElBQUksQ0FBQyxXQUFXLEtBQUssV0FBVyxJQUFJLE9BQU8sRUFBRTtnQkFDdEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQ3JDLENBQUE7YUFDRjtZQUNELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQTtRQUN6QixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7V0FNRztRQUNILG1CQUFjLEdBQUcsQ0FBQyxXQUE0QixFQUFFLEVBQUU7WUFDaEQsSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLEVBQUU7Z0JBQ25DLFdBQVcsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFBO2FBQy9DO1lBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7UUFDaEMsQ0FBQyxDQUFBO1FBRUQ7Ozs7V0FJRztRQUNILG9CQUFlLEdBQUcsR0FBTyxFQUFFO1lBQ3pCLE9BQU8sSUFBSSxlQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDL0MsQ0FBQyxDQUFBO1FBRUQ7Ozs7V0FJRztRQUNILGFBQVEsR0FBRyxHQUFPLEVBQUU7WUFDbEIsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO2dCQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTthQUNwQztZQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtRQUNuQixDQUFDLENBQUE7UUFFRDs7OztXQUlHO1FBQ0gsd0JBQW1CLEdBQUcsR0FBTyxFQUFFOztZQUM3QixPQUFPLElBQUksZUFBRSxDQUFDLE1BQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLG1DQUFJLENBQUMsQ0FBQyxDQUFBO1FBQy9ELENBQUMsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCx5QkFBb0IsR0FBRyxHQUFPLEVBQUU7O1lBQzlCLE9BQU8sSUFBSSxlQUFFLENBQUMsTUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLG1DQUFJLENBQUMsQ0FBQyxDQUFBO1FBQzdELENBQUMsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCx3QkFBbUIsR0FBRyxHQUFPLEVBQUU7O1lBQzdCLE9BQU8sSUFBSSxlQUFFLENBQUMsTUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLG1DQUFJLENBQUMsQ0FBQyxDQUFBO1FBQzVELENBQUMsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxhQUFRLEdBQUcsQ0FBQyxHQUFPLEVBQUUsRUFBRTtZQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQTtRQUNsQixDQUFDLENBQUE7UUFFRDs7OztXQUlHO1FBQ0gsNEJBQXVCLEdBQUcsR0FBTyxFQUFFO1lBQ2pDLE9BQU8sSUFBSSxlQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUMxRCxDQUFDLENBQUE7UUFFRDs7OztXQUlHO1FBQ0gscUJBQWdCLEdBQUcsR0FBTyxFQUFFO1lBQzFCLElBQUksT0FBTyxJQUFJLENBQUMsYUFBYSxLQUFLLFdBQVcsRUFBRTtnQkFDN0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQTthQUNwRDtZQUNELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQTtRQUMzQixDQUFDLENBQUE7UUFFRDs7OztXQUlHO1FBQ0gscUJBQWdCLEdBQUcsQ0FBQyxHQUFPLEVBQUUsRUFBRTtZQUM3QixJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQTtRQUMxQixDQUFDLENBQUE7UUFFRDs7OztXQUlHO1FBQ0gsYUFBUSxHQUFHLEdBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUE7UUFFeEM7O1dBRUc7UUFDSCxnQkFBVyxHQUFHLEdBQWEsRUFBRTtZQUMzQix1Q0FBdUM7WUFDdkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUE7WUFDdkMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQTthQUN4RDtpQkFBTTtnQkFDTCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTthQUNwRTtZQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQTtRQUN0QixDQUFDLENBQUE7UUFFRDs7Ozs7Ozs7O1dBU0c7UUFDSCxrQkFBYSxHQUFHLENBQ2QsR0FBZSxFQUNmLFdBQWUsZUFBTSxFQUNILEVBQUU7WUFDcEIsTUFBTSxXQUFXLEdBQVcsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7WUFDdkQsSUFBSSxXQUFXLEdBQU8sUUFBUSxDQUFDLEVBQUUsQ0FBQyxlQUFNLENBQUM7Z0JBQ3ZDLENBQUMsQ0FBQyxRQUFRO2dCQUNWLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQ25DLE1BQU0sR0FBRyxHQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDeEMsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLG1CQUFPLENBQUMsR0FBRyxDQUFDLElBQUksZUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUM1RCxPQUFPLElBQUksQ0FBQTthQUNaO2lCQUFNO2dCQUNMLE9BQU8sS0FBSyxDQUFBO2FBQ2I7UUFDSCxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxzQkFBaUIsR0FBRyxHQUEwQixFQUFFO1lBQzlDLE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELDRCQUE0QixDQUM3QixDQUFBO1lBQ0QsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUE7UUFDckMsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7O1dBWUc7UUFDSCxxQkFBZ0IsR0FBRyxDQUNqQixRQUFnQixFQUNoQixRQUFnQixFQUNoQixXQUE0QixTQUFTLEVBQ3JDLElBQVksRUFDWixLQUFlLEVBQ2YsSUFBWSxFQUNaLE9BQWUsRUFDRSxFQUFFO1lBQ25CLE1BQU0sTUFBTSxHQUEyQjtnQkFDckMsUUFBUTtnQkFDUixRQUFRO2dCQUNSLEtBQUs7Z0JBQ0wsSUFBSTtnQkFDSixJQUFJO2dCQUNKLFdBQVcsRUFBRSxPQUFPO2FBQ3JCLENBQUE7WUFDRCxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7YUFDM0I7aUJBQU0sSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7Z0JBQzFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQTthQUNoRDtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELDJCQUEyQixFQUMzQixNQUFNLENBQ1AsQ0FBQTtZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFBO1FBQ2xDLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7OztXQU1HO1FBQ0gsd0JBQW1CLEdBQUcsQ0FBTyxZQUFvQixFQUFtQixFQUFFO1lBQ3BFLE1BQU0sTUFBTSxHQUFRO2dCQUNsQixZQUFZO2FBQ2IsQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELDhCQUE4QixFQUM5QixNQUFNLENBQ1AsQ0FBQTtZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFBO1FBQ3BDLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILG9CQUFlLEdBQUcsQ0FDaEIsTUFBYyxFQUNkLFFBQWlCLEVBQ2lCLEVBQUU7WUFDcEMsTUFBTSxNQUFNLEdBQTBCO2dCQUNwQyxNQUFNO2FBQ1AsQ0FBQTtZQUNELElBQUksT0FBTyxRQUFRLEtBQUssV0FBVyxFQUFFO2dCQUNuQyxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTthQUMzQjtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELDBCQUEwQixFQUMxQixNQUFNLENBQ1AsQ0FBQTtZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDN0IsQ0FBQyxDQUFBLENBQUE7UUFDRDs7Ozs7O1dBTUc7UUFDSCxxQkFBZ0IsR0FBRyxDQUNqQixNQUFjLEVBQ2QsUUFBZ0IsRUFDVyxFQUFFO1lBQzdCLE1BQU0sTUFBTSxHQUEyQjtnQkFDckMsTUFBTTtnQkFDTixRQUFRO2FBQ1QsQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELDJCQUEyQixFQUMzQixNQUFNLENBQ1AsQ0FBQTtZQUVELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDN0IsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7OztXQU9HO1FBQ0gsa0JBQWEsR0FBRyxDQUNkLFFBQWdCLEVBQ2hCLFFBQWdCLEVBQ0MsRUFBRTtZQUNuQixNQUFNLE1BQU0sR0FBd0I7Z0JBQ2xDLFFBQVE7Z0JBQ1IsUUFBUTthQUNULENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCx3QkFBd0IsRUFDeEIsTUFBTSxDQUNQLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQTtRQUNyQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7V0FNRztRQUNILGVBQVUsR0FBRyxDQUFPLFNBQW1CLEVBQStCLEVBQUU7WUFDdEUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxXQUFXLEVBQUU7b0JBQ3JELDBCQUEwQjtvQkFDMUIsTUFBTSxJQUFJLHFCQUFZLENBQ3BCLDBEQUEwRCxDQUMzRCxDQUFBO2lCQUNGO1lBQ0gsQ0FBQyxDQUFDLENBQUE7WUFDRixNQUFNLE1BQU0sR0FBUTtnQkFDbEIsU0FBUzthQUNWLENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxxQkFBcUIsRUFDckIsTUFBTSxDQUNQLENBQUE7WUFFRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQTtZQUVuQyxNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQVksRUFBZSxFQUFFO2dCQUM5QyxJQUFJLElBQUksR0FBZ0IsRUFBRSxDQUFBO2dCQUMxQixLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7b0JBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUMvRCxPQUFPLElBQW1CLENBQUE7WUFDNUIsQ0FBQyxDQUFBO1lBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDaEQsT0FBTztvQkFDTCxRQUFRLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7b0JBQ3BDLGVBQWUsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztvQkFDbEQsYUFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDO29CQUM5QyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO29CQUNwRCxzQkFBc0IsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDO29CQUNoRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87aUJBQ0YsQ0FBQTthQUN4QjtZQUNELE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUksZUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQy9CLFFBQVEsRUFBRSxJQUFJLGVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxlQUFlLEVBQUUsSUFBSSxlQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztnQkFDL0Msa0JBQWtCLEVBQUUsSUFBSSxlQUFFLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDO2dCQUNyRCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87YUFDRixDQUFBO1FBQ3pCLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILGtCQUFhLEdBQUcsQ0FDZCxRQUFnQixFQUNoQixRQUFnQixFQUNHLEVBQUU7WUFDckIsTUFBTSxNQUFNLEdBQXdCO2dCQUNsQyxRQUFRO2dCQUNSLFFBQVE7YUFDVCxDQUFBO1lBQ0QsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsd0JBQXdCLEVBQ3hCLE1BQU0sQ0FDUCxDQUFBO1lBQ0QsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUE7UUFDdkMsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7O1dBU0c7UUFDSCx5QkFBb0IsR0FBRyxDQUNyQixXQUE0QixTQUFTLEVBQ3JDLFVBQW9CLFNBQVMsRUFDWixFQUFFO1lBQ25CLE1BQU0sTUFBTSxHQUErQixFQUFFLENBQUE7WUFDN0MsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7Z0JBQ2hDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO2FBQzNCO2lCQUFNLElBQUksT0FBTyxRQUFRLEtBQUssV0FBVyxFQUFFO2dCQUMxQyxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7YUFDaEQ7WUFDRCxJQUFJLE9BQU8sT0FBTyxJQUFJLFdBQVcsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdkQsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7YUFDekI7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCwrQkFBK0IsRUFDL0IsTUFBTSxDQUNQLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFBO1FBQzdCLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7OztXQU1HO1FBQ0gsNkJBQXdCLEdBQUcsQ0FBTyxPQUFlLEVBQW1CLEVBQUU7WUFDcEUsTUFBTSxNQUFNLEdBQUc7Z0JBQ2IsT0FBTzthQUNSLENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxtQ0FBbUMsRUFDbkMsTUFBTSxDQUNQLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQTtRQUNyQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7V0FNRztRQUNILHdCQUFtQixHQUFHLENBQU8sU0FBa0IsRUFBMkIsRUFBRTtZQUMxRSxJQUFJLENBQUMsU0FBUztnQkFBRSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7WUFDekQsTUFBTSxNQUFNLEdBQThCO2dCQUN4QyxTQUFTO2FBQ1YsQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELDhCQUE4QixFQUM5QixNQUFNLENBQ1AsQ0FBQTtZQUVELE1BQU0sTUFBTSxHQUFnQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQTtZQUNoRSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWE7Z0JBQUUsT0FBTyxFQUFFLENBQUE7WUFDcEMsT0FBTyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO2dCQUN4QyxPQUFPO29CQUNMLGNBQWMsRUFBRSxLQUFLLENBQUMsY0FBYztvQkFDcEMsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO29CQUNaLHFCQUFxQixFQUFFLElBQUksZUFBRSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztvQkFDMUQsS0FBSyxFQUFFLElBQUksZUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7b0JBQzFCLEdBQUcsRUFBRSxJQUFJLGVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO29CQUN0QixTQUFTLEVBQUUsSUFBSSxlQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztvQkFDbEMsY0FBYyxFQUFFLElBQUksZUFBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7b0JBQzVDLGVBQWUsRUFBRSxJQUFJLGVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO29CQUM5QyxXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVc7b0JBQzlCLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVztvQkFDOUIsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLG9CQUFvQjtvQkFDaEQsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLHVCQUF1QjtvQkFDdEQsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO29CQUNoQixLQUFLLEVBQUUsSUFBSSxlQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztvQkFDMUIsb0JBQW9CLEVBQUUsSUFBSSxlQUFFLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDO29CQUN4RCxjQUFjLEVBQUUsSUFBSSxlQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxZQUFZO2lCQUNqQixDQUFBO1lBQ25CLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7O1dBTUc7UUFDSCxnQkFBVyxHQUFHLENBQ1osWUFBc0IsRUFDUSxFQUFFO1lBQ2hDLE1BQU0sTUFBTSxHQUFzQjtnQkFDaEMsWUFBWTthQUNiLENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxzQkFBc0IsRUFDdEIsTUFBTSxDQUNQLENBQUE7WUFFRCxNQUFNLFFBQVEsR0FBd0IsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7WUFDMUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRO2dCQUNwQixPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLGVBQU0sRUFBRSxDQUFBO1lBQ2xFLE9BQU87Z0JBQ0wsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQzFDLE9BQU87d0JBQ0wsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO3dCQUNoQyxjQUFjLEVBQUUsT0FBTyxDQUFDLGNBQWM7d0JBQ3RDLGNBQWMsRUFBRSxJQUFJLGVBQUUsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO3dCQUM5QyxnQkFBZ0IsRUFBRSxJQUFJLGVBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7d0JBQ2xELG1CQUFtQixFQUFFLElBQUksZUFBRSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQzt3QkFDeEQsS0FBSyxFQUFFLElBQUksZUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7d0JBQzVCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTt3QkFDMUIsTUFBTSxFQUFFLElBQUksZUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7d0JBQzlCLFdBQVcsRUFBRTs0QkFDWCxRQUFRLEVBQUUsSUFBSSxlQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7NEJBQzlDLFNBQVMsRUFBRSxJQUFJLGVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRTs0QkFDM0QsU0FBUyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsU0FBUzt5QkFDaEM7cUJBQ0csQ0FBQTtnQkFDakIsQ0FBQyxDQUFDO2dCQUNGLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqRSxTQUFTLEVBQUUsSUFBSSxlQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUNmLENBQUE7UUFDMUIsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7O1dBTUc7UUFDSCxrQkFBYSxHQUFHLENBQ2QsTUFBb0IsRUFDWSxFQUFFO1lBQ2xDLE1BQU0sTUFBTSxHQUFHO2dCQUNiLE1BQU0sRUFBRSxNQUFNO2FBQ2YsQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELHdCQUF3QixFQUN4QixNQUFNLENBQ1AsQ0FBQTtZQUNELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFBO1lBRW5DLE9BQU87Z0JBQ0wsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7b0JBQzNDLE9BQU87d0JBQ0wsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXOzRCQUN4QixDQUFDLENBQUU7Z0NBQ0MsUUFBUSxFQUFFLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO2dDQUN4QyxTQUFTLEVBQUUsSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUU7Z0NBQ3JELFNBQVMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVM7NkJBQ3pCOzRCQUNiLENBQUMsQ0FBQyxTQUFTO3dCQUNiLGdCQUFnQixFQUFFLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQzt3QkFDNUMscUJBQXFCLEVBQUUsSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO3FCQUMxQyxDQUFBO2dCQUNoQixDQUFDLENBQUM7YUFDc0IsQ0FBQTtRQUM1QixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7Ozs7V0FTRztRQUNILHlCQUFvQixHQUFHLENBQ3JCLFdBQTRCLFNBQVMsRUFDckMsVUFBb0IsU0FBUyxFQUNaLEVBQUU7WUFDbkIsTUFBTSxNQUFNLEdBQStCLEVBQUUsQ0FBQTtZQUM3QyxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7YUFDM0I7aUJBQU0sSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7Z0JBQzFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQTthQUNoRDtZQUNELElBQUksT0FBTyxPQUFPLElBQUksV0FBVyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN2RCxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTthQUN6QjtZQUVELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELCtCQUErQixFQUMvQixNQUFNLENBQ1AsQ0FBQTtZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDN0IsQ0FBQyxDQUFBLENBQUE7UUFFRDs7OztXQUlHO1FBQ0gscUJBQWdCLEdBQUcsR0FBc0MsRUFBRTs7WUFDekQsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsMkJBQTJCLENBQzVCLENBQUE7WUFDRCxPQUFPO2dCQUNMLFlBQVksRUFBRSxRQUFRLENBQUMsTUFBQSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sMENBQUUsWUFBWSxDQUFDO2dCQUMxRCxXQUFXLEVBQUUsUUFBUSxDQUFDLE1BQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLDBDQUFFLFdBQVcsQ0FBQztnQkFDeEQsV0FBVyxFQUFFLFFBQVEsQ0FBQyxNQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSwwQ0FBRSxXQUFXLENBQUM7Z0JBQ3hELFVBQVUsRUFBRSxRQUFRLENBQUMsTUFBQSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sMENBQUUsVUFBVSxDQUFDO2FBQ3ZELENBQUE7UUFDSCxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7OztXQVFHO1FBQ0gscUJBQWdCLEdBQUcsQ0FDakIsVUFBa0IsRUFDbEIsV0FBNEIsU0FBUyxFQUNsQixFQUFFO1lBQ3JCLE1BQU0sTUFBTSxHQUEyQjtnQkFDckMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUU7YUFDNUIsQ0FBQTtZQUNELElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUNoQyxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTthQUMzQjtpQkFBTSxJQUFJLE9BQU8sUUFBUSxLQUFLLFdBQVcsRUFBRTtnQkFDMUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBO2FBQ2hEO1lBQ0QsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsMkJBQTJCLEVBQzNCLE1BQU0sQ0FDUCxDQUFBO1lBQ0QsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUE7UUFDeEMsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBa0JHO1FBQ0gsaUJBQVksR0FBRyxDQUNiLFFBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLE1BQWMsRUFDZCxTQUFlLEVBQ2YsT0FBYSxFQUNiLFdBQWUsRUFDZixhQUFxQixFQUNyQixvQkFBd0IsU0FBUyxFQUNoQixFQUFFO1lBQ25CLE1BQU0sTUFBTSxHQUF1QjtnQkFDakMsUUFBUTtnQkFDUixRQUFRO2dCQUNSLE1BQU07Z0JBQ04sU0FBUyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJO2dCQUNyQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUk7Z0JBQ2pDLFdBQVcsRUFBRSxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDckMsYUFBYTthQUNkLENBQUE7WUFDRCxJQUFJLE9BQU8saUJBQWlCLEtBQUssV0FBVyxFQUFFO2dCQUM1QyxNQUFNLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFBO2FBQzFEO1lBQ0QsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsdUJBQXVCLEVBQ3ZCLE1BQU0sQ0FDUCxDQUFBO1lBQ0QsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUE7UUFDbEMsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7O1dBWUc7UUFDSCx1QkFBa0IsR0FBRyxDQUNuQixRQUFnQixFQUNoQixRQUFnQixFQUNoQixNQUFjLEVBQ2QsUUFBeUIsRUFDekIsU0FBZSxFQUNmLE9BQWEsRUFDYixNQUFjLEVBQ0csRUFBRTtZQUNuQixNQUFNLE1BQU0sR0FBUTtnQkFDbEIsUUFBUTtnQkFDUixRQUFRO2dCQUNSLE1BQU07Z0JBQ04sU0FBUyxFQUFFLFNBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJO2dCQUNyQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUk7Z0JBQ2pDLE1BQU07YUFDUCxDQUFBO1lBQ0QsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7Z0JBQ2hDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO2FBQzNCO2lCQUFNLElBQUksT0FBTyxRQUFRLEtBQUssV0FBVyxFQUFFO2dCQUMxQyxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7YUFDaEQ7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCw2QkFBNkIsRUFDN0IsTUFBTSxDQUNQLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQTtRQUNsQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7Ozs7Ozs7OztXQWNHO1FBQ0gsaUJBQVksR0FBRyxDQUNiLFFBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLE1BQWMsRUFDZCxTQUFlLEVBQ2YsT0FBYSxFQUNiLFdBQWUsRUFDZixhQUFxQixFQUNKLEVBQUU7WUFDbkIsTUFBTSxNQUFNLEdBQXVCO2dCQUNqQyxRQUFRO2dCQUNSLFFBQVE7Z0JBQ1IsTUFBTTtnQkFDTixTQUFTLEVBQUUsU0FBUyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUk7Z0JBQ3JDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSTtnQkFDakMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNyQyxhQUFhO2FBQ2QsQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELHVCQUF1QixFQUN2QixNQUFNLENBQ1AsQ0FBQTtZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFBO1FBQ2xDLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7Ozs7O1dBV0c7UUFDSCxpQkFBWSxHQUFHLENBQ2IsUUFBZ0IsRUFDaEIsUUFBZ0IsRUFDaEIsV0FBcUIsRUFDckIsU0FBaUIsRUFDc0IsRUFBRTtZQUN6QyxNQUFNLE1BQU0sR0FBdUI7Z0JBQ2pDLFFBQVE7Z0JBQ1IsUUFBUTtnQkFDUixXQUFXO2dCQUNYLFNBQVM7YUFDVixDQUFBO1lBQ0QsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsdUJBQXVCLEVBQ3ZCLE1BQU0sQ0FDUCxDQUFBO1lBQ0QsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO2dCQUM5QixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtnQkFDM0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFBO1FBQzFCLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILGdCQUFXLEdBQUcsQ0FBTyxZQUFvQixFQUFtQixFQUFFO1lBQzVELE1BQU0sTUFBTSxHQUFRO2dCQUNsQixZQUFZO2FBQ2IsQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELHNCQUFzQixFQUN0QixNQUFNLENBQ1AsQ0FBQTtZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFBO1FBQ3RDLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILGNBQVMsR0FBRyxDQUFPLFFBQXlCLEVBQXFCLEVBQUU7WUFDakUsTUFBTSxNQUFNLEdBQVE7Z0JBQ2xCLFFBQVE7YUFDVCxDQUFBO1lBQ0QsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7Z0JBQ2hDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO2FBQzNCO2lCQUFNLElBQUksT0FBTyxRQUFRLEtBQUssV0FBVyxFQUFFO2dCQUMxQyxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7YUFDaEQ7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxvQkFBb0IsRUFDcEIsTUFBTSxDQUNQLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQTtRQUMzQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxtQkFBYyxHQUFHLEdBQWdDLEVBQUU7WUFDakQsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQseUJBQXlCLENBQzFCLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQTtRQUN6QyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7Ozs7Ozs7O1dBYUc7UUFDSCxlQUFVLEdBQUcsQ0FDWCxRQUFnQixFQUNoQixRQUFnQixFQUNoQixNQUFVLEVBQ1YsRUFBVSxFQUM2QixFQUFFO1lBQ3pDLE1BQU0sTUFBTSxHQUFxQjtnQkFDL0IsUUFBUTtnQkFDUixRQUFRO2dCQUNSLEVBQUU7Z0JBQ0YsTUFBTSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2FBQzVCLENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxxQkFBcUIsRUFDckIsTUFBTSxDQUNQLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUk7Z0JBQzlCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO2dCQUMzQixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDMUIsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7Ozs7V0FjRztRQUNILGVBQVUsR0FBRyxDQUNYLFFBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLEVBQVUsRUFDVixXQUFtQixFQUNvQixFQUFFO1lBQ3pDLE1BQU0sTUFBTSxHQUFxQjtnQkFDL0IsRUFBRTtnQkFDRixXQUFXO2dCQUNYLFFBQVE7Z0JBQ1IsUUFBUTthQUNULENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxxQkFBcUIsRUFDckIsTUFBTSxDQUNQLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUk7Z0JBQzlCLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO2dCQUMzQixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDMUIsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7O1dBTUc7UUFDSCxZQUFPLEdBQUcsQ0FBTyxFQUF3QixFQUFtQixFQUFFO1lBQzVELElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQTtZQUNwQixJQUFJLE9BQU8sRUFBRSxLQUFLLFFBQVEsRUFBRTtnQkFDMUIsV0FBVyxHQUFHLEVBQUUsQ0FBQTthQUNqQjtpQkFBTSxJQUFJLEVBQUUsWUFBWSxlQUFNLEVBQUU7Z0JBQy9CLE1BQU0sS0FBSyxHQUFPLElBQUksT0FBRSxFQUFFLENBQUE7Z0JBQzFCLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBQ3BCLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUE7YUFDbEM7aUJBQU0sSUFBSSxFQUFFLFlBQVksT0FBRSxFQUFFO2dCQUMzQixXQUFXLEdBQUcsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFBO2FBQy9CO2lCQUFNO2dCQUNMLDBCQUEwQjtnQkFDMUIsTUFBTSxJQUFJLHlCQUFnQixDQUN4QixxRkFBcUYsQ0FDdEYsQ0FBQTthQUNGO1lBQ0QsTUFBTSxNQUFNLEdBQVE7Z0JBQ2xCLEVBQUUsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFFO2dCQUMxQixRQUFRLEVBQUUsS0FBSzthQUNoQixDQUFBO1lBQ0QsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsa0JBQWtCLEVBQ2xCLE1BQU0sQ0FDUCxDQUFBO1lBQ0QsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUE7UUFDbEMsQ0FBQyxDQUFBLENBQUE7UUFFRDs7V0FFRztRQUNILHFCQUFnQixHQUFHLEdBQTRDLEVBQUU7WUFDL0QsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsMkJBQTJCLENBQzVCLENBQUE7WUFDRCxPQUFPO2dCQUNMLE1BQU0sRUFBRSxJQUFJLGVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO2dCQUMvQyxNQUFNLEVBQUUsSUFBSSxlQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQzthQUNoRCxDQUFBO1FBQ0gsQ0FBQyxDQUFBLENBQUE7UUFFRDs7V0FFRztRQUNILGNBQVMsR0FBRyxHQUFzQixFQUFFO1lBQ2xDLE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELG9CQUFvQixDQUNyQixDQUFBO1lBQ0QsT0FBTyxJQUFJLGVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDaEQsQ0FBQyxDQUFBLENBQUE7UUFFRDs7OztXQUlHO1FBQ0gsZ0JBQVcsR0FBRyxDQUNaLFVBQW1CLEtBQUssRUFDTSxFQUFFO1lBQ2hDLElBQ0UsT0FBTyxLQUFLLElBQUk7Z0JBQ2hCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixLQUFLLFdBQVc7Z0JBQzdDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixLQUFLLFdBQVcsRUFDN0M7Z0JBQ0EsT0FBTztvQkFDTCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCO29CQUN6QyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCO2lCQUMxQyxDQUFBO2FBQ0Y7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxzQkFBc0IsQ0FDdkIsQ0FBQTtZQUNELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLGVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUMzRSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxlQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUE7WUFDM0UsT0FBTztnQkFDTCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCO2dCQUN6QyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCO2FBQzFDLENBQUE7UUFDSCxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxrQkFBYSxHQUFHLEdBQXNCLEVBQUU7WUFDdEMsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsd0JBQXdCLENBQ3pCLENBQUE7WUFDRCxPQUFPLElBQUksZUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUMvQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7OztXQVFHO1FBQ0gsc0JBQWlCLEdBQUcsQ0FDbEIsUUFBeUIsRUFDekIsTUFBYyxFQUNkLFNBQWEsRUFDYixPQUFXLEVBQ0UsRUFBRTtZQUNmLE1BQU0sR0FBRyxHQUFPLElBQUEseUJBQU8sR0FBRSxDQUFBO1lBQ3pCLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUMvQyxNQUFNLElBQUksa0JBQVMsQ0FDakIsd0dBQXdHLENBQ3pHLENBQUE7YUFDRjtZQUVELE1BQU0sTUFBTSxHQUE0QjtnQkFDdEMsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsU0FBUyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxPQUFPLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7YUFDOUIsQ0FBQTtZQUVELElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFO2dCQUNoQyxNQUFNLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTthQUMzQjtpQkFBTSxJQUFJLE9BQU8sUUFBUSxLQUFLLFdBQVcsRUFBRTtnQkFDMUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBO2FBQ2hEO1lBRUQsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsNEJBQTRCLEVBQzVCLE1BQU0sQ0FDUCxDQUFBO1lBQ0QsT0FBTyxJQUFJLGVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDaEQsQ0FBQyxDQUFBLENBQUE7UUFFRDs7OztXQUlHO1FBQ0gsZ0JBQVcsR0FBRyxDQUNaLG9CQUF3QixTQUFTLEVBQ2pDLG9CQUF3QixTQUFTLEVBQzNCLEVBQUU7WUFDUixJQUFJLE9BQU8saUJBQWlCLEtBQUssV0FBVyxFQUFFO2dCQUM1QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUE7YUFDM0M7WUFDRCxJQUFJLE9BQU8saUJBQWlCLEtBQUssV0FBVyxFQUFFO2dCQUM1QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUE7YUFDM0M7UUFDSCxDQUFDLENBQUE7UUFFRDs7V0FFRztRQUNILGFBQVEsR0FBRyxDQUNULFNBQW1CLEVBQ25CLFdBQW1CLEtBQUssRUFDRyxFQUFFO1lBQzdCLE1BQU0sTUFBTSxHQUFtQjtnQkFDN0IsU0FBUztnQkFDVCxRQUFRO2FBQ1QsQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELG1CQUFtQixFQUNuQixNQUFNLENBQ1AsQ0FBQTtZQUNELE9BQU87Z0JBQ0wsTUFBTSxFQUFFLElBQUksZUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7Z0JBQy9DLGFBQWEsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUNuRCxDQUFDLFlBQW9CLEVBQXNCLEVBQUU7b0JBQzNDLE1BQU0sa0JBQWtCLEdBQ3RCLElBQUksNEJBQWtCLEVBQUUsQ0FBQTtvQkFDMUIsSUFBSSxHQUFXLENBQUE7b0JBQ2YsSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFO3dCQUN2QixHQUFHLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQTtxQkFDeEM7eUJBQU07d0JBQ0wsR0FBRyxHQUFHLGVBQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7cUJBQzFEO29CQUNELGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUE7b0JBQ3JDLE9BQU8sa0JBQWtCLENBQUE7Z0JBQzNCLENBQUMsQ0FDRjthQUNGLENBQUE7UUFDSCxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7O1dBT0c7UUFDSCxlQUFVLEdBQUcsQ0FBTyxNQUFnQixTQUFTLEVBQXFCLEVBQUU7WUFDbEUsTUFBTSxNQUFNLEdBQVEsRUFBRSxDQUFBO1lBQ3RCLElBQUksT0FBTyxHQUFHLEtBQUssU0FBUyxFQUFFO2dCQUM1QixNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTthQUNqQjtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELHFCQUFxQixFQUNyQixNQUFNLENBQ1AsQ0FBQTtZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFBO1FBQ3JDLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7O1dBUUc7UUFDSCxjQUFTLEdBQUcsQ0FDVixRQUFnQixFQUNoQixRQUFnQixFQUNoQixPQUFlLEVBQ3dCLEVBQUU7WUFDekMsTUFBTSxNQUFNLEdBQW9CO2dCQUM5QixRQUFRO2dCQUNSLFFBQVE7Z0JBQ1IsT0FBTzthQUNSLENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxvQkFBb0IsRUFDcEIsTUFBTSxDQUNQLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7Z0JBQ3BDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVO2dCQUNqQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDMUIsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7V0FRRztRQUNILGNBQVMsR0FBRyxDQUNWLFFBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLFVBQWtCLEVBQ3FCLEVBQUU7WUFDekMsTUFBTSxNQUFNLEdBQW9CO2dCQUM5QixRQUFRO2dCQUNSLFFBQVE7Z0JBQ1IsVUFBVTthQUNYLENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxvQkFBb0IsRUFDcEIsTUFBTSxDQUNQLENBQUE7WUFFRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87Z0JBQ2pDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPO2dCQUM5QixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDMUIsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7OztXQU9HO1FBQ0gsVUFBSyxHQUFHLENBQ04sSUFBWSxFQUNaLFdBQW1CLEtBQUssRUFDRSxFQUFFO1lBQzVCLE1BQU0sTUFBTSxHQUFRO2dCQUNsQixJQUFJO2dCQUNKLFFBQVE7YUFDVCxDQUFBO1lBQ0QsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsZ0JBQWdCLEVBQ2hCLE1BQU0sQ0FDUCxDQUFBO1lBQ0QsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM1QixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDekIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFBO1FBQzFCLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILGdCQUFXLEdBQUcsQ0FDWixJQUFZLEVBQ1osZ0JBQXlCLElBQUksRUFDVSxFQUFFO1lBQ3pDLE1BQU0sTUFBTSxHQUFzQjtnQkFDaEMsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsYUFBYSxFQUFFLGFBQWE7YUFDN0IsQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELHNCQUFzQixFQUN0QixNQUFNLENBQ1AsQ0FBQTtZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7UUFDN0IsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7Ozs7O1dBZUc7UUFDSCxhQUFRLEdBQUcsQ0FDVCxTQUE0QixFQUM1QixjQUFzQixTQUFTLEVBQy9CLFFBQWdCLENBQUMsRUFDakIsYUFBZ0QsU0FBUyxFQUN6RCxjQUFrQyxTQUFTLEVBQzNDLFdBQW1CLEtBQUssRUFDRyxFQUFFO1lBQzdCLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO2dCQUNqQyxTQUFTLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTthQUN4QjtZQUVELE1BQU0sTUFBTSxHQUFtQjtnQkFDN0IsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLEtBQUs7Z0JBQ0wsUUFBUTthQUNULENBQUE7WUFDRCxJQUFJLE9BQU8sVUFBVSxLQUFLLFdBQVcsSUFBSSxVQUFVLEVBQUU7Z0JBQ25ELE1BQU0sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO2FBQy9CO1lBRUQsSUFBSSxPQUFPLFdBQVcsS0FBSyxXQUFXLEVBQUU7Z0JBQ3RDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO2FBQ2pDO1lBRUQsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsbUJBQW1CLEVBQ25CLE1BQU0sQ0FDUCxDQUFBO1lBRUQsTUFBTSxLQUFLLEdBQVksSUFBSSxlQUFPLEVBQUUsQ0FBQTtZQUNwQyxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUE7WUFDckMsSUFBSSxXQUFXLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFO2dCQUNsRCxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFO29CQUN0QyxNQUFNLFNBQVMsR0FBYSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtvQkFDOUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUM1QixLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUNwQixNQUFNLElBQUksR0FBWSxJQUFJLGVBQU8sRUFBRSxDQUFBO3dCQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFBO3dCQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQTt3QkFDbkQsSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO3FCQUNoQztpQkFDRjtnQkFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFBO2FBQ3JFO1lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3ZELE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQTtnQkFDN0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQVcsRUFBUSxFQUFFO29CQUNqQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDdEUsQ0FBQyxDQUFDLENBQUE7Z0JBRUYsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUE7YUFDaEM7aUJBQU07Z0JBQ0wsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUE7YUFDNUI7WUFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO1lBQ2xDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDM0UsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUM3QixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxxQkFBZ0IsR0FBRyxDQUFPLE9BQWUsRUFBZSxFQUFFO1lBQ3hELE1BQU0sTUFBTSxHQUFrQjtnQkFDNUIsT0FBTyxFQUFFLE9BQU87YUFDakIsQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELDJCQUEyQixFQUMzQixNQUFNLENBQ1AsQ0FBQTtZQUNELE9BQU8sSUFBSSxlQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDekMsQ0FBQyxDQUFBLENBQUE7UUFFRDs7OztXQUlHO1FBQ0gscUJBQWdCLEdBQUcsQ0FBTyxPQUFlLEVBQStCLEVBQUU7WUFDeEUsTUFBTSxNQUFNLEdBQWtCO2dCQUM1QixPQUFPLEVBQUUsT0FBTzthQUNqQixDQUFBO1lBQ0QsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDekQsMkJBQTJCLEVBQzNCLE1BQU0sQ0FDUCxDQUFBO1lBQ0QsT0FBTztnQkFDTCxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtnQkFDL0IsUUFBUSxFQUFFLElBQUksZUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDL0MsU0FBUyxFQUFFLElBQUksZUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtnQkFDNUQsU0FBUyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVM7YUFDcEIsQ0FBQTtRQUN6QixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBbUJHO1FBQ0gsZ0JBQVcsR0FBRyxDQUNaLE9BQWdCLEVBQ2hCLE1BQVUsRUFDVixXQUFxQixFQUNyQixhQUF1QixFQUN2QixlQUF5QixFQUN6QixPQUE2QixTQUFTLEVBQ3RDLE9BQVcsSUFBQSx5QkFBTyxHQUFFLEVBQ3BCLFdBQWUsSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ3hCLGNBQXNCLENBQUMsRUFDdkIsa0JBQTBCLENBQUMsRUFDTixFQUFFO1lBQ3ZCLE1BQU0sTUFBTSxHQUFXLGFBQWEsQ0FBQTtZQUNwQyxNQUFNLEVBQUUsR0FBYSxJQUFJLENBQUMsd0JBQXdCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBQ3ZFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFDL0QsTUFBTSxNQUFNLEdBQWEsSUFBSSxDQUFDLHdCQUF3QixDQUNwRCxlQUFlLEVBQ2YsTUFBTSxDQUNQLENBQUE7WUFFRCxJQUFJLElBQUksWUFBWSxxQkFBVyxFQUFFO2dCQUMvQixJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO2FBQ3pCO1lBQ0QsTUFBTSxTQUFTLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtZQUNsRCxNQUFNLGVBQWUsR0FBVyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtZQUN0RSxNQUFNLEdBQUcsR0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7WUFDL0IsTUFBTSxVQUFVLEdBQVcsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7WUFFdEQsTUFBTSxlQUFlLEdBQWUsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUN4RCxPQUFPLENBQ1IsQ0FBQyxXQUFXLENBQ1gsU0FBUyxFQUNULGVBQWUsRUFDZixNQUFNLEVBQ04sVUFBVSxFQUNWLEVBQUUsRUFDRixVQUFVLEVBQ1YsTUFBTSxFQUNOLEdBQUcsRUFDSCxVQUFVLEVBQ1YsSUFBSSxFQUNKLElBQUksRUFDSixRQUFRLEVBQ1IsV0FBVyxFQUNYLGVBQWUsQ0FDaEIsQ0FBQTtZQUVELElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFO2dCQUNoRCwwQkFBMEI7Z0JBQzFCLElBQUksMkJBQWtCLENBQUMsd0JBQXdCLENBQUMsQ0FBQTthQUNqRDtZQUVELE9BQU8sZUFBZSxDQUFBO1FBQ3hCLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBb0JHO1FBQ0gsa0JBQWEsR0FBRyxDQUNkLE9BQWdCLEVBQ2hCLGNBQXdCLEVBQ3hCLFdBQTRCLEVBQzVCLFdBQXFCLEVBQ3JCLGFBQXVCLEVBQ3ZCLGtCQUE0QixTQUFTLEVBQ3JDLE9BQTZCLFNBQVMsRUFDdEMsT0FBVyxlQUFNLEVBQ2pCLFdBQWUsZUFBTSxFQUNyQixjQUFzQixDQUFDLEVBQ3ZCLGtCQUEwQixDQUFDLEVBQ04sRUFBRTtZQUN2QixNQUFNLE1BQU0sR0FBRyxxQkFBcUIsQ0FBQTtZQUVwQyxNQUFNLEVBQUUsR0FBYSxJQUFJLENBQUMsd0JBQXdCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBRXZFLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFFL0QsTUFBTSxNQUFNLEdBQWEsSUFBSSxDQUFDLHdCQUF3QixDQUNwRCxlQUFlLEVBQ2YsTUFBTSxDQUNQLENBQUE7WUFFRCxJQUFJLFFBQVEsR0FBVyxTQUFTLENBQUE7WUFFaEMsSUFBSSxPQUFPLFdBQVcsS0FBSyxXQUFXLEVBQUU7Z0JBQ3RDLE1BQU0sSUFBSSxxQkFBWSxDQUNwQixtRUFBbUUsQ0FDcEUsQ0FBQTthQUNGO2lCQUFNLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFO2dCQUMxQyxRQUFRLEdBQUcsV0FBVyxDQUFBO2dCQUN0QixXQUFXLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQTthQUMvQztpQkFBTSxJQUFJLENBQUMsQ0FBQyxXQUFXLFlBQVksZUFBTSxDQUFDLEVBQUU7Z0JBQzNDLE1BQU0sSUFBSSxxQkFBWSxDQUNwQixzRUFBc0U7b0JBQ3BFLE9BQU8sV0FBVyxDQUNyQixDQUFBO2FBQ0Y7WUFDRCxNQUFNLFdBQVcsR0FBWSxNQUFNLENBQ2pDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FDNUQsQ0FBQyxLQUFLLENBQUE7WUFDUCxNQUFNLFdBQVcsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUV2RCxJQUFJLElBQUksWUFBWSxxQkFBVyxFQUFFO2dCQUMvQixJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO2FBQ3pCO1lBRUQsTUFBTSxPQUFPLEdBQVcsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFBO1lBRWpELE1BQU0sZUFBZSxHQUFlLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FDeEQsT0FBTyxDQUNSLENBQUMsYUFBYSxDQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQ3hCLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUN0QyxFQUFFLEVBQ0YsVUFBVSxFQUNWLE1BQU0sRUFDTixPQUFPLEVBQ1AsV0FBVyxFQUNYLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFDZixXQUFXLEVBQ1gsSUFBSSxFQUNKLElBQUksRUFDSixRQUFRLEVBQ1IsV0FBVyxFQUNYLGVBQWUsQ0FDaEIsQ0FBQTtZQUVELElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFO2dCQUNoRCwwQkFBMEI7Z0JBQzFCLE1BQU0sSUFBSSwyQkFBa0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO2FBQ3ZEO1lBRUQsT0FBTyxlQUFlLENBQUE7UUFDeEIsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7V0FpQkc7UUFDSCxrQkFBYSxHQUFHLENBQ2QsT0FBZ0IsRUFDaEIsTUFBVSxFQUNWLGdCQUFpQyxFQUNqQyxXQUFxQixFQUNyQixhQUF1QixFQUN2QixrQkFBNEIsU0FBUyxFQUNyQyxPQUE2QixTQUFTLEVBQ3RDLE9BQVcsZUFBTSxFQUNqQixXQUFlLGVBQU0sRUFDckIsY0FBc0IsQ0FBQyxFQUN2QixrQkFBMEIsQ0FBQyxFQUNOLEVBQUU7WUFDdkIsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFBO1lBRTlCLElBQUksUUFBUSxHQUFXLEVBQUUsQ0FBQTtZQUN6QixXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBUyxFQUFRLEVBQUU7Z0JBQ2xDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO1lBQ2xDLENBQUMsQ0FBQyxDQUFBO1lBQ0YsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3RDLE1BQU0sSUFBSSxxQkFBWSxDQUNwQixzRkFBc0YsQ0FDdkYsQ0FBQTthQUNGO1lBRUQsSUFBSSxPQUFPLGdCQUFnQixLQUFLLFdBQVcsRUFBRTtnQkFDM0MsTUFBTSxJQUFJLHFCQUFZLENBQ3BCLHdFQUF3RSxDQUN6RSxDQUFBO2FBQ0Y7aUJBQU0sSUFBSSxPQUFPLGdCQUFnQixLQUFLLFFBQVEsRUFBRTtnQkFDL0MsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBLENBQUMsRUFBRTthQUM1RDtpQkFBTSxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsWUFBWSxlQUFNLENBQUMsRUFBRTtnQkFDaEQsTUFBTSxJQUFJLHFCQUFZLENBQ3BCLHNFQUFzRTtvQkFDcEUsT0FBTyxnQkFBZ0IsQ0FDMUIsQ0FBQTthQUNGO1lBQ0QsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssRUFBRSxFQUFFO2dCQUNsQyxNQUFNLElBQUkscUJBQVksQ0FDcEIsc0ZBQXNGLENBQ3ZGLENBQUE7YUFDRjtZQUVELElBQUksRUFBRSxHQUFhLEVBQUUsQ0FBQTtZQUNyQixXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBUyxFQUFRLEVBQUU7Z0JBQ2xDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3RDLENBQUMsQ0FBQyxDQUFBO1lBRUYsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUUvRCxNQUFNLE1BQU0sR0FBYSxJQUFJLENBQUMsd0JBQXdCLENBQ3BELGVBQWUsRUFDZixNQUFNLENBQ1AsQ0FBQTtZQUVELElBQUksSUFBSSxZQUFZLHFCQUFXLEVBQUU7Z0JBQy9CLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7YUFDekI7WUFFRCxNQUFNLFdBQVcsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUV2RCxNQUFNLGVBQWUsR0FBZSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQ3hELE9BQU8sQ0FDUixDQUFDLGFBQWEsQ0FDYixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUN4QixRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFDdEMsTUFBTSxFQUNOLFdBQVcsRUFDWCxFQUFFLEVBQ0YsVUFBVSxFQUNWLGdCQUFnQixFQUNoQixNQUFNLEVBQ04sSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUNmLFdBQVcsRUFDWCxJQUFJLEVBQ0osSUFBSSxFQUNKLFFBQVEsRUFDUixXQUFXLEVBQ1gsZUFBZSxDQUNoQixDQUFBO1lBRUQsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hELDBCQUEwQjtnQkFDMUIsTUFBTSxJQUFJLDJCQUFrQixDQUFDLHdCQUF3QixDQUFDLENBQUE7YUFDdkQ7WUFFRCxPQUFPLGVBQWUsQ0FBQTtRQUN4QixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7Ozs7Ozs7Ozs7OztXQWlCRztRQUVILDhCQUF5QixHQUFHLENBQzFCLE9BQWdCLEVBQ2hCLGFBQXVCLEVBQ3ZCLGVBQXlCLEVBQ3pCLE1BQWMsRUFDZCxTQUFhLEVBQ2IsT0FBVyxFQUNYLE1BQVUsRUFDVixRQUFnQixFQUNoQixPQUE2QixTQUFTLEVBQ3RDLE9BQVcsZUFBTSxFQUNqQixhQUFtQixFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQzlELGtCQUEwQixDQUFDLEVBQ04sRUFBRTtZQUN2QixNQUFNLE1BQU0sR0FBRywyQkFBMkIsQ0FBQTtZQUUxQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBRS9ELE1BQU0sTUFBTSxHQUFhLElBQUksQ0FBQyx3QkFBd0IsQ0FDcEQsZUFBZSxFQUNmLE1BQU0sQ0FDUCxDQUFBO1lBRUQsSUFBSSxJQUFJLFlBQVkscUJBQVcsRUFBRTtnQkFDL0IsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTthQUN6QjtZQUVELE1BQU0sV0FBVyxHQUFXLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1lBRXZELE1BQU0sR0FBRyxHQUFPLElBQUEseUJBQU8sR0FBRSxDQUFBO1lBQ3pCLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUMvQyxNQUFNLElBQUksS0FBSyxDQUNiLGtIQUFrSCxDQUNuSCxDQUFBO2FBQ0Y7WUFFRCxNQUFNLGVBQWUsR0FBZSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQ3hELE9BQU8sQ0FDUixDQUFDLHlCQUF5QixDQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUN4QixRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFDdEMsVUFBVSxFQUNWLE1BQU0sRUFDTixJQUFBLHNDQUFvQixFQUFDLE1BQU0sQ0FBQyxFQUM1QixTQUFTLEVBQ1QsT0FBTyxFQUNQLE1BQU0sRUFDTixRQUFRLEVBQ1IsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUN0QixXQUFXLEVBQ1gsSUFBSSxFQUNKLElBQUksRUFDSixVQUFVLEVBQ1YsZUFBZSxDQUNoQixDQUFBO1lBRUQsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hELDBCQUEwQjtnQkFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO2FBQzFDO1lBRUQsT0FBTyxlQUFlLENBQUE7UUFDeEIsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBcUJHO1FBQ0gsd0JBQW1CLEdBQUcsQ0FDcEIsT0FBZ0IsRUFDaEIsV0FBcUIsRUFDckIsYUFBdUIsRUFDdkIsZUFBeUIsRUFDekIsTUFBYyxFQUNkLFNBQWEsRUFDYixPQUFXLEVBQ1gsV0FBZSxFQUNmLGVBQXlCLEVBQ3pCLGlCQUFxQixlQUFNLEVBQzNCLGtCQUEwQixDQUFDLEVBQzNCLE9BQTZCLFNBQVMsRUFDdEMsT0FBVyxlQUFNLEVBQ2pCLGNBQXNCLENBQUMsRUFDdkIsa0JBQTBCLENBQUMsRUFDTixFQUFFO1lBQ3ZCLE1BQU0sTUFBTSxHQUFHLHFCQUFxQixDQUFBO1lBQ3BDLE1BQU0sRUFBRSxHQUFhLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFFdkUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUUvRCxNQUFNLE1BQU0sR0FBYSxJQUFJLENBQUMsd0JBQXdCLENBQ3BELGVBQWUsRUFDZixNQUFNLENBQ1AsQ0FBQTtZQUNELE1BQU0sT0FBTyxHQUFhLElBQUksQ0FBQyx3QkFBd0IsQ0FDckQsZUFBZSxFQUNmLE1BQU0sQ0FDUCxDQUFBO1lBRUQsSUFBSSxJQUFJLFlBQVkscUJBQVcsRUFBRTtnQkFDL0IsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTthQUN6QjtZQUVELE1BQU0sUUFBUSxHQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1lBQ3BFLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDNUIsTUFBTSxJQUFJLG1CQUFVLENBQ2xCLHFFQUFxRTtvQkFDbkUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FDeEIsQ0FBQTthQUNGO1lBRUQsTUFBTSxXQUFXLEdBQVcsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7WUFFdkQsTUFBTSxHQUFHLEdBQU8sSUFBQSx5QkFBTyxHQUFFLENBQUE7WUFDekIsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQy9DLE1BQU0sSUFBSSxrQkFBUyxDQUNqQiw0R0FBNEcsQ0FDN0csQ0FBQTthQUNGO1lBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDaEQsTUFBTSxJQUFJLGtCQUFTLENBQ2pCLDJFQUEyRSxDQUM1RSxDQUFBO2FBQ0Y7WUFFRCxNQUFNLGVBQWUsR0FBZSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQ3hELE9BQU8sQ0FDUixDQUFDLG1CQUFtQixDQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUN4QixRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFDdEMsV0FBVyxFQUNYLEVBQUUsRUFDRixVQUFVLEVBQ1YsTUFBTSxFQUNOLElBQUEsc0NBQW9CLEVBQUMsTUFBTSxDQUFDLEVBQzVCLFNBQVMsRUFDVCxPQUFPLEVBQ1AsV0FBVyxFQUNYLGNBQWMsRUFDZCxlQUFlLEVBQ2YsT0FBTyxFQUNQLGVBQU0sRUFDTixXQUFXLEVBQ1gsSUFBSSxFQUNKLElBQUksRUFDSixXQUFXLEVBQ1gsZUFBZSxDQUNoQixDQUFBO1lBRUQsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hELDBCQUEwQjtnQkFDMUIsTUFBTSxJQUFJLDJCQUFrQixDQUFDLHdCQUF3QixDQUFDLENBQUE7YUFDdkQ7WUFFRCxPQUFPLGVBQWUsQ0FBQTtRQUN4QixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBc0JHO1FBQ0gsd0JBQW1CLEdBQUcsQ0FDcEIsT0FBZ0IsRUFDaEIsV0FBcUIsRUFDckIsYUFBdUIsRUFDdkIsZUFBeUIsRUFDekIsTUFBYyxFQUNkLFNBQWEsRUFDYixPQUFXLEVBQ1gsV0FBZSxFQUNmLGVBQXlCLEVBQ3pCLGFBQXFCLEVBQ3JCLGlCQUFxQixlQUFNLEVBQzNCLGtCQUEwQixDQUFDLEVBQzNCLE9BQTZCLFNBQVMsRUFDdEMsT0FBVyxlQUFNLEVBQ2pCLGNBQXNCLENBQUMsRUFDdkIsa0JBQTBCLENBQUMsRUFDTixFQUFFO1lBQ3ZCLE1BQU0sTUFBTSxHQUFHLHFCQUFxQixDQUFBO1lBRXBDLE1BQU0sRUFBRSxHQUFhLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFFdkUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUUvRCxNQUFNLE1BQU0sR0FBYSxJQUFJLENBQUMsd0JBQXdCLENBQ3BELGVBQWUsRUFDZixNQUFNLENBQ1AsQ0FBQTtZQUNELE1BQU0sT0FBTyxHQUFhLElBQUksQ0FBQyx3QkFBd0IsQ0FDckQsZUFBZSxFQUNmLE1BQU0sQ0FDUCxDQUFBO1lBRUQsSUFBSSxJQUFJLFlBQVkscUJBQVcsRUFBRTtnQkFDL0IsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTthQUN6QjtZQUVELE1BQU0sUUFBUSxHQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1lBQ3BFLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDNUIsTUFBTSxJQUFJLG1CQUFVLENBQ2xCLGlCQUFpQixNQUFNLG9DQUFvQztvQkFDekQsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FDeEIsQ0FBQTthQUNGO1lBRUQsSUFDRSxPQUFPLGFBQWEsS0FBSyxRQUFRO2dCQUNqQyxhQUFhLEdBQUcsR0FBRztnQkFDbkIsYUFBYSxHQUFHLENBQUMsRUFDakI7Z0JBQ0EsTUFBTSxJQUFJLDJCQUFrQixDQUMxQixpQkFBaUIsTUFBTSxzREFBc0QsQ0FDOUUsQ0FBQTthQUNGO1lBRUQsTUFBTSxXQUFXLEdBQVcsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7WUFFdkQsTUFBTSxHQUFHLEdBQU8sSUFBQSx5QkFBTyxHQUFFLENBQUE7WUFDekIsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQy9DLE1BQU0sSUFBSSxrQkFBUyxDQUNqQixpQkFBaUIsTUFBTSwyRUFBMkUsQ0FDbkcsQ0FBQTthQUNGO1lBRUQsTUFBTSxlQUFlLEdBQWUsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUN4RCxPQUFPLENBQ1IsQ0FBQyxtQkFBbUIsQ0FDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFDeEIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQ3RDLEVBQUUsRUFDRixVQUFVLEVBQ1YsTUFBTSxFQUNOLElBQUEsc0NBQW9CLEVBQUMsTUFBTSxDQUFDLEVBQzVCLFNBQVMsRUFDVCxPQUFPLEVBQ1AsV0FBVyxFQUNYLFdBQVcsRUFDWCxjQUFjLEVBQ2QsZUFBZSxFQUNmLE9BQU8sRUFDUCxhQUFhLEVBQ2IsZUFBTSxFQUNOLFdBQVcsRUFDWCxJQUFJLEVBQ0osSUFBSSxFQUNKLFdBQVcsRUFDWCxlQUFlLENBQ2hCLENBQUE7WUFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRTtnQkFDaEQsMEJBQTBCO2dCQUMxQixNQUFNLElBQUksMkJBQWtCLENBQUMsd0JBQXdCLENBQUMsQ0FBQTthQUN2RDtZQUVELE9BQU8sZUFBZSxDQUFBO1FBQ3hCLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7Ozs7Ozs7V0FhRztRQUNILHdCQUFtQixHQUFHLENBQ3BCLE9BQWdCLEVBQ2hCLGFBQXVCLEVBQ3ZCLGVBQXlCLEVBQ3pCLG9CQUE4QixFQUM5QixvQkFBNEIsRUFDNUIsT0FBNkIsU0FBUyxFQUN0QyxPQUFXLGVBQU0sRUFDakIsa0JBQTBCLENBQUMsRUFDTixFQUFFO1lBQ3ZCLE1BQU0sTUFBTSxHQUFHLHFCQUFxQixDQUFBO1lBRXBDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFFL0QsTUFBTSxNQUFNLEdBQWEsSUFBSSxDQUFDLHdCQUF3QixDQUNwRCxlQUFlLEVBQ2YsTUFBTSxDQUNQLENBQUE7WUFDRCxNQUFNLE1BQU0sR0FBYSxJQUFJLENBQUMsd0JBQXdCLENBQ3BELG9CQUFvQixFQUNwQixNQUFNLENBQ1AsQ0FBQTtZQUVELElBQUksSUFBSSxZQUFZLHFCQUFXLEVBQUU7Z0JBQy9CLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7YUFDekI7WUFFRCxNQUFNLFdBQVcsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUN2RCxNQUFNLFNBQVMsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1lBQ2xELE1BQU0sWUFBWSxHQUFXLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBQ25FLE1BQU0sR0FBRyxHQUFPLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFBO1lBRTNDLE1BQU0sZUFBZSxHQUFlLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FDeEQsT0FBTyxDQUNSLENBQUMsbUJBQW1CLENBQ25CLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLE1BQU0sRUFDTixNQUFNLEVBQ04sb0JBQW9CLEVBQ3BCLEdBQUcsRUFDSCxXQUFXLEVBQ1gsSUFBSSxFQUNKLElBQUksRUFDSixlQUFlLENBQ2hCLENBQUE7WUFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDekUsMEJBQTBCO2dCQUMxQixNQUFNLElBQUksMkJBQWtCLENBQUMsd0JBQXdCLENBQUMsQ0FBQTthQUN2RDtZQUVELE9BQU8sZUFBZSxDQUFBO1FBQ3hCLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7V0FnQkc7UUFDSCx1QkFBa0IsR0FBRyxDQUNuQixPQUFnQixFQUNoQixhQUF1QixFQUN2QixlQUF5QixFQUN6QixXQUE0QixTQUFTLEVBQ3JDLFlBQW9CLFNBQVMsRUFDN0IsT0FBZSxTQUFTLEVBQ3hCLFFBQWtCLFNBQVMsRUFDM0IsY0FBb0MsU0FBUyxFQUM3QyxPQUE2QixTQUFTLEVBQ3RDLE9BQVcsZUFBTSxFQUNqQixhQUFtQixFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQzlELGtCQUEwQixDQUFDLEVBQ04sRUFBRTtZQUN2QixNQUFNLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQTtZQUVuQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBRS9ELE1BQU0sTUFBTSxHQUFhLElBQUksQ0FBQyx3QkFBd0IsQ0FDcEQsZUFBZSxFQUNmLE1BQU0sQ0FDUCxDQUFBO1lBRUQsSUFBSSxJQUFJLFlBQVkscUJBQVcsRUFBRTtnQkFDL0IsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTthQUN6QjtZQUVELE1BQU0sV0FBVyxHQUFXLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1lBQ3ZELEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7WUFFcEIsTUFBTSxTQUFTLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtZQUNsRCxNQUFNLFlBQVksR0FBVyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtZQUNuRSxNQUFNLEdBQUcsR0FBTyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtZQUUxQyxNQUFNLGVBQWUsR0FBZSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQ3hELE9BQU8sQ0FDUixDQUFDLGtCQUFrQixDQUNsQixTQUFTLEVBQ1QsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sUUFBUSxFQUNSLFNBQVMsRUFDVCxJQUFJLEVBQ0osS0FBSyxFQUNMLFdBQVcsRUFDWCxHQUFHLEVBQ0gsV0FBVyxFQUNYLElBQUksRUFDSixJQUFJLEVBQ0osVUFBVSxFQUNWLGVBQWUsQ0FDaEIsQ0FBQTtZQUVELElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUN6RSwwQkFBMEI7Z0JBQzFCLE1BQU0sSUFBSSwyQkFBa0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO2FBQ3ZEO1lBRUQsT0FBTyxlQUFlLENBQUE7UUFDeEIsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQXNCRztRQUNILDhCQUF5QixHQUFHLENBQzFCLE9BQWdCLEVBQ2hCLGFBQXVCLEVBQ3ZCLGVBQXlCLEVBQ3pCLE1BQWMsRUFDZCxTQUF3QixFQUN4QixTQUFhLEVBQ2IsT0FBVyxFQUNYLFdBQWUsRUFDZixlQUF5QixFQUN6QixpQkFBcUIsZUFBTSxFQUMzQixrQkFBMEIsQ0FBQyxFQUMzQixPQUE2QixTQUFTLEVBQ3RDLE9BQVcsZUFBTSxFQUNqQixjQUFzQixDQUFDLEVBQ3ZCLGtCQUEwQixDQUFDLEVBQ04sRUFBRTtZQUN2QixNQUFNLE1BQU0sR0FBRywyQkFBMkIsQ0FBQTtZQUUxQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBRS9ELE1BQU0sTUFBTSxHQUFhLElBQUksQ0FBQyx3QkFBd0IsQ0FDcEQsZUFBZSxFQUNmLE1BQU0sQ0FDUCxDQUFBO1lBQ0QsTUFBTSxPQUFPLEdBQWEsSUFBSSxDQUFDLHdCQUF3QixDQUNyRCxlQUFlLEVBQ2YsTUFBTSxDQUNQLENBQUE7WUFFRCxJQUFJLElBQUksWUFBWSxxQkFBVyxFQUFFO2dCQUMvQixJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO2FBQ3pCO1lBRUQsTUFBTSxRQUFRLEdBQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUE7WUFDcEUsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM1QixNQUFNLElBQUksbUJBQVUsQ0FDbEIsaUJBQWlCLE1BQU0sb0NBQW9DO29CQUN6RCxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUN4QixDQUFBO2FBQ0Y7WUFFRCxNQUFNLFdBQVcsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUV2RCxNQUFNLEdBQUcsR0FBTyxJQUFBLHlCQUFPLEdBQUUsQ0FBQTtZQUN6QixJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDL0MsTUFBTSxJQUFJLGtCQUFTLENBQ2pCLGlCQUFpQixNQUFNLDJFQUEyRSxDQUNuRyxDQUFBO2FBQ0Y7WUFFRCxNQUFNLElBQUksR0FBYztnQkFDdEIsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztnQkFDN0MsSUFBSSxFQUFFLEVBQUU7YUFDVCxDQUFBO1lBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDakQsQ0FBQyxDQUFDLENBQUE7WUFFRixNQUFNLGVBQWUsR0FBZSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQ3hELE9BQU8sQ0FDUixDQUFDLHlCQUF5QixDQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUN4QixRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFDdEMsVUFBVSxFQUNWLE1BQU0sRUFDTixJQUFBLHNDQUFvQixFQUFDLE1BQU0sQ0FBQyxFQUM1QixJQUFJLEVBQ0osU0FBUyxFQUNULE9BQU8sRUFDUCxXQUFXLEVBQ1gsV0FBVyxFQUNYLE9BQU8sRUFDUCxjQUFjLEVBQ2QsZUFBZSxFQUNmLElBQUksRUFDSixJQUFJLEVBQ0osV0FBVyxFQUNYLGVBQWUsQ0FDaEIsQ0FBQTtZQUVELElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFO2dCQUNoRCwwQkFBMEI7Z0JBQzFCLE1BQU0sSUFBSSwyQkFBa0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO2FBQ3ZEO1lBRUQsT0FBTyxlQUFlLENBQUE7UUFDeEIsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7Ozs7O1dBZUc7UUFDSCx3QkFBbUIsR0FBRyxDQUNwQixVQUFrQiwyQ0FBK0IsRUFDakQsT0FBZ0IsRUFDaEIsYUFBdUIsRUFDdkIsZUFBeUIsRUFDekIsT0FBd0IsRUFDeEIsS0FBYSxFQUNiLFNBQWtCLEtBQUssRUFDdkIsT0FBZSxTQUFTLEVBQ3hCLE9BQVcsZUFBTSxFQUNqQixrQkFBMEIsQ0FBQyxFQUMzQixrQkFBMEIsU0FBUyxFQUNuQyxlQUFtQyxFQUFFLEVBQ2hCLEVBQUU7WUFDdkIsTUFBTSxNQUFNLEdBQUcscUJBQXFCLENBQUE7WUFFcEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUUvRCxNQUFNLE1BQU0sR0FBYSxJQUFJLENBQUMsd0JBQXdCLENBQ3BELGVBQWUsRUFDZixNQUFNLENBQ1AsQ0FBQTtZQUNELE1BQU0sVUFBVSxHQUNkLE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO1lBQ3BFLElBQUksSUFBSSxZQUFZLHFCQUFXLEVBQUU7Z0JBQy9CLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7YUFDekI7WUFFRCxNQUFNLFdBQVcsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUN2RCxNQUFNLFNBQVMsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1lBQ2xELE1BQU0sWUFBWSxHQUFXLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBQ25FLE1BQU0sR0FBRyxHQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtZQUUvQixJQUFJLFdBQW1CLENBQUE7WUFDdkIsSUFBSSxJQUFJLEdBQXVCLEVBQUUsQ0FBQTtZQUVqQyxJQUFJLGVBQWUsRUFBRTtnQkFDbkIsV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtvQkFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDNUMsQ0FBQyxDQUFDLENBQUE7YUFDSDtZQUVELE1BQU0sZUFBZSxHQUFlLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FDeEQsT0FBTyxDQUNSLENBQUMsbUJBQW1CLENBQ25CLE9BQU8sRUFDUCxTQUFTLEVBQ1QsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sVUFBVSxFQUNWLEtBQUssRUFDTCxNQUFNLEVBQ04sR0FBRyxFQUNILFdBQVcsRUFDWCxJQUFJLEVBQ0osSUFBSSxFQUNKLGVBQWUsRUFDZixXQUFXLEVBQ1gsSUFBSSxDQUNMLENBQUE7WUFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDekUsMEJBQTBCO2dCQUMxQixNQUFNLElBQUksMkJBQWtCLENBQUMsd0JBQXdCLENBQUMsQ0FBQTthQUN2RDtZQUVELE9BQU8sZUFBZSxDQUFBO1FBQ3hCLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7Ozs7Ozs7OztXQWVHO1FBQ0gsd0JBQW1CLEdBQUcsQ0FDcEIsT0FBZ0IsRUFDaEIsYUFBdUIsRUFDdkIsa0JBQTRCLFNBQVMsRUFDckMsWUFBNkIsU0FBUyxFQUN0QyxZQUE2QixTQUFTLEVBQ3RDLFVBQTJCLFNBQVMsRUFDcEMsZUFBNEMsRUFBRSxFQUM5QyxPQUE2QixTQUFTLEVBQ3RDLE9BQVcsZUFBTSxFQUNqQixrQkFBMEIsQ0FBQyxFQUNOLEVBQUU7WUFDdkIsTUFBTSxNQUFNLEdBQUcscUJBQXFCLENBQUE7WUFFcEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUUvRCxNQUFNLE1BQU0sR0FBYSxJQUFJLENBQUMsd0JBQXdCLENBQ3BELGVBQWUsRUFDZixNQUFNLENBQ1AsQ0FBQTtZQUNELE1BQU0sT0FBTyxHQUNYLE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO1lBRXBFLElBQUksSUFBSSxZQUFZLHFCQUFXLEVBQUU7Z0JBQy9CLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7YUFDekI7WUFDRCxNQUFNLElBQUksR0FBdUIsRUFBRSxDQUFBO1lBQ25DLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDekIsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDUixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNKLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDMUQsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxDQUFDLENBQUE7WUFFRixJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRTtnQkFDakMsU0FBUyxHQUFHLElBQUEsc0NBQW9CLEVBQUMsU0FBUyxDQUFDLENBQUE7YUFDNUM7WUFFRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRTtnQkFDakMsU0FBUyxHQUFHLElBQUEsc0NBQW9CLEVBQUMsU0FBUyxDQUFDLENBQUE7YUFDNUM7WUFFRCxNQUFNLFdBQVcsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUN2RCxNQUFNLFNBQVMsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1lBQ2xELE1BQU0sWUFBWSxHQUFXLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBQ25FLE1BQU0sR0FBRyxHQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtZQUUvQixNQUFNLGVBQWUsR0FBZSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQ3hELE9BQU8sQ0FDUixDQUFDLG1CQUFtQixDQUNuQixTQUFTLEVBQ1QsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sU0FBUyxFQUNULFNBQVMsRUFDVCxPQUFPLEVBQ1AsSUFBSSxFQUNKLEdBQUcsRUFDSCxXQUFXLEVBQ1gsSUFBSSxFQUNKLElBQUksRUFDSixlQUFlLENBQ2hCLENBQUE7WUFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDekUsMEJBQTBCO2dCQUMxQixNQUFNLElBQUksMkJBQWtCLENBQUMsd0JBQXdCLENBQUMsQ0FBQTthQUN2RDtZQUVELE9BQU8sZUFBZSxDQUFBO1FBQ3hCLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7V0FtQkc7UUFDSCxtQkFBYyxHQUFHLENBQ2YsVUFBa0IsMkNBQStCLEVBQ2pELE9BQWdCLEVBQ2hCLGFBQXVCLEVBQ3ZCLGtCQUE0QixTQUFTLEVBQ3JDLGNBQStCLEVBQy9CLGVBQXVCLEVBQ3ZCLGVBQTZCLFNBQVMsRUFDdEMsd0JBQXlDLFNBQVMsRUFDbEQscUJBQWtELEVBQUUsRUFDcEQsd0JBQWtDLEVBQUUsRUFDcEMsd0JBQXFELEVBQUUsRUFDdkQsT0FBNkIsU0FBUyxFQUN0QyxPQUFXLGVBQU0sRUFDakIsWUFBZ0IsRUFDaEIsa0JBQTBCLENBQUMsRUFDM0IsS0FBZSxFQUFFLEVBQ2pCLGNBQXNCLENBQUMsRUFDRixFQUFFO1lBQ3ZCLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFBO1lBRS9CLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFFL0QsTUFBTSxNQUFNLEdBQWEsSUFBSSxDQUFDLHdCQUF3QixDQUNwRCxlQUFlLEVBQ2YsTUFBTSxDQUNQLENBQUE7WUFFRCxJQUFJLElBQUksWUFBWSxxQkFBVyxFQUFFO2dCQUMvQixJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO2FBQ3pCO1lBRUQsTUFBTSxXQUFXLEdBQVcsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7WUFDdkQsTUFBTSxTQUFTLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtZQUNsRCxNQUFNLFlBQVksR0FBVyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtZQUNuRSxNQUFNLEdBQUcsR0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7WUFFL0IsSUFBSSxPQUFPLGNBQWMsS0FBSyxRQUFRO2dCQUNwQyxjQUFjLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQTtZQUV0RCxNQUFNLE9BQU8sR0FBdUIsRUFBRSxDQUFBO1lBQ3RDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDO29CQUNYLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ0osT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMxRCxDQUFDLENBQUE7WUFDSixDQUFDLENBQUMsQ0FBQTtZQUVGLElBQUkscUJBQXFCLENBQUMsTUFBTSxLQUFLLHFCQUFxQixDQUFDLE1BQU0sRUFBRTtnQkFDakUsTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFBO2FBQ2pFO1lBRUQsTUFBTSxNQUFNLEdBQXVCLEVBQUUsQ0FBQTtZQUNyQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQztvQkFDVixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNKLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDMUQsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxDQUFDLENBQUE7WUFFRixJQUFJLE9BQU8scUJBQXFCLEtBQUssUUFBUTtnQkFDM0MscUJBQXFCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1lBRWxFLE1BQU0sZUFBZSxHQUFlLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FDeEQsT0FBTyxDQUNSLENBQUMsY0FBYyxDQUNkLE9BQU8sRUFDUCxTQUFTLEVBQ1QsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sY0FBYyxFQUNkLGVBQWUsRUFDZixZQUFZLEVBQ1oscUJBQXFCLEVBQ3JCLE9BQU8sRUFDUCxxQkFBcUIsRUFDckIsTUFBTSxFQUNOLEdBQUcsRUFDSCxXQUFXLEVBQ1gsSUFBSSxFQUNKLElBQUksRUFDSixZQUFZLEVBQ1osZUFBZSxFQUNmLEVBQUUsRUFDRixXQUFXLENBQ1osQ0FBQTtZQUVELElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUN6RSwwQkFBMEI7Z0JBQzFCLE1BQU0sSUFBSSwyQkFBa0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO2FBQ3ZEO1lBRUQsT0FBTyxlQUFlLENBQUE7UUFDeEIsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7V0FXRztRQUNILHlCQUFvQixHQUFHLENBQ3JCLE9BQWdCLEVBQ2hCLGFBQXVCLEVBQ3ZCLGtCQUE0QixTQUFTLEVBQ3JDLE9BQTZCLFNBQVMsRUFDdEMsT0FBVyxlQUFNLEVBQ2pCLFlBQWdCLEVBQ2hCLGtCQUEwQixDQUFDLEVBQ04sRUFBRTtZQUN2QixNQUFNLE1BQU0sR0FBRyxzQkFBc0IsQ0FBQTtZQUNyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBQy9ELE1BQU0sTUFBTSxHQUFhLElBQUksQ0FBQyx3QkFBd0IsQ0FDcEQsZUFBZSxFQUNmLE1BQU0sQ0FDUCxDQUFBO1lBQ0QsSUFBSSxJQUFJLFlBQVkscUJBQVcsRUFBRTtnQkFDL0IsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTthQUN6QjtZQUVELE1BQU0sV0FBVyxHQUFXLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1lBQ3ZELE1BQU0sU0FBUyxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7WUFDbEQsTUFBTSxZQUFZLEdBQVcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7WUFDbkUsTUFBTSxHQUFHLEdBQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1lBRS9CLE1BQU0sZUFBZSxHQUFlLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FDeEQsT0FBTyxDQUNSLENBQUMsb0JBQW9CLENBQ3BCLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLE1BQU0sRUFDTixHQUFHLEVBQ0gsV0FBVyxFQUNYLElBQUksRUFDSixJQUFJLEVBQ0osZUFBZSxDQUNoQixDQUFBO1lBRUQsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3pFLDBCQUEwQjtnQkFDMUIsTUFBTSxJQUFJLDJCQUFrQixDQUFDLHdCQUF3QixDQUFDLENBQUE7YUFDdkQ7WUFFRCxPQUFPLGVBQWUsQ0FBQTtRQUN4QixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7Ozs7Ozs7O1dBYUc7UUFDSCxpQkFBWSxHQUFHLENBQ2IsT0FBZ0IsRUFDaEIsYUFBdUIsRUFDdkIsa0JBQTRCLFNBQVMsRUFDckMsT0FBNkIsU0FBUyxFQUN0QyxPQUFXLGVBQU0sRUFDakIsa0JBQTBCLENBQUMsRUFDM0IsWUFBaUMsRUFDakMsVUFBd0IsU0FBUyxFQUNaLEVBQUU7WUFDdkIsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFBO1lBQzdCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFDL0QsTUFBTSxNQUFNLEdBQWEsSUFBSSxDQUFDLHdCQUF3QixDQUNwRCxlQUFlLEVBQ2YsTUFBTSxDQUNQLENBQUE7WUFDRCxJQUFJLElBQUksWUFBWSxxQkFBVyxFQUFFO2dCQUMvQixJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO2FBQ3pCO1lBQ0QsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFBO2FBQ3pEO1lBQ0QsTUFBTSxXQUFXLEdBQVcsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7WUFDdkQsTUFBTSxTQUFTLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtZQUNsRCxNQUFNLFlBQVksR0FBVyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtZQUNuRSxNQUFNLEdBQUcsR0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7WUFFL0IsTUFBTSxlQUFlLEdBQWUsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUN4RCxPQUFPLENBQ1IsQ0FBQyxZQUFZLENBQ1osU0FBUyxFQUNULFlBQVksRUFDWixVQUFVLEVBQ1YsTUFBTSxFQUNOLEdBQUcsRUFDSCxXQUFXLEVBQ1gsSUFBSSxFQUNKLElBQUksRUFDSixlQUFlLEVBQ2YsWUFBWSxFQUNaLE9BQU8sQ0FDUixDQUFBO1lBRUQsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3pFLDBCQUEwQjtnQkFDMUIsTUFBTSxJQUFJLDJCQUFrQixDQUFDLHdCQUF3QixDQUFDLENBQUE7YUFDdkQ7WUFFRCxPQUFPLGVBQWUsQ0FBQTtRQUN4QixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7Ozs7Ozs7V0FZRztRQUNILHlCQUFvQixHQUFHLENBQ3JCLE9BQWdCLEVBQ2hCLGFBQXVCLEVBQ3ZCLGVBQXlCLEVBQ3pCLG1CQUF3QyxFQUN4QyxPQUE2QixTQUFTLEVBQ3RDLE9BQVcsZUFBTSxFQUNqQixrQkFBMEIsQ0FBQyxFQUNOLEVBQUU7WUFDdkIsTUFBTSxNQUFNLEdBQUcsc0JBQXNCLENBQUE7WUFFckMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUUvRCxNQUFNLE1BQU0sR0FBYSxJQUFJLENBQUMsd0JBQXdCLENBQ3BELGVBQWUsRUFDZixNQUFNLENBQ1AsQ0FBQTtZQUVELElBQUksSUFBSSxZQUFZLHFCQUFXLEVBQUU7Z0JBQy9CLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7YUFDekI7WUFFRCxNQUFNLFdBQVcsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUN2RCxNQUFNLFNBQVMsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1lBQ2xELE1BQU0sWUFBWSxHQUFXLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBQ25FLE1BQU0sR0FBRyxHQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtZQUUvQixNQUFNLGVBQWUsR0FBZSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQ3hELE9BQU8sQ0FDUixDQUFDLG9CQUFvQixDQUNwQixTQUFTLEVBQ1QsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sbUJBQW1CLEVBQ25CLEdBQUcsRUFDSCxXQUFXLEVBQ1gsSUFBSSxFQUNKLElBQUksRUFDSixlQUFlLENBQ2hCLENBQUE7WUFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDekUsMEJBQTBCO2dCQUMxQixNQUFNLElBQUksMkJBQWtCLENBQUMsd0JBQXdCLENBQUMsQ0FBQTthQUN2RDtZQUVELE9BQU8sZUFBZSxDQUFBO1FBQ3hCLENBQUMsQ0FBQSxDQUFBO1FBRUQsMkJBQXNCLEdBQUcsQ0FDdkIsT0FBZ0IsRUFDaEIsYUFBdUIsRUFDdkIsZUFBeUIsRUFDekIsWUFBMEIsRUFDMUIsMEJBQWtDLEVBQ2xDLDBCQUF1RCxFQUFFLEVBQ3pELE9BQTZCLFNBQVMsRUFDdEMsT0FBVyxlQUFNLEVBQ2pCLGtCQUEwQixDQUFDLEVBQ04sRUFBRTtZQUN2QixNQUFNLE1BQU0sR0FBRyx3QkFBd0IsQ0FBQTtZQUV2QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBRS9ELE1BQU0sTUFBTSxHQUFhLElBQUksQ0FBQyx3QkFBd0IsQ0FDcEQsZUFBZSxFQUNmLE1BQU0sQ0FDUCxDQUFBO1lBRUQsSUFBSSxJQUFJLFlBQVkscUJBQVcsRUFBRTtnQkFDL0IsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTthQUN6QjtZQUVELE1BQU0sV0FBVyxHQUFXLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1lBQ3ZELE1BQU0sU0FBUyxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7WUFDbEQsTUFBTSxZQUFZLEdBQVcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7WUFDbkUsTUFBTSxHQUFHLEdBQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1lBRS9CLE1BQU0sSUFBSSxHQUF1QixFQUFFLENBQUE7WUFDbkMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQ1IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDSixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzFELENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FBQyxDQUFBO1lBRUYsSUFBSSxZQUFvQixDQUFBO1lBQ3hCLElBQUksWUFBWSxDQUFDLFlBQVksRUFBRTtnQkFDN0IsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFBO2FBQzVEO1lBRUQsTUFBTSxLQUFLLEdBQVUsSUFBSSx5QkFBSyxDQUM1QixZQUFZLENBQUMsY0FBYyxFQUMzQixZQUFZLENBQUMscUJBQXFCLEVBQ2xDLFlBQVksQ0FBQyxLQUFLLEVBQ2xCLFlBQVksQ0FBQyxHQUFHLEVBQ2hCLFlBQVksQ0FBQyxTQUFTLEVBQ3RCLFlBQVksQ0FBQyxjQUFjLEVBQzNCLFlBQVksQ0FBQyxlQUFlLEVBQzVCLFlBQVksQ0FBQyxXQUFXLEVBQ3hCLFlBQVksQ0FBQyxXQUFXLEVBQ3hCLFlBQVksQ0FBQyxvQkFBb0IsRUFDakMsWUFBWSxDQUFDLHVCQUF1QixFQUNwQyxlQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQ3ZDLFlBQVksQ0FBQyxLQUFLLEVBQ2xCLFlBQVksQ0FBQyxvQkFBb0IsRUFDakMsWUFBWSxDQUFDLGNBQWMsRUFDM0IsWUFBWSxDQUNiLENBQUE7WUFFRCxNQUFNLGVBQWUsR0FBZSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQ3hELE9BQU8sQ0FDUixDQUFDLHNCQUFzQixDQUN0QixTQUFTLEVBQ1QsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sS0FBSyxFQUNMLElBQUksQ0FBQyxZQUFZLENBQUMsMEJBQTBCLENBQUMsRUFDN0MsSUFBSSxFQUNKLEdBQUcsRUFDSCxXQUFXLEVBQ1gsSUFBSSxFQUNKLElBQUksRUFDSixlQUFlLENBQ2hCLENBQUE7WUFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDekUsMEJBQTBCO2dCQUMxQixNQUFNLElBQUksMkJBQWtCLENBQUMsd0JBQXdCLENBQUMsQ0FBQTthQUN2RDtZQUVELE9BQU8sZUFBZSxDQUFBO1FBQ3hCLENBQUMsQ0FBQSxDQUFBO1FBdUZEOztXQUVHO1FBQ0gsaUJBQVksR0FBRyxHQUEwQixFQUFFO1lBQ3pDLE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELHVCQUF1QixDQUN4QixDQUFBO1lBQ0QsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUE7UUFDdkMsQ0FBQyxDQUFBLENBQUE7UUFFRDs7V0FFRztRQUNILG1CQUFjLEdBQUcsQ0FDZixJQUFZLEVBQ1osUUFBaUIsRUFDZ0IsRUFBRTtZQUNuQyxNQUFNLE1BQU0sR0FBeUI7Z0JBQ25DLElBQUk7Z0JBQ0osUUFBUTthQUNULENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCx5QkFBeUIsRUFDekIsTUFBTSxDQUNQLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFBO1FBQzdCLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7V0FJRztRQUNILHFCQUFnQixHQUFHLEdBQTRDLEVBQUU7O1lBQy9ELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQ3pELDJCQUEyQixDQUM1QixDQUFBO1lBQ0QsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7WUFDOUIsT0FBTztnQkFDTCxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQ2hDLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztnQkFDbEIsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO2dCQUMxQixHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7Z0JBQ1YsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO2dCQUMxQixnQkFBZ0IsRUFBRSxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO2dCQUNuRSxnQkFBZ0IsRUFBRSxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO2dCQUNuRSxpQkFBaUIsRUFBRSxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUM7Z0JBQzlDLGlCQUFpQixFQUFFLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDOUMsZ0JBQWdCLEVBQUUsSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO2dCQUM1QyxpQkFBaUIsRUFBRSxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUM7Z0JBQzlDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxrQkFBa0I7Z0JBQ3ZFLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxrQkFBa0I7Z0JBQ3ZFLFNBQVMsRUFBRSxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUM5QixtQkFBbUIsRUFBRSxNQUFBLENBQUMsQ0FBQyxtQkFBbUIsbUNBQUksS0FBSztnQkFDbkQsbUJBQW1CLEVBQUUsTUFBQSxDQUFDLENBQUMsbUJBQW1CLG1DQUFJLEtBQUs7YUFDeEIsQ0FBQTtRQUMvQixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxVQUFLLEdBQUcsQ0FDTixJQUF1QixFQUN2QixNQUF5QixFQUN6QixFQUFZLEVBQ1osV0FBbUIsRUFDbkIsVUFBYyxFQUNkLE1BQWdCLEVBQ2hCLGVBQXVCLEVBQ3ZCLFFBQWtCLEVBQ2xCLFlBQWdCLEVBQ2hCLFlBQWdCLEVBQ2hCLElBQVEsRUFDUixRQUFpQixFQUNJLEVBQUU7WUFDdkIsSUFBSSxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3ZELE1BQU0sSUFBSSxzQkFBYSxDQUFDLDhDQUE4QyxDQUFDLENBQUE7YUFDeEU7WUFDRCxNQUFNLE1BQU0sR0FBZ0I7Z0JBQzFCLElBQUk7Z0JBQ0osTUFBTTtnQkFDTixFQUFFLEVBQ0EsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDO29CQUNYLENBQUMsQ0FBQzt3QkFDRSxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7d0JBQ2pDLFNBQVMsRUFBRSxXQUFXO3dCQUN0QixTQUFTLEVBQUUsRUFBRTtxQkFDZDtvQkFDSCxDQUFDLENBQUMsU0FBUztnQkFDZixNQUFNLEVBQ0osTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDO29CQUNmLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO29CQUNsRSxDQUFDLENBQUMsU0FBUztnQkFDZixRQUFRLEVBQUUsUUFBUSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RFLFlBQVksRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDdkMsWUFBWSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZCLFFBQVEsRUFBRSxRQUFRLGFBQVIsUUFBUSxjQUFSLFFBQVEsR0FBSSxLQUFLO2FBQzVCLENBQUE7WUFFRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxnQkFBZ0IsRUFDaEIsTUFBTSxDQUNQLENBQUE7WUFDRCxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQTtZQUU5QixnREFBZ0Q7WUFDaEQsTUFBTSxHQUFHLEdBQUcsMEJBQWlCLENBQUMsU0FBUyxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtZQUMzRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQ3JCLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQ2pDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xFLENBQUMsQ0FBQyxDQUNILENBQUE7WUFFRCxPQUFPO2dCQUNMLEdBQUc7Z0JBQ0gsR0FBRyxFQUFFLDRCQUFrQixDQUFDLFNBQVMsQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN0RSxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07b0JBQ2QsQ0FBQyxDQUFDLHFCQUFZLENBQUMsU0FBUyxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQy9ELENBQUMsQ0FBQyxFQUFFO2FBQ1AsQ0FBQTtRQUNILENBQUMsQ0FBQSxDQUFBO1FBRUQsZ0JBQVcsR0FBRyxDQUFDLE9BQWdCLEVBQVcsRUFBRTtZQUMxQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFO2dCQUNoRCxPQUFPLElBQUksaUJBQU8sQ0FBQyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7YUFDNUM7WUFDRCxPQUFPLElBQUksaUJBQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDcEMsQ0FBQyxDQUFBO1FBRUQ7Ozs7Ozs7Ozs7Ozs7OztXQWVHO1FBQ0gsdUJBQWtCLEdBQUcsQ0FDbkIsT0FBZ0IsRUFDaEIsYUFBdUIsRUFDdkIsZUFBeUIsRUFDekIsbUJBQTJCLEVBQzNCLFFBQWtCLEVBQ2xCLGVBQXVCLEVBQ3ZCLFVBQWtCLDJDQUErQixFQUNqRCxPQUE2QixTQUFTLEVBQ3RDLE9BQVcsZUFBTSxFQUNqQixrQkFBMEIsQ0FBQyxFQUNOLEVBQUU7WUFDdkIsTUFBTSxNQUFNLEdBQUcsb0JBQW9CLENBQUE7WUFFbkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUMvRCxNQUFNLE1BQU0sR0FBYSxJQUFJLENBQUMsd0JBQXdCLENBQ3BELGVBQWUsRUFDZixNQUFNLENBQ1AsQ0FBQTtZQUVELElBQUksSUFBSSxZQUFZLHFCQUFXLEVBQUU7Z0JBQy9CLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUE7YUFDekI7WUFFRCxNQUFNLFdBQVcsR0FBVyxNQUFNLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUN2RCxNQUFNLFNBQVMsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1lBQ2xELE1BQU0sWUFBWSxHQUFXLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBQ25FLE1BQU0sR0FBRyxHQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtZQUMvQixNQUFNLFlBQVksR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQTtZQUNyQyxNQUFNLFVBQVUsR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xDLFlBQVksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUE7WUFFeEMsTUFBTSxlQUFlLEdBQWUsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUN4RCxPQUFPLENBQ1IsQ0FBQyxrQkFBa0IsQ0FDbEIsU0FBUyxFQUNULFlBQVksRUFDWixVQUFVLEVBQ1YsTUFBTSxFQUNOLG1CQUFtQixFQUNuQixRQUFRLEVBQ1IsZUFBZSxFQUNmLFlBQVksRUFDWixPQUFPLEVBQ1AsSUFBSSxFQUNKLEdBQUcsRUFDSCxXQUFXLEVBQ1gsSUFBSSxFQUNKLGVBQWUsQ0FDaEIsQ0FBQTtZQUVELElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUN6RSwwQkFBMEI7Z0JBQzFCLE1BQU0sSUFBSSwyQkFBa0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO2FBQ3ZEO1lBRUQsT0FBTyxlQUFlLENBQUE7UUFDeEIsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7Ozs7Ozs7Ozs7O1dBZUc7UUFDSCxtQkFBYyxHQUFHLENBQ2YsT0FBZ0IsRUFDaEIsYUFBdUIsRUFDdkIsZUFBeUIsRUFDekIsVUFBa0IsRUFDbEIsZUFBdUIsRUFDdkIsWUFBb0IsRUFDcEIsVUFBa0IsMkNBQStCLEVBQ2pELE9BQTZCLFNBQVMsRUFDdEMsT0FBVyxlQUFNLEVBQ2pCLGtCQUEwQixDQUFDLEVBQ04sRUFBRTtZQUN2QixNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQTtZQUUvQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBQy9ELE1BQU0sTUFBTSxHQUFhLElBQUksQ0FBQyx3QkFBd0IsQ0FDcEQsZUFBZSxFQUNmLE1BQU0sQ0FDUCxDQUFBO1lBRUQsSUFBSSxJQUFJLFlBQVkscUJBQVcsRUFBRTtnQkFDL0IsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQTthQUN6QjtZQUVELE1BQU0sV0FBVyxHQUFXLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFBO1lBQ3ZELE1BQU0sU0FBUyxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7WUFDbEQsTUFBTSxZQUFZLEdBQVcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7WUFDbkUsTUFBTSxHQUFHLEdBQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1lBQy9CLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDckQsTUFBTSxTQUFTLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUE7WUFDbEMsTUFBTSxVQUFVLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNsQyxTQUFTLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBRXJDLE1BQU0sZUFBZSxHQUFlLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FDeEQsT0FBTyxDQUNSLENBQUMsY0FBYyxDQUNkLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLE1BQU0sRUFDTixhQUFhLEVBQ2IsZUFBZSxFQUNmLFlBQVksRUFDWixTQUFTLEVBQ1QsT0FBTyxFQUNQLElBQUksRUFDSixHQUFHLEVBQ0gsV0FBVyxFQUNYLElBQUksRUFDSixlQUFlLENBQ2hCLENBQUE7WUFFRCxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDekUsMEJBQTBCO2dCQUMxQixNQUFNLElBQUksMkJBQWtCLENBQUMsd0JBQXdCLENBQUMsQ0FBQTthQUN2RDtZQUVELE9BQU8sZUFBZSxDQUFBO1FBQ3hCLENBQUMsQ0FBQSxDQUFBO1FBL1JDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUE7WUFDcEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7U0FDdkU7SUFDSCxDQUFDO0NBNFJGO0FBcm9HRCxzQ0Fxb0dDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk1cbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgQXZhbGFuY2hlQ29yZSBmcm9tIFwiLi4vLi4vY2FtaW5vXCJcbmltcG9ydCB7XG4gIEdldEJsb2NrQnlIZWlnaHRQYXJhbXMsXG4gIEdldEJsb2NrUmVzcG9uc2UsXG4gIEpSUENBUEksXG4gIE91dHB1dE93bmVycyxcbiAgUmVxdWVzdFJlc3BvbnNlRGF0YSxcbiAgWmVyb0JOXG59IGZyb20gXCIuLi8uLi9jb21tb25cIlxuXG5pbXBvcnQge1xuICBFcnJvclJlc3BvbnNlT2JqZWN0LFxuICBQcm90b2NvbEVycm9yLFxuICBVVFhPRXJyb3Jcbn0gZnJvbSBcIi4uLy4uL3V0aWxzL2Vycm9yc1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IEtleUNoYWluIH0gZnJvbSBcIi4va2V5Y2hhaW5cIlxuaW1wb3J0IHsgRGVmYXVsdFRyYW5zYWN0aW9uVmVyc2lvbk51bWJlciwgT05FQVZBWCB9IGZyb20gXCIuLi8uLi91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBVbnNpZ25lZFR4LCBUeCB9IGZyb20gXCIuL3R4XCJcbmltcG9ydCB7IFBheWxvYWRCYXNlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3BheWxvYWRcIlxuaW1wb3J0IHsgVW5peE5vdywgTm9kZUlEU3RyaW5nVG9CdWZmZXIgfSBmcm9tIFwiLi4vLi4vdXRpbHMvaGVscGVyZnVuY3Rpb25zXCJcbmltcG9ydCB7IFVUWE8sIFVUWE9TZXQgfSBmcm9tIFwiLi4vcGxhdGZvcm12bS91dHhvc1wiXG5pbXBvcnQgeyBQZXJzaXN0YW5jZU9wdGlvbnMgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcGVyc2lzdGVuY2VvcHRpb25zXCJcbmltcG9ydCB7XG4gIEFkZHJlc3NFcnJvcixcbiAgVHJhbnNhY3Rpb25FcnJvcixcbiAgQ2hhaW5JZEVycm9yLFxuICBHb29zZUVnZ0NoZWNrRXJyb3IsXG4gIFRpbWVFcnJvcixcbiAgU3Rha2VFcnJvcixcbiAgRGVsZWdhdGlvbkZlZUVycm9yXG59IGZyb20gXCIuLi8uLi91dGlscy9lcnJvcnNcIlxuaW1wb3J0IHtcbiAgQVBJRGVwb3NpdCxcbiAgQmFsYW5jZURpY3QsXG4gIENsYWltYWJsZSxcbiAgQ2xhaW1BbW91bnRQYXJhbXMsXG4gIERlcG9zaXRPZmZlcixcbiAgR2V0Q3VycmVudFZhbGlkYXRvcnNQYXJhbXMsXG4gIEdldFBlbmRpbmdWYWxpZGF0b3JzUGFyYW1zLFxuICBHZXRSZXdhcmRVVFhPc1BhcmFtcyxcbiAgR2V0UmV3YXJkVVRYT3NSZXNwb25zZSxcbiAgR2V0U3Rha2VQYXJhbXMsXG4gIEdldFN0YWtlUmVzcG9uc2UsXG4gIEdldENvbmZpZ3VyYXRpb25SZXNwb25zZSxcbiAgU3VibmV0LFxuICBHZXRWYWxpZGF0b3JzQXRQYXJhbXMsXG4gIEdldFZhbGlkYXRvcnNBdFJlc3BvbnNlLFxuICBDcmVhdGVBZGRyZXNzUGFyYW1zLFxuICBHZXRVVFhPc1BhcmFtcyxcbiAgR2V0QmFsYW5jZVJlc3BvbnNlLFxuICBHZXRVVFhPc1Jlc3BvbnNlLFxuICBMaXN0QWRkcmVzc2VzUGFyYW1zLFxuICBTYW1wbGVWYWxpZGF0b3JzUGFyYW1zLFxuICBBZGRWYWxpZGF0b3JQYXJhbXMsXG4gIEFkZERlbGVnYXRvclBhcmFtcyxcbiAgQ3JlYXRlU3VibmV0UGFyYW1zLFxuICBFeHBvcnRBVkFYUGFyYW1zLFxuICBFeHBvcnRLZXlQYXJhbXMsXG4gIEltcG9ydEtleVBhcmFtcyxcbiAgSW1wb3J0QVZBWFBhcmFtcyxcbiAgQ3JlYXRlQmxvY2tjaGFpblBhcmFtcyxcbiAgQmxvY2tjaGFpbixcbiAgR2V0VHhTdGF0dXNQYXJhbXMsXG4gIEdldFR4U3RhdHVzUmVzcG9uc2UsXG4gIEdldE1pblN0YWtlUmVzcG9uc2UsXG4gIEdldE1heFN0YWtlQW1vdW50UGFyYW1zLFxuICBTcGVuZFBhcmFtcyxcbiAgU3BlbmRSZXBseSxcbiAgQWRkcmVzc1BhcmFtcyxcbiAgTXVsdGlzaWdBbGlhc1JlcGx5LFxuICBHZXRDbGFpbWFibGVzUmVzcG9uc2UsXG4gIEdldEFsbERlcG9zaXRPZmZlcnNQYXJhbXMsXG4gIEdldEFsbERlcG9zaXRPZmZlcnNSZXNwb25zZSxcbiAgR2V0RGVwb3NpdHNQYXJhbXMsXG4gIEdldERlcG9zaXRzUmVzcG9uc2UsXG4gIE93bmVyLFxuICBPd25lclBhcmFtLFxuICBNdWx0aXNpZ0FsaWFzUGFyYW1zLFxuICBVcGdyYWRlUGhhc2VzUmVwbHksXG4gIEdldEN1cnJlbnRTdXBwbHlSZXNwb25zZVxufSBmcm9tIFwiLi9pbnRlcmZhY2VzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSBcIi4vaW5wdXRzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZU91dHB1dCB9IGZyb20gXCIuL291dHB1dHNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZFR5cGUgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIlxuaW1wb3J0IHsgR2VuZXNpc0RhdGEgfSBmcm9tIFwiLi4vYXZtXCJcbmltcG9ydCB7IEF1dGgsIExvY2tNb2RlLCBCdWlsZGVyLCBGcm9tU2lnbmVyLCBOb2RlT3duZXIgfSBmcm9tIFwiLi9idWlsZGVyXCJcbmltcG9ydCB7IE5ldHdvcmsgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbmV0d29ya3NcIlxuaW1wb3J0IHsgU3BlbmRlciB9IGZyb20gXCIuL3NwZW5kZXJcIlxuaW1wb3J0IHsgT2ZmZXIgfSBmcm9tIFwiLi9hZGRkZXBvc2l0b2ZmZXJ0eFwiXG5pbXBvcnQgdHlwZSB7IFByb3Bvc2FsIH0gZnJvbSBcIi4vYWRkcHJvcG9zYWx0eFwiXG5pbXBvcnQgeyBTdWJuZXRBdXRoIH0gZnJvbSBcIi4vc3VibmV0YXV0aFwiXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbmNvbnN0IE5hbm9CTiA9IG5ldyBCTigxMDAwMDAwMDAwKVxuY29uc3QgcmV3YXJkUGVyY2VudERlbm9tID0gMTAwMDAwMFxuXG50eXBlIEZyb21UeXBlID0gU3RyaW5nW10gfCBTdHJpbmdbXVtdXG50eXBlIE5vZGVPd25lclR5cGUgPSB7XG4gIGFkZHJlc3M6IHN0cmluZ1xuICBhdXRoOiBbbnVtYmVyLCBzdHJpbmddW11cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIG5vZGUncyBQbGF0Zm9ybVZNQVBJXG4gKlxuICogQGNhdGVnb3J5IFJQQ0FQSXNcbiAqXG4gKiBAcmVtYXJrcyBUaGlzIGV4dGVuZHMgdGhlIFtbSlJQQ0FQSV1dIGNsYXNzLiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgZGlyZWN0bHkgY2FsbGVkLiBJbnN0ZWFkLCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIHRoaXMgaW50ZXJmYWNlIHdpdGggQXZhbGFuY2hlLlxuICovXG5leHBvcnQgY2xhc3MgUGxhdGZvcm1WTUFQSSBleHRlbmRzIEpSUENBUEkge1xuICAvKipcbiAgICogQGlnbm9yZVxuICAgKi9cbiAgcHJvdGVjdGVkIGtleWNoYWluOiBLZXlDaGFpbiA9IG5ldyBLZXlDaGFpbihcIlwiLCBcIlwiKVxuXG4gIHByb3RlY3RlZCBibG9ja2NoYWluSUQ6IHN0cmluZyA9IFwiXCJcblxuICBwcm90ZWN0ZWQgYmxvY2tjaGFpbkFsaWFzOiBzdHJpbmcgPSB1bmRlZmluZWRcblxuICBwcm90ZWN0ZWQgQVZBWEFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZFxuXG4gIHByb3RlY3RlZCB0eEZlZTogQk4gPSB1bmRlZmluZWRcblxuICBwcm90ZWN0ZWQgY3JlYXRpb25UeEZlZTogQk4gPSB1bmRlZmluZWRcblxuICBwcm90ZWN0ZWQgbWluVmFsaWRhdG9yU3Rha2U6IEJOID0gdW5kZWZpbmVkXG5cbiAgcHJvdGVjdGVkIG1pbkRlbGVnYXRvclN0YWtlOiBCTiA9IHVuZGVmaW5lZFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBhbGlhcyBmb3IgdGhlIGJsb2NrY2hhaW5JRCBpZiBpdCBleGlzdHMsIG90aGVyd2lzZSByZXR1cm5zIGB1bmRlZmluZWRgLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgYWxpYXMgZm9yIHRoZSBibG9ja2NoYWluSURcbiAgICovXG4gIGdldEJsb2NrY2hhaW5BbGlhcyA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIHJldHVybiB0aGlzLmNvcmUuZ2V0TmV0d29yaygpLlAuYWxpYXNcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IG5ldHdvcmssIGZldGNoZWQgdmlhIGF2YWxhbmNoZS5mZXRjaE5ldHdvcmtTZXR0aW5ncy5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGN1cnJlbnQgTmV0d29ya1xuICAgKi9cbiAgZ2V0TmV0d29yayA9ICgpOiBOZXR3b3JrID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb3JlLmdldE5ldHdvcmsoKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGJsb2NrY2hhaW5JRCBhbmQgcmV0dXJucyBpdC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGJsb2NrY2hhaW5JRFxuICAgKi9cbiAgZ2V0QmxvY2tjaGFpbklEID0gKCk6IHN0cmluZyA9PiB0aGlzLmJsb2NrY2hhaW5JRFxuXG4gIC8qKlxuICAgKiBUYWtlcyBhbiBhZGRyZXNzIHN0cmluZyBhbmQgcmV0dXJucyBpdHMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gaWYgdmFsaWQuXG4gICAqXG4gICAqIEByZXR1cm5zIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBhZGRyZXNzIGlmIHZhbGlkLCB1bmRlZmluZWQgaWYgbm90IHZhbGlkLlxuICAgKi9cbiAgcGFyc2VBZGRyZXNzID0gKGFkZHI6IHN0cmluZyk6IEJ1ZmZlciA9PiB7XG4gICAgY29uc3QgYWxpYXM6IHN0cmluZyA9IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKClcbiAgICBjb25zdCBibG9ja2NoYWluSUQ6IHN0cmluZyA9IHRoaXMuZ2V0QmxvY2tjaGFpbklEKClcbiAgICByZXR1cm4gYmludG9vbHMucGFyc2VBZGRyZXNzKFxuICAgICAgYWRkcixcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIGFsaWFzLFxuICAgICAgUGxhdGZvcm1WTUNvbnN0YW50cy5BRERSRVNTTEVOR1RIXG4gICAgKVxuICB9XG5cbiAgYWRkcmVzc0Zyb21CdWZmZXIgPSAoYWRkcmVzczogQnVmZmVyKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBjaGFpbmlkOiBzdHJpbmcgPSB0aGlzLmdldEJsb2NrY2hhaW5BbGlhcygpXG4gICAgICA/IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKClcbiAgICAgIDogdGhpcy5nZXRCbG9ja2NoYWluSUQoKVxuICAgIGNvbnN0IHR5cGU6IFNlcmlhbGl6ZWRUeXBlID0gXCJiZWNoMzJcIlxuICAgIHJldHVybiBzZXJpYWxpemF0aW9uLmJ1ZmZlclRvVHlwZShcbiAgICAgIGFkZHJlc3MsXG4gICAgICB0eXBlLFxuICAgICAgdGhpcy5jb3JlLmdldEhSUCgpLFxuICAgICAgY2hhaW5pZFxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBBVkFYIEFzc2V0SUQgYW5kIHJldHVybnMgaXQgaW4gYSBQcm9taXNlLlxuICAgKlxuICAgKiBAcGFyYW0gcmVmcmVzaCBUaGlzIGZ1bmN0aW9uIGNhY2hlcyB0aGUgcmVzcG9uc2UuIFJlZnJlc2ggPSB0cnVlIHdpbGwgYnVzdCB0aGUgY2FjaGUuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSB0aGUgcHJvdmlkZWQgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgQVZBWCBBc3NldElEXG4gICAqL1xuICBnZXRBVkFYQXNzZXRJRCA9IGFzeW5jIChyZWZyZXNoOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPEJ1ZmZlcj4gPT4ge1xuICAgIGlmICh0eXBlb2YgdGhpcy5BVkFYQXNzZXRJRCA9PT0gXCJ1bmRlZmluZWRcIiB8fCByZWZyZXNoKSB7XG4gICAgICB0aGlzLkFWQVhBc3NldElEID0gYmludG9vbHMuY2I1OERlY29kZShcbiAgICAgICAgdGhpcy5jb3JlLmdldE5ldHdvcmsoKS5YLmF2YXhBc3NldElEXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiB0aGlzLkFWQVhBc3NldElEXG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSBkZWZhdWx0cyBhbmQgc2V0cyB0aGUgY2FjaGUgdG8gYSBzcGVjaWZpYyBBVkFYIEFzc2V0SURcbiAgICpcbiAgICogQHBhcmFtIGF2YXhBc3NldElEIEEgY2I1OCBzdHJpbmcgb3IgQnVmZmVyIHJlcHJlc2VudGluZyB0aGUgQVZBWCBBc3NldElEXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSB0aGUgcHJvdmlkZWQgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgQVZBWCBBc3NldElEXG4gICAqL1xuICBzZXRBVkFYQXNzZXRJRCA9IChhdmF4QXNzZXRJRDogc3RyaW5nIHwgQnVmZmVyKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBhdmF4QXNzZXRJRCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgYXZheEFzc2V0SUQgPSBiaW50b29scy5jYjU4RGVjb2RlKGF2YXhBc3NldElEKVxuICAgIH1cbiAgICB0aGlzLkFWQVhBc3NldElEID0gYXZheEFzc2V0SURcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkZWZhdWx0IHR4IGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGRlZmF1bHQgdHggZmVlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIGdldERlZmF1bHRUeEZlZSA9ICgpOiBCTiA9PiB7XG4gICAgcmV0dXJuIG5ldyBCTih0aGlzLmNvcmUuZ2V0TmV0d29yaygpLlAudHhGZWUpXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdHggZmVlIGZvciB0aGlzIGNoYWluLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgdHggZmVlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIGdldFR4RmVlID0gKCk6IEJOID0+IHtcbiAgICBpZiAodHlwZW9mIHRoaXMudHhGZWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMudHhGZWUgPSB0aGlzLmdldERlZmF1bHRUeEZlZSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnR4RmVlXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgQ3JlYXRlQXNzZXRUeCBmZWUuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBDcmVhdGVBc3NldFR4IGZlZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqL1xuICBnZXRDcmVhdGVBc3NldFR4RmVlID0gKCk6IEJOID0+IHtcbiAgICByZXR1cm4gbmV3IEJOKHRoaXMuY29yZS5nZXROZXR3b3JrKCkuUC5jcmVhdGVBc3NldFR4RmVlID8/IDApXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgQ3JlYXRlU3VibmV0VHggZmVlLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgQ3JlYXRlU3VibmV0VHggZmVlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIGdldENyZWF0ZVN1Ym5ldFR4RmVlID0gKCk6IEJOID0+IHtcbiAgICByZXR1cm4gbmV3IEJOKHRoaXMuY29yZS5nZXROZXR3b3JrKCkuUC5jcmVhdGVTdWJuZXRUeCA/PyAwKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIENyZWF0ZUNoYWluVHggZmVlLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgQ3JlYXRlQ2hhaW5UeCBmZWUgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgZ2V0Q3JlYXRlQ2hhaW5UeEZlZSA9ICgpOiBCTiA9PiB7XG4gICAgcmV0dXJuIG5ldyBCTih0aGlzLmNvcmUuZ2V0TmV0d29yaygpLlAuY3JlYXRlQ2hhaW5UeCA/PyAwKVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHR4IGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHBhcmFtIGZlZSBUaGUgdHggZmVlIGFtb3VudCB0byBzZXQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIHNldFR4RmVlID0gKGZlZTogQk4pID0+IHtcbiAgICB0aGlzLnR4RmVlID0gZmVlXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgZGVmYXVsdCBjcmVhdGlvbiBmZWUgZm9yIHRoaXMgY2hhaW4uXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBkZWZhdWx0IGNyZWF0aW9uIGZlZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqL1xuICBnZXREZWZhdWx0Q3JlYXRpb25UeEZlZSA9ICgpOiBCTiA9PiB7XG4gICAgcmV0dXJuIG5ldyBCTih0aGlzLmNvcmUuZ2V0TmV0d29yaygpLlAuY3JlYXRlQXNzZXRUeEZlZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjcmVhdGlvbiBmZWUgZm9yIHRoaXMgY2hhaW4uXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBjcmVhdGlvbiBmZWUgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgZ2V0Q3JlYXRpb25UeEZlZSA9ICgpOiBCTiA9PiB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmNyZWF0aW9uVHhGZWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuY3JlYXRpb25UeEZlZSA9IHRoaXMuZ2V0RGVmYXVsdENyZWF0aW9uVHhGZWUoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcmVhdGlvblR4RmVlXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY3JlYXRpb24gZmVlIGZvciB0aGlzIGNoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gZmVlIFRoZSBjcmVhdGlvbiBmZWUgYW1vdW50IHRvIHNldCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgc2V0Q3JlYXRpb25UeEZlZSA9IChmZWU6IEJOKSA9PiB7XG4gICAgdGhpcy5jcmVhdGlvblR4RmVlID0gZmVlXG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHJlZmVyZW5jZSB0byB0aGUga2V5Y2hhaW4gZm9yIHRoaXMgY2xhc3MuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBpbnN0YW5jZSBvZiBbW11dIGZvciB0aGlzIGNsYXNzXG4gICAqL1xuICBrZXlDaGFpbiA9ICgpOiBLZXlDaGFpbiA9PiB0aGlzLmtleWNoYWluXG5cbiAgLyoqXG4gICAqIEBpZ25vcmVcbiAgICovXG4gIG5ld0tleUNoYWluID0gKCk6IEtleUNoYWluID0+IHtcbiAgICAvLyB3YXJuaW5nLCBvdmVyd3JpdGVzIHRoZSBvbGQga2V5Y2hhaW5cbiAgICBjb25zdCBhbGlhcyA9IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKClcbiAgICBpZiAoYWxpYXMpIHtcbiAgICAgIHRoaXMua2V5Y2hhaW4gPSBuZXcgS2V5Q2hhaW4odGhpcy5jb3JlLmdldEhSUCgpLCBhbGlhcylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXljaGFpbiA9IG5ldyBLZXlDaGFpbih0aGlzLmNvcmUuZ2V0SFJQKCksIHRoaXMuYmxvY2tjaGFpbklEKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5rZXljaGFpblxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBkZXRlcm1pbmVzIGlmIGEgdHggaXMgYSBnb29zZSBlZ2cgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB1dHggQW4gVW5zaWduZWRUeFxuICAgKlxuICAgKiBAcmV0dXJucyBib29sZWFuIHRydWUgaWYgcGFzc2VzIGdvb3NlIGVnZyB0ZXN0IGFuZCBmYWxzZSBpZiBmYWlscy5cbiAgICpcbiAgICogQHJlbWFya3NcbiAgICogQSBcIkdvb3NlIEVnZyBUcmFuc2FjdGlvblwiIGlzIHdoZW4gdGhlIGZlZSBmYXIgZXhjZWVkcyBhIHJlYXNvbmFibGUgYW1vdW50XG4gICAqL1xuICBjaGVja0dvb3NlRWdnID0gYXN5bmMgKFxuICAgIHV0eDogVW5zaWduZWRUeCxcbiAgICBvdXRUb3RhbDogQk4gPSBaZXJvQk5cbiAgKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgY29uc3QgYXZheEFzc2V0SUQ6IEJ1ZmZlciA9IGF3YWl0IHRoaXMuZ2V0QVZBWEFzc2V0SUQoKVxuICAgIGxldCBvdXRwdXRUb3RhbDogQk4gPSBvdXRUb3RhbC5ndChaZXJvQk4pXG4gICAgICA/IG91dFRvdGFsXG4gICAgICA6IHV0eC5nZXRPdXRwdXRUb3RhbChhdmF4QXNzZXRJRClcbiAgICBjb25zdCBmZWU6IEJOID0gdXR4LmdldEJ1cm4oYXZheEFzc2V0SUQpXG4gICAgaWYgKGZlZS5sdGUoT05FQVZBWC5tdWwobmV3IEJOKDEwKSkpIHx8IGZlZS5sdGUob3V0cHV0VG90YWwpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGFuIGFzc2V0SUQgZm9yIGEgc3VibmV0XCJzIHN0YWtpbmcgYXNzc2V0LlxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZSBzdHJpbmcgd2l0aCBjYjU4IGVuY29kZWQgdmFsdWUgb2YgdGhlIGFzc2V0SUQuXG4gICAqL1xuICBnZXRTdGFraW5nQXNzZXRJRCA9IGFzeW5jICgpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXRTdGFraW5nQXNzZXRJRFwiXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5hc3NldElEXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBibG9ja2NoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIG9mIHRoZSBLZXlzdG9yZSB1c2VyIHRoYXQgY29udHJvbHMgdGhlIG5ldyBhY2NvdW50XG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXIgdGhhdCBjb250cm9scyB0aGUgbmV3IGFjY291bnRcbiAgICogQHBhcmFtIHN1Ym5ldElEIE9wdGlvbmFsLiBFaXRoZXIgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhbiBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIGZvciB0aGUgU3VibmV0SUQgb3IgaXRzIGFsaWFzLlxuICAgKiBAcGFyYW0gdm1JRCBUaGUgSUQgb2YgdGhlIFZpcnR1YWwgTWFjaGluZSB0aGUgYmxvY2tjaGFpbiBydW5zLiBDYW4gYWxzbyBiZSBhbiBhbGlhcyBvZiB0aGUgVmlydHVhbCBNYWNoaW5lLlxuICAgKiBAcGFyYW0gZnhJRHMgVGhlIGlkcyBvZiB0aGUgRlhzIHRoZSBWTSBpcyBydW5uaW5nLlxuICAgKiBAcGFyYW0gbmFtZSBBIGh1bWFuLXJlYWRhYmxlIG5hbWUgZm9yIHRoZSBuZXcgYmxvY2tjaGFpblxuICAgKiBAcGFyYW0gZ2VuZXNpcyBUaGUgYmFzZSA1OCAod2l0aCBjaGVja3N1bSkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdlbmVzaXMgc3RhdGUgb2YgdGhlIG5ldyBibG9ja2NoYWluLiBWaXJ0dWFsIE1hY2hpbmVzIHNob3VsZCBoYXZlIGEgc3RhdGljIEFQSSBtZXRob2QgbmFtZWQgYnVpbGRHZW5lc2lzIHRoYXQgY2FuIGJlIHVzZWQgdG8gZ2VuZXJhdGUgZ2VuZXNpc0RhdGEuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIHRoZSB1bnNpZ25lZCB0cmFuc2FjdGlvbiB0byBjcmVhdGUgdGhpcyBibG9ja2NoYWluLiBNdXN0IGJlIHNpZ25lZCBieSBhIHN1ZmZpY2llbnQgbnVtYmVyIG9mIHRoZSBTdWJuZXTigJlzIGNvbnRyb2wga2V5cyBhbmQgYnkgdGhlIGFjY291bnQgcGF5aW5nIHRoZSB0cmFuc2FjdGlvbiBmZWUuXG4gICAqL1xuICBjcmVhdGVCbG9ja2NoYWluID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgICBzdWJuZXRJRDogQnVmZmVyIHwgc3RyaW5nID0gdW5kZWZpbmVkLFxuICAgIHZtSUQ6IHN0cmluZyxcbiAgICBmeElEczogbnVtYmVyW10sXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGdlbmVzaXM6IHN0cmluZ1xuICApOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogQ3JlYXRlQmxvY2tjaGFpblBhcmFtcyA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBmeElEcyxcbiAgICAgIHZtSUQsXG4gICAgICBuYW1lLFxuICAgICAgZ2VuZXNpc0RhdGE6IGdlbmVzaXNcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzdWJuZXRJRCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgcGFyYW1zLnN1Ym5ldElEID0gc3VibmV0SURcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdWJuZXRJRCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgcGFyYW1zLnN1Ym5ldElEID0gYmludG9vbHMuY2I1OEVuY29kZShzdWJuZXRJRClcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmNyZWF0ZUJsb2NrY2hhaW5cIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRFxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHN0YXR1cyBvZiBhIGJsb2NrY2hhaW4uXG4gICAqXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgVGhlIGJsb2NrY2hhaW5JRCByZXF1ZXN0aW5nIGEgc3RhdHVzIHVwZGF0ZVxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhIHN0cmluZyBvZiBvbmUgb2Y6IFwiVmFsaWRhdGluZ1wiLCBcIkNyZWF0ZWRcIiwgXCJQcmVmZXJyZWRcIiwgXCJVbmtub3duXCIuXG4gICAqL1xuICBnZXRCbG9ja2NoYWluU3RhdHVzID0gYXN5bmMgKGJsb2NrY2hhaW5JRDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIGJsb2NrY2hhaW5JRFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwicGxhdGZvcm0uZ2V0QmxvY2tjaGFpblN0YXR1c1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5zdGF0dXNcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHZhbGlkYXRvcnMgYW5kIHRoZWlyIHdlaWdodHMgb2YgYSBzdWJuZXQgb3IgdGhlIFByaW1hcnkgTmV0d29yayBhdCBhIGdpdmVuIFAtQ2hhaW4gaGVpZ2h0LlxuICAgKlxuICAgKiBAcGFyYW0gaGVpZ2h0IFRoZSBQLUNoYWluIGhlaWdodCB0byBnZXQgdGhlIHZhbGlkYXRvciBzZXQgYXQuXG4gICAqIEBwYXJhbSBzdWJuZXRJRCBPcHRpb25hbC4gQSBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIGZvciB0aGUgU3VibmV0SUQgb3IgaXRzIGFsaWFzLlxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIEdldFZhbGlkYXRvcnNBdFJlc3BvbnNlXG4gICAqL1xuICBnZXRWYWxpZGF0b3JzQXQgPSBhc3luYyAoXG4gICAgaGVpZ2h0OiBudW1iZXIsXG4gICAgc3VibmV0SUQ/OiBzdHJpbmdcbiAgKTogUHJvbWlzZTxHZXRWYWxpZGF0b3JzQXRSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogR2V0VmFsaWRhdG9yc0F0UGFyYW1zID0ge1xuICAgICAgaGVpZ2h0XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3VibmV0SUQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IHN1Ym5ldElEXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXRWYWxpZGF0b3JzQXRcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHRcbiAgfVxuICAvKipcbiAgICogR2V0cyB0aGUgYmxvY2sgYXQgZ2l2ZW4gaGVpZ2h0XG4gICAqIEBwYXJhbSBoZWlnaHQgVGhlIFAtQ2hhaW4gaGVpZ2h0IHRvIGdldCB0aGUgYmxvY2sgYXQuXG4gICAqIEBwYXJhbSBlbmNvZGluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIEdldEJsb2NrUmVzcG9uc2VcbiAgICovXG4gIGdldEJsb2NrQnlIZWlnaHQgPSBhc3luYyAoXG4gICAgaGVpZ2h0OiBudW1iZXIsXG4gICAgZW5jb2Rpbmc6IHN0cmluZ1xuICApOiBQcm9taXNlPEdldEJsb2NrUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IEdldEJsb2NrQnlIZWlnaHRQYXJhbXMgPSB7XG4gICAgICBoZWlnaHQsXG4gICAgICBlbmNvZGluZ1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwicGxhdGZvcm0uZ2V0QmxvY2tCeUhlaWdodFwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGFuIGFkZHJlc3MgaW4gdGhlIG5vZGUncyBrZXlzdG9yZS5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSB1c2VybmFtZSBvZiB0aGUgS2V5c3RvcmUgdXNlciB0aGF0IGNvbnRyb2xzIHRoZSBuZXcgYWNjb3VudFxuICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIG9mIHRoZSBLZXlzdG9yZSB1c2VyIHRoYXQgY29udHJvbHMgdGhlIG5ldyBhY2NvdW50XG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGEgc3RyaW5nIG9mIHRoZSBuZXdseSBjcmVhdGVkIGFjY291bnQgYWRkcmVzcy5cbiAgICovXG4gIGNyZWF0ZUFkZHJlc3MgPSBhc3luYyAoXG4gICAgdXNlcm5hbWU6IHN0cmluZyxcbiAgICBwYXNzd29yZDogc3RyaW5nXG4gICk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBDcmVhdGVBZGRyZXNzUGFyYW1zID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwicGxhdGZvcm0uY3JlYXRlQWRkcmVzc1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5hZGRyZXNzXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgYmFsYW5jZSBvZiBhIHBhcnRpY3VsYXIgYXNzZXQuXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0byBwdWxsIHRoZSBhc3NldCBiYWxhbmNlIGZyb21cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSB3aXRoIHRoZSBiYWxhbmNlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gb24gdGhlIHByb3ZpZGVkIGFkZHJlc3MuXG4gICAqL1xuICBnZXRCYWxhbmNlID0gYXN5bmMgKGFkZHJlc3Nlczogc3RyaW5nW10pOiBQcm9taXNlPEdldEJhbGFuY2VSZXNwb25zZT4gPT4ge1xuICAgIGFkZHJlc3Nlcy5mb3JFYWNoKChhZGRyZXNzKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKGFkZHJlc3MpID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoXG4gICAgICAgICAgXCJFcnJvciAtIFBsYXRmb3JtVk1BUEkuZ2V0QmFsYW5jZTogSW52YWxpZCBhZGRyZXNzIGZvcm1hdFwiXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9KVxuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgYWRkcmVzc2VzXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXRCYWxhbmNlXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG5cbiAgICBjb25zdCByZXN1bHQgPSByZXNwb25zZS5kYXRhLnJlc3VsdFxuXG4gICAgY29uc3QgcGFyc2VEaWN0ID0gKGlucHV0OiBhbnlbXSk6IEJhbGFuY2VEaWN0ID0+IHtcbiAgICAgIGxldCBkaWN0OiBCYWxhbmNlRGljdCA9IHt9XG4gICAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhpbnB1dCkpIGRpY3Rba10gPSBuZXcgQk4odilcbiAgICAgIHJldHVybiBkaWN0IGFzIEJhbGFuY2VEaWN0XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY29yZS5nZXROZXR3b3JrKCkuUC5sb2NrTW9kZUJvbmREZXBvc2l0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBiYWxhbmNlczogcGFyc2VEaWN0KHJlc3VsdC5iYWxhbmNlcyksXG4gICAgICAgIHVubG9ja2VkT3V0cHV0czogcGFyc2VEaWN0KHJlc3VsdC51bmxvY2tlZE91dHB1dHMpLFxuICAgICAgICBib25kZWRPdXRwdXRzOiBwYXJzZURpY3QocmVzdWx0LmJvbmRlZE91dHB1dHMpLFxuICAgICAgICBkZXBvc2l0ZWRPdXRwdXRzOiBwYXJzZURpY3QocmVzdWx0LmRlcG9zaXRlZE91dHB1dHMpLFxuICAgICAgICBib25kZWREZXBvc2l0ZWRPdXRwdXRzOiBwYXJzZURpY3QocmVzdWx0LmJvbmRlZERlcG9zaXRlZE91dHB1dHMpLFxuICAgICAgICB1dHhvSURzOiByZXN1bHQudXR4b0lEc1xuICAgICAgfSBhcyBHZXRCYWxhbmNlUmVzcG9uc2VcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGJhbGFuY2U6IG5ldyBCTihyZXN1bHQuYmFsYW5jZSksXG4gICAgICB1bmxvY2tlZDogbmV3IEJOKHJlc3VsdC51bmxvY2tlZCksXG4gICAgICBsb2NrZWRTdGFrZWFibGU6IG5ldyBCTihyZXN1bHQubG9ja2VkU3Rha2VhYmxlKSxcbiAgICAgIGxvY2tlZE5vdFN0YWtlYWJsZTogbmV3IEJOKHJlc3VsdC5sb2NrZWROb3RTdGFrZWFibGUpLFxuICAgICAgdXR4b0lEczogcmVzdWx0LnV0eG9JRHNcbiAgICB9IGFzIEdldEJhbGFuY2VSZXNwb25zZVxuICB9XG5cbiAgLyoqXG4gICAqIExpc3QgdGhlIGFkZHJlc3NlcyBjb250cm9sbGVkIGJ5IHRoZSB1c2VyLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIG9mIHRoZSBLZXlzdG9yZSB1c2VyXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgYWRkcmVzc2VzLlxuICAgKi9cbiAgbGlzdEFkZHJlc3NlcyA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxzdHJpbmdbXT4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogTGlzdEFkZHJlc3Nlc1BhcmFtcyA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmxpc3RBZGRyZXNzZXNcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuYWRkcmVzc2VzXG4gIH1cblxuICAvKipcbiAgICogTGlzdHMgdGhlIHNldCBvZiBjdXJyZW50IHZhbGlkYXRvcnMuXG4gICAqXG4gICAqIEBwYXJhbSBzdWJuZXRJRCBPcHRpb25hbC4gRWl0aGVyIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb3IgYW5cbiAgICogY2I1OCBzZXJpYWxpemVkIHN0cmluZyBmb3IgdGhlIFN1Ym5ldElEIG9yIGl0cyBhbGlhcy5cbiAgICogQHBhcmFtIG5vZGVJRHMgT3B0aW9uYWwuIEFuIGFycmF5IG9mIHN0cmluZ3NcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgdmFsaWRhdG9ycyB0aGF0IGFyZSBjdXJyZW50bHkgc3Rha2luZywgc2VlOiB7QGxpbmsgaHR0cHM6Ly9kb2NzLmF2YXgubmV0d29yay92MS4wL2VuL2FwaS9wbGF0Zm9ybS8jcGxhdGZvcm1nZXRjdXJyZW50dmFsaWRhdG9yc3xwbGF0Zm9ybS5nZXRDdXJyZW50VmFsaWRhdG9ycyBkb2N1bWVudGF0aW9ufS5cbiAgICpcbiAgICovXG4gIGdldEN1cnJlbnRWYWxpZGF0b3JzID0gYXN5bmMgKFxuICAgIHN1Ym5ldElEOiBCdWZmZXIgfCBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgbm9kZUlEczogc3RyaW5nW10gPSB1bmRlZmluZWRcbiAgKTogUHJvbWlzZTxvYmplY3Q+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IEdldEN1cnJlbnRWYWxpZGF0b3JzUGFyYW1zID0ge31cbiAgICBpZiAodHlwZW9mIHN1Ym5ldElEID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBzdWJuZXRJRFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHN1Ym5ldElEICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBiaW50b29scy5jYjU4RW5jb2RlKHN1Ym5ldElEKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG5vZGVJRHMgIT0gXCJ1bmRlZmluZWRcIiAmJiBub2RlSURzLmxlbmd0aCA+IDApIHtcbiAgICAgIHBhcmFtcy5ub2RlSURzID0gbm9kZUlEc1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwicGxhdGZvcm0uZ2V0Q3VycmVudFZhbGlkYXRvcnNcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHJlcXVlc3QgdGhhdCBpbiBhZGRyZXNzIGZpZWxkIGFjY2VwdHMgZWl0aGVyIGEgbm9kZUlEIChhbmQgcmV0dXJucyBhIGJlY2gzMiBhZGRyZXNzIGlmIGl0IGV4aXN0cyksIG9yIGEgYmVjaDMyIGFkZHJlc3MgKGFuZCByZXR1cm5zIGEgTm9kZUlEIGlmIGl0IGV4aXN0cykuXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzIEEgbm9kZUlEIG9yIGEgYmVjaDMyIGFkZHJlc3NcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBzdHJpbmcgY29udGFpbmluZyBiZWNoMzIgYWRkcmVzcyB0aGF0IGlzIHRoZSBub2RlIG93bmVyIG9yIG5vZGVJRCB0aGF0IHRoZSBhZGRyZXNzIHBhc3NlZCBpcyBhbiBvd25lciBvZi5cbiAgICovXG4gIGdldFJlZ2lzdGVyZWRTaG9ydElETGluayA9IGFzeW5jIChhZGRyZXNzOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIGFkZHJlc3NcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmdldFJlZ2lzdGVyZWRTaG9ydElETGlua1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5hZGRyZXNzXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhY3RpdmUgb3IgaW5hY3RpdmUgZGVwb3NpdCBvZmZlcnMuXG4gICAqXG4gICAqIEBwYXJhbSBhY3RpdmUgQSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0byByZXR1cm4gYWN0aXZlIG9yIGluYWN0aXZlIGRlcG9zaXQgb2ZmZXJzLlxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhIGxpc3QgY29udGFpbmluZyBkZXBvc2l0IG9mZmVycy5cbiAgICovXG4gIGdldEFsbERlcG9zaXRPZmZlcnMgPSBhc3luYyAodGltZXN0YW1wPzogbnVtYmVyKTogUHJvbWlzZTxEZXBvc2l0T2ZmZXJbXT4gPT4ge1xuICAgIGlmICghdGltZXN0YW1wKSB0aW1lc3RhbXAgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxuICAgIGNvbnN0IHBhcmFtczogR2V0QWxsRGVwb3NpdE9mZmVyc1BhcmFtcyA9IHtcbiAgICAgIHRpbWVzdGFtcFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwicGxhdGZvcm0uZ2V0QWxsRGVwb3NpdE9mZmVyc1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuXG4gICAgY29uc3Qgb2ZmZXJzOiBHZXRBbGxEZXBvc2l0T2ZmZXJzUmVzcG9uc2UgPSByZXNwb25zZS5kYXRhLnJlc3VsdFxuICAgIGlmICghb2ZmZXJzLmRlcG9zaXRPZmZlcnMpIHJldHVybiBbXVxuICAgIHJldHVybiBvZmZlcnMuZGVwb3NpdE9mZmVycy5tYXAoKG9mZmVyKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1cGdyYWRlVmVyc2lvbjogb2ZmZXIudXBncmFkZVZlcnNpb24sXG4gICAgICAgIGlkOiBvZmZlci5pZCxcbiAgICAgICAgaW50ZXJlc3RSYXRlTm9taW5hdG9yOiBuZXcgQk4ob2ZmZXIuaW50ZXJlc3RSYXRlTm9taW5hdG9yKSxcbiAgICAgICAgc3RhcnQ6IG5ldyBCTihvZmZlci5zdGFydCksXG4gICAgICAgIGVuZDogbmV3IEJOKG9mZmVyLmVuZCksXG4gICAgICAgIG1pbkFtb3VudDogbmV3IEJOKG9mZmVyLm1pbkFtb3VudCksXG4gICAgICAgIHRvdGFsTWF4QW1vdW50OiBuZXcgQk4ob2ZmZXIudG90YWxNYXhBbW91bnQpLFxuICAgICAgICBkZXBvc2l0ZWRBbW91bnQ6IG5ldyBCTihvZmZlci5kZXBvc2l0ZWRBbW91bnQpLFxuICAgICAgICBtaW5EdXJhdGlvbjogb2ZmZXIubWluRHVyYXRpb24sXG4gICAgICAgIG1heER1cmF0aW9uOiBvZmZlci5tYXhEdXJhdGlvbixcbiAgICAgICAgdW5sb2NrUGVyaW9kRHVyYXRpb246IG9mZmVyLnVubG9ja1BlcmlvZER1cmF0aW9uLFxuICAgICAgICBub1Jld2FyZHNQZXJpb2REdXJhdGlvbjogb2ZmZXIubm9SZXdhcmRzUGVyaW9kRHVyYXRpb24sXG4gICAgICAgIG1lbW86IG9mZmVyLm1lbW8sXG4gICAgICAgIGZsYWdzOiBuZXcgQk4ob2ZmZXIuZmxhZ3MpLFxuICAgICAgICB0b3RhbE1heFJld2FyZEFtb3VudDogbmV3IEJOKG9mZmVyLnRvdGFsTWF4UmV3YXJkQW1vdW50KSxcbiAgICAgICAgcmV3YXJkZWRBbW91bnQ6IG5ldyBCTihvZmZlci5yZXdhcmRlZEFtb3VudCksXG4gICAgICAgIG93bmVyQWRkcmVzczogb2ZmZXIub3duZXJBZGRyZXNzXG4gICAgICB9IGFzIERlcG9zaXRPZmZlclxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBkZXBvc2l0cyBjb3JyZXNwb25kaW5nIHRvIHJlcXVlc3RlZCB0eElEcy5cbiAgICpcbiAgICogQHBhcmFtIGRlcG9zaXRUeElEcyBBIGxpc3Qgb2YgdHhJRHMgKGNiNTgpIHRvIHJlcXVlc3QgZGVwb3NpdHMgZm9yLlxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhIEdldERlcG9zaXRzUmVzcG9uc2Ugb2JqZWN0LlxuICAgKi9cbiAgZ2V0RGVwb3NpdHMgPSBhc3luYyAoXG4gICAgZGVwb3NpdFR4SURzOiBzdHJpbmdbXVxuICApOiBQcm9taXNlPEdldERlcG9zaXRzUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IEdldERlcG9zaXRzUGFyYW1zID0ge1xuICAgICAgZGVwb3NpdFR4SURzXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXREZXBvc2l0c1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuXG4gICAgY29uc3QgZGVwb3NpdHM6IEdldERlcG9zaXRzUmVzcG9uc2UgPSByZXNwb25zZS5kYXRhLnJlc3VsdFxuICAgIGlmICghZGVwb3NpdHMuZGVwb3NpdHMpXG4gICAgICByZXR1cm4geyBkZXBvc2l0czogW10sIGF2YWlsYWJsZVJld2FyZHM6IFtdLCB0aW1lc3RhbXA6IFplcm9CTiB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGRlcG9zaXRzOiBkZXBvc2l0cy5kZXBvc2l0cy5tYXAoKGRlcG9zaXQpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBkZXBvc2l0VHhJRDogZGVwb3NpdC5kZXBvc2l0VHhJRCxcbiAgICAgICAgICBkZXBvc2l0T2ZmZXJJRDogZGVwb3NpdC5kZXBvc2l0T2ZmZXJJRCxcbiAgICAgICAgICB1bmxvY2tlZEFtb3VudDogbmV3IEJOKGRlcG9zaXQudW5sb2NrZWRBbW91bnQpLFxuICAgICAgICAgIHVubG9ja2FibGVBbW91bnQ6IG5ldyBCTihkZXBvc2l0LnVubG9ja2FibGVBbW91bnQpLFxuICAgICAgICAgIGNsYWltZWRSZXdhcmRBbW91bnQ6IG5ldyBCTihkZXBvc2l0LmNsYWltZWRSZXdhcmRBbW91bnQpLFxuICAgICAgICAgIHN0YXJ0OiBuZXcgQk4oZGVwb3NpdC5zdGFydCksXG4gICAgICAgICAgZHVyYXRpb246IGRlcG9zaXQuZHVyYXRpb24sXG4gICAgICAgICAgYW1vdW50OiBuZXcgQk4oZGVwb3NpdC5hbW91bnQpLFxuICAgICAgICAgIHJld2FyZE93bmVyOiB7XG4gICAgICAgICAgICBsb2NrdGltZTogbmV3IEJOKGRlcG9zaXQucmV3YXJkT3duZXIubG9ja3RpbWUpLFxuICAgICAgICAgICAgdGhyZXNob2xkOiBuZXcgQk4oZGVwb3NpdC5yZXdhcmRPd25lci50aHJlc2hvbGQpLnRvTnVtYmVyKCksXG4gICAgICAgICAgICBhZGRyZXNzZXM6IGRlcG9zaXQucmV3YXJkT3duZXIuYWRkcmVzc2VzXG4gICAgICAgICAgfSBhcyBPd25lclxuICAgICAgICB9IGFzIEFQSURlcG9zaXRcbiAgICAgIH0pLFxuICAgICAgYXZhaWxhYmxlUmV3YXJkczogZGVwb3NpdHMuYXZhaWxhYmxlUmV3YXJkcy5tYXAoKGEpID0+IG5ldyBCTihhKSksXG4gICAgICB0aW1lc3RhbXA6IG5ldyBCTihkZXBvc2l0cy50aW1lc3RhbXApXG4gICAgfSBhcyBHZXREZXBvc2l0c1Jlc3BvbnNlXG4gIH1cblxuICAvKipcbiAgICogTGlzdCBhbW91bnRzIHRoYXQgY2FuIGJlIGNsYWltZWQ6IHZhbGlkYXRvciByZXdhcmRzLCBleHBpcmVkIGRlcG9zaXQgcmV3YXJkcyBjbGFpbWFibGUgYXQgY3VycmVudCB0aW1lLlxuICAgKlxuICAgKiBAcGFyYW0gb3duZXJzIFJld2FyZE93bmVyIG9mIERlcG9zaXRUeCBvciBBZGRWYWxpZGF0b3JUeFxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgYW1vdW50cyB0aGF0IGNhbiBiZSBjbGFpbWVkLlxuICAgKi9cbiAgZ2V0Q2xhaW1hYmxlcyA9IGFzeW5jIChcbiAgICBvd25lcnM6IE93bmVyUGFyYW1bXVxuICApOiBQcm9taXNlPEdldENsYWltYWJsZXNSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIE93bmVyczogb3duZXJzXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXRDbGFpbWFibGVzXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgY29uc3QgcmVzdWx0ID0gcmVzcG9uc2UuZGF0YS5yZXN1bHRcblxuICAgIHJldHVybiB7XG4gICAgICBjbGFpbWFibGVzOiByZXN1bHQuY2xhaW1hYmxlcy5tYXAoKGM6IGFueSkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJld2FyZE93bmVyOiBjLnJld2FyZE93bmVyXG4gICAgICAgICAgICA/ICh7XG4gICAgICAgICAgICAgICAgbG9ja3RpbWU6IG5ldyBCTihjLnJld2FyZE93bmVyLmxvY2t0aW1lKSxcbiAgICAgICAgICAgICAgICB0aHJlc2hvbGQ6IG5ldyBCTihjLnJld2FyZE93bmVyLnRocmVzaG9sZCkudG9OdW1iZXIoKSxcbiAgICAgICAgICAgICAgICBhZGRyZXNzZXM6IGMucmV3YXJkT3duZXIuYWRkcmVzc2VzXG4gICAgICAgICAgICAgIH0gYXMgT3duZXIpXG4gICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB2YWxpZGF0b3JSZXdhcmRzOiBuZXcgQk4oYy52YWxpZGF0b3JSZXdhcmRzKSxcbiAgICAgICAgICBleHBpcmVkRGVwb3NpdFJld2FyZHM6IG5ldyBCTihjLmV4cGlyZWREZXBvc2l0UmV3YXJkcylcbiAgICAgICAgfSBhcyBDbGFpbWFibGVcbiAgICAgIH0pXG4gICAgfSBhcyBHZXRDbGFpbWFibGVzUmVzcG9uc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0cyB0aGUgc2V0IG9mIHBlbmRpbmcgdmFsaWRhdG9ycy5cbiAgICpcbiAgICogQHBhcmFtIHN1Ym5ldElEIE9wdGlvbmFsLiBFaXRoZXIgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiBvciBhIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgZm9yIHRoZSBTdWJuZXRJRCBvciBpdHMgYWxpYXMuXG4gICAqIEBwYXJhbSBub2RlSURzIE9wdGlvbmFsLiBBbiBhcnJheSBvZiBzdHJpbmdzXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIHZhbGlkYXRvcnMgdGhhdCBhcmUgcGVuZGluZyBzdGFraW5nLCBzZWU6IHtAbGluayBodHRwczovL2RvY3MuYXZheC5uZXR3b3JrL3YxLjAvZW4vYXBpL3BsYXRmb3JtLyNwbGF0Zm9ybWdldHBlbmRpbmd2YWxpZGF0b3JzfHBsYXRmb3JtLmdldFBlbmRpbmdWYWxpZGF0b3JzIGRvY3VtZW50YXRpb259LlxuICAgKlxuICAgKi9cbiAgZ2V0UGVuZGluZ1ZhbGlkYXRvcnMgPSBhc3luYyAoXG4gICAgc3VibmV0SUQ6IEJ1ZmZlciB8IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICBub2RlSURzOiBzdHJpbmdbXSA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPG9iamVjdD4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogR2V0UGVuZGluZ1ZhbGlkYXRvcnNQYXJhbXMgPSB7fVxuICAgIGlmICh0eXBlb2Ygc3VibmV0SUQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IHN1Ym5ldElEXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3VibmV0SUQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoc3VibmV0SUQpXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygbm9kZUlEcyAhPSBcInVuZGVmaW5lZFwiICYmIG5vZGVJRHMubGVuZ3RoID4gMCkge1xuICAgICAgcGFyYW1zLm5vZGVJRHMgPSBub2RlSURzXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmdldFBlbmRpbmdWYWxpZGF0b3JzXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHBoYXNlcy5cbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2Ugb2YgYSBVcGdyYWRlUGhhc2VzUmVwbHkuXG4gICAqL1xuICBnZXRVcGdyYWRlUGhhc2VzID0gYXN5bmMgKCk6IFByb21pc2U8VXBncmFkZVBoYXNlc1JlcGx5PiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmdldFVwZ3JhZGVQaGFzZXNcIlxuICAgIClcbiAgICByZXR1cm4ge1xuICAgICAgU3VucmlzZVBoYXNlOiBwYXJzZUludChyZXNwb25zZS5kYXRhLnJlc3VsdD8uc3VucmlzZVBoYXNlKSxcbiAgICAgIEF0aGVuc1BoYXNlOiBwYXJzZUludChyZXNwb25zZS5kYXRhLnJlc3VsdD8uYXRoZW5zUGhhc2UpLFxuICAgICAgQmVybGluUGhhc2U6IHBhcnNlSW50KHJlc3BvbnNlLmRhdGEucmVzdWx0Py5iZXJsaW5QaGFzZSksXG4gICAgICBDYWlyb1BoYXNlOiBwYXJzZUludChyZXNwb25zZS5kYXRhLnJlc3VsdD8uY2Fpcm9QaGFzZSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2FtcGxlcyBgU2l6ZWAgdmFsaWRhdG9ycyBmcm9tIHRoZSBjdXJyZW50IHZhbGlkYXRvciBzZXQuXG4gICAqXG4gICAqIEBwYXJhbSBzYW1wbGVTaXplIE9mIHRoZSB0b3RhbCB1bml2ZXJzZSBvZiB2YWxpZGF0b3JzLCBzZWxlY3QgdGhpcyBtYW55IGF0IHJhbmRvbVxuICAgKiBAcGFyYW0gc3VibmV0SUQgT3B0aW9uYWwuIEVpdGhlciBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGFuXG4gICAqIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgZm9yIHRoZSBTdWJuZXRJRCBvciBpdHMgYWxpYXMuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIHZhbGlkYXRvclwicyBzdGFraW5nSURzLlxuICAgKi9cbiAgc2FtcGxlVmFsaWRhdG9ycyA9IGFzeW5jIChcbiAgICBzYW1wbGVTaXplOiBudW1iZXIsXG4gICAgc3VibmV0SUQ6IEJ1ZmZlciB8IHN0cmluZyA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPHN0cmluZ1tdPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBTYW1wbGVWYWxpZGF0b3JzUGFyYW1zID0ge1xuICAgICAgc2l6ZTogc2FtcGxlU2l6ZS50b1N0cmluZygpXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3VibmV0SUQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IHN1Ym5ldElEXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3VibmV0SUQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoc3VibmV0SUQpXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5zYW1wbGVWYWxpZGF0b3JzXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnZhbGlkYXRvcnNcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSB2YWxpZGF0b3IgdG8gdGhlIFByaW1hcnkgTmV0d29yay5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSB1c2VybmFtZSBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIG9mIHRoZSBLZXlzdG9yZSB1c2VyXG4gICAqIEBwYXJhbSBub2RlSUQgVGhlIG5vZGUgSUQgb2YgdGhlIHZhbGlkYXRvclxuICAgKiBAcGFyYW0gc3RhcnRUaW1lIEphdmFzY3JpcHQgRGF0ZSBvYmplY3QgZm9yIHRoZSBzdGFydCB0aW1lIHRvIHZhbGlkYXRlXG4gICAqIEBwYXJhbSBlbmRUaW1lIEphdmFzY3JpcHQgRGF0ZSBvYmplY3QgZm9yIHRoZSBlbmQgdGltZSB0byB2YWxpZGF0ZVxuICAgKiBAcGFyYW0gc3Rha2VBbW91bnQgVGhlIGFtb3VudCBvZiBuQVZBWCB0aGUgdmFsaWRhdG9yIGlzIHN0YWtpbmcgYXNcbiAgICogYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gcmV3YXJkQWRkcmVzcyBUaGUgYWRkcmVzcyB0aGUgdmFsaWRhdG9yIHJld2FyZCB3aWxsIGdvIHRvLCBpZiB0aGVyZSBpcyBvbmUuXG4gICAqIEBwYXJhbSBkZWxlZ2F0aW9uRmVlUmF0ZSBPcHRpb25hbC4gQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIHBlcmNlbnQgZmVlIHRoaXMgdmFsaWRhdG9yXG4gICAqIGNoYXJnZXMgd2hlbiBvdGhlcnMgZGVsZWdhdGUgc3Rha2UgdG8gdGhlbS4gVXAgdG8gNCBkZWNpbWFsIHBsYWNlcyBhbGxvd2VkIGFkZGl0aW9uYWwgZGVjaW1hbCBwbGFjZXMgYXJlIGlnbm9yZWQuXG4gICAqIE11c3QgYmUgYmV0d2VlbiAwIGFuZCAxMDAsIGluY2x1c2l2ZS4gRm9yIGV4YW1wbGUsIGlmIGRlbGVnYXRpb25GZWVSYXRlIGlzIDEuMjM0NSBhbmQgc29tZW9uZSBkZWxlZ2F0ZXMgdG8gdGhpc1xuICAgKiB2YWxpZGF0b3IsIHRoZW4gd2hlbiB0aGUgZGVsZWdhdGlvbiBwZXJpb2QgaXMgb3ZlciwgMS4yMzQ1JSBvZiB0aGUgcmV3YXJkIGdvZXMgdG8gdGhlIHZhbGlkYXRvciBhbmQgdGhlIHJlc3QgZ29lc1xuICAgKiB0byB0aGUgZGVsZWdhdG9yLlxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhIGJhc2U1OCBzdHJpbmcgb2YgdGhlIHVuc2lnbmVkIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgYWRkVmFsaWRhdG9yID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgICBub2RlSUQ6IHN0cmluZyxcbiAgICBzdGFydFRpbWU6IERhdGUsXG4gICAgZW5kVGltZTogRGF0ZSxcbiAgICBzdGFrZUFtb3VudDogQk4sXG4gICAgcmV3YXJkQWRkcmVzczogc3RyaW5nLFxuICAgIGRlbGVnYXRpb25GZWVSYXRlOiBCTiA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogQWRkVmFsaWRhdG9yUGFyYW1zID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIG5vZGVJRCxcbiAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lLmdldFRpbWUoKSAvIDEwMDAsXG4gICAgICBlbmRUaW1lOiBlbmRUaW1lLmdldFRpbWUoKSAvIDEwMDAsXG4gICAgICBzdGFrZUFtb3VudDogc3Rha2VBbW91bnQudG9TdHJpbmcoMTApLFxuICAgICAgcmV3YXJkQWRkcmVzc1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGRlbGVnYXRpb25GZWVSYXRlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBwYXJhbXMuZGVsZWdhdGlvbkZlZVJhdGUgPSBkZWxlZ2F0aW9uRmVlUmF0ZS50b1N0cmluZygxMClcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmFkZFZhbGlkYXRvclwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC50eElEXG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgdmFsaWRhdG9yIHRvIGEgU3VibmV0IG90aGVyIHRoYW4gdGhlIFByaW1hcnkgTmV0d29yay4gVGhlIHZhbGlkYXRvciBtdXN0IHZhbGlkYXRlIHRoZSBQcmltYXJ5IE5ldHdvcmsgZm9yIHRoZSBlbnRpcmUgZHVyYXRpb24gdGhleSB2YWxpZGF0ZSB0aGlzIFN1Ym5ldC5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSB1c2VybmFtZSBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIG9mIHRoZSBLZXlzdG9yZSB1c2VyXG4gICAqIEBwYXJhbSBub2RlSUQgVGhlIG5vZGUgSUQgb2YgdGhlIHZhbGlkYXRvclxuICAgKiBAcGFyYW0gc3VibmV0SUQgRWl0aGVyIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb3IgYSBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIGZvciB0aGUgU3VibmV0SUQgb3IgaXRzIGFsaWFzLlxuICAgKiBAcGFyYW0gc3RhcnRUaW1lIEphdmFzY3JpcHQgRGF0ZSBvYmplY3QgZm9yIHRoZSBzdGFydCB0aW1lIHRvIHZhbGlkYXRlXG4gICAqIEBwYXJhbSBlbmRUaW1lIEphdmFzY3JpcHQgRGF0ZSBvYmplY3QgZm9yIHRoZSBlbmQgdGltZSB0byB2YWxpZGF0ZVxuICAgKiBAcGFyYW0gd2VpZ2h0IFRoZSB2YWxpZGF0b3LigJlzIHdlaWdodCB1c2VkIGZvciBzYW1wbGluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciB0aGUgdW5zaWduZWQgdHJhbnNhY3Rpb24uIEl0IG11c3QgYmUgc2lnbmVkICh1c2luZyBzaWduKSBieSB0aGUgcHJvcGVyIG51bWJlciBvZiB0aGUgU3VibmV04oCZcyBjb250cm9sIGtleXMgYW5kIGJ5IHRoZSBrZXkgb2YgdGhlIGFjY291bnQgcGF5aW5nIHRoZSB0cmFuc2FjdGlvbiBmZWUgYmVmb3JlIGl0IGNhbiBiZSBpc3N1ZWQuXG4gICAqL1xuICBhZGRTdWJuZXRWYWxpZGF0b3IgPSBhc3luYyAoXG4gICAgdXNlcm5hbWU6IHN0cmluZyxcbiAgICBwYXNzd29yZDogc3RyaW5nLFxuICAgIG5vZGVJRDogc3RyaW5nLFxuICAgIHN1Ym5ldElEOiBCdWZmZXIgfCBzdHJpbmcsXG4gICAgc3RhcnRUaW1lOiBEYXRlLFxuICAgIGVuZFRpbWU6IERhdGUsXG4gICAgd2VpZ2h0OiBudW1iZXJcbiAgKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBub2RlSUQsXG4gICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZS5nZXRUaW1lKCkgLyAxMDAwLFxuICAgICAgZW5kVGltZTogZW5kVGltZS5nZXRUaW1lKCkgLyAxMDAwLFxuICAgICAgd2VpZ2h0XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3VibmV0SUQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IHN1Ym5ldElEXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3VibmV0SUQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoc3VibmV0SUQpXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5hZGRTdWJuZXRWYWxpZGF0b3JcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRFxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGRlbGVnYXRvciB0byB0aGUgUHJpbWFyeSBOZXR3b3JrLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIG9mIHRoZSBLZXlzdG9yZSB1c2VyXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgZGVsZWdhdGVlXG4gICAqIEBwYXJhbSBzdGFydFRpbWUgSmF2YXNjcmlwdCBEYXRlIG9iamVjdCBmb3Igd2hlbiB0aGUgZGVsZWdhdG9yIHN0YXJ0cyBkZWxlZ2F0aW5nXG4gICAqIEBwYXJhbSBlbmRUaW1lIEphdmFzY3JpcHQgRGF0ZSBvYmplY3QgZm9yIHdoZW4gdGhlIGRlbGVnYXRvciBzdGFydHMgZGVsZWdhdGluZ1xuICAgKiBAcGFyYW0gc3Rha2VBbW91bnQgVGhlIGFtb3VudCBvZiBuQVZBWCB0aGUgZGVsZWdhdG9yIGlzIHN0YWtpbmcgYXNcbiAgICogYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gcmV3YXJkQWRkcmVzcyBUaGUgYWRkcmVzcyBvZiB0aGUgYWNjb3VudCB0aGUgc3Rha2VkIEFWQVggYW5kIHZhbGlkYXRpb24gcmV3YXJkXG4gICAqIChpZiBhcHBsaWNhYmxlKSBhcmUgc2VudCB0byBhdCBlbmRUaW1lXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIHZhbGlkYXRvclwicyBzdGFraW5nSURzLlxuICAgKi9cbiAgYWRkRGVsZWdhdG9yID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgICBub2RlSUQ6IHN0cmluZyxcbiAgICBzdGFydFRpbWU6IERhdGUsXG4gICAgZW5kVGltZTogRGF0ZSxcbiAgICBzdGFrZUFtb3VudDogQk4sXG4gICAgcmV3YXJkQWRkcmVzczogc3RyaW5nXG4gICk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBBZGREZWxlZ2F0b3JQYXJhbXMgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgbm9kZUlELFxuICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWUuZ2V0VGltZSgpIC8gMTAwMCxcbiAgICAgIGVuZFRpbWU6IGVuZFRpbWUuZ2V0VGltZSgpIC8gMTAwMCxcbiAgICAgIHN0YWtlQW1vdW50OiBzdGFrZUFtb3VudC50b1N0cmluZygxMCksXG4gICAgICByZXdhcmRBZGRyZXNzXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5hZGREZWxlZ2F0b3JcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRFxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiB0byBjcmVhdGUgYSBuZXcgU3VibmV0LiBUaGUgdW5zaWduZWQgdHJhbnNhY3Rpb24gbXVzdCBiZVxuICAgKiBzaWduZWQgd2l0aCB0aGUga2V5IG9mIHRoZSBhY2NvdW50IHBheWluZyB0aGUgdHJhbnNhY3Rpb24gZmVlLiBUaGUgU3VibmV04oCZcyBJRCBpcyB0aGUgSUQgb2YgdGhlIHRyYW5zYWN0aW9uIHRoYXQgY3JlYXRlcyBpdCAoaWUgdGhlIHJlc3BvbnNlIGZyb20gaXNzdWVUeCB3aGVuIGlzc3VpbmcgdGhlIHNpZ25lZCB0cmFuc2FjdGlvbikuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlcm5hbWUgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gY29udHJvbEtleXMgQXJyYXkgb2YgcGxhdGZvcm0gYWRkcmVzc2VzIGFzIHN0cmluZ3NcbiAgICogQHBhcmFtIHRocmVzaG9sZCBUbyBhZGQgYSB2YWxpZGF0b3IgdG8gdGhpcyBTdWJuZXQsIGEgdHJhbnNhY3Rpb24gbXVzdCBoYXZlIHRocmVzaG9sZFxuICAgKiBzaWduYXR1cmVzLCB3aGVyZSBlYWNoIHNpZ25hdHVyZSBpcyBmcm9tIGEga2V5IHdob3NlIGFkZHJlc3MgaXMgYW4gZWxlbWVudCBvZiBgY29udHJvbEtleXNgXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGEgc3RyaW5nIHdpdGggdGhlIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGVuY29kZWQgYXMgYmFzZTU4LlxuICAgKi9cbiAgY3JlYXRlU3VibmV0ID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgICBjb250cm9sS2V5czogc3RyaW5nW10sXG4gICAgdGhyZXNob2xkOiBudW1iZXJcbiAgKTogUHJvbWlzZTxzdHJpbmcgfCBFcnJvclJlc3BvbnNlT2JqZWN0PiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBDcmVhdGVTdWJuZXRQYXJhbXMgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgY29udHJvbEtleXMsXG4gICAgICB0aHJlc2hvbGRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmNyZWF0ZVN1Ym5ldFwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC50eElEXG4gICAgICA/IHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgICAgIDogcmVzcG9uc2UuZGF0YS5yZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIFN1Ym5ldCB0aGF0IHZhbGlkYXRlcyBhIGdpdmVuIGJsb2NrY2hhaW4uXG4gICAqXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgRWl0aGVyIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb3IgYSBjYjU4XG4gICAqIGVuY29kZWQgc3RyaW5nIGZvciB0aGUgYmxvY2tjaGFpbklEIG9yIGl0cyBhbGlhcy5cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBzdHJpbmcgb2YgdGhlIHN1Ym5ldElEIHRoYXQgdmFsaWRhdGVzIHRoZSBibG9ja2NoYWluLlxuICAgKi9cbiAgdmFsaWRhdGVkQnkgPSBhc3luYyAoYmxvY2tjaGFpbklEOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgYmxvY2tjaGFpbklEXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS52YWxpZGF0ZWRCeVwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5zdWJuZXRJRFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgSURzIG9mIHRoZSBibG9ja2NoYWlucyBhIFN1Ym5ldCB2YWxpZGF0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBzdWJuZXRJRCBFaXRoZXIgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhbiBBVkFYXG4gICAqIHNlcmlhbGl6ZWQgc3RyaW5nIGZvciB0aGUgU3VibmV0SUQgb3IgaXRzIGFsaWFzLlxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhbiBhcnJheSBvZiBibG9ja2NoYWluSURzIHRoZSBzdWJuZXQgdmFsaWRhdGVzLlxuICAgKi9cbiAgdmFsaWRhdGVzID0gYXN5bmMgKHN1Ym5ldElEOiBCdWZmZXIgfCBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICBzdWJuZXRJRFxuICAgIH1cbiAgICBpZiAodHlwZW9mIHN1Ym5ldElEID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBzdWJuZXRJRFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHN1Ym5ldElEICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBiaW50b29scy5jYjU4RW5jb2RlKHN1Ym5ldElEKVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwicGxhdGZvcm0udmFsaWRhdGVzXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LmJsb2NrY2hhaW5JRHNcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRoZSBibG9ja2NoYWlucyB0aGF0IGV4aXN0IChleGNsdWRpbmcgdGhlIFAtQ2hhaW4pLlxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhbiBhcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgZmllbGRzIFwiaWRcIiwgXCJzdWJuZXRJRFwiLCBhbmQgXCJ2bUlEXCIuXG4gICAqL1xuICBnZXRCbG9ja2NoYWlucyA9IGFzeW5jICgpOiBQcm9taXNlPEJsb2NrY2hhaW5bXT4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXRCbG9ja2NoYWluc1wiXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5ibG9ja2NoYWluc1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgQVZBWCBmcm9tIGFuIGFjY291bnQgb24gdGhlIFAtQ2hhaW4gdG8gYW4gYWRkcmVzcyBvbiB0aGUgWC1DaGFpbi4gVGhpcyB0cmFuc2FjdGlvblxuICAgKiBtdXN0IGJlIHNpZ25lZCB3aXRoIHRoZSBrZXkgb2YgdGhlIGFjY291bnQgdGhhdCB0aGUgQVZBWCBpcyBzZW50IGZyb20gYW5kIHdoaWNoIHBheXMgdGhlXG4gICAqIHRyYW5zYWN0aW9uIGZlZS4gQWZ0ZXIgaXNzdWluZyB0aGlzIHRyYW5zYWN0aW9uLCB5b3UgbXVzdCBjYWxsIHRoZSBYLUNoYWlu4oCZcyBpbXBvcnRBVkFYXG4gICAqIG1ldGhvZCB0byBjb21wbGV0ZSB0aGUgdHJhbnNmZXIuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgS2V5c3RvcmUgdXNlciB0aGF0IGNvbnRyb2xzIHRoZSBhY2NvdW50IHNwZWNpZmllZCBpbiBgdG9gXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIHRvIFRoZSBhZGRyZXNzIG9uIHRoZSBYLUNoYWluIHRvIHNlbmQgdGhlIEFWQVggdG8uIERvIG5vdCBpbmNsdWRlIFgtIGluIHRoZSBhZGRyZXNzXG4gICAqIEBwYXJhbSBhbW91bnQgQW1vdW50IG9mIEFWQVggdG8gZXhwb3J0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gdG8gYmUgc2lnbmVkIGJ5IHRoZSBhY2NvdW50IHRoZSB0aGUgQVZBWCBpc1xuICAgKiBzZW50IGZyb20gYW5kIHBheXMgdGhlIHRyYW5zYWN0aW9uIGZlZS5cbiAgICovXG4gIGV4cG9ydEFWQVggPSBhc3luYyAoXG4gICAgdXNlcm5hbWU6IHN0cmluZyxcbiAgICBwYXNzd29yZDogc3RyaW5nLFxuICAgIGFtb3VudDogQk4sXG4gICAgdG86IHN0cmluZ1xuICApOiBQcm9taXNlPHN0cmluZyB8IEVycm9yUmVzcG9uc2VPYmplY3Q+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IEV4cG9ydEFWQVhQYXJhbXMgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgdG8sXG4gICAgICBhbW91bnQ6IGFtb3VudC50b1N0cmluZygxMClcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmV4cG9ydEFWQVhcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRFxuICAgICAgPyByZXNwb25zZS5kYXRhLnJlc3VsdC50eElEXG4gICAgICA6IHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBBVkFYIGZyb20gYW4gYWNjb3VudCBvbiB0aGUgUC1DaGFpbiB0byBhbiBhZGRyZXNzIG9uIHRoZSBYLUNoYWluLiBUaGlzIHRyYW5zYWN0aW9uXG4gICAqIG11c3QgYmUgc2lnbmVkIHdpdGggdGhlIGtleSBvZiB0aGUgYWNjb3VudCB0aGF0IHRoZSBBVkFYIGlzIHNlbnQgZnJvbSBhbmQgd2hpY2ggcGF5c1xuICAgKiB0aGUgdHJhbnNhY3Rpb24gZmVlLiBBZnRlciBpc3N1aW5nIHRoaXMgdHJhbnNhY3Rpb24sIHlvdSBtdXN0IGNhbGwgdGhlIFgtQ2hhaW7igJlzXG4gICAqIGltcG9ydEFWQVggbWV0aG9kIHRvIGNvbXBsZXRlIHRoZSB0cmFuc2Zlci5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSBLZXlzdG9yZSB1c2VyIHRoYXQgY29udHJvbHMgdGhlIGFjY291bnQgc3BlY2lmaWVkIGluIGB0b2BcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gdG8gVGhlIElEIG9mIHRoZSBhY2NvdW50IHRoZSBBVkFYIGlzIHNlbnQgdG8uIFRoaXMgbXVzdCBiZSB0aGUgc2FtZSBhcyB0aGUgdG9cbiAgICogYXJndW1lbnQgaW4gdGhlIGNvcnJlc3BvbmRpbmcgY2FsbCB0byB0aGUgWC1DaGFpbuKAmXMgZXhwb3J0QVZBWFxuICAgKiBAcGFyYW0gc291cmNlQ2hhaW4gVGhlIGNoYWluSUQgd2hlcmUgdGhlIGZ1bmRzIGFyZSBjb21pbmcgZnJvbS5cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBzdHJpbmcgZm9yIHRoZSB0cmFuc2FjdGlvbiwgd2hpY2ggc2hvdWxkIGJlIHNlbnQgdG8gdGhlIG5ldHdvcmtcbiAgICogYnkgY2FsbGluZyBpc3N1ZVR4LlxuICAgKi9cbiAgaW1wb3J0QVZBWCA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgdG86IHN0cmluZyxcbiAgICBzb3VyY2VDaGFpbjogc3RyaW5nXG4gICk6IFByb21pc2U8c3RyaW5nIHwgRXJyb3JSZXNwb25zZU9iamVjdD4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogSW1wb3J0QVZBWFBhcmFtcyA9IHtcbiAgICAgIHRvLFxuICAgICAgc291cmNlQ2hhaW4sXG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5pbXBvcnRBVkFYXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgICAgID8gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRFxuICAgICAgOiByZXNwb25zZS5kYXRhLnJlc3VsdFxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIHRoZSBub2RlJ3MgaXNzdWVUeCBtZXRob2QgZnJvbSB0aGUgQVBJIGFuZCByZXR1cm5zIHRoZSByZXN1bHRpbmcgdHJhbnNhY3Rpb24gSUQgYXMgYSBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB0eCBBIHN0cmluZywge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0sIG9yIFtbVHhdXSByZXByZXNlbnRpbmcgYSB0cmFuc2FjdGlvblxuICAgKlxuICAgKiBAcmV0dXJucyBBIFByb21pc2Ugc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb24gSUQgb2YgdGhlIHBvc3RlZCB0cmFuc2FjdGlvbi5cbiAgICovXG4gIGlzc3VlVHggPSBhc3luYyAodHg6IHN0cmluZyB8IEJ1ZmZlciB8IFR4KTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBsZXQgVHJhbnNhY3Rpb24gPSBcIlwiXG4gICAgaWYgKHR5cGVvZiB0eCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgVHJhbnNhY3Rpb24gPSB0eFxuICAgIH0gZWxzZSBpZiAodHggaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIGNvbnN0IHR4b2JqOiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eG9iai5mcm9tQnVmZmVyKHR4KVxuICAgICAgVHJhbnNhY3Rpb24gPSB0eG9iai50b1N0cmluZ0hleCgpXG4gICAgfSBlbHNlIGlmICh0eCBpbnN0YW5jZW9mIFR4KSB7XG4gICAgICBUcmFuc2FjdGlvbiA9IHR4LnRvU3RyaW5nSGV4KClcbiAgICB9IGVsc2Uge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBUcmFuc2FjdGlvbkVycm9yKFxuICAgICAgICBcIkVycm9yIC0gcGxhdGZvcm0uaXNzdWVUeDogcHJvdmlkZWQgdHggaXMgbm90IGV4cGVjdGVkIHR5cGUgb2Ygc3RyaW5nLCBCdWZmZXIsIG9yIFR4XCJcbiAgICAgIClcbiAgICB9XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICB0eDogVHJhbnNhY3Rpb24udG9TdHJpbmcoKSxcbiAgICAgIGVuY29kaW5nOiBcImhleFwiXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5pc3N1ZVR4XCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIHVwcGVyIGJvdW5kIG9uIHRoZSBhbW91bnQgb2YgdG9rZW5zIHRoYXQgZXhpc3QgYWxvbmcgd2l0aCB0aGUgUC1jaGFpbiBoZWlnaHQuIE5vdCBtb25vdG9uaWNhbGx5IGluY3JlYXNpbmcgYmVjYXVzZSB0aGlzIG51bWJlciBjYW4gZ28gZG93biBpZiBhIHN0YWtlclwicyByZXdhcmQgaXMgZGVuaWVkLlxuICAgKi9cbiAgZ2V0Q3VycmVudFN1cHBseSA9IGFzeW5jICgpOiBQcm9taXNlPEdldEN1cnJlbnRTdXBwbHlSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXRDdXJyZW50U3VwcGx5XCJcbiAgICApXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1cHBseTogbmV3IEJOKHJlc3BvbnNlLmRhdGEucmVzdWx0LnN1cHBseSwgMTApLFxuICAgICAgaGVpZ2h0OiBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQuaGVpZ2h0LCAxMClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSBwbGF0Zm9ybSBjaGFpbi5cbiAgICovXG4gIGdldEhlaWdodCA9IGFzeW5jICgpOiBQcm9taXNlPEJOPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmdldEhlaWdodFwiXG4gICAgKVxuICAgIHJldHVybiBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQuaGVpZ2h0LCAxMClcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtaW5pbXVtIHN0YWtpbmcgYW1vdW50LlxuICAgKlxuICAgKiBAcGFyYW0gcmVmcmVzaCBBIGJvb2xlYW4gdG8gYnlwYXNzIHRoZSBsb2NhbCBjYWNoZWQgdmFsdWUgb2YgTWluaW11bSBTdGFrZSBBbW91bnQsIHBvbGxpbmcgdGhlIG5vZGUgaW5zdGVhZC5cbiAgICovXG4gIGdldE1pblN0YWtlID0gYXN5bmMgKFxuICAgIHJlZnJlc2g6IGJvb2xlYW4gPSBmYWxzZVxuICApOiBQcm9taXNlPEdldE1pblN0YWtlUmVzcG9uc2U+ID0+IHtcbiAgICBpZiAoXG4gICAgICByZWZyZXNoICE9PSB0cnVlICYmXG4gICAgICB0eXBlb2YgdGhpcy5taW5WYWxpZGF0b3JTdGFrZSAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgdHlwZW9mIHRoaXMubWluRGVsZWdhdG9yU3Rha2UgIT09IFwidW5kZWZpbmVkXCJcbiAgICApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1pblZhbGlkYXRvclN0YWtlOiB0aGlzLm1pblZhbGlkYXRvclN0YWtlLFxuICAgICAgICBtaW5EZWxlZ2F0b3JTdGFrZTogdGhpcy5taW5EZWxlZ2F0b3JTdGFrZVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwicGxhdGZvcm0uZ2V0TWluU3Rha2VcIlxuICAgIClcbiAgICB0aGlzLm1pblZhbGlkYXRvclN0YWtlID0gbmV3IEJOKHJlc3BvbnNlLmRhdGEucmVzdWx0Lm1pblZhbGlkYXRvclN0YWtlLCAxMClcbiAgICB0aGlzLm1pbkRlbGVnYXRvclN0YWtlID0gbmV3IEJOKHJlc3BvbnNlLmRhdGEucmVzdWx0Lm1pbkRlbGVnYXRvclN0YWtlLCAxMClcbiAgICByZXR1cm4ge1xuICAgICAgbWluVmFsaWRhdG9yU3Rha2U6IHRoaXMubWluVmFsaWRhdG9yU3Rha2UsXG4gICAgICBtaW5EZWxlZ2F0b3JTdGFrZTogdGhpcy5taW5EZWxlZ2F0b3JTdGFrZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRUb3RhbFN0YWtlKCkgcmV0dXJucyB0aGUgdG90YWwgYW1vdW50IHN0YWtlZCBvbiB0aGUgUHJpbWFyeSBOZXR3b3JrXG4gICAqXG4gICAqIEByZXR1cm5zIEEgYmlnIG51bWJlciByZXByZXNlbnRpbmcgdG90YWwgc3Rha2VkIGJ5IHZhbGlkYXRvcnMgb24gdGhlIHByaW1hcnkgbmV0d29ya1xuICAgKi9cbiAgZ2V0VG90YWxTdGFrZSA9IGFzeW5jICgpOiBQcm9taXNlPEJOPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmdldFRvdGFsU3Rha2VcIlxuICAgIClcbiAgICByZXR1cm4gbmV3IEJOKHJlc3BvbnNlLmRhdGEucmVzdWx0LnN0YWtlLCAxMClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRNYXhTdGFrZUFtb3VudCgpIHJldHVybnMgdGhlIG1heGltdW0gYW1vdW50IG9mIG5BVkFYIHN0YWtpbmcgdG8gdGhlIG5hbWVkIG5vZGUgZHVyaW5nIHRoZSB0aW1lIHBlcmlvZC5cbiAgICpcbiAgICogQHBhcmFtIHN1Ym5ldElEIEEgQnVmZmVyIG9yIGNiNTggc3RyaW5nIHJlcHJlc2VudGluZyBzdWJuZXRcbiAgICogQHBhcmFtIG5vZGVJRCBBIHN0cmluZyByZXByZXNlbnRpbmcgSUQgb2YgdGhlIG5vZGUgd2hvc2Ugc3Rha2UgYW1vdW50IGlzIHJlcXVpcmVkIGR1cmluZyB0aGUgZ2l2ZW4gZHVyYXRpb25cbiAgICogQHBhcmFtIHN0YXJ0VGltZSBBIGJpZyBudW1iZXIgZGVub3Rpbmcgc3RhcnQgdGltZSBvZiB0aGUgZHVyYXRpb24gZHVyaW5nIHdoaWNoIHN0YWtlIGFtb3VudCBvZiB0aGUgbm9kZSBpcyByZXF1aXJlZC5cbiAgICogQHBhcmFtIGVuZFRpbWUgQSBiaWcgbnVtYmVyIGRlbm90aW5nIGVuZCB0aW1lIG9mIHRoZSBkdXJhdGlvbiBkdXJpbmcgd2hpY2ggc3Rha2UgYW1vdW50IG9mIHRoZSBub2RlIGlzIHJlcXVpcmVkLlxuICAgKiBAcmV0dXJucyBBIGJpZyBudW1iZXIgcmVwcmVzZW50aW5nIHRvdGFsIHN0YWtlZCBieSB2YWxpZGF0b3JzIG9uIHRoZSBwcmltYXJ5IG5ldHdvcmtcbiAgICovXG4gIGdldE1heFN0YWtlQW1vdW50ID0gYXN5bmMgKFxuICAgIHN1Ym5ldElEOiBzdHJpbmcgfCBCdWZmZXIsXG4gICAgbm9kZUlEOiBzdHJpbmcsXG4gICAgc3RhcnRUaW1lOiBCTixcbiAgICBlbmRUaW1lOiBCTlxuICApOiBQcm9taXNlPEJOPiA9PiB7XG4gICAgY29uc3Qgbm93OiBCTiA9IFVuaXhOb3coKVxuICAgIGlmIChzdGFydFRpbWUuZ3Qobm93KSB8fCBlbmRUaW1lLmx0ZShzdGFydFRpbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVGltZUVycm9yKFxuICAgICAgICBcIlBsYXRmb3JtVk1BUEkuZ2V0TWF4U3Rha2VBbW91bnQgLS0gc3RhcnRUaW1lIG11c3QgYmUgaW4gdGhlIHBhc3QgYW5kIGVuZFRpbWUgbXVzdCBjb21lIGFmdGVyIHN0YXJ0VGltZVwiXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgcGFyYW1zOiBHZXRNYXhTdGFrZUFtb3VudFBhcmFtcyA9IHtcbiAgICAgIG5vZGVJRDogbm9kZUlELFxuICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWUudG9TdHJpbmcoMTApLFxuICAgICAgZW5kVGltZTogZW5kVGltZS50b1N0cmluZygxMClcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHN1Ym5ldElEID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBzdWJuZXRJRFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHN1Ym5ldElEICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBiaW50b29scy5jYjU4RW5jb2RlKHN1Ym5ldElEKVxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXRNYXhTdGFrZUFtb3VudFwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQuYW1vdW50LCAxMClcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBtaW5pbXVtIHN0YWtlIGNhY2hlZCBpbiB0aGlzIGNsYXNzLlxuICAgKiBAcGFyYW0gbWluVmFsaWRhdG9yU3Rha2UgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSB0byBzZXQgdGhlIG1pbmltdW0gc3Rha2UgYW1vdW50IGNhY2hlZCBpbiB0aGlzIGNsYXNzLlxuICAgKiBAcGFyYW0gbWluRGVsZWdhdG9yU3Rha2UgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSB0byBzZXQgdGhlIG1pbmltdW0gZGVsZWdhdGlvbiBhbW91bnQgY2FjaGVkIGluIHRoaXMgY2xhc3MuXG4gICAqL1xuICBzZXRNaW5TdGFrZSA9IChcbiAgICBtaW5WYWxpZGF0b3JTdGFrZTogQk4gPSB1bmRlZmluZWQsXG4gICAgbWluRGVsZWdhdG9yU3Rha2U6IEJOID0gdW5kZWZpbmVkXG4gICk6IHZvaWQgPT4ge1xuICAgIGlmICh0eXBlb2YgbWluVmFsaWRhdG9yU3Rha2UgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMubWluVmFsaWRhdG9yU3Rha2UgPSBtaW5WYWxpZGF0b3JTdGFrZVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG1pbkRlbGVnYXRvclN0YWtlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLm1pbkRlbGVnYXRvclN0YWtlID0gbWluRGVsZWdhdG9yU3Rha2VcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdG90YWwgYW1vdW50IHN0YWtlZCBmb3IgYW4gYXJyYXkgb2YgYWRkcmVzc2VzLlxuICAgKi9cbiAgZ2V0U3Rha2UgPSBhc3luYyAoXG4gICAgYWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBlbmNvZGluZzogc3RyaW5nID0gXCJoZXhcIlxuICApOiBQcm9taXNlPEdldFN0YWtlUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IEdldFN0YWtlUGFyYW1zID0ge1xuICAgICAgYWRkcmVzc2VzLFxuICAgICAgZW5jb2RpbmdcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmdldFN0YWtlXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YWtlZDogbmV3IEJOKHJlc3BvbnNlLmRhdGEucmVzdWx0LnN0YWtlZCwgMTApLFxuICAgICAgc3Rha2VkT3V0cHV0czogcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3Rha2VkT3V0cHV0cy5tYXAoXG4gICAgICAgIChzdGFrZWRPdXRwdXQ6IHN0cmluZyk6IFRyYW5zZmVyYWJsZU91dHB1dCA9PiB7XG4gICAgICAgICAgY29uc3QgdHJhbnNmZXJhYmxlT3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPVxuICAgICAgICAgICAgbmV3IFRyYW5zZmVyYWJsZU91dHB1dCgpXG4gICAgICAgICAgbGV0IGJ1ZjogQnVmZmVyXG4gICAgICAgICAgaWYgKGVuY29kaW5nID09PSBcImNiNThcIikge1xuICAgICAgICAgICAgYnVmID0gYmludG9vbHMuY2I1OERlY29kZShzdGFrZWRPdXRwdXQpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1ZiA9IEJ1ZmZlci5mcm9tKHN0YWtlZE91dHB1dC5yZXBsYWNlKC8weC9nLCBcIlwiKSwgXCJoZXhcIilcbiAgICAgICAgICB9XG4gICAgICAgICAgdHJhbnNmZXJhYmxlT3V0cHV0LmZyb21CdWZmZXIoYnVmLCAyKVxuICAgICAgICAgIHJldHVybiB0cmFuc2ZlcmFibGVPdXRwdXRcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRoZSBzdWJuZXRzIHRoYXQgZXhpc3QuXG4gICAqXG4gICAqIEBwYXJhbSBpZHMgSURzIG9mIHRoZSBzdWJuZXRzIHRvIHJldHJpZXZlIGluZm9ybWF0aW9uIGFib3V0LiBJZiBvbWl0dGVkLCBnZXRzIGFsbCBzdWJuZXRzXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBmaWVsZHMgXCJpZFwiLFxuICAgKiBcImNvbnRyb2xLZXlzXCIsIGFuZCBcInRocmVzaG9sZFwiLlxuICAgKi9cbiAgZ2V0U3VibmV0cyA9IGFzeW5jIChpZHM6IHN0cmluZ1tdID0gdW5kZWZpbmVkKTogUHJvbWlzZTxTdWJuZXRbXT4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge31cbiAgICBpZiAodHlwZW9mIGlkcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXJhbXMuaWRzID0gaWRzXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXRTdWJuZXRzXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnN1Ym5ldHNcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvcnRzIHRoZSBwcml2YXRlIGtleSBmb3IgYW4gYWRkcmVzcy5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSBuYW1lIG9mIHRoZSB1c2VyIHdpdGggdGhlIHByaXZhdGUga2V5XG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgdXNlZCB0byBkZWNyeXB0IHRoZSBwcml2YXRlIGtleVxuICAgKiBAcGFyYW0gYWRkcmVzcyBUaGUgYWRkcmVzcyB3aG9zZSBwcml2YXRlIGtleSBzaG91bGQgYmUgZXhwb3J0ZWRcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSB3aXRoIHRoZSBkZWNyeXB0ZWQgcHJpdmF0ZSBrZXkgYXMgc3RvcmUgaW4gdGhlIGRhdGFiYXNlXG4gICAqL1xuICBleHBvcnRLZXkgPSBhc3luYyAoXG4gICAgdXNlcm5hbWU6IHN0cmluZyxcbiAgICBwYXNzd29yZDogc3RyaW5nLFxuICAgIGFkZHJlc3M6IHN0cmluZ1xuICApOiBQcm9taXNlPHN0cmluZyB8IEVycm9yUmVzcG9uc2VPYmplY3Q+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IEV4cG9ydEtleVBhcmFtcyA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBhZGRyZXNzXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5leHBvcnRLZXlcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQucHJpdmF0ZUtleVxuICAgICAgPyByZXNwb25zZS5kYXRhLnJlc3VsdC5wcml2YXRlS2V5XG4gICAgICA6IHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogR2l2ZSBhIHVzZXIgY29udHJvbCBvdmVyIGFuIGFkZHJlc3MgYnkgcHJvdmlkaW5nIHRoZSBwcml2YXRlIGtleSB0aGF0IGNvbnRyb2xzIHRoZSBhZGRyZXNzLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIG5hbWUgb2YgdGhlIHVzZXIgdG8gc3RvcmUgdGhlIHByaXZhdGUga2V5XG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgdGhhdCB1bmxvY2tzIHRoZSB1c2VyXG4gICAqIEBwYXJhbSBwcml2YXRlS2V5IEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgcHJpdmF0ZSBrZXkgaW4gdGhlIHZtXCJzIGZvcm1hdFxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgYWRkcmVzcyBmb3IgdGhlIGltcG9ydGVkIHByaXZhdGUga2V5LlxuICAgKi9cbiAgaW1wb3J0S2V5ID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgICBwcml2YXRlS2V5OiBzdHJpbmdcbiAgKTogUHJvbWlzZTxzdHJpbmcgfCBFcnJvclJlc3BvbnNlT2JqZWN0PiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBJbXBvcnRLZXlQYXJhbXMgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcHJpdmF0ZUtleVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwicGxhdGZvcm0uaW1wb3J0S2V5XCIsXG4gICAgICBwYXJhbXNcbiAgICApXG5cbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuYWRkcmVzc1xuICAgICAgPyByZXNwb25zZS5kYXRhLnJlc3VsdC5hZGRyZXNzXG4gICAgICA6IHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdHJlYW5zYWN0aW9uIGRhdGEgb2YgYSBwcm92aWRlZCB0cmFuc2FjdGlvbiBJRCBieSBjYWxsaW5nIHRoZSBub2RlJ3MgYGdldFR4YCBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSB0eElEIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRyYW5zYWN0aW9uIElEXG4gICAqIEBwYXJhbSBlbmNvZGluZyBzZXRzIHRoZSBmb3JtYXQgb2YgdGhlIHJldHVybmVkIHRyYW5zYWN0aW9uLiBDYW4gYmUsIFwiY2I1OFwiLCBcImhleFwiIG9yIFwianNvblwiLiBEZWZhdWx0cyB0byBcImNiNThcIi5cbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2Ugc3RyaW5nIG9yIG9iamVjdCBjb250YWluaW5nIHRoZSBieXRlcyByZXRyaWV2ZWQgZnJvbSB0aGUgbm9kZVxuICAgKi9cbiAgZ2V0VHggPSBhc3luYyAoXG4gICAgdHhJRDogc3RyaW5nLFxuICAgIGVuY29kaW5nOiBzdHJpbmcgPSBcImhleFwiXG4gICk6IFByb21pc2U8c3RyaW5nIHwgb2JqZWN0PiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICB0eElELFxuICAgICAgZW5jb2RpbmdcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmdldFR4XCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4XG4gICAgICA/IHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4XG4gICAgICA6IHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3RhdHVzIG9mIGEgcHJvdmlkZWQgdHJhbnNhY3Rpb24gSUQgYnkgY2FsbGluZyB0aGUgbm9kZSdzIGBnZXRUeFN0YXR1c2AgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0gdHhpZCBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0cmFuc2FjdGlvbiBJRFxuICAgKiBAcGFyYW0gaW5jbHVkZVJlYXNvbiBSZXR1cm4gdGhlIHJlYXNvbiB0eCB3YXMgZHJvcHBlZCwgaWYgYXBwbGljYWJsZS4gRGVmYXVsdHMgdG8gdHJ1ZVxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZSBzdHJpbmcgY29udGFpbmluZyB0aGUgc3RhdHVzIHJldHJpZXZlZCBmcm9tIHRoZSBub2RlIGFuZCB0aGUgcmVhc29uIGEgdHggd2FzIGRyb3BwZWQsIGlmIGFwcGxpY2FibGUuXG4gICAqL1xuICBnZXRUeFN0YXR1cyA9IGFzeW5jIChcbiAgICB0eGlkOiBzdHJpbmcsXG4gICAgaW5jbHVkZVJlYXNvbjogYm9vbGVhbiA9IHRydWVcbiAgKTogUHJvbWlzZTxzdHJpbmcgfCBHZXRUeFN0YXR1c1Jlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBHZXRUeFN0YXR1c1BhcmFtcyA9IHtcbiAgICAgIHR4SUQ6IHR4aWQsXG4gICAgICBpbmNsdWRlUmVhc29uOiBpbmNsdWRlUmVhc29uXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXRUeFN0YXR1c1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgVVRYT3MgcmVsYXRlZCB0byB0aGUgYWRkcmVzc2VzIHByb3ZpZGVkIGZyb20gdGhlIG5vZGUncyBgZ2V0VVRYT3NgIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMgY2I1OCBzdHJpbmdzIG9yIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfXNcbiAgICogQHBhcmFtIHNvdXJjZUNoYWluIEEgc3RyaW5nIGZvciB0aGUgY2hhaW4gdG8gbG9vayBmb3IgdGhlIFVUWE9cInMuIERlZmF1bHQgaXMgdG8gdXNlIHRoaXMgY2hhaW4sIGJ1dCBpZiBleHBvcnRlZCBVVFhPcyBleGlzdCBmcm9tIG90aGVyIGNoYWlucywgdGhpcyBjYW4gdXNlZCB0byBwdWxsIHRoZW0gaW5zdGVhZC5cbiAgICogQHBhcmFtIGxpbWl0IE9wdGlvbmFsLiBSZXR1cm5zIGF0IG1vc3QgW2xpbWl0XSBhZGRyZXNzZXMuIElmIFtsaW1pdF0gPT0gMCBvciA+IFttYXhVVFhPc1RvRmV0Y2hdLCBmZXRjaGVzIHVwIHRvIFttYXhVVFhPc1RvRmV0Y2hdLlxuICAgKiBAcGFyYW0gc3RhcnRJbmRleCBPcHRpb25hbC4gW1N0YXJ0SW5kZXhdIGRlZmluZXMgd2hlcmUgdG8gc3RhcnQgZmV0Y2hpbmcgVVRYT3MgKGZvciBwYWdpbmF0aW9uLilcbiAgICogVVRYT3MgZmV0Y2hlZCBhcmUgZnJvbSBhZGRyZXNzZXMgZXF1YWwgdG8gb3IgZ3JlYXRlciB0aGFuIFtTdGFydEluZGV4LkFkZHJlc3NdXG4gICAqIEZvciBhZGRyZXNzIFtTdGFydEluZGV4LkFkZHJlc3NdLCBvbmx5IFVUWE9zIHdpdGggSURzIGdyZWF0ZXIgdGhhbiBbU3RhcnRJbmRleC5VdHhvXSB3aWxsIGJlIHJldHVybmVkLlxuICAgKiBAcGFyYW0gcGVyc2lzdE9wdHMgT3B0aW9ucyBhdmFpbGFibGUgdG8gcGVyc2lzdCB0aGVzZSBVVFhPcyBpbiBsb2NhbCBzdG9yYWdlXG4gICAqIEBwYXJhbSBlbmNvZGluZyBPcHRpb25hbC4gIGlzIHRoZSBlbmNvZGluZyBmb3JtYXQgdG8gdXNlIGZvciB0aGUgcGF5bG9hZCBhcmd1bWVudC4gQ2FuIGJlIGVpdGhlciBcImNiNThcIiBvciBcImhleFwiLiBEZWZhdWx0cyB0byBcImhleFwiLlxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiBwZXJzaXN0T3B0cyBpcyBvcHRpb25hbCBhbmQgbXVzdCBiZSBvZiB0eXBlIFtbUGVyc2lzdGFuY2VPcHRpb25zXV1cbiAgICpcbiAgICovXG4gIGdldFVUWE9zID0gYXN5bmMgKFxuICAgIGFkZHJlc3Nlczogc3RyaW5nW10gfCBzdHJpbmcsXG4gICAgc291cmNlQ2hhaW46IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICBsaW1pdDogbnVtYmVyID0gMCxcbiAgICBzdGFydEluZGV4OiB7IGFkZHJlc3M6IHN0cmluZzsgdXR4bzogc3RyaW5nIH0gPSB1bmRlZmluZWQsXG4gICAgcGVyc2lzdE9wdHM6IFBlcnNpc3RhbmNlT3B0aW9ucyA9IHVuZGVmaW5lZCxcbiAgICBlbmNvZGluZzogc3RyaW5nID0gXCJoZXhcIlxuICApOiBQcm9taXNlPEdldFVUWE9zUmVzcG9uc2U+ID0+IHtcbiAgICBpZiAodHlwZW9mIGFkZHJlc3NlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgYWRkcmVzc2VzID0gW2FkZHJlc3Nlc11cbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbXM6IEdldFVUWE9zUGFyYW1zID0ge1xuICAgICAgYWRkcmVzc2VzOiBhZGRyZXNzZXMsXG4gICAgICBsaW1pdCxcbiAgICAgIGVuY29kaW5nXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3RhcnRJbmRleCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBzdGFydEluZGV4KSB7XG4gICAgICBwYXJhbXMuc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXhcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNvdXJjZUNoYWluICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBwYXJhbXMuc291cmNlQ2hhaW4gPSBzb3VyY2VDaGFpblxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXRVVFhPc1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuXG4gICAgY29uc3QgdXR4b3M6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgbGV0IGRhdGEgPSByZXNwb25zZS5kYXRhLnJlc3VsdC51dHhvc1xuICAgIGlmIChwZXJzaXN0T3B0cyAmJiB0eXBlb2YgcGVyc2lzdE9wdHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGlmICh0aGlzLmRiLmhhcyhwZXJzaXN0T3B0cy5nZXROYW1lKCkpKSB7XG4gICAgICAgIGNvbnN0IHNlbGZBcnJheTogc3RyaW5nW10gPSB0aGlzLmRiLmdldChwZXJzaXN0T3B0cy5nZXROYW1lKCkpXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNlbGZBcnJheSkpIHtcbiAgICAgICAgICB1dHhvcy5hZGRBcnJheShkYXRhKVxuICAgICAgICAgIGNvbnN0IHNlbGY6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgICAgICAgc2VsZi5hZGRBcnJheShzZWxmQXJyYXkpXG4gICAgICAgICAgc2VsZi5tZXJnZUJ5UnVsZSh1dHhvcywgcGVyc2lzdE9wdHMuZ2V0TWVyZ2VSdWxlKCkpXG4gICAgICAgICAgZGF0YSA9IHNlbGYuZ2V0QWxsVVRYT1N0cmluZ3MoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmRiLnNldChwZXJzaXN0T3B0cy5nZXROYW1lKCksIGRhdGEsIHBlcnNpc3RPcHRzLmdldE92ZXJ3cml0ZSgpKVxuICAgIH1cblxuICAgIGlmIChkYXRhLmxlbmd0aCA+IDAgJiYgZGF0YVswXS5zdWJzdHJpbmcoMCwgMikgPT09IFwiMHhcIikge1xuICAgICAgY29uc3QgY2I1OFN0cnM6IHN0cmluZ1tdID0gW11cbiAgICAgIGRhdGEuZm9yRWFjaCgoc3RyOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgICAgY2I1OFN0cnMucHVzaChiaW50b29scy5jYjU4RW5jb2RlKEJ1ZmZlci5mcm9tKHN0ci5zbGljZSgyKSwgXCJoZXhcIikpKVxuICAgICAgfSlcblxuICAgICAgdXR4b3MuYWRkQXJyYXkoY2I1OFN0cnMsIGZhbHNlKVxuICAgIH0gZWxzZSB7XG4gICAgICB1dHhvcy5hZGRBcnJheShkYXRhLCBmYWxzZSlcbiAgICB9XG4gICAgcmVzcG9uc2UuZGF0YS5yZXN1bHQudXR4b3MgPSB1dHhvc1xuICAgIHJlc3BvbnNlLmRhdGEucmVzdWx0Lm51bUZldGNoZWQgPSBwYXJzZUludChyZXNwb25zZS5kYXRhLnJlc3VsdC5udW1GZXRjaGVkKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdFxuICB9XG5cbiAgLyoqXG4gICAqIGdldEFkZHJlc3NTdGF0ZXMoKSByZXR1cm5zIGFuIDY0IGJpdCBiaXRtYXNrIG9mIHN0YXRlcyBhcHBsaWVkIHRvIGFkZHJlc3NcbiAgICpcbiAgICogQHJldHVybnMgQSBiaWcgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgc3RhdGVzIGFwcGxpZWQgdG8gZ2l2ZW4gYWRkcmVzc1xuICAgKi9cbiAgZ2V0QWRkcmVzc1N0YXRlcyA9IGFzeW5jIChhZGRyZXNzOiBzdHJpbmcpOiBQcm9taXNlPEJOPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBBZGRyZXNzUGFyYW1zID0ge1xuICAgICAgYWRkcmVzczogYWRkcmVzc1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwicGxhdGZvcm0uZ2V0QWRkcmVzc1N0YXRlc1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQsIDEwKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldE11bHRpc2lnQWxpYXMoKSByZXR1cm5zIGEgTXVsdGlzaWdBbGlhc1JlcGx5XG4gICAqXG4gICAqIEByZXR1cm5zIEEgTXVsdGlTaWdBbGlhc1xuICAgKi9cbiAgZ2V0TXVsdGlzaWdBbGlhcyA9IGFzeW5jIChhZGRyZXNzOiBzdHJpbmcpOiBQcm9taXNlPE11bHRpc2lnQWxpYXNSZXBseT4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogQWRkcmVzc1BhcmFtcyA9IHtcbiAgICAgIGFkZHJlc3M6IGFkZHJlc3NcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmdldE11bHRpc2lnQWxpYXNcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4ge1xuICAgICAgbWVtbzogcmVzcG9uc2UuZGF0YS5yZXN1bHQubWVtbyxcbiAgICAgIGxvY2t0aW1lOiBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQubG9ja3RpbWUpLFxuICAgICAgdGhyZXNob2xkOiBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQudGhyZXNob2xkKS50b051bWJlcigpLFxuICAgICAgYWRkcmVzc2VzOiByZXNwb25zZS5kYXRhLnJlc3VsdC5hZGRyZXNzZXNcbiAgICB9IGFzIE11bHRpc2lnQWxpYXNSZXBseVxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBjcmVhdGVzIGFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uLiBGb3IgbW9yZSBncmFudWxhciBjb250cm9sLCB5b3UgbWF5IGNyZWF0ZSB5b3VyIG93blxuICAgKiBbW1Vuc2lnbmVkVHhdXSBtYW51YWxseSAod2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMsIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zLCBhbmQgW1tUcmFuc2Zlck9wZXJhdGlvbl1dcykuXG4gICAqXG4gICAqIEBwYXJhbSB1dHhvc2V0IEEgc2V0IG9mIFVUWE9zIHRoYXQgdGhlIHRyYW5zYWN0aW9uIGlzIGJ1aWx0IG9uXG4gICAqIEBwYXJhbSBhbW91bnQgVGhlIGFtb3VudCBvZiBBc3NldElEIHRvIGJlIHNwZW50IGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59LlxuICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0byBzZW5kIHRoZSBmdW5kc1xuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3MgcHJvdmlkZWRcbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIENCNTggQnVmZmVyIG9yIFN0cmluZyB3aGljaCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICAgKiBAcGFyYW0gdG9UaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqIEBwYXJhbSBjaGFuZ2VUaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBjaGFuZ2UgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiAoW1tVbnNpZ25lZFR4XV0pIHdoaWNoIGNvbnRhaW5zIGEgW1tCYXNlVHhdXS5cbiAgICpcbiAgICogQHJlbWFya3NcbiAgICogVGhpcyBoZWxwZXIgZXhpc3RzIGJlY2F1c2UgdGhlIGVuZHBvaW50IEFQSSBzaG91bGQgYmUgdGhlIHByaW1hcnkgcG9pbnQgb2YgZW50cnkgZm9yIG1vc3QgZnVuY3Rpb25hbGl0eS5cbiAgICovXG4gIGJ1aWxkQmFzZVR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgYW1vdW50OiBCTixcbiAgICB0b0FkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgZnJvbUFkZHJlc3NlczogRnJvbVR5cGUsXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMCksXG4gICAgdG9UaHJlc2hvbGQ6IG51bWJlciA9IDEsXG4gICAgY2hhbmdlVGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICk6IFByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IGNhbGxlcjogc3RyaW5nID0gXCJidWlsZEJhc2VUeFwiXG4gICAgY29uc3QgdG86IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIodG9BZGRyZXNzZXMsIGNhbGxlcilcbiAgICBjb25zdCBmcm9tU2lnbmVyID0gdGhpcy5fcGFyc2VGcm9tU2lnbmVyKGZyb21BZGRyZXNzZXMsIGNhbGxlcilcbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIoXG4gICAgICBjaGFuZ2VBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApXG5cbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKClcbiAgICBjb25zdCBibG9ja2NoYWluSURCdWY6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpXG4gICAgY29uc3QgZmVlOiBCTiA9IHRoaXMuZ2V0VHhGZWUoKVxuICAgIGNvbnN0IGZlZUFzc2V0SUQ6IEJ1ZmZlciA9IGF3YWl0IHRoaXMuZ2V0QVZBWEFzc2V0SUQoKVxuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gYXdhaXQgdGhpcy5fZ2V0QnVpbGRlcihcbiAgICAgIHV0eG9zZXRcbiAgICApLmJ1aWxkQmFzZVR4KFxuICAgICAgbmV0d29ya0lELFxuICAgICAgYmxvY2tjaGFpbklEQnVmLFxuICAgICAgYW1vdW50LFxuICAgICAgZmVlQXNzZXRJRCxcbiAgICAgIHRvLFxuICAgICAgZnJvbVNpZ25lcixcbiAgICAgIGNoYW5nZSxcbiAgICAgIGZlZSxcbiAgICAgIGZlZUFzc2V0SUQsXG4gICAgICBtZW1vLFxuICAgICAgYXNPZixcbiAgICAgIGxvY2t0aW1lLFxuICAgICAgdG9UaHJlc2hvbGQsXG4gICAgICBjaGFuZ2VUaHJlc2hvbGRcbiAgICApXG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBuZXcgR29vc2VFZ2dDaGVja0Vycm9yKFwiRmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKVxuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhbiB1bnNpZ25lZCBJbXBvcnQgVHguIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICAqIFtbVW5zaWduZWRUeF1dIG1hbnVhbGx5ICh3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcywgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXMsIGFuZCBbW1RyYW5zZmVyT3BlcmF0aW9uXV1zKS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIG93bmVyQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBpbXBvcnRcbiAgICogQHBhcmFtIHNvdXJjZUNoYWluIFRoZSBjaGFpbmlkIGZvciB3aGVyZSB0aGUgaW1wb3J0IGlzIGNvbWluZyBmcm9tLlxuICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0byBzZW5kIHRoZSBmdW5kc1xuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3MgcHJvdmlkZWRcbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAqIEBwYXJhbSB0b1RocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IFVUWE9cbiAgICogQHBhcmFtIGNoYW5nZVRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IGNoYW5nZSBVVFhPXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIChbW1Vuc2lnbmVkVHhdXSkgd2hpY2ggY29udGFpbnMgYSBbW0ltcG9ydFR4XV0uXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIFRoaXMgaGVscGVyIGV4aXN0cyBiZWNhdXNlIHRoZSBlbmRwb2ludCBBUEkgc2hvdWxkIGJlIHRoZSBwcmltYXJ5IHBvaW50IG9mIGVudHJ5IGZvciBtb3N0IGZ1bmN0aW9uYWxpdHkuXG4gICAqL1xuICBidWlsZEltcG9ydFR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgb3duZXJBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIHNvdXJjZUNoYWluOiBCdWZmZXIgfCBzdHJpbmcsXG4gICAgdG9BZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIGZyb21BZGRyZXNzZXM6IEZyb21UeXBlLFxuICAgIGNoYW5nZUFkZHJlc3Nlczogc3RyaW5nW10gPSB1bmRlZmluZWQsXG4gICAgbWVtbzogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBaZXJvQk4sXG4gICAgbG9ja3RpbWU6IEJOID0gWmVyb0JOLFxuICAgIHRvVGhyZXNob2xkOiBudW1iZXIgPSAxLFxuICAgIGNoYW5nZVRocmVzaG9sZDogbnVtYmVyID0gMVxuICApOiBQcm9taXNlPFVuc2lnbmVkVHg+ID0+IHtcbiAgICBjb25zdCBjYWxsZXIgPSBcImJ1aWxkQWRkVmFsaWRhdG9yVHhcIlxuXG4gICAgY29uc3QgdG86IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIodG9BZGRyZXNzZXMsIGNhbGxlcilcblxuICAgIGNvbnN0IGZyb21TaWduZXIgPSB0aGlzLl9wYXJzZUZyb21TaWduZXIoZnJvbUFkZHJlc3NlcywgY2FsbGVyKVxuXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5QnVmZmVyKFxuICAgICAgY2hhbmdlQWRkcmVzc2VzLFxuICAgICAgY2FsbGVyXG4gICAgKVxuXG4gICAgbGV0IHNyY0NoYWluOiBzdHJpbmcgPSB1bmRlZmluZWRcblxuICAgIGlmICh0eXBlb2Ygc291cmNlQ2hhaW4gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLmJ1aWxkSW1wb3J0VHg6IFNvdXJjZSBDaGFpbklEIGlzIHVuZGVmaW5lZC5cIlxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNvdXJjZUNoYWluID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBzcmNDaGFpbiA9IHNvdXJjZUNoYWluXG4gICAgICBzb3VyY2VDaGFpbiA9IGJpbnRvb2xzLmNiNThEZWNvZGUoc291cmNlQ2hhaW4pXG4gICAgfSBlbHNlIGlmICghKHNvdXJjZUNoYWluIGluc3RhbmNlb2YgQnVmZmVyKSkge1xuICAgICAgdGhyb3cgbmV3IENoYWluSWRFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIFBsYXRmb3JtVk1BUEkuYnVpbGRJbXBvcnRUeDogSW52YWxpZCBkZXN0aW5hdGlvbkNoYWluIHR5cGU6IFwiICtcbiAgICAgICAgICB0eXBlb2Ygc291cmNlQ2hhaW5cbiAgICAgIClcbiAgICB9XG4gICAgY29uc3QgYXRvbWljVVRYT3M6IFVUWE9TZXQgPSBhd2FpdCAoXG4gICAgICBhd2FpdCB0aGlzLmdldFVUWE9zKG93bmVyQWRkcmVzc2VzLCBzcmNDaGFpbiwgMCwgdW5kZWZpbmVkKVxuICAgICkudXR4b3NcbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG5cbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBjb25zdCBhdG9taWNzOiBVVFhPW10gPSBhdG9taWNVVFhPcy5nZXRBbGxVVFhPcygpXG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBhd2FpdCB0aGlzLl9nZXRCdWlsZGVyKFxuICAgICAgdXR4b3NldFxuICAgICkuYnVpbGRJbXBvcnRUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSxcbiAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpLFxuICAgICAgdG8sXG4gICAgICBmcm9tU2lnbmVyLFxuICAgICAgY2hhbmdlLFxuICAgICAgYXRvbWljcyxcbiAgICAgIHNvdXJjZUNoYWluLFxuICAgICAgdGhpcy5nZXRUeEZlZSgpLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLFxuICAgICAgYXNPZixcbiAgICAgIGxvY2t0aW1lLFxuICAgICAgdG9UaHJlc2hvbGQsXG4gICAgICBjaGFuZ2VUaHJlc2hvbGRcbiAgICApXG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgR29vc2VFZ2dDaGVja0Vycm9yKFwiRmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKVxuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhbiB1bnNpZ25lZCBFeHBvcnQgVHguIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICAqIFtbVW5zaWduZWRUeF1dIG1hbnVhbGx5ICh3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcywgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXMsIGFuZCBbW1RyYW5zZmVyT3BlcmF0aW9uXV1zKS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIGFtb3VudCBUaGUgYW1vdW50IGJlaW5nIGV4cG9ydGVkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGRlc3RpbmF0aW9uQ2hhaW4gVGhlIGNoYWluaWQgZm9yIHdoZXJlIHRoZSBhc3NldHMgd2lsbCBiZSBzZW50LlxuICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0byBzZW5kIHRoZSBmdW5kc1xuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3MgcHJvdmlkZWRcbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAqIEBwYXJhbSB0b1RocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IFVUWE9cbiAgICogQHBhcmFtIGNoYW5nZVRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IGNoYW5nZSBVVFhPXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIChbW1Vuc2lnbmVkVHhdXSkgd2hpY2ggY29udGFpbnMgYW4gW1tFeHBvcnRUeF1dLlxuICAgKi9cbiAgYnVpbGRFeHBvcnRUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIGFtb3VudDogQk4sXG4gICAgZGVzdGluYXRpb25DaGFpbjogQnVmZmVyIHwgc3RyaW5nLFxuICAgIHRvQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBmcm9tQWRkcmVzc2VzOiBGcm9tVHlwZSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IHN0cmluZ1tdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gWmVyb0JOLFxuICAgIGxvY2t0aW1lOiBCTiA9IFplcm9CTixcbiAgICB0b1RocmVzaG9sZDogbnVtYmVyID0gMSxcbiAgICBjaGFuZ2VUaHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyID0gXCJidWlsZEV4cG9ydFR4XCJcblxuICAgIGxldCBwcmVmaXhlczogb2JqZWN0ID0ge31cbiAgICB0b0FkZHJlc3Nlcy5tYXAoKGE6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgcHJlZml4ZXNbYS5zcGxpdChcIi1cIilbMF1dID0gdHJ1ZVxuICAgIH0pXG4gICAgaWYgKE9iamVjdC5rZXlzKHByZWZpeGVzKS5sZW5ndGggIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLmJ1aWxkRXhwb3J0VHg6IFRvIGFkZHJlc3NlcyBtdXN0IGhhdmUgdGhlIHNhbWUgY2hhaW5JRCBwcmVmaXguXCJcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRlc3RpbmF0aW9uQ2hhaW4gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLmJ1aWxkRXhwb3J0VHg6IERlc3RpbmF0aW9uIENoYWluSUQgaXMgdW5kZWZpbmVkLlwiXG4gICAgICApXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVzdGluYXRpb25DaGFpbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgZGVzdGluYXRpb25DaGFpbiA9IGJpbnRvb2xzLmNiNThEZWNvZGUoZGVzdGluYXRpb25DaGFpbikgLy9cbiAgICB9IGVsc2UgaWYgKCEoZGVzdGluYXRpb25DaGFpbiBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLmJ1aWxkRXhwb3J0VHg6IEludmFsaWQgZGVzdGluYXRpb25DaGFpbiB0eXBlOiBcIiArXG4gICAgICAgICAgdHlwZW9mIGRlc3RpbmF0aW9uQ2hhaW5cbiAgICAgIClcbiAgICB9XG4gICAgaWYgKGRlc3RpbmF0aW9uQ2hhaW4ubGVuZ3RoICE9PSAzMikge1xuICAgICAgdGhyb3cgbmV3IENoYWluSWRFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIFBsYXRmb3JtVk1BUEkuYnVpbGRFeHBvcnRUeDogRGVzdGluYXRpb24gQ2hhaW5JRCBtdXN0IGJlIDMyIGJ5dGVzIGluIGxlbmd0aC5cIlxuICAgICAgKVxuICAgIH1cblxuICAgIGxldCB0bzogQnVmZmVyW10gPSBbXVxuICAgIHRvQWRkcmVzc2VzLm1hcCgoYTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICB0by5wdXNoKGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICB9KVxuXG4gICAgY29uc3QgZnJvbVNpZ25lciA9IHRoaXMuX3BhcnNlRnJvbVNpZ25lcihmcm9tQWRkcmVzc2VzLCBjYWxsZXIpXG5cbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIoXG4gICAgICBjaGFuZ2VBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApXG5cbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBhd2FpdCB0aGlzLl9nZXRCdWlsZGVyKFxuICAgICAgdXR4b3NldFxuICAgICkuYnVpbGRFeHBvcnRUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSxcbiAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpLFxuICAgICAgYW1vdW50LFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICB0byxcbiAgICAgIGZyb21TaWduZXIsXG4gICAgICBkZXN0aW5hdGlvbkNoYWluLFxuICAgICAgY2hhbmdlLFxuICAgICAgdGhpcy5nZXRUeEZlZSgpLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLFxuICAgICAgYXNPZixcbiAgICAgIGxvY2t0aW1lLFxuICAgICAgdG9UaHJlc2hvbGQsXG4gICAgICBjaGFuZ2VUaHJlc2hvbGRcbiAgICApXG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgR29vc2VFZ2dDaGVja0Vycm9yKFwiRmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKVxuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhbiB1bnNpZ25lZCBbW0FkZFN1Ym5ldFZhbGlkYXRvclR4XV0uIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICAqIFtbVW5zaWduZWRUeF1dIG1hbnVhbGx5IGFuZCBpbXBvcnQgdGhlIFtbQWRkU3VibmV0VmFsaWRhdG9yVHhdXSBjbGFzcyBkaXJlY3RseS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb24uXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gcGF5cyB0aGUgZmVlcyBpbiBBVkFYXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgZnJvbSB0aGUgZmVlIHBheW1lbnRcbiAgICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAgKiBAcGFyYW0gc3RhcnRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAqIEBwYXJhbSBlbmRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgICogQHBhcmFtIHdlaWdodCBUaGUgYW1vdW50IG9mIHdlaWdodCBmb3IgdGhpcyBzdWJuZXQgdmFsaWRhdG9yLlxuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gc3VibmV0QXV0aCBPcHRpb25hbC4gQW4gQXV0aCBzdHJ1Y3Qgd2hpY2ggY29udGFpbnMgdGhlIHN1Ym5ldCBBdXRoIGFuZCB0aGUgc2lnbmVycy5cbiAgICogQHBhcmFtIGNoYW5nZVRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IGNoYW5nZSBVVFhPXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAqL1xuXG4gIGJ1aWxkQWRkU3VibmV0VmFsaWRhdG9yVHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICBmcm9tQWRkcmVzc2VzOiBGcm9tVHlwZSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIG5vZGVJRDogc3RyaW5nLFxuICAgIHN0YXJ0VGltZTogQk4sXG4gICAgZW5kVGltZTogQk4sXG4gICAgd2VpZ2h0OiBCTixcbiAgICBzdWJuZXRJRDogc3RyaW5nLFxuICAgIG1lbW86IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gWmVyb0JOLFxuICAgIHN1Ym5ldEF1dGg6IEF1dGggPSB7IGFkZHJlc3NlczogW10sIHRocmVzaG9sZDogMCwgc2lnbmVyOiBbXSB9LFxuICAgIGNoYW5nZVRocmVzaG9sZDogbnVtYmVyID0gMVxuICApOiBQcm9taXNlPFVuc2lnbmVkVHg+ID0+IHtcbiAgICBjb25zdCBjYWxsZXIgPSBcImJ1aWxkQWRkU3VibmV0VmFsaWRhdG9yVHhcIlxuXG4gICAgY29uc3QgZnJvbVNpZ25lciA9IHRoaXMuX3BhcnNlRnJvbVNpZ25lcihmcm9tQWRkcmVzc2VzLCBjYWxsZXIpXG5cbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIoXG4gICAgICBjaGFuZ2VBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApXG5cbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG5cbiAgICBjb25zdCBub3c6IEJOID0gVW5peE5vdygpXG4gICAgaWYgKHN0YXJ0VGltZS5sdChub3cpIHx8IGVuZFRpbWUubHRlKHN0YXJ0VGltZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJQbGF0Zm9ybVZNQVBJLmJ1aWxkQWRkU3VibmV0VmFsaWRhdG9yVHggLS0gc3RhcnRUaW1lIG11c3QgYmUgaW4gdGhlIGZ1dHVyZSBhbmQgZW5kVGltZSBtdXN0IGNvbWUgYWZ0ZXIgc3RhcnRUaW1lXCJcbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBhd2FpdCB0aGlzLl9nZXRCdWlsZGVyKFxuICAgICAgdXR4b3NldFxuICAgICkuYnVpbGRBZGRTdWJuZXRWYWxpZGF0b3JUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSxcbiAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpLFxuICAgICAgZnJvbVNpZ25lcixcbiAgICAgIGNoYW5nZSxcbiAgICAgIE5vZGVJRFN0cmluZ1RvQnVmZmVyKG5vZGVJRCksXG4gICAgICBzdGFydFRpbWUsXG4gICAgICBlbmRUaW1lLFxuICAgICAgd2VpZ2h0LFxuICAgICAgc3VibmV0SUQsXG4gICAgICB0aGlzLmdldERlZmF1bHRUeEZlZSgpLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLFxuICAgICAgYXNPZixcbiAgICAgIHN1Ym5ldEF1dGgsXG4gICAgICBjaGFuZ2VUaHJlc2hvbGRcbiAgICApXG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBjcmVhdGVzIGFuIHVuc2lnbmVkIFtbQWRkRGVsZWdhdG9yVHhdXS4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgYW5kIGltcG9ydCB0aGUgW1tBZGREZWxlZ2F0b3JUeF1dIGNsYXNzIGRpcmVjdGx5LlxuICAgKlxuICAgKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyByZWNlaXZlZCB0aGUgc3Rha2VkIHRva2VucyBhdCB0aGUgZW5kIG9mIHRoZSBzdGFraW5nIHBlcmlvZFxuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIG93biB0aGUgc3Rha2luZyBVVFhPcyB0aGUgZmVlcyBpbiBBVkFYXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgZnJvbSB0aGUgZmVlIHBheW1lbnRcbiAgICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAgKiBAcGFyYW0gc3RhcnRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAqIEBwYXJhbSBlbmRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgICogQHBhcmFtIHN0YWtlQW1vdW50IFRoZSBhbW91bnQgYmVpbmcgZGVsZWdhdGVkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIHJld2FyZEFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHdoaWNoIHdpbGwgcmVjaWV2ZSB0aGUgcmV3YXJkcyBmcm9tIHRoZSBkZWxlZ2F0ZWQgc3Rha2UuXG4gICAqIEBwYXJhbSByZXdhcmRMb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyByZXdhcmQgb3V0cHV0c1xuICAgKiBAcGFyYW0gcmV3YXJkVGhyZXNob2xkIE9waW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCByZXdhcmQgVVRYTy4gRGVmYXVsdCAxLlxuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gdG9UaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqIEBwYXJhbSBjaGFuZ2VUaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBjaGFuZ2UgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgYnVpbGRBZGREZWxlZ2F0b3JUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIHRvQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBmcm9tQWRkcmVzc2VzOiBGcm9tVHlwZSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIG5vZGVJRDogc3RyaW5nLFxuICAgIHN0YXJ0VGltZTogQk4sXG4gICAgZW5kVGltZTogQk4sXG4gICAgc3Rha2VBbW91bnQ6IEJOLFxuICAgIHJld2FyZEFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgcmV3YXJkTG9ja3RpbWU6IEJOID0gWmVyb0JOLFxuICAgIHJld2FyZFRocmVzaG9sZDogbnVtYmVyID0gMSxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFplcm9CTixcbiAgICB0b1RocmVzaG9sZDogbnVtYmVyID0gMSxcbiAgICBjaGFuZ2VUaHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyID0gXCJidWlsZEFkZERlbGVnYXRvclR4XCJcbiAgICBjb25zdCB0bzogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheUJ1ZmZlcih0b0FkZHJlc3NlcywgY2FsbGVyKVxuXG4gICAgY29uc3QgZnJvbVNpZ25lciA9IHRoaXMuX3BhcnNlRnJvbVNpZ25lcihmcm9tQWRkcmVzc2VzLCBjYWxsZXIpXG5cbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIoXG4gICAgICBjaGFuZ2VBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApXG4gICAgY29uc3QgcmV3YXJkczogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheUJ1ZmZlcihcbiAgICAgIHJld2FyZEFkZHJlc3NlcyxcbiAgICAgIGNhbGxlclxuICAgIClcblxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGNvbnN0IG1pblN0YWtlOiBCTiA9IChhd2FpdCB0aGlzLmdldE1pblN0YWtlKCkpW1wibWluRGVsZWdhdG9yU3Rha2VcIl1cbiAgICBpZiAoc3Rha2VBbW91bnQubHQobWluU3Rha2UpKSB7XG4gICAgICB0aHJvdyBuZXcgU3Rha2VFcnJvcihcbiAgICAgICAgXCJQbGF0Zm9ybVZNQVBJLmJ1aWxkQWRkRGVsZWdhdG9yVHggLS0gc3Rha2UgYW1vdW50IG11c3QgYmUgYXQgbGVhc3QgXCIgK1xuICAgICAgICAgIG1pblN0YWtlLnRvU3RyaW5nKDEwKVxuICAgICAgKVxuICAgIH1cblxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcblxuICAgIGNvbnN0IG5vdzogQk4gPSBVbml4Tm93KClcbiAgICBpZiAoc3RhcnRUaW1lLmx0KG5vdykgfHwgZW5kVGltZS5sdGUoc3RhcnRUaW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFRpbWVFcnJvcihcbiAgICAgICAgXCJQbGF0Zm9ybVZNQVBJLmJ1aWxkQWRkRGVsZWdhdG9yVHggLS0gc3RhcnRUaW1lIG11c3QgYmUgaW4gdGhlIGZ1dHVyZSBhbmQgZW5kVGltZSBtdXN0IGNvbWUgYWZ0ZXIgc3RhcnRUaW1lXCJcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jb3JlLmdldE5ldHdvcmsoKS5QLmxvY2tNb2RlQm9uZERlcG9zaXQpIHtcbiAgICAgIHRocm93IG5ldyBVVFhPRXJyb3IoXG4gICAgICAgIFwiUGxhdGZvcm1WTUFQSS5idWlsZEFkZERlbGVnYXRvclR4IC0tIG5vdCBzdXBwb3J0ZWQgaW4gbG9ja21vZGVCb25kRGVwb3NpdFwiXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gYXdhaXQgdGhpcy5fZ2V0QnVpbGRlcihcbiAgICAgIHV0eG9zZXRcbiAgICApLmJ1aWxkQWRkRGVsZWdhdG9yVHgoXG4gICAgICB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCksXG4gICAgICBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKSxcbiAgICAgIGF2YXhBc3NldElELFxuICAgICAgdG8sXG4gICAgICBmcm9tU2lnbmVyLFxuICAgICAgY2hhbmdlLFxuICAgICAgTm9kZUlEU3RyaW5nVG9CdWZmZXIobm9kZUlEKSxcbiAgICAgIHN0YXJ0VGltZSxcbiAgICAgIGVuZFRpbWUsXG4gICAgICBzdGFrZUFtb3VudCxcbiAgICAgIHJld2FyZExvY2t0aW1lLFxuICAgICAgcmV3YXJkVGhyZXNob2xkLFxuICAgICAgcmV3YXJkcyxcbiAgICAgIFplcm9CTixcbiAgICAgIGF2YXhBc3NldElELFxuICAgICAgbWVtbyxcbiAgICAgIGFzT2YsXG4gICAgICB0b1RocmVzaG9sZCxcbiAgICAgIGNoYW5nZVRocmVzaG9sZFxuICAgIClcblxuICAgIGlmICghKGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBjcmVhdGVzIGFuIHVuc2lnbmVkIFtbQWRkVmFsaWRhdG9yVHhdXS4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgYW5kIGltcG9ydCB0aGUgW1tBZGRWYWxpZGF0b3JUeF1dIGNsYXNzIGRpcmVjdGx5LlxuICAgKlxuICAgKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyByZWNlaXZlZCB0aGUgc3Rha2VkIHRva2VucyBhdCB0aGUgZW5kIG9mIHRoZSBzdGFraW5nIHBlcmlvZFxuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIG93biB0aGUgc3Rha2luZyBVVFhPcyB0aGUgZmVlcyBpbiBBVkFYXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgZnJvbSB0aGUgZmVlIHBheW1lbnRcbiAgICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAgKiBAcGFyYW0gc3RhcnRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAqIEBwYXJhbSBlbmRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgICogQHBhcmFtIHN0YWtlQW1vdW50IFRoZSBhbW91bnQgYmVpbmcgZGVsZWdhdGVkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIHJld2FyZEFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHdoaWNoIHdpbGwgcmVjaWV2ZSB0aGUgcmV3YXJkcyBmcm9tIHRoZSBkZWxlZ2F0ZWQgc3Rha2UuXG4gICAqIEBwYXJhbSBkZWxlZ2F0aW9uRmVlIEEgbnVtYmVyIGZvciB0aGUgcGVyY2VudGFnZSBvZiByZXdhcmQgdG8gYmUgZ2l2ZW4gdG8gdGhlIHZhbGlkYXRvciB3aGVuIHNvbWVvbmUgZGVsZWdhdGVzIHRvIHRoZW0uIE11c3QgYmUgYmV0d2VlbiAwIGFuZCAxMDAuXG4gICAqIEBwYXJhbSByZXdhcmRMb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyByZXdhcmQgb3V0cHV0c1xuICAgKiBAcGFyYW0gcmV3YXJkVGhyZXNob2xkIE9waW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCByZXdhcmQgVVRYTy4gRGVmYXVsdCAxLlxuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gdG9UaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqIEBwYXJhbSBjaGFuZ2VUaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBjaGFuZ2UgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgYnVpbGRBZGRWYWxpZGF0b3JUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIHRvQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBmcm9tQWRkcmVzc2VzOiBGcm9tVHlwZSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIG5vZGVJRDogc3RyaW5nLFxuICAgIHN0YXJ0VGltZTogQk4sXG4gICAgZW5kVGltZTogQk4sXG4gICAgc3Rha2VBbW91bnQ6IEJOLFxuICAgIHJld2FyZEFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgZGVsZWdhdGlvbkZlZTogbnVtYmVyLFxuICAgIHJld2FyZExvY2t0aW1lOiBCTiA9IFplcm9CTixcbiAgICByZXdhcmRUaHJlc2hvbGQ6IG51bWJlciA9IDEsXG4gICAgbWVtbzogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBaZXJvQk4sXG4gICAgdG9UaHJlc2hvbGQ6IG51bWJlciA9IDEsXG4gICAgY2hhbmdlVGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICk6IFByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IGNhbGxlciA9IFwiYnVpbGRBZGRWYWxpZGF0b3JUeFwiXG5cbiAgICBjb25zdCB0bzogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheUJ1ZmZlcih0b0FkZHJlc3NlcywgY2FsbGVyKVxuXG4gICAgY29uc3QgZnJvbVNpZ25lciA9IHRoaXMuX3BhcnNlRnJvbVNpZ25lcihmcm9tQWRkcmVzc2VzLCBjYWxsZXIpXG5cbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIoXG4gICAgICBjaGFuZ2VBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApXG4gICAgY29uc3QgcmV3YXJkczogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheUJ1ZmZlcihcbiAgICAgIHJld2FyZEFkZHJlc3NlcyxcbiAgICAgIGNhbGxlclxuICAgIClcblxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGNvbnN0IG1pblN0YWtlOiBCTiA9IChhd2FpdCB0aGlzLmdldE1pblN0YWtlKCkpW1wibWluVmFsaWRhdG9yU3Rha2VcIl1cbiAgICBpZiAoc3Rha2VBbW91bnQubHQobWluU3Rha2UpKSB7XG4gICAgICB0aHJvdyBuZXcgU3Rha2VFcnJvcihcbiAgICAgICAgYFBsYXRmb3JtVk1BUEkuJHtjYWxsZXJ9IC0tIHN0YWtlIGFtb3VudCBtdXN0IGJlIGF0IGxlYXN0IGAgK1xuICAgICAgICAgIG1pblN0YWtlLnRvU3RyaW5nKDEwKVxuICAgICAgKVxuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHR5cGVvZiBkZWxlZ2F0aW9uRmVlICE9PSBcIm51bWJlclwiIHx8XG4gICAgICBkZWxlZ2F0aW9uRmVlID4gMTAwIHx8XG4gICAgICBkZWxlZ2F0aW9uRmVlIDwgMFxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IERlbGVnYXRpb25GZWVFcnJvcihcbiAgICAgICAgYFBsYXRmb3JtVk1BUEkuJHtjYWxsZXJ9IC0tIGRlbGVnYXRpb25GZWUgbXVzdCBiZSBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEwMGBcbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG5cbiAgICBjb25zdCBub3c6IEJOID0gVW5peE5vdygpXG4gICAgaWYgKHN0YXJ0VGltZS5sdChub3cpIHx8IGVuZFRpbWUubHRlKHN0YXJ0VGltZSkpIHtcbiAgICAgIHRocm93IG5ldyBUaW1lRXJyb3IoXG4gICAgICAgIGBQbGF0Zm9ybVZNQVBJLiR7Y2FsbGVyfSAtLSBzdGFydFRpbWUgbXVzdCBiZSBpbiB0aGUgZnV0dXJlIGFuZCBlbmRUaW1lIG11c3QgY29tZSBhZnRlciBzdGFydFRpbWVgXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gYXdhaXQgdGhpcy5fZ2V0QnVpbGRlcihcbiAgICAgIHV0eG9zZXRcbiAgICApLmJ1aWxkQWRkVmFsaWRhdG9yVHgoXG4gICAgICB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCksXG4gICAgICBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKSxcbiAgICAgIHRvLFxuICAgICAgZnJvbVNpZ25lcixcbiAgICAgIGNoYW5nZSxcbiAgICAgIE5vZGVJRFN0cmluZ1RvQnVmZmVyKG5vZGVJRCksXG4gICAgICBzdGFydFRpbWUsXG4gICAgICBlbmRUaW1lLFxuICAgICAgc3Rha2VBbW91bnQsXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIHJld2FyZExvY2t0aW1lLFxuICAgICAgcmV3YXJkVGhyZXNob2xkLFxuICAgICAgcmV3YXJkcyxcbiAgICAgIGRlbGVnYXRpb25GZWUsXG4gICAgICBaZXJvQk4sXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sXG4gICAgICBhc09mLFxuICAgICAgdG9UaHJlc2hvbGQsXG4gICAgICBjaGFuZ2VUaHJlc2hvbGRcbiAgICApXG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgR29vc2VFZ2dDaGVja0Vycm9yKFwiRmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKVxuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgW1tDcmVhdGVTdWJuZXRUeF1dIHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICAqIEBwYXJhbSBzdWJuZXRPd25lckFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgZm9yIG93bmVycyBvZiB0aGUgbmV3IHN1Ym5ldFxuICAgKiBAcGFyYW0gc3VibmV0T3duZXJUaHJlc2hvbGQgQSBudW1iZXIgaW5kaWNhdGluZyB0aGUgYW1vdW50IG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gYWRkIHZhbGlkYXRvcnMgdG8gYSBzdWJuZXRcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGNoYW5nZVRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IGNoYW5nZSBVVFhPXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAqL1xuICBidWlsZENyZWF0ZVN1Ym5ldFR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgZnJvbUFkZHJlc3NlczogRnJvbVR5cGUsXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBzdWJuZXRPd25lckFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgc3VibmV0T3duZXJUaHJlc2hvbGQ6IG51bWJlcixcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFplcm9CTixcbiAgICBjaGFuZ2VUaHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyID0gXCJidWlsZENyZWF0ZVN1Ym5ldFR4XCJcblxuICAgIGNvbnN0IGZyb21TaWduZXIgPSB0aGlzLl9wYXJzZUZyb21TaWduZXIoZnJvbUFkZHJlc3NlcywgY2FsbGVyKVxuXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5QnVmZmVyKFxuICAgICAgY2hhbmdlQWRkcmVzc2VzLFxuICAgICAgY2FsbGVyXG4gICAgKVxuICAgIGNvbnN0IG93bmVyczogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheUJ1ZmZlcihcbiAgICAgIHN1Ym5ldE93bmVyQWRkcmVzc2VzLFxuICAgICAgY2FsbGVyXG4gICAgKVxuXG4gICAgaWYgKG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgICAgbWVtbyA9IG1lbW8uZ2V0UGF5bG9hZCgpXG4gICAgfVxuXG4gICAgY29uc3QgYXZheEFzc2V0SUQ6IEJ1ZmZlciA9IGF3YWl0IHRoaXMuZ2V0QVZBWEFzc2V0SUQoKVxuICAgIGNvbnN0IG5ldHdvcmtJRDogbnVtYmVyID0gdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpXG4gICAgY29uc3QgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKVxuICAgIGNvbnN0IGZlZTogQk4gPSB0aGlzLmdldENyZWF0ZVN1Ym5ldFR4RmVlKClcblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDogVW5zaWduZWRUeCA9IGF3YWl0IHRoaXMuX2dldEJ1aWxkZXIoXG4gICAgICB1dHhvc2V0XG4gICAgKS5idWlsZENyZWF0ZVN1Ym5ldFR4KFxuICAgICAgbmV0d29ya0lELFxuICAgICAgYmxvY2tjaGFpbklELFxuICAgICAgZnJvbVNpZ25lcixcbiAgICAgIGNoYW5nZSxcbiAgICAgIG93bmVycyxcbiAgICAgIHN1Ym5ldE93bmVyVGhyZXNob2xkLFxuICAgICAgZmVlLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLFxuICAgICAgYXNPZixcbiAgICAgIGNoYW5nZVRocmVzaG9sZFxuICAgIClcblxuICAgIGlmICghKGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgsIHRoaXMuZ2V0Q3JlYXRpb25UeEZlZSgpKSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgR29vc2VFZ2dDaGVja0Vycm9yKFwiRmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKVxuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCBhbiB1bnNpZ25lZCBbW0NyZWF0ZUNoYWluVHhdXS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPc1xuICAgKiBAcGFyYW0gc3VibmV0SUQgT3B0aW9uYWwgSUQgb2YgdGhlIFN1Ym5ldCB0aGF0IHZhbGlkYXRlcyB0aGlzIGJsb2NrY2hhaW5cbiAgICogQHBhcmFtIGNoYWluTmFtZSBPcHRpb25hbCBBIGh1bWFuIHJlYWRhYmxlIG5hbWUgZm9yIHRoZSBjaGFpbjsgbmVlZCBub3QgYmUgdW5pcXVlXG4gICAqIEBwYXJhbSB2bUlEIE9wdGlvbmFsIElEIG9mIHRoZSBWTSBydW5uaW5nIG9uIHRoZSBuZXcgY2hhaW5cbiAgICogQHBhcmFtIGZ4SURzIE9wdGlvbmFsIElEcyBvZiB0aGUgZmVhdHVyZSBleHRlbnNpb25zIHJ1bm5pbmcgb24gdGhlIG5ldyBjaGFpblxuICAgKiBAcGFyYW0gZ2VuZXNpc0RhdGEgT3B0aW9uYWwgQnl0ZSByZXByZXNlbnRhdGlvbiBvZiBnZW5lc2lzIHN0YXRlIG9mIHRoZSBuZXcgY2hhaW5cbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIHN1Ym5ldEF1dGhDcmVkZW50aWFscyBPcHRpb25hbC4gQW4gYXJyYXkgb2YgaW5kZXggYW5kIGFkZHJlc3MgdG8gc2lnbiBmb3IgZWFjaCBTdWJuZXRBdXRoLlxuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgYnVpbGRDcmVhdGVDaGFpblR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgZnJvbUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBzdWJuZXRJRDogc3RyaW5nIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGNoYWluTmFtZTogc3RyaW5nID0gdW5kZWZpbmVkLFxuICAgIHZtSUQ6IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICBmeElEczogc3RyaW5nW10gPSB1bmRlZmluZWQsXG4gICAgZ2VuZXNpc0RhdGE6IHN0cmluZyB8IEdlbmVzaXNEYXRhID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gWmVyb0JOLFxuICAgIHN1Ym5ldEF1dGg6IEF1dGggPSB7IGFkZHJlc3NlczogW10sIHRocmVzaG9sZDogMCwgc2lnbmVyOiBbXSB9LFxuICAgIGNoYW5nZVRocmVzaG9sZDogbnVtYmVyID0gMVxuICApOiBQcm9taXNlPFVuc2lnbmVkVHg+ID0+IHtcbiAgICBjb25zdCBjYWxsZXIgPSBcImJ1aWxkQ3JlYXRlQ2hhaW5UeFwiXG5cbiAgICBjb25zdCBmcm9tU2lnbmVyID0gdGhpcy5fcGFyc2VGcm9tU2lnbmVyKGZyb21BZGRyZXNzZXMsIGNhbGxlcilcblxuICAgIGNvbnN0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheUJ1ZmZlcihcbiAgICAgIGNoYW5nZUFkZHJlc3NlcyxcbiAgICAgIGNhbGxlclxuICAgIClcblxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcbiAgICBmeElEcyA9IGZ4SURzLnNvcnQoKVxuXG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKClcbiAgICBjb25zdCBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpXG4gICAgY29uc3QgZmVlOiBCTiA9IHRoaXMuZ2V0Q3JlYXRlQ2hhaW5UeEZlZSgpXG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBhd2FpdCB0aGlzLl9nZXRCdWlsZGVyKFxuICAgICAgdXR4b3NldFxuICAgICkuYnVpbGRDcmVhdGVDaGFpblR4KFxuICAgICAgbmV0d29ya0lELFxuICAgICAgYmxvY2tjaGFpbklELFxuICAgICAgZnJvbVNpZ25lcixcbiAgICAgIGNoYW5nZSxcbiAgICAgIHN1Ym5ldElELFxuICAgICAgY2hhaW5OYW1lLFxuICAgICAgdm1JRCxcbiAgICAgIGZ4SURzLFxuICAgICAgZ2VuZXNpc0RhdGEsXG4gICAgICBmZWUsXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sXG4gICAgICBhc09mLFxuICAgICAgc3VibmV0QXV0aCxcbiAgICAgIGNoYW5nZVRocmVzaG9sZFxuICAgIClcblxuICAgIGlmICghKGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgsIHRoaXMuZ2V0Q3JlYXRpb25UeEZlZSgpKSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgR29vc2VFZ2dDaGVja0Vycm9yKFwiRmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKVxuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhbiB1bnNpZ25lZCBbW0NhbWlub0FkZFZhbGlkYXRvclR4XV0uIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICAqIFtbVW5zaWduZWRUeF1dIG1hbnVhbGx5IGFuZCBpbXBvcnQgdGhlIFtbQ2FtaW5vQWRkVmFsaWRhdG9yVHhdXSBjbGFzcyBkaXJlY3RseS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIHRvQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gcmVjZWl2ZWQgdGhlIHN0YWtlZCB0b2tlbnMgYXQgdGhlIGVuZCBvZiB0aGUgc3Rha2luZyBwZXJpb2RcbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBvd24gdGhlIHN0YWtpbmcgVVRYT3MgdGhlIGZlZXMgaW4gQVZBWFxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gZ2V0cyB0aGUgY2hhbmdlIGxlZnRvdmVyIGZyb20gdGhlIGZlZSBwYXltZW50XG4gICAqIEBwYXJhbSBub2RlSUQgVGhlIG5vZGUgSUQgb2YgdGhlIHZhbGlkYXRvciBiZWluZyBhZGRlZC5cbiAgICogQHBhcmFtIG5vZGVPd25lciBUaGUgYWRkcmVzcyBhbmQgc2lnbmF0dXJlIGluZGljZXMgb2YgdGhlIHJlZ2lzdGVyZWQgbm9kZUlkIG93bmVyLlxuICAgKiBAcGFyYW0gc3RhcnRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAqIEBwYXJhbSBlbmRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgICogQHBhcmFtIHN0YWtlQW1vdW50IFRoZSBhbW91bnQgYmVpbmcgZGVsZWdhdGVkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIHJld2FyZEFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHdoaWNoIHdpbGwgcmVjaWV2ZSB0aGUgcmV3YXJkcyBmcm9tIHRoZSBkZWxlZ2F0ZWQgc3Rha2UuXG4gICAqIEBwYXJhbSByZXdhcmRMb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyByZXdhcmQgb3V0cHV0c1xuICAgKiBAcGFyYW0gcmV3YXJkVGhyZXNob2xkIE9waW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCByZXdhcmQgVVRYTy4gRGVmYXVsdCAxLlxuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gdG9UaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqIEBwYXJhbSBjaGFuZ2VUaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBjaGFuZ2UgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgYnVpbGRDYW1pbm9BZGRWYWxpZGF0b3JUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIGZyb21BZGRyZXNzZXM6IEZyb21UeXBlLFxuICAgIGNoYW5nZUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgbm9kZUlEOiBzdHJpbmcsXG4gICAgbm9kZU93bmVyOiBOb2RlT3duZXJUeXBlLFxuICAgIHN0YXJ0VGltZTogQk4sXG4gICAgZW5kVGltZTogQk4sXG4gICAgc3Rha2VBbW91bnQ6IEJOLFxuICAgIHJld2FyZEFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgcmV3YXJkTG9ja3RpbWU6IEJOID0gWmVyb0JOLFxuICAgIHJld2FyZFRocmVzaG9sZDogbnVtYmVyID0gMSxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFplcm9CTixcbiAgICB0b1RocmVzaG9sZDogbnVtYmVyID0gMSxcbiAgICBjaGFuZ2VUaHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyID0gXCJidWlsZENhbWlub0FkZFZhbGlkYXRvclR4XCJcblxuICAgIGNvbnN0IGZyb21TaWduZXIgPSB0aGlzLl9wYXJzZUZyb21TaWduZXIoZnJvbUFkZHJlc3NlcywgY2FsbGVyKVxuXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5QnVmZmVyKFxuICAgICAgY2hhbmdlQWRkcmVzc2VzLFxuICAgICAgY2FsbGVyXG4gICAgKVxuICAgIGNvbnN0IHJld2FyZHM6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIoXG4gICAgICByZXdhcmRBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApXG5cbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBjb25zdCBtaW5TdGFrZTogQk4gPSAoYXdhaXQgdGhpcy5nZXRNaW5TdGFrZSgpKVtcIm1pblZhbGlkYXRvclN0YWtlXCJdXG4gICAgaWYgKHN0YWtlQW1vdW50Lmx0KG1pblN0YWtlKSkge1xuICAgICAgdGhyb3cgbmV3IFN0YWtlRXJyb3IoXG4gICAgICAgIGBQbGF0Zm9ybVZNQVBJLiR7Y2FsbGVyfSAtLSBzdGFrZSBhbW91bnQgbXVzdCBiZSBhdCBsZWFzdCBgICtcbiAgICAgICAgICBtaW5TdGFrZS50b1N0cmluZygxMClcbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG5cbiAgICBjb25zdCBub3c6IEJOID0gVW5peE5vdygpXG4gICAgaWYgKHN0YXJ0VGltZS5sdChub3cpIHx8IGVuZFRpbWUubHRlKHN0YXJ0VGltZSkpIHtcbiAgICAgIHRocm93IG5ldyBUaW1lRXJyb3IoXG4gICAgICAgIGBQbGF0Zm9ybVZNQVBJLiR7Y2FsbGVyfSAtLSBzdGFydFRpbWUgbXVzdCBiZSBpbiB0aGUgZnV0dXJlIGFuZCBlbmRUaW1lIG11c3QgY29tZSBhZnRlciBzdGFydFRpbWVgXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgYXV0aDogTm9kZU93bmVyID0ge1xuICAgICAgYWRkcmVzczogdGhpcy5wYXJzZUFkZHJlc3Mobm9kZU93bmVyLmFkZHJlc3MpLFxuICAgICAgYXV0aDogW11cbiAgICB9XG4gICAgbm9kZU93bmVyLmF1dGguZm9yRWFjaCgobykgPT4ge1xuICAgICAgYXV0aC5hdXRoLnB1c2goW29bMF0sIHRoaXMucGFyc2VBZGRyZXNzKG9bMV0pXSlcbiAgICB9KVxuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gYXdhaXQgdGhpcy5fZ2V0QnVpbGRlcihcbiAgICAgIHV0eG9zZXRcbiAgICApLmJ1aWxkQ2FtaW5vQWRkVmFsaWRhdG9yVHgoXG4gICAgICB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCksXG4gICAgICBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKSxcbiAgICAgIGZyb21TaWduZXIsXG4gICAgICBjaGFuZ2UsXG4gICAgICBOb2RlSURTdHJpbmdUb0J1ZmZlcihub2RlSUQpLFxuICAgICAgYXV0aCxcbiAgICAgIHN0YXJ0VGltZSxcbiAgICAgIGVuZFRpbWUsXG4gICAgICBzdGFrZUFtb3VudCxcbiAgICAgIGF2YXhBc3NldElELFxuICAgICAgcmV3YXJkcyxcbiAgICAgIHJld2FyZExvY2t0aW1lLFxuICAgICAgcmV3YXJkVGhyZXNob2xkLFxuICAgICAgbWVtbyxcbiAgICAgIGFzT2YsXG4gICAgICB0b1RocmVzaG9sZCxcbiAgICAgIGNoYW5nZVRocmVzaG9sZFxuICAgIClcblxuICAgIGlmICghKGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkIGFuIHVuc2lnbmVkIFtbQWRkcmVzc1N0YXRlVHhdXS5cbiAgICpcbiAgICogQHBhcmFtIHZlcnNpb24gT3B0aW9uYWwuIFRyYW5zYWN0aW9uIHZlcnNpb24gbnVtYmVyLCBkZWZhdWx0IDAuXG4gICAqIEBwYXJhbSB1dHhvc2V0IEEgc2V0IG9mIFVUWE9zIHRoYXQgdGhlIHRyYW5zYWN0aW9uIGlzIGJ1aWx0IG9uXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3MuXG4gICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIHRvIGFsdGVyIHN0YXRlLlxuICAgKiBAcGFyYW0gc3RhdGUgVGhlIHN0YXRlIHRvIHNldCBvciByZW1vdmUgb24gdGhlIGdpdmVuIGFkZHJlc3NcbiAgICogQHBhcmFtIHJlbW92ZSBPcHRpb25hbC4gRmxhZyBpZiBzdGF0ZSBzaG91bGQgYmUgYXBwbGllZCBvciByZW1vdmVkXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBjaGFuZ2VUaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBjaGFuZ2UgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCBBZGRyZXNzU3RhdGVUeCBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgYnVpbGRBZGRyZXNzU3RhdGVUeCA9IGFzeW5jIChcbiAgICB2ZXJzaW9uOiBudW1iZXIgPSBEZWZhdWx0VHJhbnNhY3Rpb25WZXJzaW9uTnVtYmVyLFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgZnJvbUFkZHJlc3NlczogRnJvbVR5cGUsXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBhZGRyZXNzOiBzdHJpbmcgfCBCdWZmZXIsXG4gICAgc3RhdGU6IG51bWJlcixcbiAgICByZW1vdmU6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBaZXJvQk4sXG4gICAgY2hhbmdlVGhyZXNob2xkOiBudW1iZXIgPSAxLFxuICAgIGV4ZWN1dG9yQWRkcmVzczogc3RyaW5nID0gdW5kZWZpbmVkLFxuICAgIGV4ZWN1dG9yQXV0aDogW251bWJlciwgc3RyaW5nXVtdID0gW11cbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyID0gXCJidWlsZEFkZHJlc3NTdGF0ZVR4XCJcblxuICAgIGNvbnN0IGZyb21TaWduZXIgPSB0aGlzLl9wYXJzZUZyb21TaWduZXIoZnJvbUFkZHJlc3NlcywgY2FsbGVyKVxuXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5QnVmZmVyKFxuICAgICAgY2hhbmdlQWRkcmVzc2VzLFxuICAgICAgY2FsbGVyXG4gICAgKVxuICAgIGNvbnN0IGFkZHJlc3NCdWYgPVxuICAgICAgdHlwZW9mIGFkZHJlc3MgPT09IFwic3RyaW5nXCIgPyB0aGlzLnBhcnNlQWRkcmVzcyhhZGRyZXNzKSA6IGFkZHJlc3NcbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKClcbiAgICBjb25zdCBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpXG4gICAgY29uc3QgZmVlOiBCTiA9IHRoaXMuZ2V0VHhGZWUoKVxuXG4gICAgdmFyIGF1dGhBZGRyZXNzOiBCdWZmZXJcbiAgICB2YXIgYXV0aDogW251bWJlciwgQnVmZmVyXVtdID0gW11cblxuICAgIGlmIChleGVjdXRvckFkZHJlc3MpIHtcbiAgICAgIGF1dGhBZGRyZXNzID0gdGhpcy5wYXJzZUFkZHJlc3MoZXhlY3V0b3JBZGRyZXNzKVxuICAgICAgZXhlY3V0b3JBdXRoLmZvckVhY2goKG8pID0+IHtcbiAgICAgICAgYXV0aC5wdXNoKFtvWzBdLCB0aGlzLnBhcnNlQWRkcmVzcyhvWzFdKV0pXG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDogVW5zaWduZWRUeCA9IGF3YWl0IHRoaXMuX2dldEJ1aWxkZXIoXG4gICAgICB1dHhvc2V0XG4gICAgKS5idWlsZEFkZHJlc3NTdGF0ZVR4KFxuICAgICAgdmVyc2lvbixcbiAgICAgIG5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIGZyb21TaWduZXIsXG4gICAgICBjaGFuZ2UsXG4gICAgICBhZGRyZXNzQnVmLFxuICAgICAgc3RhdGUsXG4gICAgICByZW1vdmUsXG4gICAgICBmZWUsXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sXG4gICAgICBhc09mLFxuICAgICAgY2hhbmdlVGhyZXNob2xkLFxuICAgICAgYXV0aEFkZHJlc3MsXG4gICAgICBhdXRoXG4gICAgKVxuXG4gICAgaWYgKCEoYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCwgdGhpcy5nZXRDcmVhdGlvblR4RmVlKCkpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkIGFuIHVuc2lnbmVkIFtbUmVnaXN0ZXJOb2RlVHhdXS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPc1xuICAgKiBAcGFyYW0gb2xkTm9kZUlEIE9wdGlvbmFsLiBJRCBvZiB0aGUgZXhpc3RpbmcgTm9kZUlEIHRvIHJlcGxhY2Ugb3IgcmVtb3ZlLlxuICAgKiBAcGFyYW0gbmV3Tm9kZUlEIE9wdGlvbmFsLiBJRCBvZiB0aGUgbmV3Tm9kSUQgdG8gcmVnaXN0ZXIgYWRkcmVzcy5cbiAgICogQHBhcmFtIGFkZHJlc3MgVGhlIGNvbnNvcnRpdW1NZW1iZXJBZGRyZXNzLCBzaW5nbGUgb3IgbXVsdGktc2lnLlxuICAgKiBAcGFyYW0gYWRkcmVzc0F1dGhzIEFuIGFycmF5IG9mIGluZGV4IGFuZCBhZGRyZXNzIHRvIHZlcmlmeSBvd25lcnNoaXAgb2YgYWRkcmVzcy5cbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGNoYW5nZVRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IGNoYW5nZSBVVFhPXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAqL1xuICBidWlsZFJlZ2lzdGVyTm9kZVR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgZnJvbUFkZHJlc3NlczogRnJvbVR5cGUsXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSA9IHVuZGVmaW5lZCxcbiAgICBvbGROb2RlSUQ6IHN0cmluZyB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBuZXdOb2RlSUQ6IHN0cmluZyB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhZGRyZXNzOiBzdHJpbmcgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYWRkcmVzc0F1dGhzOiBbbnVtYmVyLCBzdHJpbmcgfCBCdWZmZXJdW10gPSBbXSxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFplcm9CTixcbiAgICBjaGFuZ2VUaHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyID0gXCJidWlsZFJlZ2lzdGVyTm9kZVR4XCJcblxuICAgIGNvbnN0IGZyb21TaWduZXIgPSB0aGlzLl9wYXJzZUZyb21TaWduZXIoZnJvbUFkZHJlc3NlcywgY2FsbGVyKVxuXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5QnVmZmVyKFxuICAgICAgY2hhbmdlQWRkcmVzc2VzLFxuICAgICAgY2FsbGVyXG4gICAgKVxuICAgIGNvbnN0IGFkZHJCdWYgPVxuICAgICAgdHlwZW9mIGFkZHJlc3MgPT09IFwic3RyaW5nXCIgPyB0aGlzLnBhcnNlQWRkcmVzcyhhZGRyZXNzKSA6IGFkZHJlc3NcblxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cbiAgICBjb25zdCBhdXRoOiBbbnVtYmVyLCBCdWZmZXJdW10gPSBbXVxuICAgIGFkZHJlc3NBdXRocy5mb3JFYWNoKChjKSA9PiB7XG4gICAgICBhdXRoLnB1c2goW1xuICAgICAgICBjWzBdLFxuICAgICAgICB0eXBlb2YgY1sxXSA9PT0gXCJzdHJpbmdcIiA/IHRoaXMucGFyc2VBZGRyZXNzKGNbMV0pIDogY1sxXVxuICAgICAgXSlcbiAgICB9KVxuXG4gICAgaWYgKHR5cGVvZiBvbGROb2RlSUQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG9sZE5vZGVJRCA9IE5vZGVJRFN0cmluZ1RvQnVmZmVyKG9sZE5vZGVJRClcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG5ld05vZGVJRCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbmV3Tm9kZUlEID0gTm9kZUlEU3RyaW5nVG9CdWZmZXIobmV3Tm9kZUlEKVxuICAgIH1cblxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcbiAgICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKVxuICAgIGNvbnN0IGJsb2NrY2hhaW5JRDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRClcbiAgICBjb25zdCBmZWU6IEJOID0gdGhpcy5nZXRUeEZlZSgpXG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBhd2FpdCB0aGlzLl9nZXRCdWlsZGVyKFxuICAgICAgdXR4b3NldFxuICAgICkuYnVpbGRSZWdpc3Rlck5vZGVUeChcbiAgICAgIG5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIGZyb21TaWduZXIsXG4gICAgICBjaGFuZ2UsXG4gICAgICBvbGROb2RlSUQsXG4gICAgICBuZXdOb2RlSUQsXG4gICAgICBhZGRyQnVmLFxuICAgICAgYXV0aCxcbiAgICAgIGZlZSxcbiAgICAgIGF2YXhBc3NldElELFxuICAgICAgbWVtbyxcbiAgICAgIGFzT2YsXG4gICAgICBjaGFuZ2VUaHJlc2hvbGRcbiAgICApXG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4LCB0aGlzLmdldENyZWF0aW9uVHhGZWUoKSkpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcIkZhaWxlZCBHb29zZSBFZ2cgQ2hlY2tcIilcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbHRVbnNpZ25lZFR4XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgYW4gdW5zaWduZWQgW1tEZXBvc2l0VHhdXS5cbiAgICpcbiAgICogQHBhcmFtIHZlcnNpb24gT3B0aW9uYWwuIFRyYW5zYWN0aW9uIHZlcnNpb24gbnVtYmVyLCBkZWZhdWx0IDAuXG4gICAqIEBwYXJhbSB1dHhvc2V0IEEgc2V0IG9mIFVUWE9zIHRoYXQgdGhlIHRyYW5zYWN0aW9uIGlzIGJ1aWx0IG9uXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3MuXG4gICAqIEBwYXJhbSBkZXBvc2l0T2ZmZXJJRCBJRCBvZiB0aGUgZGVwb3NpdCBvZmZlci5cbiAgICogQHBhcmFtIGRlcG9zaXREdXJhdGlvbiBEdXJhdGlvbiBvZiB0aGUgZGVwb3NpdFxuICAgKiBAcGFyYW0gcmV3YXJkc093bmVyIE9wdGlvbmFsIFRoZSBvd25lcnMgb2YgdGhlIHJld2FyZC4gSWYgb21pdHRlZCwgYWxsIGlucHV0cyBtdXN0IGhhdmUgdGhlIHNhbWUgb3duZXJcbiAgICogQHBhcmFtIGRlcG9zaXRDcmVhdG9yQWRkcmVzcyBBZGRyZXNzIHRoYXQgaXMgYXV0aG9yaXplZCB0byBjcmVhdGUgZGVwb3NpdCB3aXRoIGdpdmVuIG9mZmVyLiBDb3VsZCBiZSBlbXB0eSwgaWYgb2ZmZXIgb3duZXIgaXMgZW1wdHkuXG4gICAqIEBwYXJhbSBkZXBvc2l0Q3JlYXRvckF1dGggQXV0aCBmb3IgZGVwb3NpdCBjcmVhdG9yIGFkZHJlc3NcbiAgICogQHBhcmFtIGRlcG9zaXRPZmZlck93bmVyU2lncyBTaWduYXR1cmVzIHdoaWNoIHJlY292ZXIgdG8gZGVwb3NpdE9mZmVyT3duZXIgYWRkcmVzcyhlcylcbiAgICogQHBhcmFtIGRlcG9zaXRPZmZlck93bmVyQXV0aCBBdXRoIGZvciBkZXBvc2l0IG9mZmVyIG93bmVyXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBjaGFuZ2VUaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBjaGFuZ2UgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgYnVpbGREZXBvc2l0VHggPSBhc3luYyAoXG4gICAgdmVyc2lvbjogbnVtYmVyID0gRGVmYXVsdFRyYW5zYWN0aW9uVmVyc2lvbk51bWJlcixcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIGZyb21BZGRyZXNzZXM6IEZyb21UeXBlLFxuICAgIGNoYW5nZUFkZHJlc3Nlczogc3RyaW5nW10gPSB1bmRlZmluZWQsXG4gICAgZGVwb3NpdE9mZmVySUQ6IHN0cmluZyB8IEJ1ZmZlcixcbiAgICBkZXBvc2l0RHVyYXRpb246IG51bWJlcixcbiAgICByZXdhcmRzT3duZXI6IE91dHB1dE93bmVycyA9IHVuZGVmaW5lZCxcbiAgICBkZXBvc2l0Q3JlYXRvckFkZHJlc3M6IHN0cmluZyB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBkZXBvc2l0Q3JlYXRvckF1dGg6IFtudW1iZXIsIHN0cmluZyB8IEJ1ZmZlcl1bXSA9IFtdLFxuICAgIGRlcG9zaXRPZmZlck93bmVyU2lnczogQnVmZmVyW10gPSBbXSxcbiAgICBkZXBvc2l0T2ZmZXJPd25lckF1dGg6IFtudW1iZXIsIHN0cmluZyB8IEJ1ZmZlcl1bXSA9IFtdLFxuICAgIG1lbW86IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gWmVyb0JOLFxuICAgIGFtb3VudFRvTG9jazogQk4sXG4gICAgY2hhbmdlVGhyZXNob2xkOiBudW1iZXIgPSAxLFxuICAgIHRvOiBCdWZmZXJbXSA9IFtdLFxuICAgIHRvVGhyZXNob2xkOiBudW1iZXIgPSAwXG4gICk6IFByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IGNhbGxlciA9IFwiYnVpbGREZXBvc2l0VHhcIlxuXG4gICAgY29uc3QgZnJvbVNpZ25lciA9IHRoaXMuX3BhcnNlRnJvbVNpZ25lcihmcm9tQWRkcmVzc2VzLCBjYWxsZXIpXG5cbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIoXG4gICAgICBjaGFuZ2VBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApXG5cbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKClcbiAgICBjb25zdCBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpXG4gICAgY29uc3QgZmVlOiBCTiA9IHRoaXMuZ2V0VHhGZWUoKVxuXG4gICAgaWYgKHR5cGVvZiBkZXBvc2l0T2ZmZXJJRCA9PT0gXCJzdHJpbmdcIilcbiAgICAgIGRlcG9zaXRPZmZlcklEID0gYmludG9vbHMuY2I1OERlY29kZShkZXBvc2l0T2ZmZXJJRClcblxuICAgIGNvbnN0IGRjX2F1dGg6IFtudW1iZXIsIEJ1ZmZlcl1bXSA9IFtdXG4gICAgZGVwb3NpdENyZWF0b3JBdXRoLmZvckVhY2goKGMpID0+IHtcbiAgICAgIGRjX2F1dGgucHVzaChbXG4gICAgICAgIGNbMF0sXG4gICAgICAgIHR5cGVvZiBjWzFdID09PSBcInN0cmluZ1wiID8gdGhpcy5wYXJzZUFkZHJlc3MoY1sxXSkgOiBjWzFdXG4gICAgICBdKVxuICAgIH0pXG5cbiAgICBpZiAoZGVwb3NpdE9mZmVyT3duZXJBdXRoLmxlbmd0aCAhPT0gZGVwb3NpdE9mZmVyT3duZXJTaWdzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT3duZXJBdXRoIGxlbmd0aCBtdXN0IG1hdGhjaCBPd25lclNpZ3MgbGVuZ3RoXCIpXG4gICAgfVxuXG4gICAgY29uc3Qgb19hdXRoOiBbbnVtYmVyLCBCdWZmZXJdW10gPSBbXVxuICAgIGRlcG9zaXRPZmZlck93bmVyQXV0aC5mb3JFYWNoKChjKSA9PiB7XG4gICAgICBvX2F1dGgucHVzaChbXG4gICAgICAgIGNbMF0sXG4gICAgICAgIHR5cGVvZiBjWzFdID09PSBcInN0cmluZ1wiID8gdGhpcy5wYXJzZUFkZHJlc3MoY1sxXSkgOiBjWzFdXG4gICAgICBdKVxuICAgIH0pXG5cbiAgICBpZiAodHlwZW9mIGRlcG9zaXRDcmVhdG9yQWRkcmVzcyA9PT0gXCJzdHJpbmdcIilcbiAgICAgIGRlcG9zaXRDcmVhdG9yQWRkcmVzcyA9IHRoaXMucGFyc2VBZGRyZXNzKGRlcG9zaXRDcmVhdG9yQWRkcmVzcylcblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDogVW5zaWduZWRUeCA9IGF3YWl0IHRoaXMuX2dldEJ1aWxkZXIoXG4gICAgICB1dHhvc2V0XG4gICAgKS5idWlsZERlcG9zaXRUeChcbiAgICAgIHZlcnNpb24sXG4gICAgICBuZXR3b3JrSUQsXG4gICAgICBibG9ja2NoYWluSUQsXG4gICAgICBmcm9tU2lnbmVyLFxuICAgICAgY2hhbmdlLFxuICAgICAgZGVwb3NpdE9mZmVySUQsXG4gICAgICBkZXBvc2l0RHVyYXRpb24sXG4gICAgICByZXdhcmRzT3duZXIsXG4gICAgICBkZXBvc2l0Q3JlYXRvckFkZHJlc3MsXG4gICAgICBkY19hdXRoLFxuICAgICAgZGVwb3NpdE9mZmVyT3duZXJTaWdzLFxuICAgICAgb19hdXRoLFxuICAgICAgZmVlLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLFxuICAgICAgYXNPZixcbiAgICAgIGFtb3VudFRvTG9jayxcbiAgICAgIGNoYW5nZVRocmVzaG9sZCxcbiAgICAgIHRvLFxuICAgICAgdG9UaHJlc2hvbGRcbiAgICApXG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4LCB0aGlzLmdldENyZWF0aW9uVHhGZWUoKSkpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcIkZhaWxlZCBHb29zZSBFZ2cgQ2hlY2tcIilcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbHRVbnNpZ25lZFR4XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgYW4gdW5zaWduZWQgW1tVbmxvY2tEZXBvc2l0VHhdXS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPcy5cbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGNoYW5nZVRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IGNoYW5nZSBVVFhPXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAqL1xuICBidWlsZFVubG9ja0RlcG9zaXRUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIGZyb21BZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIGNoYW5nZUFkZHJlc3Nlczogc3RyaW5nW10gPSB1bmRlZmluZWQsXG4gICAgbWVtbzogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBaZXJvQk4sXG4gICAgYW1vdW50VG9Mb2NrOiBCTixcbiAgICBjaGFuZ2VUaHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyID0gXCJidWlsZFVubG9ja0RlcG9zaXRUeFwiXG4gICAgY29uc3QgZnJvbVNpZ25lciA9IHRoaXMuX3BhcnNlRnJvbVNpZ25lcihmcm9tQWRkcmVzc2VzLCBjYWxsZXIpXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5QnVmZmVyKFxuICAgICAgY2hhbmdlQWRkcmVzc2VzLFxuICAgICAgY2FsbGVyXG4gICAgKVxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcbiAgICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKVxuICAgIGNvbnN0IGJsb2NrY2hhaW5JRDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRClcbiAgICBjb25zdCBmZWU6IEJOID0gdGhpcy5nZXRUeEZlZSgpXG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBhd2FpdCB0aGlzLl9nZXRCdWlsZGVyKFxuICAgICAgdXR4b3NldFxuICAgICkuYnVpbGRVbmxvY2tEZXBvc2l0VHgoXG4gICAgICBuZXR3b3JrSUQsXG4gICAgICBibG9ja2NoYWluSUQsXG4gICAgICBmcm9tU2lnbmVyLFxuICAgICAgY2hhbmdlLFxuICAgICAgZmVlLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLFxuICAgICAgYXNPZixcbiAgICAgIGNoYW5nZVRocmVzaG9sZFxuICAgIClcblxuICAgIGlmICghKGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgsIHRoaXMuZ2V0Q3JlYXRpb25UeEZlZSgpKSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgR29vc2VFZ2dDaGVja0Vycm9yKFwiRmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKVxuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCBhbiB1bnNpZ25lZCBbW0NsYWltVHhdXS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPcy5cbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGNoYW5nZVRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IGNoYW5nZSBVVFhPXG4gICAqIEBwYXJhbSBjbGFpbUFtb3VudHMgVGhlIHNwZWNpZmljYXRpb24gYW5kIGF1dGhlbnRpY2F0aW9uIHdoYXQgYW5kIGhvdyBtdWNoIHRvIGNsYWltXG4gICAqIEBwYXJhbSBjbGFpbVRvIFRoZSBhZGRyZXNzIHRvIGNsYWltZWQgcmV3YXJkcyB3aWxsIGJlIGRpcmVjdGVkIHRvXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAqL1xuICBidWlsZENsYWltVHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICBmcm9tQWRkcmVzc2VzOiBGcm9tVHlwZSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IHN0cmluZ1tdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gWmVyb0JOLFxuICAgIGNoYW5nZVRocmVzaG9sZDogbnVtYmVyID0gMSxcbiAgICBjbGFpbUFtb3VudHM6IENsYWltQW1vdW50UGFyYW1zW10sXG4gICAgY2xhaW1UbzogT3V0cHV0T3duZXJzID0gdW5kZWZpbmVkXG4gICk6IFByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IGNhbGxlciA9IFwiYnVpbGRDbGFpbVR4XCJcbiAgICBjb25zdCBmcm9tU2lnbmVyID0gdGhpcy5fcGFyc2VGcm9tU2lnbmVyKGZyb21BZGRyZXNzZXMsIGNhbGxlcilcbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIoXG4gICAgICBjaGFuZ2VBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApXG4gICAgaWYgKG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgICAgbWVtbyA9IG1lbW8uZ2V0UGF5bG9hZCgpXG4gICAgfVxuICAgIGlmIChjbGFpbUFtb3VudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNdXN0IHByb3ZpZGUgYXQgbGVhc3Qgb25lIGNsYWltQW1vdW50XCIpXG4gICAgfVxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcbiAgICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKVxuICAgIGNvbnN0IGJsb2NrY2hhaW5JRDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRClcbiAgICBjb25zdCBmZWU6IEJOID0gdGhpcy5nZXRUeEZlZSgpXG5cbiAgICBjb25zdCB1bnNpZ25lZENsYWltVHg6IFVuc2lnbmVkVHggPSBhd2FpdCB0aGlzLl9nZXRCdWlsZGVyKFxuICAgICAgdXR4b3NldFxuICAgICkuYnVpbGRDbGFpbVR4KFxuICAgICAgbmV0d29ya0lELFxuICAgICAgYmxvY2tjaGFpbklELFxuICAgICAgZnJvbVNpZ25lcixcbiAgICAgIGNoYW5nZSxcbiAgICAgIGZlZSxcbiAgICAgIGF2YXhBc3NldElELFxuICAgICAgbWVtbyxcbiAgICAgIGFzT2YsXG4gICAgICBjaGFuZ2VUaHJlc2hvbGQsXG4gICAgICBjbGFpbUFtb3VudHMsXG4gICAgICBjbGFpbVRvXG4gICAgKVxuXG4gICAgaWYgKCEoYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKHVuc2lnbmVkQ2xhaW1UeCwgdGhpcy5nZXRDcmVhdGlvblR4RmVlKCkpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIHVuc2lnbmVkQ2xhaW1UeFxuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkIGFuIHVuc2lnbmVkIFtbTXVsdGlzaWdBbGlhc1R4XV0uXG4gICAqXG4gICAqIEBwYXJhbSB1dHhvc2V0IEEgc2V0IG9mIFVUWE9zIHRoYXQgdGhlIHRyYW5zYWN0aW9uIGlzIGJ1aWx0IG9uXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3MuXG4gICAqIEBwYXJhbSBtdWx0aXNpZ0FsaWFzUGFyYW1zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIGZvciB0aGUgbXVsdGlzaWdBbGlhc1R4XG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBjaGFuZ2VUaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBjaGFuZ2UgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgYnVpbGRNdWx0aXNpZ0FsaWFzVHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICBmcm9tQWRkcmVzc2VzOiBGcm9tVHlwZSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIG11bHRpc2lnQWxpYXNQYXJhbXM6IE11bHRpc2lnQWxpYXNQYXJhbXMsXG4gICAgbWVtbzogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBaZXJvQk4sXG4gICAgY2hhbmdlVGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICk6IFByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IGNhbGxlciA9IFwiYnVpbGRNdWx0aXNpZ0FsaWFzVHhcIlxuXG4gICAgY29uc3QgZnJvbVNpZ25lciA9IHRoaXMuX3BhcnNlRnJvbVNpZ25lcihmcm9tQWRkcmVzc2VzLCBjYWxsZXIpXG5cbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIoXG4gICAgICBjaGFuZ2VBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApXG5cbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKClcbiAgICBjb25zdCBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpXG4gICAgY29uc3QgZmVlOiBCTiA9IHRoaXMuZ2V0VHhGZWUoKVxuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gYXdhaXQgdGhpcy5fZ2V0QnVpbGRlcihcbiAgICAgIHV0eG9zZXRcbiAgICApLmJ1aWxkTXVsdGlzaWdBbGlhc1R4KFxuICAgICAgbmV0d29ya0lELFxuICAgICAgYmxvY2tjaGFpbklELFxuICAgICAgZnJvbVNpZ25lcixcbiAgICAgIGNoYW5nZSxcbiAgICAgIG11bHRpc2lnQWxpYXNQYXJhbXMsXG4gICAgICBmZWUsXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sXG4gICAgICBhc09mLFxuICAgICAgY2hhbmdlVGhyZXNob2xkXG4gICAgKVxuXG4gICAgaWYgKCEoYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCwgdGhpcy5nZXRDcmVhdGlvblR4RmVlKCkpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgYnVpbGRBZGREZXBvc2l0T2ZmZXJUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIGZyb21BZGRyZXNzZXM6IEZyb21UeXBlLFxuICAgIGNoYW5nZUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgZGVwb3NpdE9mZmVyOiBEZXBvc2l0T2ZmZXIsXG4gICAgZGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3M6IHN0cmluZyxcbiAgICBkZXBvc2l0T2ZmZXJDcmVhdG9yQXV0aDogW251bWJlciwgc3RyaW5nIHwgQnVmZmVyXVtdID0gW10sXG4gICAgbWVtbzogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBaZXJvQk4sXG4gICAgY2hhbmdlVGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICk6IFByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IGNhbGxlciA9IFwiYnVpbGRBZGREZXBvc2l0T2ZmZXJUeFwiXG5cbiAgICBjb25zdCBmcm9tU2lnbmVyID0gdGhpcy5fcGFyc2VGcm9tU2lnbmVyKGZyb21BZGRyZXNzZXMsIGNhbGxlcilcblxuICAgIGNvbnN0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheUJ1ZmZlcihcbiAgICAgIGNoYW5nZUFkZHJlc3NlcyxcbiAgICAgIGNhbGxlclxuICAgIClcblxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcbiAgICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKVxuICAgIGNvbnN0IGJsb2NrY2hhaW5JRDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRClcbiAgICBjb25zdCBmZWU6IEJOID0gdGhpcy5nZXRUeEZlZSgpXG5cbiAgICBjb25zdCBhdXRoOiBbbnVtYmVyLCBCdWZmZXJdW10gPSBbXVxuICAgIGRlcG9zaXRPZmZlckNyZWF0b3JBdXRoLmZvckVhY2goKGMpID0+IHtcbiAgICAgIGF1dGgucHVzaChbXG4gICAgICAgIGNbMF0sXG4gICAgICAgIHR5cGVvZiBjWzFdID09PSBcInN0cmluZ1wiID8gdGhpcy5wYXJzZUFkZHJlc3MoY1sxXSkgOiBjWzFdXG4gICAgICBdKVxuICAgIH0pXG5cbiAgICBsZXQgb3duZXJBZGRyZXNzOiBCdWZmZXJcbiAgICBpZiAoZGVwb3NpdE9mZmVyLm93bmVyQWRkcmVzcykge1xuICAgICAgb3duZXJBZGRyZXNzID0gdGhpcy5wYXJzZUFkZHJlc3MoZGVwb3NpdE9mZmVyLm93bmVyQWRkcmVzcylcbiAgICB9XG5cbiAgICBjb25zdCBvZmZlcjogT2ZmZXIgPSBuZXcgT2ZmZXIoXG4gICAgICBkZXBvc2l0T2ZmZXIudXBncmFkZVZlcnNpb24sXG4gICAgICBkZXBvc2l0T2ZmZXIuaW50ZXJlc3RSYXRlTm9taW5hdG9yLFxuICAgICAgZGVwb3NpdE9mZmVyLnN0YXJ0LFxuICAgICAgZGVwb3NpdE9mZmVyLmVuZCxcbiAgICAgIGRlcG9zaXRPZmZlci5taW5BbW91bnQsXG4gICAgICBkZXBvc2l0T2ZmZXIudG90YWxNYXhBbW91bnQsXG4gICAgICBkZXBvc2l0T2ZmZXIuZGVwb3NpdGVkQW1vdW50LFxuICAgICAgZGVwb3NpdE9mZmVyLm1pbkR1cmF0aW9uLFxuICAgICAgZGVwb3NpdE9mZmVyLm1heER1cmF0aW9uLFxuICAgICAgZGVwb3NpdE9mZmVyLnVubG9ja1BlcmlvZER1cmF0aW9uLFxuICAgICAgZGVwb3NpdE9mZmVyLm5vUmV3YXJkc1BlcmlvZER1cmF0aW9uLFxuICAgICAgQnVmZmVyLmZyb20oZGVwb3NpdE9mZmVyLm1lbW8sIFwidXRmLThcIiksXG4gICAgICBkZXBvc2l0T2ZmZXIuZmxhZ3MsXG4gICAgICBkZXBvc2l0T2ZmZXIudG90YWxNYXhSZXdhcmRBbW91bnQsXG4gICAgICBkZXBvc2l0T2ZmZXIucmV3YXJkZWRBbW91bnQsXG4gICAgICBvd25lckFkZHJlc3NcbiAgICApXG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBhd2FpdCB0aGlzLl9nZXRCdWlsZGVyKFxuICAgICAgdXR4b3NldFxuICAgICkuYnVpbGRBZGREZXBvc2l0T2ZmZXJUeChcbiAgICAgIG5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIGZyb21TaWduZXIsXG4gICAgICBjaGFuZ2UsXG4gICAgICBvZmZlcixcbiAgICAgIHRoaXMucGFyc2VBZGRyZXNzKGRlcG9zaXRPZmZlckNyZWF0b3JBZGRyZXNzKSxcbiAgICAgIGF1dGgsXG4gICAgICBmZWUsXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sXG4gICAgICBhc09mLFxuICAgICAgY2hhbmdlVGhyZXNob2xkXG4gICAgKVxuXG4gICAgaWYgKCEoYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCwgdGhpcy5nZXRDcmVhdGlvblR4RmVlKCkpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAqIEBpZ25vcmVcbiAgICovXG4gIHByb3RlY3RlZCBfY2xlYW5BZGRyZXNzQXJyYXkoXG4gICAgYWRkcmVzc2VzOiBzdHJpbmdbXSB8IEJ1ZmZlcltdLFxuICAgIGNhbGxlcjogc3RyaW5nXG4gICk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBhZGRyczogc3RyaW5nW10gPSBbXVxuICAgIGNvbnN0IGNoYWluaWQ6IHN0cmluZyA9IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKClcbiAgICAgID8gdGhpcy5nZXRCbG9ja2NoYWluQWxpYXMoKVxuICAgICAgOiB0aGlzLmdldEJsb2NrY2hhaW5JRCgpXG4gICAgaWYgKGFkZHJlc3NlcyAmJiBhZGRyZXNzZXMubGVuZ3RoID4gMCkge1xuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodHlwZW9mIGFkZHJlc3Nlc1tgJHtpfWBdID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgdHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKGFkZHJlc3Nlc1tgJHtpfWBdIGFzIHN0cmluZykgPT09XG4gICAgICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihgRXJyb3IgLSBJbnZhbGlkIGFkZHJlc3MgZm9ybWF0ICgke2NhbGxlcn0pYClcbiAgICAgICAgICB9XG4gICAgICAgICAgYWRkcnMucHVzaChhZGRyZXNzZXNbYCR7aX1gXSBhcyBzdHJpbmcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgYmVjaDMyOiBTZXJpYWxpemVkVHlwZSA9IFwiYmVjaDMyXCJcbiAgICAgICAgICBhZGRycy5wdXNoKFxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbi5idWZmZXJUb1R5cGUoXG4gICAgICAgICAgICAgIGFkZHJlc3Nlc1tgJHtpfWBdIGFzIEJ1ZmZlcixcbiAgICAgICAgICAgICAgYmVjaDMyLFxuICAgICAgICAgICAgICB0aGlzLmNvcmUuZ2V0SFJQKCksXG4gICAgICAgICAgICAgIGNoYWluaWRcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFkZHJzXG4gIH1cblxuICBwcm90ZWN0ZWQgX2NsZWFuQWRkcmVzc0FycmF5QnVmZmVyKFxuICAgIGFkZHJlc3Nlczogc3RyaW5nW10gfCBCdWZmZXJbXSxcbiAgICBjYWxsZXI6IHN0cmluZ1xuICApOiBCdWZmZXJbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGFkZHJlc3NlcywgY2FsbGVyKS5tYXAoXG4gICAgICAoYTogc3RyaW5nKTogQnVmZmVyID0+IHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBhID09PSBcInVuZGVmaW5lZFwiXG4gICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICA6IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKVxuICAgICAgfVxuICAgIClcbiAgfVxuXG4gIHByb3RlY3RlZCBfcGFyc2VGcm9tU2lnbmVyKGZyb206IEZyb21UeXBlLCBjYWxsZXI6IHN0cmluZyk6IEZyb21TaWduZXIge1xuICAgIGlmIChmcm9tLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICh0eXBlb2YgZnJvbVswXSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBmcm9tOiB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheUJ1ZmZlcihmcm9tIGFzIHN0cmluZ1tdLCBjYWxsZXIpLFxuICAgICAgICAgIHNpZ25lcjogW11cbiAgICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGZyb206IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5QnVmZmVyKGZyb21bMF0gYXMgc3RyaW5nW10sIGNhbGxlciksXG4gICAgICAgICAgc2lnbmVyOlxuICAgICAgICAgICAgZnJvbS5sZW5ndGggPiAxXG4gICAgICAgICAgICAgID8gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIoZnJvbVsxXSBhcyBzdHJpbmdbXSwgY2FsbGVyKVxuICAgICAgICAgICAgICA6IFtdXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgZnJvbTogW10sIHNpZ25lcjogW10gfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBpbnN0YW50aWF0ZWQgZGlyZWN0bHkuXG4gICAqIEluc3RlYWQgdXNlIHRoZSBbW0F2YWxhbmNoZS5hZGRBUEldXSBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSBjb3JlIEEgcmVmZXJlbmNlIHRvIHRoZSBBdmFsYW5jaGUgY2xhc3NcbiAgICogQHBhcmFtIGJhc2VVUkwgRGVmYXVsdHMgdG8gdGhlIHN0cmluZyBcIi9leHQvUFwiIGFzIHRoZSBwYXRoIHRvIGJsb2NrY2hhaW4ncyBiYXNlVVJMXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb3JlOiBBdmFsYW5jaGVDb3JlLCBiYXNlVVJMOiBzdHJpbmcgPSBcIi9leHQvYmMvUFwiKSB7XG4gICAgc3VwZXIoY29yZSwgYmFzZVVSTClcbiAgICBpZiAoY29yZS5nZXROZXR3b3JrKCkpIHtcbiAgICAgIHRoaXMuYmxvY2tjaGFpbklEID0gY29yZS5nZXROZXR3b3JrKCkuUC5ibG9ja2NoYWluSURcbiAgICAgIHRoaXMua2V5Y2hhaW4gPSBuZXcgS2V5Q2hhaW4oY29yZS5nZXRIUlAoKSwgY29yZS5nZXROZXR3b3JrKCkuUC5hbGlhcylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgdGhlIGN1cnJlbnQgdGltZXN0YW1wIG9uIGNoYWluLlxuICAgKi9cbiAgZ2V0VGltZXN0YW1wID0gYXN5bmMgKCk6IFByb21pc2U8bnVtYmVyPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmdldFRpbWVzdGFtcFwiXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC50aW1lc3RhbXBcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB0aGUgVVRYT3MgdGhhdCB3ZXJlIHJld2FyZGVkIGFmdGVyIHRoZSBwcm92aWRlZCB0cmFuc2FjdGlvblwicyBzdGFraW5nIG9yIGRlbGVnYXRpb24gcGVyaW9kIGVuZGVkLlxuICAgKi9cbiAgZ2V0UmV3YXJkVVRYT3MgPSBhc3luYyAoXG4gICAgdHhJRDogc3RyaW5nLFxuICAgIGVuY29kaW5nPzogc3RyaW5nXG4gICk6IFByb21pc2U8R2V0UmV3YXJkVVRYT3NSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogR2V0UmV3YXJkVVRYT3NQYXJhbXMgPSB7XG4gICAgICB0eElELFxuICAgICAgZW5jb2RpbmdcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcInBsYXRmb3JtLmdldFJld2FyZFVUWE9zXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogR2V0IGJsb2NrY2hhaW5zIGNvbmZpZ3VyYXRpb24gKGdlbmVzaXMpXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIEdldENvbmZpZ3VyYXRpb25SZXNwb25zZVxuICAgKi9cbiAgZ2V0Q29uZmlndXJhdGlvbiA9IGFzeW5jICgpOiBQcm9taXNlPEdldENvbmZpZ3VyYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJwbGF0Zm9ybS5nZXRDb25maWd1cmF0aW9uXCJcbiAgICApXG4gICAgY29uc3QgciA9IHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gICAgcmV0dXJuIHtcbiAgICAgIG5ldHdvcmtJRDogcGFyc2VJbnQoci5uZXR3b3JrSUQpLFxuICAgICAgYXNzZXRJRDogci5hc3NldElELFxuICAgICAgYXNzZXRTeW1ib2w6IHIuYXNzZXRTeW1ib2wsXG4gICAgICBocnA6IHIuaHJwLFxuICAgICAgYmxvY2tjaGFpbnM6IHIuYmxvY2tjaGFpbnMsXG4gICAgICBtaW5TdGFrZUR1cmF0aW9uOiBuZXcgQk4oci5taW5TdGFrZUR1cmF0aW9uKS5kaXYoTmFub0JOKS50b051bWJlcigpLFxuICAgICAgbWF4U3Rha2VEdXJhdGlvbjogbmV3IEJOKHIubWF4U3Rha2VEdXJhdGlvbikuZGl2KE5hbm9CTikudG9OdW1iZXIoKSxcbiAgICAgIG1pblZhbGlkYXRvclN0YWtlOiBuZXcgQk4oci5taW5WYWxpZGF0b3JTdGFrZSksXG4gICAgICBtYXhWYWxpZGF0b3JTdGFrZTogbmV3IEJOKHIubWF4VmFsaWRhdG9yU3Rha2UpLFxuICAgICAgbWluRGVsZWdhdGlvbkZlZTogbmV3IEJOKHIubWluRGVsZWdhdGlvbkZlZSksXG4gICAgICBtaW5EZWxlZ2F0b3JTdGFrZTogbmV3IEJOKHIubWluRGVsZWdhdG9yU3Rha2UpLFxuICAgICAgbWluQ29uc3VtcHRpb25SYXRlOiBwYXJzZUludChyLm1pbkNvbnN1bXB0aW9uUmF0ZSkgLyByZXdhcmRQZXJjZW50RGVub20sXG4gICAgICBtYXhDb25zdW1wdGlvblJhdGU6IHBhcnNlSW50KHIubWF4Q29uc3VtcHRpb25SYXRlKSAvIHJld2FyZFBlcmNlbnREZW5vbSxcbiAgICAgIHN1cHBseUNhcDogbmV3IEJOKHIuc3VwcGx5Q2FwKSxcbiAgICAgIHZlcmlmeU5vZGVTaWduYXR1cmU6IHIudmVyaWZ5Tm9kZVNpZ25hdHVyZSA/PyBmYWxzZSxcbiAgICAgIGxvY2tNb2RlQm9uZERlcG9zaXQ6IHIubG9ja01vZGVCb25kRGVwb3NpdCA/PyBmYWxzZVxuICAgIH0gYXMgR2V0Q29uZmlndXJhdGlvblJlc3BvbnNlXG4gIH1cblxuICAvKipcbiAgICogR2V0IGJsb2NrY2hhaW5zIGNvbmZpZ3VyYXRpb24gKGdlbmVzaXMpXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIEdldENvbmZpZ3VyYXRpb25SZXNwb25zZVxuICAgKi9cbiAgc3BlbmQgPSBhc3luYyAoXG4gICAgZnJvbTogc3RyaW5nW10gfCBzdHJpbmcsXG4gICAgc2lnbmVyOiBzdHJpbmdbXSB8IHN0cmluZyxcbiAgICB0bzogc3RyaW5nW10sXG4gICAgdG9UaHJlc2hvbGQ6IG51bWJlcixcbiAgICB0b0xvY2tUaW1lOiBCTixcbiAgICBjaGFuZ2U6IHN0cmluZ1tdLFxuICAgIGNoYW5nZVRocmVzaG9sZDogbnVtYmVyLFxuICAgIGxvY2tNb2RlOiBMb2NrTW9kZSxcbiAgICBhbW91bnRUb0xvY2s6IEJOLFxuICAgIGFtb3VudFRvQnVybjogQk4sXG4gICAgYXNPZjogQk4sXG4gICAgZW5jb2Rpbmc/OiBzdHJpbmdcbiAgKTogUHJvbWlzZTxTcGVuZFJlcGx5PiA9PiB7XG4gICAgaWYgKCFbXCJVbmxvY2tlZFwiLCBcIkRlcG9zaXRcIiwgXCJCb25kXCJdLmluY2x1ZGVzKGxvY2tNb2RlKSkge1xuICAgICAgdGhyb3cgbmV3IFByb3RvY29sRXJyb3IoXCJFcnJvciAtLSBQbGF0Zm9ybUFQSS5zcGVuZDogaW52YWxpZCBsb2NrTW9kZVwiKVxuICAgIH1cbiAgICBjb25zdCBwYXJhbXM6IFNwZW5kUGFyYW1zID0ge1xuICAgICAgZnJvbSxcbiAgICAgIHNpZ25lcixcbiAgICAgIHRvOlxuICAgICAgICB0by5sZW5ndGggPiAwXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGxvY2t0aW1lOiB0b0xvY2tUaW1lLnRvU3RyaW5nKDEwKSxcbiAgICAgICAgICAgICAgdGhyZXNob2xkOiB0b1RocmVzaG9sZCxcbiAgICAgICAgICAgICAgYWRkcmVzc2VzOiB0b1xuICAgICAgICAgICAgfVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgY2hhbmdlOlxuICAgICAgICBjaGFuZ2UubGVuZ3RoID4gMFxuICAgICAgICAgID8geyBsb2NrdGltZTogXCIwXCIsIHRocmVzaG9sZDogY2hhbmdlVGhyZXNob2xkLCBhZGRyZXNzZXM6IGNoYW5nZSB9XG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICBsb2NrTW9kZTogbG9ja01vZGUgPT09IFwiVW5sb2NrZWRcIiA/IDAgOiBsb2NrTW9kZSA9PT0gXCJEZXBvc2l0XCIgPyAxIDogMixcbiAgICAgIGFtb3VudFRvTG9jazogYW1vdW50VG9Mb2NrLnRvU3RyaW5nKDEwKSxcbiAgICAgIGFtb3VudFRvQnVybjogYW1vdW50VG9CdXJuLnRvU3RyaW5nKDEwKSxcbiAgICAgIGFzT2Y6IGFzT2YudG9TdHJpbmcoMTApLFxuICAgICAgZW5jb2Rpbmc6IGVuY29kaW5nID8/IFwiaGV4XCJcbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwicGxhdGZvcm0uc3BlbmRcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICBjb25zdCByID0gcmVzcG9uc2UuZGF0YS5yZXN1bHRcblxuICAgIC8vIFdlIG5lZWQgdG8gdXBkYXRlIHNpZ25hdHVyZSBpbmRleCBzb3VyY2UgaGVyZVxuICAgIGNvbnN0IGlucyA9IFRyYW5zZmVyYWJsZUlucHV0LmZyb21BcnJheShCdWZmZXIuZnJvbShyLmlucy5zbGljZSgyKSwgXCJoZXhcIikpXG4gICAgaW5zLmZvckVhY2goKGUsIGlkeCkgPT5cbiAgICAgIGUuZ2V0U2lnSWR4cygpLmZvckVhY2goKHMsIHNpZHgpID0+IHtcbiAgICAgICAgcy5zZXRTb3VyY2UoYmludG9vbHMuY2I1OERlY29kZShyLnNpZ25lcnNbYCR7aWR4fWBdW2Ake3NpZHh9YF0pKVxuICAgICAgfSlcbiAgICApXG5cbiAgICByZXR1cm4ge1xuICAgICAgaW5zLFxuICAgICAgb3V0OiBUcmFuc2ZlcmFibGVPdXRwdXQuZnJvbUFycmF5KEJ1ZmZlci5mcm9tKHIub3V0cy5zbGljZSgyKSwgXCJoZXhcIikpLFxuICAgICAgb3duZXJzOiByLm93bmVyc1xuICAgICAgICA/IE91dHB1dE93bmVycy5mcm9tQXJyYXkoQnVmZmVyLmZyb20oci5vd25lcnMuc2xpY2UoMiksIFwiaGV4XCIpKVxuICAgICAgICA6IFtdXG4gICAgfVxuICB9XG5cbiAgX2dldEJ1aWxkZXIgPSAodXR4b1NldDogVVRYT1NldCk6IEJ1aWxkZXIgPT4ge1xuICAgIGlmICh0aGlzLmNvcmUuZ2V0TmV0d29yaygpLlAubG9ja01vZGVCb25kRGVwb3NpdCkge1xuICAgICAgcmV0dXJuIG5ldyBCdWlsZGVyKG5ldyBTcGVuZGVyKHRoaXMpLCB0cnVlKVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEJ1aWxkZXIodXR4b1NldCwgZmFsc2UpXG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgYW4gdW5zaWduZWQgW1tBZGRQcm9wb3NhbFR4XV0uXG4gICAqXG4gICAqIEBwYXJhbSB1dHhvc2V0IEEgc2V0IG9mIFVUWE9zIHRoYXQgdGhlIHRyYW5zYWN0aW9uIGlzIGJ1aWx0IG9uXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3MuXG4gICAqIEBwYXJhbSBwcm9wb3NhbERlc2NyaXB0aW9uIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBwcm9wb3NhbCBUaGUgcHJvcG9zYWwgY29udGVudCB0aGF0IHdpbGwgYmUgY3JlYXRlZC5cbiAgICogQHBhcmFtIHByb3Bvc2VyQWRkcmVzcyBUaGUgUC1hZGRyZXNzIG9mIHByb3Bvc2VyIGluIEJ1ZmZlci5cbiAgICogQHBhcmFtIHZlcnNpb24gT3B0aW9uYWwuIFRyYW5zYWN0aW9uIHZlcnNpb24gbnVtYmVyLCBkZWZhdWx0IDAuXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBjaGFuZ2VUaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBjaGFuZ2UgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgYnVpbGRBZGRQcm9wb3NhbFR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgZnJvbUFkZHJlc3NlczogRnJvbVR5cGUsXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBwcm9wb3NhbERlc2NyaXB0aW9uOiBCdWZmZXIsXG4gICAgcHJvcG9zYWw6IFByb3Bvc2FsLFxuICAgIHByb3Bvc2VyQWRkcmVzczogQnVmZmVyLFxuICAgIHZlcnNpb246IG51bWJlciA9IERlZmF1bHRUcmFuc2FjdGlvblZlcnNpb25OdW1iZXIsXG4gICAgbWVtbzogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBaZXJvQk4sXG4gICAgY2hhbmdlVGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICk6IFByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IGNhbGxlciA9IFwiYnVpbGRBZGRQcm9wb3NhbFR4XCJcblxuICAgIGNvbnN0IGZyb21TaWduZXIgPSB0aGlzLl9wYXJzZUZyb21TaWduZXIoZnJvbUFkZHJlc3NlcywgY2FsbGVyKVxuICAgIGNvbnN0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheUJ1ZmZlcihcbiAgICAgIGNoYW5nZUFkZHJlc3NlcyxcbiAgICAgIGNhbGxlclxuICAgIClcblxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcbiAgICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKVxuICAgIGNvbnN0IGJsb2NrY2hhaW5JRDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRClcbiAgICBjb25zdCBmZWU6IEJOID0gdGhpcy5nZXRUeEZlZSgpXG4gICAgY29uc3QgcHJvcG9zZXJBdXRoID0gbmV3IFN1Ym5ldEF1dGgoKVxuICAgIGNvbnN0IGFkZHJlc3NJZHggPSBCdWZmZXIuYWxsb2MoNClcbiAgICBwcm9wb3NlckF1dGguYWRkQWRkcmVzc0luZGV4KGFkZHJlc3NJZHgpXG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBhd2FpdCB0aGlzLl9nZXRCdWlsZGVyKFxuICAgICAgdXR4b3NldFxuICAgICkuYnVpbGRBZGRQcm9wb3NhbFR4KFxuICAgICAgbmV0d29ya0lELFxuICAgICAgYmxvY2tjaGFpbklELFxuICAgICAgZnJvbVNpZ25lcixcbiAgICAgIGNoYW5nZSxcbiAgICAgIHByb3Bvc2FsRGVzY3JpcHRpb24sXG4gICAgICBwcm9wb3NhbCxcbiAgICAgIHByb3Bvc2VyQWRkcmVzcyxcbiAgICAgIHByb3Bvc2VyQXV0aCxcbiAgICAgIHZlcnNpb24sXG4gICAgICBtZW1vLFxuICAgICAgZmVlLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBhc09mLFxuICAgICAgY2hhbmdlVGhyZXNob2xkXG4gICAgKVxuXG4gICAgaWYgKCEoYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCwgdGhpcy5nZXRDcmVhdGlvblR4RmVlKCkpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkIGFuIHVuc2lnbmVkIFtbQWRkVm90ZVR4XV0uXG4gICAqXG4gICAqIEBwYXJhbSB1dHhvc2V0IEEgc2V0IG9mIFVUWE9zIHRoYXQgdGhlIHRyYW5zYWN0aW9uIGlzIGJ1aWx0IG9uXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3MuXG4gICAqIEBwYXJhbSBwcm9wb3NhbElEIFRoZSBwcm9wb3NhbElEIG9mIHRlaCBwcm9wb3NhbCBpbiBzdHJpbmdcbiAgICogQHBhcmFtIHZvdGVPcHRpb25JbmRleCBUaGUgaW5kZXggb2Ygdm90ZSBvcHRpb24uXG4gICAqIEBwYXJhbSB2b3RlckFkZHJlc3MgVGhlIFAtYWRkcmVzcyBvZiB2b3RlciBpbiBCdWZmZXIuXG4gICAqIEBwYXJhbSB2ZXJzaW9uIE9wdGlvbmFsLiBUcmFuc2FjdGlvbiB2ZXJzaW9uIG51bWJlciwgZGVmYXVsdCAwLlxuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gY2hhbmdlVGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgY2hhbmdlIFVUWE9cbiAgICpcbiAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgICovXG4gIGJ1aWxkQWRkVm90ZVR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgZnJvbUFkZHJlc3NlczogRnJvbVR5cGUsXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBwcm9wb3NhbElEOiBzdHJpbmcsXG4gICAgdm90ZU9wdGlvbkluZGV4OiBudW1iZXIsXG4gICAgdm90ZXJBZGRyZXNzOiBCdWZmZXIsXG4gICAgdmVyc2lvbjogbnVtYmVyID0gRGVmYXVsdFRyYW5zYWN0aW9uVmVyc2lvbk51bWJlcixcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFplcm9CTixcbiAgICBjaGFuZ2VUaHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyID0gXCJidWlsZEFkZFZvdGVUeFwiXG5cbiAgICBjb25zdCBmcm9tU2lnbmVyID0gdGhpcy5fcGFyc2VGcm9tU2lnbmVyKGZyb21BZGRyZXNzZXMsIGNhbGxlcilcbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXlCdWZmZXIoXG4gICAgICBjaGFuZ2VBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApXG5cbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKClcbiAgICBjb25zdCBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpXG4gICAgY29uc3QgZmVlOiBCTiA9IHRoaXMuZ2V0VHhGZWUoKVxuICAgIGNvbnN0IHByb3Bvc2FsSURCdWYgPSBiaW50b29scy5jYjU4RGVjb2RlKHByb3Bvc2FsSUQpXG4gICAgY29uc3Qgdm90ZXJBdXRoID0gbmV3IFN1Ym5ldEF1dGgoKVxuICAgIGNvbnN0IGFkZHJlc3NJZHggPSBCdWZmZXIuYWxsb2MoNClcbiAgICB2b3RlckF1dGguYWRkQWRkcmVzc0luZGV4KGFkZHJlc3NJZHgpXG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBhd2FpdCB0aGlzLl9nZXRCdWlsZGVyKFxuICAgICAgdXR4b3NldFxuICAgICkuYnVpbGRBZGRWb3RlVHgoXG4gICAgICBuZXR3b3JrSUQsXG4gICAgICBibG9ja2NoYWluSUQsXG4gICAgICBmcm9tU2lnbmVyLFxuICAgICAgY2hhbmdlLFxuICAgICAgcHJvcG9zYWxJREJ1ZixcbiAgICAgIHZvdGVPcHRpb25JbmRleCxcbiAgICAgIHZvdGVyQWRkcmVzcyxcbiAgICAgIHZvdGVyQXV0aCxcbiAgICAgIHZlcnNpb24sXG4gICAgICBtZW1vLFxuICAgICAgZmVlLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBhc09mLFxuICAgICAgY2hhbmdlVGhyZXNob2xkXG4gICAgKVxuXG4gICAgaWYgKCEoYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCwgdGhpcy5nZXRDcmVhdGlvblR4RmVlKCkpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG59XG4iXX0=