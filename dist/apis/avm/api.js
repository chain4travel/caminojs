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
exports.AVMAPI = void 0;
/**
 * @packageDocumentation
 * @module API-AVM
 */
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const utxos_1 = require("./utxos");
const constants_1 = require("./constants");
const keychain_1 = require("./keychain");
const tx_1 = require("./tx");
const payload_1 = require("../../utils/payload");
const helperfunctions_1 = require("../../utils/helperfunctions");
const jrpcapi_1 = require("../../common/jrpcapi");
const constants_2 = require("../../utils/constants");
const output_1 = require("../../common/output");
const errors_1 = require("../../utils/errors");
const utils_1 = require("../../utils");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = utils_1.Serialization.getInstance();
/**
 * Class for interacting with a node endpoint that is using the AVM.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class AVMAPI extends jrpcapi_1.JRPCAPI {
    /**
     * @ignore
     */
    _cleanAddressArray(addresses, caller) {
        const addrs = [];
        const chainID = this.getBlockchainAlias()
            ? this.getBlockchainAlias()
            : this.getBlockchainID();
        if (addresses && addresses.length > 0) {
            for (let i = 0; i < addresses.length; i++) {
                if (typeof addresses[`${i}`] === "string") {
                    if (typeof this.parseAddress(addresses[`${i}`]) ===
                        "undefined") {
                        /* istanbul ignore next */
                        throw new errors_1.AddressError(`Error - AVMAPI.${caller}: Invalid address format`);
                    }
                    addrs.push(addresses[`${i}`]);
                }
                else {
                    const type = "bech32";
                    addrs.push(serialization.bufferToType(addresses[`${i}`], type, this.core.getHRP(), chainID));
                }
            }
        }
        return addrs;
    }
    /**
     * This class should not be instantiated directly. Instead use the [[Avalanche.addAP`${I}`]] method.
     *
     * @param core A reference to the Avalanche class
     * @param baseURL Defaults to the string "/ext/bc/X" as the path to blockchain's baseURL
     * @param blockchainID The Blockchain"s ID. Defaults to an empty string: ""
     */
    constructor(core, baseURL = "/ext/bc/X", blockchainID = "") {
        super(core, baseURL);
        /**
         * @ignore
         */
        this.keychain = new keychain_1.KeyChain("", "");
        this.blockchainAlias = undefined;
        this.blockchainID = undefined;
        this.AVAXAssetID = undefined;
        this.txFee = undefined;
        this.creationTxFee = undefined;
        this.mintTxFee = undefined;
        /**
         * Gets the alias for the blockchainID if it exists, otherwise returns `undefined`.
         *
         * @returns The alias for the blockchainID
         */
        this.getBlockchainAlias = () => {
            if (typeof this.blockchainAlias === "undefined") {
                this.blockchainAlias = this.core.getNetwork().X.alias;
            }
            return this.blockchainAlias;
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
            return bintools.parseAddress(addr, blockchainID, alias, constants_1.AVMConstants.ADDRESSLENGTH);
        };
        this.addressFromBuffer = (address) => {
            const chainID = this.getBlockchainAlias()
                ? this.getBlockchainAlias()
                : this.getBlockchainID();
            const type = "bech32";
            const hrp = this.core.getHRP();
            return serialization.bufferToType(address, type, hrp, chainID);
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
                const asset = yield this.getAssetDescription(this.core.getPrimaryAssetAlias());
                this.AVAXAssetID = asset.assetID;
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
            return new bn_js_1.default(this.core.getNetwork().X.txFee);
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
            return new bn_js_1.default(this.core.getNetwork().X.createAssetTxFee);
        };
        /**
         * Gets the default mint fee for this chain.
         *
         * @returns The default mint fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getDefaultMintTxFee = () => {
            var _a;
            return new bn_js_1.default((_a = this.core.getNetwork().X.mintTxFee) !== null && _a !== void 0 ? _a : 0);
        };
        /**
         * Gets the mint fee for this chain.
         *
         * @returns The mint fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getMintTxFee = () => {
            if (typeof this.mintTxFee === "undefined") {
                this.mintTxFee = this.getDefaultMintTxFee();
            }
            return this.mintTxFee;
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
         * Sets the mint fee for this chain.
         *
         * @param fee The mint fee amount to set as {@link https://github.com/indutny/bn.js/|BN}
         */
        this.setMintTxFee = (fee) => {
            this.mintTxFee = fee;
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
         * @returns The instance of [[KeyChain]] for this class
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
        this.checkGooseEgg = (utx, outTotal = new bn_js_1.default(0)) => __awaiter(this, void 0, void 0, function* () {
            const avaxAssetID = yield this.getAVAXAssetID();
            const outputTotal = outTotal.gt(new bn_js_1.default(0))
                ? outTotal
                : utx.getOutputTotal(avaxAssetID);
            const fee = utx.getBurn(avaxAssetID);
            if (fee.lte(constants_2.ONEAVAX.mul(new bn_js_1.default(10))) || fee.lte(outputTotal)) {
                return true;
            }
            else {
                return false;
            }
        });
        /**
         * Gets the balance of a particular asset on a blockchain.
         *
         * @param address The address to pull the asset balance from
         * @param assetID The assetID to pull the balance from
         * @param includePartial If includePartial=false, returns only the balance held solely
         *
         * @returns Promise with the balance of the assetID as a {@link https://github.com/indutny/bn.js/|BN} on the provided address for the blockchain.
         */
        this.getBalance = (address, assetID, includePartial = false) => __awaiter(this, void 0, void 0, function* () {
            if (typeof this.parseAddress(address) === "undefined") {
                /* istanbul ignore next */
                throw new errors_1.AddressError("Error - AVMAPI.getBalance: Invalid address format");
            }
            const params = {
                address,
                assetID,
                includePartial
            };
            const response = yield this.callMethod("avm.getBalance", params);
            return response.data.result;
        });
        /**
         * Creates an address (and associated private keys) on a user on a blockchain.
         *
         * @param username Name of the user to create the address under
         * @param password Password to unlock the user and encrypt the private key
         *
         * @returns Promise for a string representing the address created by the vm.
         */
        this.createAddress = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password
            };
            const response = yield this.callMethod("avm.createAddress", params);
            return response.data.result.address;
        });
        /**
         * Create a new fixed-cap, fungible asset. A quantity of it is created at initialization and there no more is ever created.
         *
         * @param username The user paying the transaction fee (in $AVAX) for asset creation
         * @param password The password for the user paying the transaction fee (in $AVAX) for asset creation
         * @param name The human-readable name for the asset
         * @param symbol Optional. The shorthand symbol for the asset. Between 0 and 4 characters
         * @param denomination Optional. Determines how balances of this asset are displayed by user interfaces. Default is 0
         * @param initialHolders An array of objects containing the field "address" and "amount" to establish the genesis values for the new asset
         *
         * ```js
         * Example initialHolders:
         * [
         *   {
         *     "address": "X-avax1kj06lhgx84h39snsljcey3tpc046ze68mek3g5",
         *     "amount": 10000
         *   },
         *   {
         *     "address": "X-avax1am4w6hfrvmh3akduzkjthrtgtqafalce6an8cr",
         *     "amount": 50000
         *   }
         * ]
         * ```
         *
         * @returns Returns a Promise string containing the base 58 string representation of the ID of the newly created asset.
         */
        this.createFixedCapAsset = (username, password, name, symbol, denomination, initialHolders) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                name,
                symbol,
                denomination,
                username,
                password,
                initialHolders
            };
            const response = yield this.callMethod("avm.createFixedCapAsset", params);
            return response.data.result.assetID;
        });
        /**
         * Create a new variable-cap, fungible asset. No units of the asset exist at initialization. Minters can mint units of this asset using createMintTx, signMintTx and sendMintTx.
         *
         * @param username The user paying the transaction fee (in $AVAX) for asset creation
         * @param password The password for the user paying the transaction fee (in $AVAX) for asset creation
         * @param name The human-readable name for the asset
         * @param symbol Optional. The shorthand symbol for the asset -- between 0 and 4 characters
         * @param denomination Optional. Determines how balances of this asset are displayed by user interfaces. Default is 0
         * @param minterSets is a list where each element specifies that threshold of the addresses in minters may together mint more of the asset by signing a minting transaction
         *
         * ```js
         * Example minterSets:
         * [
         *    {
         *      "minters":[
         *        "X-avax1am4w6hfrvmh3akduzkjthrtgtqafalce6an8cr"
         *      ],
         *      "threshold": 1
         *     },
         *     {
         *      "minters": [
         *        "X-avax1am4w6hfrvmh3akduzkjthrtgtqafalce6an8cr",
         *        "X-avax1kj06lhgx84h39snsljcey3tpc046ze68mek3g5",
         *        "X-avax1yell3e4nln0m39cfpdhgqprsd87jkh4qnakklx"
         *      ],
         *      "threshold": 2
         *     }
         * ]
         * ```
         *
         * @returns Returns a Promise string containing the base 58 string representation of the ID of the newly created asset.
         */
        this.createVariableCapAsset = (username, password, name, symbol, denomination, minterSets) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                name,
                symbol,
                denomination,
                username,
                password,
                minterSets
            };
            const response = yield this.callMethod("avm.createVariableCapAsset", params);
            return response.data.result.assetID;
        });
        /**
         * Creates a family of NFT Asset. No units of the asset exist at initialization. Minters can mint units of this asset using createMintTx, signMintTx and sendMintTx.
         *
         * @param username The user paying the transaction fee (in $AVAX) for asset creation
         * @param password The password for the user paying the transaction fee (in $AVAX) for asset creation
         * @param from Optional. An array of addresses managed by the node's keystore for this blockchain which will fund this transaction
         * @param changeAddr Optional. An address to send the change
         * @param name The human-readable name for the asset
         * @param symbol Optional. The shorthand symbol for the asset -- between 0 and 4 characters
         * @param minterSets is a list where each element specifies that threshold of the addresses in minters may together mint more of the asset by signing a minting transaction
         *
         * @returns Returns a Promise string containing the base 58 string representation of the ID of the newly created asset.
         */
        this.createNFTAsset = (username, password, from = undefined, changeAddr, name, symbol, minterSet) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                name,
                symbol,
                minterSet
            };
            const caller = "createNFTAsset";
            from = this._cleanAddressArray(from, caller);
            if (typeof from !== "undefined") {
                params["from"] = from;
            }
            if (typeof changeAddr !== "undefined") {
                if (typeof this.parseAddress(changeAddr) === "undefined") {
                    /* istanbul ignore next */
                    throw new errors_1.AddressError("Error - AVMAPI.createNFTAsset: Invalid address format");
                }
                params["changeAddr"] = changeAddr;
            }
            const response = yield this.callMethod("avm.createNFTAsset", params);
            return response.data.result.assetID;
        });
        /**
         * Create an unsigned transaction to mint more of an asset.
         *
         * @param amount The units of the asset to mint
         * @param assetID The ID of the asset to mint
         * @param to The address to assign the units of the minted asset
         * @param minters Addresses of the minters responsible for signing the transaction
         *
         * @returns Returns a Promise string containing the base 58 string representation of the unsigned transaction.
         */
        this.mint = (username, password, amount, assetID, to, minters) => __awaiter(this, void 0, void 0, function* () {
            let asset;
            let amnt;
            if (typeof assetID !== "string") {
                asset = bintools.cb58Encode(assetID);
            }
            else {
                asset = assetID;
            }
            if (typeof amount === "number") {
                amnt = new bn_js_1.default(amount);
            }
            else {
                amnt = amount;
            }
            const params = {
                username: username,
                password: password,
                amount: amnt.toString(10),
                assetID: asset,
                to,
                minters
            };
            const response = yield this.callMethod("avm.mint", params);
            return response.data.result.txID;
        });
        /**
         * Mint non-fungible tokens which were created with AVMAPI.createNFTAsset
         *
         * @param username The user paying the transaction fee (in $AVAX) for asset creation
         * @param password The password for the user paying the transaction fee (in $AVAX) for asset creation
         * @param from Optional. An array of addresses managed by the node's keystore for this blockchain which will fund this transaction
         * @param changeAddr Optional. An address to send the change
         * @param assetID The asset id which is being sent
         * @param to Address on X-Chain of the account to which this NFT is being sent
         * @param encoding Optional.  is the encoding format to use for the payload argument. Can be either "cb58" or "hex". Defaults to "hex".
         *
         * @returns ID of the transaction
         */
        this.mintNFT = (username, password, from = undefined, changeAddr = undefined, payload, assetID, to, encoding = "hex") => __awaiter(this, void 0, void 0, function* () {
            let asset;
            if (typeof this.parseAddress(to) === "undefined") {
                /* istanbul ignore next */
                throw new errors_1.AddressError("Error - AVMAPI.mintNFT: Invalid address format");
            }
            if (typeof assetID !== "string") {
                asset = bintools.cb58Encode(assetID);
            }
            else {
                asset = assetID;
            }
            const params = {
                username,
                password,
                assetID: asset,
                payload,
                to,
                encoding
            };
            const caller = "mintNFT";
            from = this._cleanAddressArray(from, caller);
            if (typeof from !== "undefined") {
                params["from"] = from;
            }
            if (typeof changeAddr !== "undefined") {
                if (typeof this.parseAddress(changeAddr) === "undefined") {
                    /* istanbul ignore next */
                    throw new errors_1.AddressError("Error - AVMAPI.mintNFT: Invalid address format");
                }
                params["changeAddr"] = changeAddr;
            }
            const response = yield this.callMethod("avm.mintNFT", params);
            return response.data.result.txID;
        });
        /**
         * Send NFT from one account to another on X-Chain
         *
         * @param username The user paying the transaction fee (in $AVAX) for asset creation
         * @param password The password for the user paying the transaction fee (in $AVAX) for asset creation
         * @param from Optional. An array of addresses managed by the node's keystore for this blockchain which will fund this transaction
         * @param changeAddr Optional. An address to send the change
         * @param assetID The asset id which is being sent
         * @param groupID The group this NFT is issued to.
         * @param to Address on X-Chain of the account to which this NFT is being sent
         *
         * @returns ID of the transaction
         */
        this.sendNFT = (username, password, from = undefined, changeAddr = undefined, assetID, groupID, to) => __awaiter(this, void 0, void 0, function* () {
            let asset;
            if (typeof this.parseAddress(to) === "undefined") {
                /* istanbul ignore next */
                throw new errors_1.AddressError("Error - AVMAPI.sendNFT: Invalid address format");
            }
            if (typeof assetID !== "string") {
                asset = bintools.cb58Encode(assetID);
            }
            else {
                asset = assetID;
            }
            const params = {
                username,
                password,
                assetID: asset,
                groupID,
                to
            };
            const caller = "sendNFT";
            from = this._cleanAddressArray(from, caller);
            if (typeof from !== "undefined") {
                params["from"] = from;
            }
            if (typeof changeAddr !== "undefined") {
                if (typeof this.parseAddress(changeAddr) === "undefined") {
                    /* istanbul ignore next */
                    throw new errors_1.AddressError("Error - AVMAPI.sendNFT: Invalid address format");
                }
                params["changeAddr"] = changeAddr;
            }
            const response = yield this.callMethod("avm.sendNFT", params);
            return response.data.result.txID;
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
            if (typeof this.parseAddress(address) === "undefined") {
                /* istanbul ignore next */
                throw new errors_1.AddressError("Error - AVMAPI.exportKey: Invalid address format");
            }
            const params = {
                username,
                password,
                address
            };
            const response = yield this.callMethod("avm.exportKey", params);
            return response.data.result.privateKey;
        });
        /**
         * Imports a private key into the node's keystore under an user and for a blockchain.
         *
         * @param username The name of the user to store the private key
         * @param password The password that unlocks the user
         * @param privateKey A string representing the private key in the vm's format
         *
         * @returns The address for the imported private key.
         */
        this.importKey = (username, password, privateKey) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                privateKey
            };
            const response = yield this.callMethod("avm.importKey", params);
            return response.data.result.address;
        });
        /**
         * Send ANT (Avalanche Native Token) assets including AVAX from the X-Chain to an account on the P-Chain or C-Chain.
         *
         * After calling this method, you must call the P-Chain's `import` or the C-Chain’s `import` method to complete the transfer.
         *
         * @param username The Keystore user that controls the P-Chain or C-Chain account specified in `to`
         * @param password The password of the Keystore user
         * @param to The account on the P-Chain or C-Chain to send the asset to.
         * @param amount Amount of asset to export as a {@link https://github.com/indutny/bn.js/|BN}
         * @param assetID The asset id which is being sent
         *
         * @returns String representing the transaction id
         */
        this.export = (username, password, to, amount, assetID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                to,
                amount: amount.toString(10),
                assetID
            };
            const response = yield this.callMethod("avm.export", params);
            return response.data.result.txID;
        });
        /**
         * Send ANT (Avalanche Native Token) assets including AVAX from an account on the P-Chain or C-Chain to an address on the X-Chain. This transaction
         * must be signed with the key of the account that the asset is sent from and which pays
         * the transaction fee.
         *
         * @param username The Keystore user that controls the account specified in `to`
         * @param password The password of the Keystore user
         * @param to The address of the account the asset is sent to.
         * @param sourceChain The chainID where the funds are coming from. Ex: "C"
         *
         * @returns Promise for a string for the transaction, which should be sent to the network
         * by calling issueTx.
         */
        this.import = (username, password, to, sourceChain) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                to,
                sourceChain
            };
            const response = yield this.callMethod("avm.import", params);
            return response.data.result.txID;
        });
        /**
         * Lists all the addresses under a user.
         *
         * @param username The user to list addresses
         * @param password The password of the user to list the addresses
         *
         * @returns Promise of an array of address strings in the format specified by the blockchain.
         */
        this.listAddresses = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password
            };
            const response = yield this.callMethod("avm.listAddresses", params);
            return response.data.result.addresses;
        });
        /**
         * Retrieves all assets for an address on a server and their associated balances.
         *
         * @param address The address to get a list of assets
         *
         * @returns Promise of an object mapping assetID strings with {@link https://github.com/indutny/bn.js/|BN} balance for the address on the blockchain.
         */
        this.getAllBalances = (address) => __awaiter(this, void 0, void 0, function* () {
            if (typeof this.parseAddress(address) === "undefined") {
                /* istanbul ignore next */
                throw new errors_1.AddressError("Error - AVMAPI.getAllBalances: Invalid address format");
            }
            const params = {
                address
            };
            const response = yield this.callMethod("avm.getAllBalances", params);
            return response.data.result.balances;
        });
        /**
         * Retrieves an assets name and symbol.
         *
         * @param assetID Either a {@link https://github.com/feross/buffer|Buffer} or an b58 serialized string for the AssetID or its alias.
         *
         * @returns Returns a Promise object with keys "name" and "symbol".
         */
        this.getAssetDescription = (assetID) => __awaiter(this, void 0, void 0, function* () {
            let asset;
            if (typeof assetID !== "string") {
                asset = bintools.cb58Encode(assetID);
            }
            else {
                asset = assetID;
            }
            const params = {
                assetID: asset
            };
            const response = yield this.callMethod("avm.getAssetDescription", params);
            return {
                name: response.data.result.name,
                symbol: response.data.result.symbol,
                assetID: bintools.cb58Decode(response.data.result.assetID),
                denomination: parseInt(response.data.result.denomination, 10)
            };
        });
        /**
         * Returns the transaction data of a provided transaction ID by calling the node's `getTx` method.
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
            const response = yield this.callMethod("avm.getTx", params);
            return response.data.result.tx;
        });
        /**
         * Returns the status of a provided transaction ID by calling the node's `getTxStatus` method.
         *
         * @param txID The string representation of the transaction ID
         *
         * @returns Returns a Promise string containing the status retrieved from the node
         */
        this.getTxStatus = (txID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                txID
            };
            const response = yield this.callMethod("avm.getTxStatus", params);
            return response.data.result.status;
        });
        /**
         * Retrieves the UTXOs related to the addresses provided from the node's `getUTXOs` method.
         *
         * @param addresses An array of addresses as cb58 strings or addresses as {@link https://github.com/feross/buffer|Buffer}s
         * @param sourceChain A string for the chain to look for the UTXO's. Default is to use this chain, but if exported UTXOs exist from other chains, this can used to pull them instead.
         * @param limit Optional. Returns at most [limit] addresses. If [limit] == 0 or > [maxUTXOsToFetch], fetches up to [maxUTXOsToFetch].
         * @param startIndex Optional. [StartIndex] defines where to start fetching UTXOs (for pagination.)
         * UTXOs fetched are from addresses equal to or greater than [StartIndex.Address]
         * For address [StartIndex.Address], only UTXOs with IDs greater than [StartIndex.Utxo] will be returned.
         * @param persistOpts Options available to persist these UTXOs in local storage
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
            const response = yield this.callMethod("avm.getUTXOs", params);
            const utxos = new utxos_1.UTXOSet();
            let data = response.data.result.utxos;
            if (persistOpts && typeof persistOpts === "object") {
                if (this.db.has(persistOpts.getName())) {
                    const selfArray = this.db.get(persistOpts.getName());
                    if (Array.isArray(selfArray)) {
                        utxos.addArray(data);
                        const utxoSet = new utxos_1.UTXOSet();
                        utxoSet.addArray(selfArray);
                        utxoSet.mergeByRule(utxos, persistOpts.getMergeRule());
                        data = utxoSet.getAllUTXOStrings();
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
            return response.data.result;
        });
        /**
         * Helper function which creates an unsigned transaction. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param amount The amount of AssetID to be spent in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}.
         * @param assetID The assetID of the value being sent
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
        this.buildBaseTx = (utxoset, amount, assetID = undefined, toAddresses, fromAddresses, changeAddresses, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)(), locktime = new bn_js_1.default(0), toThreshold = 1, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildBaseTx";
            const to = this._cleanAddressArray(toAddresses, caller).map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, caller).map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, caller).map((a) => bintools.stringToAddress(a));
            if (typeof assetID === "string") {
                assetID = bintools.cb58Decode(assetID);
            }
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const networkID = this.core.getNetworkID();
            const blockchainIDBuf = bintools.cb58Decode(this.blockchainID);
            const fee = this.getTxFee();
            const feeAssetID = yield this.getAVAXAssetID();
            const builtUnsignedTx = utxoset.buildBaseTx(networkID, blockchainIDBuf, amount, assetID, to, from, change, fee, feeAssetID, memo, asOf, locktime, toThreshold, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildBaseTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned NFT Transfer. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset  A set of UTXOs that the transaction is built on
         * @param toAddresses The addresses to send the NFT
         * @param fromAddresses The addresses being used to send the NFT from the utxoID provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param utxoid A base58 utxoID or an array of base58 utxoIDs for the nfts this transaction is sending
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[NFTTransferTx]].
         *
         * @remarks
         * This helper exists because the endpoint API should be the primary point of entry for most functionality.
         */
        this.buildNFTTransferTx = (utxoset, toAddresses, fromAddresses, changeAddresses, utxoid, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)(), locktime = new bn_js_1.default(0), toThreshold = 1, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildNFTTransferTx";
            const to = this._cleanAddressArray(toAddresses, caller).map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, caller).map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, caller).map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            let utxoidArray = [];
            if (typeof utxoid === "string") {
                utxoidArray = [utxoid];
            }
            else if (Array.isArray(utxoid)) {
                utxoidArray = utxoid;
            }
            const builtUnsignedTx = utxoset.buildNFTTransferTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), to, from, change, utxoidArray, this.getTxFee(), avaxAssetID, memo, asOf, locktime, toThreshold, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildNFTTransferTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned Import Tx. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset  A set of UTXOs that the transaction is built on
         * @param ownerAddresses The addresses being used to import
         * @param sourceChain The chainid for where the import is coming from
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
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
        this.buildImportTx = (utxoset, ownerAddresses, sourceChain, toAddresses, fromAddresses, changeAddresses = undefined, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)(), locktime = new bn_js_1.default(0), toThreshold = 1, changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildImportTx";
            const to = this._cleanAddressArray(toAddresses, caller).map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, caller).map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, caller).map((a) => bintools.stringToAddress(a));
            let srcChain = undefined;
            if (typeof sourceChain === "undefined") {
                throw new errors_1.ChainIdError("Error - AVMAPI.buildImportTx: Source ChainID is undefined.");
            }
            else if (typeof sourceChain === "string") {
                srcChain = sourceChain;
                sourceChain = bintools.cb58Decode(sourceChain);
            }
            else if (!(sourceChain instanceof buffer_1.Buffer)) {
                throw new errors_1.ChainIdError("Error - AVMAPI.buildImportTx: Invalid destinationChain type: " +
                    typeof sourceChain);
            }
            const atomicUTXOs = (yield this.getUTXOs(ownerAddresses, srcChain, 0, undefined)).utxos;
            const avaxAssetID = yield this.getAVAXAssetID();
            const atomics = atomicUTXOs.getAllUTXOs();
            if (atomics.length === 0) {
                throw new errors_1.NoAtomicUTXOsError("Error - AVMAPI.buildImportTx: No atomic UTXOs to import from " +
                    srcChain +
                    " using addresses: " +
                    ownerAddresses.join(", "));
            }
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const builtUnsignedTx = utxoset.buildImportTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), to, from, change, atomics, sourceChain, this.getTxFee(), avaxAssetID, memo, asOf, locktime, toThreshold, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildImportTx:Failed Goose Egg Check");
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
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         * @param assetID Optional. The assetID of the asset to send. Defaults to AVAX assetID.
         * Regardless of the asset which you"re exporting, all fees are paid in AVAX.
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains an [[ExportTx]].
         */
        this.buildExportTx = (utxoset, amount, destinationChain, toAddresses, fromAddresses, changeAddresses = undefined, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)(), locktime = new bn_js_1.default(0), toThreshold = 1, changeThreshold = 1, assetID = undefined) => __awaiter(this, void 0, void 0, function* () {
            const prefixes = {};
            toAddresses.map((a) => {
                prefixes[a.split("-")[0]] = true;
            });
            if (Object.keys(prefixes).length !== 1) {
                throw new errors_1.AddressError("Error - AVMAPI.buildExportTx: To addresses must have the same chainID prefix.");
            }
            if (typeof destinationChain === "undefined") {
                throw new errors_1.ChainIdError("Error - AVMAPI.buildExportTx: Destination ChainID is undefined.");
            }
            else if (typeof destinationChain === "string") {
                destinationChain = bintools.cb58Decode(destinationChain); //
            }
            else if (!(destinationChain instanceof buffer_1.Buffer)) {
                throw new errors_1.ChainIdError("Error - AVMAPI.buildExportTx: Invalid destinationChain type: " +
                    typeof destinationChain);
            }
            if (destinationChain.length !== 32) {
                throw new errors_1.ChainIdError("Error - AVMAPI.buildExportTx: Destination ChainID must be 32 bytes in length.");
            }
            const to = [];
            toAddresses.map((a) => {
                to.push(bintools.stringToAddress(a));
            });
            const caller = "buildExportTx";
            const from = this._cleanAddressArray(fromAddresses, caller).map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, caller).map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            if (typeof assetID === "undefined") {
                assetID = bintools.cb58Encode(avaxAssetID);
            }
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const assetIDBuf = bintools.cb58Decode(assetID);
            const fee = this.getTxFee();
            const builtUnsignedTx = utxoset.buildExportTx(networkID, blockchainID, amount, assetIDBuf, to, from, change, destinationChain, fee, avaxAssetID, memo, asOf, locktime, toThreshold, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildExportTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Creates an unsigned transaction. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param initialState The [[InitialStates]] that represent the intial state of a created asset
         * @param name String for the descriptive name of the asset
         * @param symbol String for the ticker symbol of the asset
         * @param denomination Number for the denomination which is 10^D. D must be >= 0 and <= 32. Ex: $1 AVAX = 10^9 $nAVAX
         * @param mintOutputs Optional. Array of [[SECPMintOutput]]s to be included in the transaction. These outputs can be spent to mint more tokens.
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[CreateAssetTx]].
         *
         */
        this.buildCreateAssetTx = (utxoset, fromAddresses, changeAddresses, initialStates, name, symbol, denomination, mintOutputs = undefined, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)(), changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildCreateAssetTx";
            const from = this._cleanAddressArray(fromAddresses, caller).map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, caller).map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            if (symbol.length > constants_1.AVMConstants.SYMBOLMAXLEN) {
                throw new errors_1.SymbolError("Error - AVMAPI.buildCreateAssetTx: Symbols may not exceed length of " +
                    constants_1.AVMConstants.SYMBOLMAXLEN);
            }
            if (name.length > constants_1.AVMConstants.ASSETNAMELEN) {
                throw new errors_1.NameError("Error - AVMAPI.buildCreateAssetTx: Names may not exceed length of " +
                    constants_1.AVMConstants.ASSETNAMELEN);
            }
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const avaxAssetID = yield this.getAVAXAssetID();
            const fee = this.getDefaultCreationTxFee();
            const builtUnsignedTx = utxoset.buildCreateAssetTx(networkID, blockchainID, from, change, initialStates, name, symbol, denomination, mintOutputs, fee, avaxAssetID, memo, asOf, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, fee))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildCreateAssetTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Creates an unsigned Secp mint transaction. For more granular control, you may create your own
         * [[OperationTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param mintOwner A [[SECPMintOutput]] which specifies the new set of minters
         * @param transferOwner A [[SECPTransferOutput]] which specifies where the minted tokens will go
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param mintUTXOID The UTXOID for the [[SCPMintOutput]] being spent to produce more tokens
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changethreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[SECPMintTx]].
         */
        this.buildSECPMintTx = (utxoset, mintOwner, transferOwner, fromAddresses, changeAddresses, mintUTXOID, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)(), changeThreshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildSECPMintTx";
            const from = this._cleanAddressArray(fromAddresses, caller).map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, caller).map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const avaxAssetID = yield this.getAVAXAssetID();
            const fee = this.getMintTxFee();
            const builtUnsignedTx = utxoset.buildSECPMintTx(networkID, blockchainID, mintOwner, transferOwner, from, change, mintUTXOID, fee, avaxAssetID, memo, asOf, changeThreshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildSECPMintTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Creates an unsigned transaction. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param minterSets is a list where each element specifies that threshold of the addresses in minters may together mint more of the asset by signing a minting transaction
         * @param name String for the descriptive name of the asset
         * @param symbol String for the ticker symbol of the asset
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting mint output
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * ```js
         * Example minterSets:
         * [
         *      {
         *          "minters":[
         *              "X-avax1ghstjukrtw8935lryqtnh643xe9a94u3tc75c7"
         *          ],
         *          "threshold": 1
         *      },
         *      {
         *          "minters": [
         *              "X-avax1yell3e4nln0m39cfpdhgqprsd87jkh4qnakklx",
         *              "X-avax1k4nr26c80jaquzm9369j5a4shmwcjn0vmemcjz",
         *              "X-avax1ztkzsrjnkn0cek5ryvhqswdtcg23nhge3nnr5e"
         *          ],
         *          "threshold": 2
         *      }
         * ]
         * ```
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[CreateAssetTx]].
         *
         */
        this.buildCreateNFTAssetTx = (utxoset, fromAddresses, changeAddresses, minterSets, name, symbol, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)(), locktime = new bn_js_1.default(0)) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildCreateNFTAssetTx";
            const from = this._cleanAddressArray(fromAddresses, caller).map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, caller).map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            if (name.length > constants_1.AVMConstants.ASSETNAMELEN) {
                /* istanbul ignore next */
                throw new errors_1.NameError("Error - AVMAPI.buildCreateNFTAssetTx: Names may not exceed length of " +
                    constants_1.AVMConstants.ASSETNAMELEN);
            }
            if (symbol.length > constants_1.AVMConstants.SYMBOLMAXLEN) {
                /* istanbul ignore next */
                throw new errors_1.SymbolError("Error - AVMAPI.buildCreateNFTAssetTx: Symbols may not exceed length of " +
                    constants_1.AVMConstants.SYMBOLMAXLEN);
            }
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const creationTxFee = this.getCreationTxFee();
            const avaxAssetID = yield this.getAVAXAssetID();
            const builtUnsignedTx = utxoset.buildCreateNFTAssetTx(networkID, blockchainID, from, change, minterSets, name, symbol, creationTxFee, avaxAssetID, memo, asOf, locktime);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, creationTxFee))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildCreateNFTAssetTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Creates an unsigned transaction. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset  A set of UTXOs that the transaction is built on
         * @param owners Either a single or an array of [[OutputOwners]] to send the nft output
         * @param fromAddresses The addresses being used to send the NFT from the utxoID provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param utxoid A base58 utxoID or an array of base58 utxoIDs for the nft mint output this transaction is sending
         * @param groupID Optional. The group this NFT is issued to.
         * @param payload Optional. Data for NFT Payload as either a [[PayloadBase]] or a {@link https://github.com/feross/buffer|Buffer}
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains an [[OperationTx]].
         *
         */
        this.buildCreateNFTMintTx = (utxoset, owners, fromAddresses, changeAddresses, utxoid, groupID = 0, payload = undefined, memo = undefined, asOf = (0, helperfunctions_1.UnixNow)()) => __awaiter(this, void 0, void 0, function* () {
            const caller = "buildCreateNFTMintTx";
            const from = this._cleanAddressArray(fromAddresses, caller).map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, caller).map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            if (payload instanceof payload_1.PayloadBase) {
                payload = payload.getPayload();
            }
            if (typeof utxoid === "string") {
                utxoid = [utxoid];
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            if (owners instanceof output_1.OutputOwners) {
                owners = [owners];
            }
            const networkID = this.core.getNetworkID();
            const blockchainID = bintools.cb58Decode(this.blockchainID);
            const txFee = this.getTxFee();
            const builtUnsignedTx = utxoset.buildCreateNFTMintTx(networkID, blockchainID, owners, from, change, utxoid, groupID, payload, txFee, avaxAssetID, memo, asOf);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildCreateNFTMintTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which takes an unsigned transaction and signs it, returning the resulting [[Tx]].
         *
         * @param utx The unsigned transaction of type [[UnsignedTx]]
         *
         * @returns A signed transaction of type [[Tx]]
         */
        this.signTx = (utx) => utx.sign(this.keychain);
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
                throw new errors_1.TransactionError("Error - AVMAPI.issueTx: provided tx is not expected type of string, Buffer, or Tx");
            }
            const params = {
                tx: Transaction.toString(),
                encoding: "hex"
            };
            const response = yield this.callMethod("avm.issueTx", params);
            return response.data.result.txID;
        });
        /**
         * Calls the node's getAddressTxs method from the API and returns transactions corresponding to the provided address and assetID
         *
         * @param address The address for which we're fetching related transactions.
         * @param cursor Page number or offset.
         * @param pageSize  Number of items to return per page. Optional. Defaults to 1024. If [pageSize] == 0 or [pageSize] > [maxPageSize], then it fetches at max [maxPageSize] transactions
         * @param assetID Only return transactions that changed the balance of this asset. Must be an ID or an alias for an asset.
         *
         * @returns A promise object representing the array of transaction IDs and page offset
         */
        this.getAddressTxs = (address, cursor, pageSize, assetID) => __awaiter(this, void 0, void 0, function* () {
            let asset;
            let pageSizeNum;
            if (typeof assetID !== "string") {
                asset = bintools.cb58Encode(assetID);
            }
            else {
                asset = assetID;
            }
            if (typeof pageSize !== "number") {
                pageSizeNum = 0;
            }
            else {
                pageSizeNum = pageSize;
            }
            const params = {
                address,
                cursor,
                pageSize: pageSizeNum,
                assetID: asset
            };
            const response = yield this.callMethod("avm.getAddressTxs", params);
            return response.data.result;
        });
        /**
         * Sends an amount of assetID to the specified address from a list of owned of addresses.
         *
         * @param username The user that owns the private keys associated with the `from` addresses
         * @param password The password unlocking the user
         * @param assetID The assetID of the asset to send
         * @param amount The amount of the asset to be sent
         * @param to The address of the recipient
         * @param from Optional. An array of addresses managed by the node's keystore for this blockchain which will fund this transaction
         * @param changeAddr Optional. An address to send the change
         * @param memo Optional. CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         *
         * @returns Promise for the string representing the transaction's ID.
         */
        this.send = (username, password, assetID, amount, to, from = undefined, changeAddr = undefined, memo = undefined) => __awaiter(this, void 0, void 0, function* () {
            let asset;
            let amnt;
            if (typeof this.parseAddress(to) === "undefined") {
                /* istanbul ignore next */
                throw new errors_1.AddressError("Error - AVMAPI.send: Invalid address format");
            }
            if (typeof assetID !== "string") {
                asset = bintools.cb58Encode(assetID);
            }
            else {
                asset = assetID;
            }
            if (typeof amount === "number") {
                amnt = new bn_js_1.default(amount);
            }
            else {
                amnt = amount;
            }
            const params = {
                username: username,
                password: password,
                assetID: asset,
                amount: amnt.toString(10),
                to: to
            };
            const caller = "send";
            from = this._cleanAddressArray(from, caller);
            if (typeof from !== "undefined") {
                params["from"] = from;
            }
            if (typeof changeAddr !== "undefined") {
                if (typeof this.parseAddress(changeAddr) === "undefined") {
                    /* istanbul ignore next */
                    throw new errors_1.AddressError("Error - AVMAPI.send: Invalid address format");
                }
                params["changeAddr"] = changeAddr;
            }
            if (typeof memo !== "undefined") {
                if (typeof memo !== "string") {
                    params["memo"] = bintools.cb58Encode(memo);
                }
                else {
                    params["memo"] = memo;
                }
            }
            const response = yield this.callMethod("avm.send", params);
            return response.data.result;
        });
        /**
         * Sends an amount of assetID to an array of specified addresses from a list of owned of addresses.
         *
         * @param username The user that owns the private keys associated with the `from` addresses
         * @param password The password unlocking the user
         * @param sendOutputs The array of SendOutputs. A SendOutput is an object literal which contains an assetID, amount, and to.
         * @param from Optional. An array of addresses managed by the node's keystore for this blockchain which will fund this transaction
         * @param changeAddr Optional. An address to send the change
         * @param memo Optional. CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         *
         * @returns Promise for the string representing the transaction"s ID.
         */
        this.sendMultiple = (username, password, sendOutputs, from = undefined, changeAddr = undefined, memo = undefined) => __awaiter(this, void 0, void 0, function* () {
            let asset;
            let amnt;
            const sOutputs = [];
            sendOutputs.forEach((output) => {
                if (typeof this.parseAddress(output.to) === "undefined") {
                    /* istanbul ignore next */
                    throw new errors_1.AddressError("Error - AVMAPI.sendMultiple: Invalid address format");
                }
                if (typeof output.assetID !== "string") {
                    asset = bintools.cb58Encode(output.assetID);
                }
                else {
                    asset = output.assetID;
                }
                if (typeof output.amount === "number") {
                    amnt = new bn_js_1.default(output.amount);
                }
                else {
                    amnt = output.amount;
                }
                sOutputs.push({
                    to: output.to,
                    assetID: asset,
                    amount: amnt.toString(10)
                });
            });
            const params = {
                username: username,
                password: password,
                outputs: sOutputs
            };
            const caller = "send";
            from = this._cleanAddressArray(from, caller);
            if (typeof from !== "undefined") {
                params.from = from;
            }
            if (typeof changeAddr !== "undefined") {
                if (typeof this.parseAddress(changeAddr) === "undefined") {
                    /* istanbul ignore next */
                    throw new errors_1.AddressError("Error - AVMAPI.send: Invalid address format");
                }
                params.changeAddr = changeAddr;
            }
            if (typeof memo !== "undefined") {
                if (typeof memo !== "string") {
                    params.memo = bintools.cb58Encode(memo);
                }
                else {
                    params.memo = memo;
                }
            }
            const response = yield this.callMethod("avm.sendMultiple", params);
            return response.data.result;
        });
        /**
         * Given a JSON representation of this Virtual Machine’s genesis state, create the byte representation of that state.
         *
         * @param genesisData The blockchain's genesis data object
         *
         * @returns Promise of a string of bytes
         */
        this.buildGenesis = (genesisData) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                genesisData
            };
            const response = yield this.callMethod("avm.buildGenesis", params);
            return response.data.result.bytes;
        });
        this.blockchainID = core.getNetwork().X.blockchainID;
        if (blockchainID !== "" && blockchainID !== this.blockchainID) {
            this.keychain = new keychain_1.KeyChain(this.core.getHRP(), blockchainID);
            this.blockchainID = blockchainID;
        }
        else {
            this.keychain = new keychain_1.KeyChain(this.core.getHRP(), core.getNetwork().X.alias);
        }
    }
}
exports.AVMAPI = AVMAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvYXZtL2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxrREFBc0I7QUFDdEIsb0NBQWdDO0FBRWhDLG9FQUEyQztBQUMzQyxtQ0FBdUM7QUFDdkMsMkNBQTBDO0FBQzFDLHlDQUFxQztBQUNyQyw2QkFBcUM7QUFDckMsaURBQWlEO0FBR2pELGlFQUFxRDtBQUNyRCxrREFBOEM7QUFFOUMscURBQStDO0FBRy9DLGdEQUFrRDtBQUVsRCwrQ0FRMkI7QUFDM0IsdUNBQTJEO0FBb0MzRDs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLHFCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEU7Ozs7OztHQU1HO0FBQ0gsTUFBYSxNQUFPLFNBQVEsaUJBQU87SUFnNURqQzs7T0FFRztJQUNPLGtCQUFrQixDQUMxQixTQUE4QixFQUM5QixNQUFjO1FBRWQsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFBO1FBQzFCLE1BQU0sT0FBTyxHQUFXLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUMvQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQzNCLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7UUFDMUIsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDckMsS0FBSyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2pELElBQUksT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLFFBQVEsRUFBRTtvQkFDekMsSUFDRSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMs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Q0FDUCxDQUFBO1lBQ0QsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUM3QixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7V0FNRztRQUNILGlCQUFZLEdBQUcsQ0FBTyxXQUFtQixFQUFtQixFQUFFO1lBQzVELE1BQU0sTUFBTSxHQUF1QjtnQkFDakMsV0FBVzthQUNaLENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxrQkFBa0IsRUFDbEIsTUFBTSxDQUNQLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQTtRQUNuQyxDQUFDLENBQUEsQ0FBQTtRQXdEQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFBO1FBRXBELElBQUksWUFBWSxLQUFLLEVBQUUsSUFBSSxZQUFZLEtBQUssSUFBSSxDQUFDLFlBQVksRUFBRTtZQUM3RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFBO1lBQzlELElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1NBQ2pDO2FBQU07WUFDTCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFDbEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQzFCLENBQUE7U0FDRjtJQUNILENBQUM7Q0FDRjtBQWw5REQsd0JBazlEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1BVk1cbiAqL1xuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQXZhbGFuY2hlQ29yZSBmcm9tIFwiLi4vLi4vY2FtaW5vXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgVVRYTywgVVRYT1NldCB9IGZyb20gXCIuL3V0eG9zXCJcbmltcG9ydCB7IEFWTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBLZXlDaGFpbiB9IGZyb20gXCIuL2tleWNoYWluXCJcbmltcG9ydCB7IFR4LCBVbnNpZ25lZFR4IH0gZnJvbSBcIi4vdHhcIlxuaW1wb3J0IHsgUGF5bG9hZEJhc2UgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcGF5bG9hZFwiXG5pbXBvcnQgeyBTRUNQTWludE91dHB1dCB9IGZyb20gXCIuL291dHB1dHNcIlxuaW1wb3J0IHsgSW5pdGlhbFN0YXRlcyB9IGZyb20gXCIuL2luaXRpYWxzdGF0ZXNcIlxuaW1wb3J0IHsgVW5peE5vdyB9IGZyb20gXCIuLi8uLi91dGlscy9oZWxwZXJmdW5jdGlvbnNcIlxuaW1wb3J0IHsgSlJQQ0FQSSB9IGZyb20gXCIuLi8uLi9jb21tb24vanJwY2FwaVwiXG5pbXBvcnQgeyBSZXF1ZXN0UmVzcG9uc2VEYXRhIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9hcGliYXNlXCJcbmltcG9ydCB7IE9ORUFWQVggfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IE1pbnRlclNldCB9IGZyb20gXCIuL21pbnRlcnNldFwiXG5pbXBvcnQgeyBQZXJzaXN0YW5jZU9wdGlvbnMgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcGVyc2lzdGVuY2VvcHRpb25zXCJcbmltcG9ydCB7IE91dHB1dE93bmVycyB9IGZyb20gXCIuLi8uLi9jb21tb24vb3V0cHV0XCJcbmltcG9ydCB7IFNFQ1BUcmFuc2Zlck91dHB1dCB9IGZyb20gXCIuL291dHB1dHNcIlxuaW1wb3J0IHtcbiAgQWRkcmVzc0Vycm9yLFxuICBHb29zZUVnZ0NoZWNrRXJyb3IsXG4gIENoYWluSWRFcnJvcixcbiAgTm9BdG9taWNVVFhPc0Vycm9yLFxuICBTeW1ib2xFcnJvcixcbiAgTmFtZUVycm9yLFxuICBUcmFuc2FjdGlvbkVycm9yXG59IGZyb20gXCIuLi8uLi91dGlscy9lcnJvcnNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZFR5cGUgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIlxuaW1wb3J0IHtcbiAgQnVpbGRHZW5lc2lzUGFyYW1zLFxuICBDcmVhdGVBZGRyZXNzUGFyYW1zLFxuICBDcmVhdGVGaXhlZENhcEFzc2V0UGFyYW1zLFxuICBDcmVhdGVWYXJpYWJsZUNhcEFzc2V0UGFyYW1zLFxuICBFeHBvcnRQYXJhbXMsXG4gIEV4cG9ydEtleVBhcmFtcyxcbiAgR2V0QWxsQmFsYW5jZXNQYXJhbXMsXG4gIEdldEFzc2V0RGVzY3JpcHRpb25QYXJhbXMsXG4gIEdldEFWQVhBc3NldElEUGFyYW1zLFxuICBHZXRCYWxhbmNlUGFyYW1zLFxuICBHZXRUeFBhcmFtcyxcbiAgR2V0VHhTdGF0dXNQYXJhbXMsXG4gIEdldFVUWE9zUGFyYW1zLFxuICBJbXBvcnRQYXJhbXMsXG4gIEltcG9ydEtleVBhcmFtcyxcbiAgTGlzdEFkZHJlc3Nlc1BhcmFtcyxcbiAgTWludFBhcmFtcyxcbiAgU2VuZE11bHRpcGxlUGFyYW1zLFxuICBTT3V0cHV0c1BhcmFtcyxcbiAgR2V0VVRYT3NSZXNwb25zZSxcbiAgR2V0QXNzZXREZXNjcmlwdGlvblJlc3BvbnNlLFxuICBHZXRCYWxhbmNlUmVzcG9uc2UsXG4gIFNlbmRQYXJhbXMsXG4gIFNlbmRSZXNwb25zZSxcbiAgU2VuZE11bHRpcGxlUmVzcG9uc2UsXG4gIEdldEFkZHJlc3NUeHNQYXJhbXMsXG4gIEdldEFkZHJlc3NUeHNSZXNwb25zZSxcbiAgQ3JlYXRlTkZUQXNzZXRQYXJhbXMsXG4gIFNlbmRORlRQYXJhbXMsXG4gIE1pbnRORlRQYXJhbXMsXG4gIElNaW50ZXJTZXRcbn0gZnJvbSBcIi4vaW50ZXJmYWNlc1wiXG5pbXBvcnQgeyBJc3N1ZVR4UGFyYW1zIH0gZnJvbSBcIi4uLy4uL2NvbW1vblwiXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogQ2xhc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBub2RlIGVuZHBvaW50IHRoYXQgaXMgdXNpbmcgdGhlIEFWTS5cbiAqXG4gKiBAY2F0ZWdvcnkgUlBDQVBJc1xuICpcbiAqIEByZW1hcmtzIFRoaXMgZXh0ZW5kcyB0aGUgW1tKUlBDQVBJXV0gY2xhc3MuIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBkaXJlY3RseSBjYWxsZWQuIEluc3RlYWQsIHVzZSB0aGUgW1tBdmFsYW5jaGUuYWRkQVBJXV0gZnVuY3Rpb24gdG8gcmVnaXN0ZXIgdGhpcyBpbnRlcmZhY2Ugd2l0aCBBdmFsYW5jaGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBVk1BUEkgZXh0ZW5kcyBKUlBDQVBJIHtcbiAgLyoqXG4gICAqIEBpZ25vcmVcbiAgICovXG4gIHByb3RlY3RlZCBrZXljaGFpbjogS2V5Q2hhaW4gPSBuZXcgS2V5Q2hhaW4oXCJcIiwgXCJcIilcbiAgcHJvdGVjdGVkIGJsb2NrY2hhaW5BbGlhczogc3RyaW5nID0gdW5kZWZpbmVkXG4gIHByb3RlY3RlZCBibG9ja2NoYWluSUQ6IHN0cmluZyA9IHVuZGVmaW5lZFxuICBwcm90ZWN0ZWQgQVZBWEFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZFxuICBwcm90ZWN0ZWQgdHhGZWU6IEJOID0gdW5kZWZpbmVkXG4gIHByb3RlY3RlZCBjcmVhdGlvblR4RmVlOiBCTiA9IHVuZGVmaW5lZFxuICBwcm90ZWN0ZWQgbWludFR4RmVlOiBCTiA9IHVuZGVmaW5lZFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBhbGlhcyBmb3IgdGhlIGJsb2NrY2hhaW5JRCBpZiBpdCBleGlzdHMsIG90aGVyd2lzZSByZXR1cm5zIGB1bmRlZmluZWRgLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgYWxpYXMgZm9yIHRoZSBibG9ja2NoYWluSURcbiAgICovXG4gIGdldEJsb2NrY2hhaW5BbGlhcyA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGlmICh0eXBlb2YgdGhpcy5ibG9ja2NoYWluQWxpYXMgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuYmxvY2tjaGFpbkFsaWFzID0gdGhpcy5jb3JlLmdldE5ldHdvcmsoKS5YLmFsaWFzXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJsb2NrY2hhaW5BbGlhc1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGJsb2NrY2hhaW5JRCBhbmQgcmV0dXJucyBpdC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGJsb2NrY2hhaW5JRFxuICAgKi9cbiAgZ2V0QmxvY2tjaGFpbklEID0gKCk6IHN0cmluZyA9PiB0aGlzLmJsb2NrY2hhaW5JRFxuXG4gIC8qKlxuICAgKiBUYWtlcyBhbiBhZGRyZXNzIHN0cmluZyBhbmQgcmV0dXJucyBpdHMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gaWYgdmFsaWQuXG4gICAqXG4gICAqIEByZXR1cm5zIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBhZGRyZXNzIGlmIHZhbGlkLCB1bmRlZmluZWQgaWYgbm90IHZhbGlkLlxuICAgKi9cbiAgcGFyc2VBZGRyZXNzID0gKGFkZHI6IHN0cmluZyk6IEJ1ZmZlciA9PiB7XG4gICAgY29uc3QgYWxpYXM6IHN0cmluZyA9IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKClcbiAgICBjb25zdCBibG9ja2NoYWluSUQ6IHN0cmluZyA9IHRoaXMuZ2V0QmxvY2tjaGFpbklEKClcbiAgICByZXR1cm4gYmludG9vbHMucGFyc2VBZGRyZXNzKFxuICAgICAgYWRkcixcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIGFsaWFzLFxuICAgICAgQVZNQ29uc3RhbnRzLkFERFJFU1NMRU5HVEhcbiAgICApXG4gIH1cblxuICBhZGRyZXNzRnJvbUJ1ZmZlciA9IChhZGRyZXNzOiBCdWZmZXIpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGNoYWluSUQ6IHN0cmluZyA9IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKClcbiAgICAgID8gdGhpcy5nZXRCbG9ja2NoYWluQWxpYXMoKVxuICAgICAgOiB0aGlzLmdldEJsb2NrY2hhaW5JRCgpXG4gICAgY29uc3QgdHlwZTogU2VyaWFsaXplZFR5cGUgPSBcImJlY2gzMlwiXG4gICAgY29uc3QgaHJwOiBzdHJpbmcgPSB0aGlzLmNvcmUuZ2V0SFJQKClcbiAgICByZXR1cm4gc2VyaWFsaXphdGlvbi5idWZmZXJUb1R5cGUoYWRkcmVzcywgdHlwZSwgaHJwLCBjaGFpbklEKVxuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIEFWQVggQXNzZXRJRCBhbmQgcmV0dXJucyBpdCBpbiBhIFByb21pc2UuXG4gICAqXG4gICAqIEBwYXJhbSByZWZyZXNoIFRoaXMgZnVuY3Rpb24gY2FjaGVzIHRoZSByZXNwb25zZS4gUmVmcmVzaCA9IHRydWUgd2lsbCBidXN0IHRoZSBjYWNoZS5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIHRoZSBwcm92aWRlZCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBBVkFYIEFzc2V0SURcbiAgICovXG4gIGdldEFWQVhBc3NldElEID0gYXN5bmMgKHJlZnJlc2g6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8QnVmZmVyPiA9PiB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLkFWQVhBc3NldElEID09PSBcInVuZGVmaW5lZFwiIHx8IHJlZnJlc2gpIHtcbiAgICAgIGNvbnN0IGFzc2V0OiBHZXRBVkFYQXNzZXRJRFBhcmFtcyA9IGF3YWl0IHRoaXMuZ2V0QXNzZXREZXNjcmlwdGlvbihcbiAgICAgICAgdGhpcy5jb3JlLmdldFByaW1hcnlBc3NldEFsaWFzKClcbiAgICAgIClcbiAgICAgIHRoaXMuQVZBWEFzc2V0SUQgPSBhc3NldC5hc3NldElEXG4gICAgfVxuICAgIHJldHVybiB0aGlzLkFWQVhBc3NldElEXG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSBkZWZhdWx0cyBhbmQgc2V0cyB0aGUgY2FjaGUgdG8gYSBzcGVjaWZpYyBBVkFYIEFzc2V0SURcbiAgICpcbiAgICogQHBhcmFtIGF2YXhBc3NldElEIEEgY2I1OCBzdHJpbmcgb3IgQnVmZmVyIHJlcHJlc2VudGluZyB0aGUgQVZBWCBBc3NldElEXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSB0aGUgcHJvdmlkZWQgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgQVZBWCBBc3NldElEXG4gICAqL1xuICBzZXRBVkFYQXNzZXRJRCA9IChhdmF4QXNzZXRJRDogc3RyaW5nIHwgQnVmZmVyKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBhdmF4QXNzZXRJRCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgYXZheEFzc2V0SUQgPSBiaW50b29scy5jYjU4RGVjb2RlKGF2YXhBc3NldElEKVxuICAgIH1cbiAgICB0aGlzLkFWQVhBc3NldElEID0gYXZheEFzc2V0SURcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkZWZhdWx0IHR4IGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGRlZmF1bHQgdHggZmVlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIGdldERlZmF1bHRUeEZlZSA9ICgpOiBCTiA9PiB7XG4gICAgcmV0dXJuIG5ldyBCTih0aGlzLmNvcmUuZ2V0TmV0d29yaygpLlgudHhGZWUpXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdHggZmVlIGZvciB0aGlzIGNoYWluLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgdHggZmVlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIGdldFR4RmVlID0gKCk6IEJOID0+IHtcbiAgICBpZiAodHlwZW9mIHRoaXMudHhGZWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMudHhGZWUgPSB0aGlzLmdldERlZmF1bHRUeEZlZSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnR4RmVlXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdHggZmVlIGZvciB0aGlzIGNoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gZmVlIFRoZSB0eCBmZWUgYW1vdW50IHRvIHNldCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgc2V0VHhGZWUgPSAoZmVlOiBCTik6IHZvaWQgPT4ge1xuICAgIHRoaXMudHhGZWUgPSBmZWVcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkZWZhdWx0IGNyZWF0aW9uIGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGRlZmF1bHQgY3JlYXRpb24gZmVlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIGdldERlZmF1bHRDcmVhdGlvblR4RmVlID0gKCk6IEJOID0+IHtcbiAgICByZXR1cm4gbmV3IEJOKHRoaXMuY29yZS5nZXROZXR3b3JrKCkuWC5jcmVhdGVBc3NldFR4RmVlKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGRlZmF1bHQgbWludCBmZWUgZm9yIHRoaXMgY2hhaW4uXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBkZWZhdWx0IG1pbnQgZmVlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIGdldERlZmF1bHRNaW50VHhGZWUgPSAoKTogQk4gPT4ge1xuICAgIHJldHVybiBuZXcgQk4odGhpcy5jb3JlLmdldE5ldHdvcmsoKS5YLm1pbnRUeEZlZSA/PyAwKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1pbnQgZmVlIGZvciB0aGlzIGNoYWluLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbWludCBmZWUgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgZ2V0TWludFR4RmVlID0gKCk6IEJOID0+IHtcbiAgICBpZiAodHlwZW9mIHRoaXMubWludFR4RmVlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLm1pbnRUeEZlZSA9IHRoaXMuZ2V0RGVmYXVsdE1pbnRUeEZlZSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1pbnRUeEZlZVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGNyZWF0aW9uIGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGNyZWF0aW9uIGZlZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqL1xuICBnZXRDcmVhdGlvblR4RmVlID0gKCk6IEJOID0+IHtcbiAgICBpZiAodHlwZW9mIHRoaXMuY3JlYXRpb25UeEZlZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5jcmVhdGlvblR4RmVlID0gdGhpcy5nZXREZWZhdWx0Q3JlYXRpb25UeEZlZSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNyZWF0aW9uVHhGZWVcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBtaW50IGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHBhcmFtIGZlZSBUaGUgbWludCBmZWUgYW1vdW50IHRvIHNldCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgc2V0TWludFR4RmVlID0gKGZlZTogQk4pOiB2b2lkID0+IHtcbiAgICB0aGlzLm1pbnRUeEZlZSA9IGZlZVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGNyZWF0aW9uIGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHBhcmFtIGZlZSBUaGUgY3JlYXRpb24gZmVlIGFtb3VudCB0byBzZXQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIHNldENyZWF0aW9uVHhGZWUgPSAoZmVlOiBCTik6IHZvaWQgPT4ge1xuICAgIHRoaXMuY3JlYXRpb25UeEZlZSA9IGZlZVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSByZWZlcmVuY2UgdG8gdGhlIGtleWNoYWluIGZvciB0aGlzIGNsYXNzLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgaW5zdGFuY2Ugb2YgW1tLZXlDaGFpbl1dIGZvciB0aGlzIGNsYXNzXG4gICAqL1xuICBrZXlDaGFpbiA9ICgpOiBLZXlDaGFpbiA9PiB0aGlzLmtleWNoYWluXG5cbiAgLyoqXG4gICAqIEBpZ25vcmVcbiAgICovXG4gIG5ld0tleUNoYWluID0gKCk6IEtleUNoYWluID0+IHtcbiAgICAvLyB3YXJuaW5nLCBvdmVyd3JpdGVzIHRoZSBvbGQga2V5Y2hhaW5cbiAgICBjb25zdCBhbGlhczogc3RyaW5nID0gdGhpcy5nZXRCbG9ja2NoYWluQWxpYXMoKVxuICAgIGlmIChhbGlhcykge1xuICAgICAgdGhpcy5rZXljaGFpbiA9IG5ldyBLZXlDaGFpbih0aGlzLmNvcmUuZ2V0SFJQKCksIGFsaWFzKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmtleWNoYWluID0gbmV3IEtleUNoYWluKHRoaXMuY29yZS5nZXRIUlAoKSwgdGhpcy5ibG9ja2NoYWluSUQpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmtleWNoYWluXG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHdoaWNoIGRldGVybWluZXMgaWYgYSB0eCBpcyBhIGdvb3NlIGVnZyB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHV0eCBBbiBVbnNpZ25lZFR4XG4gICAqXG4gICAqIEByZXR1cm5zIGJvb2xlYW4gdHJ1ZSBpZiBwYXNzZXMgZ29vc2UgZWdnIHRlc3QgYW5kIGZhbHNlIGlmIGZhaWxzLlxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiBBIFwiR29vc2UgRWdnIFRyYW5zYWN0aW9uXCIgaXMgd2hlbiB0aGUgZmVlIGZhciBleGNlZWRzIGEgcmVhc29uYWJsZSBhbW91bnRcbiAgICovXG4gIGNoZWNrR29vc2VFZ2cgPSBhc3luYyAoXG4gICAgdXR4OiBVbnNpZ25lZFR4LFxuICAgIG91dFRvdGFsOiBCTiA9IG5ldyBCTigwKVxuICApOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG4gICAgY29uc3Qgb3V0cHV0VG90YWw6IEJOID0gb3V0VG90YWwuZ3QobmV3IEJOKDApKVxuICAgICAgPyBvdXRUb3RhbFxuICAgICAgOiB1dHguZ2V0T3V0cHV0VG90YWwoYXZheEFzc2V0SUQpXG4gICAgY29uc3QgZmVlOiBCTiA9IHV0eC5nZXRCdXJuKGF2YXhBc3NldElEKVxuICAgIGlmIChmZWUubHRlKE9ORUFWQVgubXVsKG5ldyBCTigxMCkpKSB8fCBmZWUubHRlKG91dHB1dFRvdGFsKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGJhbGFuY2Ugb2YgYSBwYXJ0aWN1bGFyIGFzc2V0IG9uIGEgYmxvY2tjaGFpbi5cbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3MgVGhlIGFkZHJlc3MgdG8gcHVsbCB0aGUgYXNzZXQgYmFsYW5jZSBmcm9tXG4gICAqIEBwYXJhbSBhc3NldElEIFRoZSBhc3NldElEIHRvIHB1bGwgdGhlIGJhbGFuY2UgZnJvbVxuICAgKiBAcGFyYW0gaW5jbHVkZVBhcnRpYWwgSWYgaW5jbHVkZVBhcnRpYWw9ZmFsc2UsIHJldHVybnMgb25seSB0aGUgYmFsYW5jZSBoZWxkIHNvbGVseVxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIHdpdGggdGhlIGJhbGFuY2Ugb2YgdGhlIGFzc2V0SUQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBvbiB0aGUgcHJvdmlkZWQgYWRkcmVzcyBmb3IgdGhlIGJsb2NrY2hhaW4uXG4gICAqL1xuICBnZXRCYWxhbmNlID0gYXN5bmMgKFxuICAgIGFkZHJlc3M6IHN0cmluZyxcbiAgICBhc3NldElEOiBzdHJpbmcsXG4gICAgaW5jbHVkZVBhcnRpYWw6IGJvb2xlYW4gPSBmYWxzZVxuICApOiBQcm9taXNlPEdldEJhbGFuY2VSZXNwb25zZT4gPT4ge1xuICAgIGlmICh0eXBlb2YgdGhpcy5wYXJzZUFkZHJlc3MoYWRkcmVzcykgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFxuICAgICAgICBcIkVycm9yIC0gQVZNQVBJLmdldEJhbGFuY2U6IEludmFsaWQgYWRkcmVzcyBmb3JtYXRcIlxuICAgICAgKVxuICAgIH1cbiAgICBjb25zdCBwYXJhbXM6IEdldEJhbGFuY2VQYXJhbXMgPSB7XG4gICAgICBhZGRyZXNzLFxuICAgICAgYXNzZXRJRCxcbiAgICAgIGluY2x1ZGVQYXJ0aWFsXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJhdm0uZ2V0QmFsYW5jZVwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdFxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYWRkcmVzcyAoYW5kIGFzc29jaWF0ZWQgcHJpdmF0ZSBrZXlzKSBvbiBhIHVzZXIgb24gYSBibG9ja2NoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgTmFtZSBvZiB0aGUgdXNlciB0byBjcmVhdGUgdGhlIGFkZHJlc3MgdW5kZXJcbiAgICogQHBhcmFtIHBhc3N3b3JkIFBhc3N3b3JkIHRvIHVubG9jayB0aGUgdXNlciBhbmQgZW5jcnlwdCB0aGUgcHJpdmF0ZSBrZXlcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBhZGRyZXNzIGNyZWF0ZWQgYnkgdGhlIHZtLlxuICAgKi9cbiAgY3JlYXRlQWRkcmVzcyA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IENyZWF0ZUFkZHJlc3NQYXJhbXMgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJhdm0uY3JlYXRlQWRkcmVzc1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5hZGRyZXNzXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGZpeGVkLWNhcCwgZnVuZ2libGUgYXNzZXQuIEEgcXVhbnRpdHkgb2YgaXQgaXMgY3JlYXRlZCBhdCBpbml0aWFsaXphdGlvbiBhbmQgdGhlcmUgbm8gbW9yZSBpcyBldmVyIGNyZWF0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlciBwYXlpbmcgdGhlIHRyYW5zYWN0aW9uIGZlZSAoaW4gJEFWQVgpIGZvciBhc3NldCBjcmVhdGlvblxuICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIGZvciB0aGUgdXNlciBwYXlpbmcgdGhlIHRyYW5zYWN0aW9uIGZlZSAoaW4gJEFWQVgpIGZvciBhc3NldCBjcmVhdGlvblxuICAgKiBAcGFyYW0gbmFtZSBUaGUgaHVtYW4tcmVhZGFibGUgbmFtZSBmb3IgdGhlIGFzc2V0XG4gICAqIEBwYXJhbSBzeW1ib2wgT3B0aW9uYWwuIFRoZSBzaG9ydGhhbmQgc3ltYm9sIGZvciB0aGUgYXNzZXQuIEJldHdlZW4gMCBhbmQgNCBjaGFyYWN0ZXJzXG4gICAqIEBwYXJhbSBkZW5vbWluYXRpb24gT3B0aW9uYWwuIERldGVybWluZXMgaG93IGJhbGFuY2VzIG9mIHRoaXMgYXNzZXQgYXJlIGRpc3BsYXllZCBieSB1c2VyIGludGVyZmFjZXMuIERlZmF1bHQgaXMgMFxuICAgKiBAcGFyYW0gaW5pdGlhbEhvbGRlcnMgQW4gYXJyYXkgb2Ygb2JqZWN0cyBjb250YWluaW5nIHRoZSBmaWVsZCBcImFkZHJlc3NcIiBhbmQgXCJhbW91bnRcIiB0byBlc3RhYmxpc2ggdGhlIGdlbmVzaXMgdmFsdWVzIGZvciB0aGUgbmV3IGFzc2V0XG4gICAqXG4gICAqIGBgYGpzXG4gICAqIEV4YW1wbGUgaW5pdGlhbEhvbGRlcnM6XG4gICAqIFtcbiAgICogICB7XG4gICAqICAgICBcImFkZHJlc3NcIjogXCJYLWF2YXgxa2owNmxoZ3g4NGgzOXNuc2xqY2V5M3RwYzA0NnplNjhtZWszZzVcIixcbiAgICogICAgIFwiYW1vdW50XCI6IDEwMDAwXG4gICAqICAgfSxcbiAgICogICB7XG4gICAqICAgICBcImFkZHJlc3NcIjogXCJYLWF2YXgxYW00dzZoZnJ2bWgzYWtkdXpranRocnRndHFhZmFsY2U2YW44Y3JcIixcbiAgICogICAgIFwiYW1vdW50XCI6IDUwMDAwXG4gICAqICAgfVxuICAgKiBdXG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZSBzdHJpbmcgY29udGFpbmluZyB0aGUgYmFzZSA1OCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIElEIG9mIHRoZSBuZXdseSBjcmVhdGVkIGFzc2V0LlxuICAgKi9cbiAgY3JlYXRlRml4ZWRDYXBBc3NldCA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHN5bWJvbDogc3RyaW5nLFxuICAgIGRlbm9taW5hdGlvbjogbnVtYmVyLFxuICAgIGluaXRpYWxIb2xkZXJzOiBvYmplY3RbXVxuICApOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogQ3JlYXRlRml4ZWRDYXBBc3NldFBhcmFtcyA9IHtcbiAgICAgIG5hbWUsXG4gICAgICBzeW1ib2wsXG4gICAgICBkZW5vbWluYXRpb24sXG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgaW5pdGlhbEhvbGRlcnNcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcImF2bS5jcmVhdGVGaXhlZENhcEFzc2V0XCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LmFzc2V0SURcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgdmFyaWFibGUtY2FwLCBmdW5naWJsZSBhc3NldC4gTm8gdW5pdHMgb2YgdGhlIGFzc2V0IGV4aXN0IGF0IGluaXRpYWxpemF0aW9uLiBNaW50ZXJzIGNhbiBtaW50IHVuaXRzIG9mIHRoaXMgYXNzZXQgdXNpbmcgY3JlYXRlTWludFR4LCBzaWduTWludFR4IGFuZCBzZW5kTWludFR4LlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXIgcGF5aW5nIHRoZSB0cmFuc2FjdGlvbiBmZWUgKGluICRBVkFYKSBmb3IgYXNzZXQgY3JlYXRpb25cbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBmb3IgdGhlIHVzZXIgcGF5aW5nIHRoZSB0cmFuc2FjdGlvbiBmZWUgKGluICRBVkFYKSBmb3IgYXNzZXQgY3JlYXRpb25cbiAgICogQHBhcmFtIG5hbWUgVGhlIGh1bWFuLXJlYWRhYmxlIG5hbWUgZm9yIHRoZSBhc3NldFxuICAgKiBAcGFyYW0gc3ltYm9sIE9wdGlvbmFsLiBUaGUgc2hvcnRoYW5kIHN5bWJvbCBmb3IgdGhlIGFzc2V0IC0tIGJldHdlZW4gMCBhbmQgNCBjaGFyYWN0ZXJzXG4gICAqIEBwYXJhbSBkZW5vbWluYXRpb24gT3B0aW9uYWwuIERldGVybWluZXMgaG93IGJhbGFuY2VzIG9mIHRoaXMgYXNzZXQgYXJlIGRpc3BsYXllZCBieSB1c2VyIGludGVyZmFjZXMuIERlZmF1bHQgaXMgMFxuICAgKiBAcGFyYW0gbWludGVyU2V0cyBpcyBhIGxpc3Qgd2hlcmUgZWFjaCBlbGVtZW50IHNwZWNpZmllcyB0aGF0IHRocmVzaG9sZCBvZiB0aGUgYWRkcmVzc2VzIGluIG1pbnRlcnMgbWF5IHRvZ2V0aGVyIG1pbnQgbW9yZSBvZiB0aGUgYXNzZXQgYnkgc2lnbmluZyBhIG1pbnRpbmcgdHJhbnNhY3Rpb25cbiAgICpcbiAgICogYGBganNcbiAgICogRXhhbXBsZSBtaW50ZXJTZXRzOlxuICAgKiBbXG4gICAqICAgIHtcbiAgICogICAgICBcIm1pbnRlcnNcIjpbXG4gICAqICAgICAgICBcIlgtYXZheDFhbTR3NmhmcnZtaDNha2R1emtqdGhydGd0cWFmYWxjZTZhbjhjclwiXG4gICAqICAgICAgXSxcbiAgICogICAgICBcInRocmVzaG9sZFwiOiAxXG4gICAqICAgICB9LFxuICAgKiAgICAge1xuICAgKiAgICAgIFwibWludGVyc1wiOiBbXG4gICAqICAgICAgICBcIlgtYXZheDFhbTR3NmhmcnZtaDNha2R1emtqdGhydGd0cWFmYWxjZTZhbjhjclwiLFxuICAgKiAgICAgICAgXCJYLWF2YXgxa2owNmxoZ3g4NGgzOXNuc2xqY2V5M3RwYzA0NnplNjhtZWszZzVcIixcbiAgICogICAgICAgIFwiWC1hdmF4MXllbGwzZTRubG4wbTM5Y2ZwZGhncXByc2Q4N2praDRxbmFra2x4XCJcbiAgICogICAgICBdLFxuICAgKiAgICAgIFwidGhyZXNob2xkXCI6IDJcbiAgICogICAgIH1cbiAgICogXVxuICAgKiBgYGBcbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2Ugc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGJhc2UgNTggc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBJRCBvZiB0aGUgbmV3bHkgY3JlYXRlZCBhc3NldC5cbiAgICovXG4gIGNyZWF0ZVZhcmlhYmxlQ2FwQXNzZXQgPSBhc3luYyAoXG4gICAgdXNlcm5hbWU6IHN0cmluZyxcbiAgICBwYXNzd29yZDogc3RyaW5nLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzeW1ib2w6IHN0cmluZyxcbiAgICBkZW5vbWluYXRpb246IG51bWJlcixcbiAgICBtaW50ZXJTZXRzOiBvYmplY3RbXVxuICApOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogQ3JlYXRlVmFyaWFibGVDYXBBc3NldFBhcmFtcyA9IHtcbiAgICAgIG5hbWUsXG4gICAgICBzeW1ib2wsXG4gICAgICBkZW5vbWluYXRpb24sXG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgbWludGVyU2V0c1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwiYXZtLmNyZWF0ZVZhcmlhYmxlQ2FwQXNzZXRcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuYXNzZXRJRFxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBmYW1pbHkgb2YgTkZUIEFzc2V0LiBObyB1bml0cyBvZiB0aGUgYXNzZXQgZXhpc3QgYXQgaW5pdGlhbGl6YXRpb24uIE1pbnRlcnMgY2FuIG1pbnQgdW5pdHMgb2YgdGhpcyBhc3NldCB1c2luZyBjcmVhdGVNaW50VHgsIHNpZ25NaW50VHggYW5kIHNlbmRNaW50VHguXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlciBwYXlpbmcgdGhlIHRyYW5zYWN0aW9uIGZlZSAoaW4gJEFWQVgpIGZvciBhc3NldCBjcmVhdGlvblxuICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIGZvciB0aGUgdXNlciBwYXlpbmcgdGhlIHRyYW5zYWN0aW9uIGZlZSAoaW4gJEFWQVgpIGZvciBhc3NldCBjcmVhdGlvblxuICAgKiBAcGFyYW0gZnJvbSBPcHRpb25hbC4gQW4gYXJyYXkgb2YgYWRkcmVzc2VzIG1hbmFnZWQgYnkgdGhlIG5vZGUncyBrZXlzdG9yZSBmb3IgdGhpcyBibG9ja2NoYWluIHdoaWNoIHdpbGwgZnVuZCB0aGlzIHRyYW5zYWN0aW9uXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyIE9wdGlvbmFsLiBBbiBhZGRyZXNzIHRvIHNlbmQgdGhlIGNoYW5nZVxuICAgKiBAcGFyYW0gbmFtZSBUaGUgaHVtYW4tcmVhZGFibGUgbmFtZSBmb3IgdGhlIGFzc2V0XG4gICAqIEBwYXJhbSBzeW1ib2wgT3B0aW9uYWwuIFRoZSBzaG9ydGhhbmQgc3ltYm9sIGZvciB0aGUgYXNzZXQgLS0gYmV0d2VlbiAwIGFuZCA0IGNoYXJhY3RlcnNcbiAgICogQHBhcmFtIG1pbnRlclNldHMgaXMgYSBsaXN0IHdoZXJlIGVhY2ggZWxlbWVudCBzcGVjaWZpZXMgdGhhdCB0aHJlc2hvbGQgb2YgdGhlIGFkZHJlc3NlcyBpbiBtaW50ZXJzIG1heSB0b2dldGhlciBtaW50IG1vcmUgb2YgdGhlIGFzc2V0IGJ5IHNpZ25pbmcgYSBtaW50aW5nIHRyYW5zYWN0aW9uXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlIHN0cmluZyBjb250YWluaW5nIHRoZSBiYXNlIDU4IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgSUQgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgYXNzZXQuXG4gICAqL1xuICBjcmVhdGVORlRBc3NldCA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgZnJvbTogc3RyaW5nW10gfCBCdWZmZXJbXSA9IHVuZGVmaW5lZCxcbiAgICBjaGFuZ2VBZGRyOiBzdHJpbmcsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHN5bWJvbDogc3RyaW5nLFxuICAgIG1pbnRlclNldDogSU1pbnRlclNldFxuICApOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogQ3JlYXRlTkZUQXNzZXRQYXJhbXMgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgbmFtZSxcbiAgICAgIHN5bWJvbCxcbiAgICAgIG1pbnRlclNldFxuICAgIH1cblxuICAgIGNvbnN0IGNhbGxlcjogc3RyaW5nID0gXCJjcmVhdGVORlRBc3NldFwiXG4gICAgZnJvbSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb20sIGNhbGxlcilcbiAgICBpZiAodHlwZW9mIGZyb20gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHBhcmFtc1tcImZyb21cIl0gPSBmcm9tXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBjaGFuZ2VBZGRyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKGNoYW5nZUFkZHIpID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoXG4gICAgICAgICAgXCJFcnJvciAtIEFWTUFQSS5jcmVhdGVORlRBc3NldDogSW52YWxpZCBhZGRyZXNzIGZvcm1hdFwiXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHBhcmFtc1tcImNoYW5nZUFkZHJcIl0gPSBjaGFuZ2VBZGRyXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcImF2bS5jcmVhdGVORlRBc3NldFwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5hc3NldElEXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIHRvIG1pbnQgbW9yZSBvZiBhbiBhc3NldC5cbiAgICpcbiAgICogQHBhcmFtIGFtb3VudCBUaGUgdW5pdHMgb2YgdGhlIGFzc2V0IHRvIG1pbnRcbiAgICogQHBhcmFtIGFzc2V0SUQgVGhlIElEIG9mIHRoZSBhc3NldCB0byBtaW50XG4gICAqIEBwYXJhbSB0byBUaGUgYWRkcmVzcyB0byBhc3NpZ24gdGhlIHVuaXRzIG9mIHRoZSBtaW50ZWQgYXNzZXRcbiAgICogQHBhcmFtIG1pbnRlcnMgQWRkcmVzc2VzIG9mIHRoZSBtaW50ZXJzIHJlc3BvbnNpYmxlIGZvciBzaWduaW5nIHRoZSB0cmFuc2FjdGlvblxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZSBzdHJpbmcgY29udGFpbmluZyB0aGUgYmFzZSA1OCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHVuc2lnbmVkIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgbWludCA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgYW1vdW50OiBudW1iZXIgfCBCTixcbiAgICBhc3NldElEOiBCdWZmZXIgfCBzdHJpbmcsXG4gICAgdG86IHN0cmluZyxcbiAgICBtaW50ZXJzOiBzdHJpbmdbXVxuICApOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGxldCBhc3NldDogc3RyaW5nXG4gICAgbGV0IGFtbnQ6IEJOXG4gICAgaWYgKHR5cGVvZiBhc3NldElEICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICBhc3NldCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRClcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzZXQgPSBhc3NldElEXG4gICAgfVxuICAgIGlmICh0eXBlb2YgYW1vdW50ID09PSBcIm51bWJlclwiKSB7XG4gICAgICBhbW50ID0gbmV3IEJOKGFtb3VudClcbiAgICB9IGVsc2Uge1xuICAgICAgYW1udCA9IGFtb3VudFxuICAgIH1cbiAgICBjb25zdCBwYXJhbXM6IE1pbnRQYXJhbXMgPSB7XG4gICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZDogcGFzc3dvcmQsXG4gICAgICBhbW91bnQ6IGFtbnQudG9TdHJpbmcoMTApLFxuICAgICAgYXNzZXRJRDogYXNzZXQsXG4gICAgICB0byxcbiAgICAgIG1pbnRlcnNcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcImF2bS5taW50XCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgfVxuXG4gIC8qKlxuICAgKiBNaW50IG5vbi1mdW5naWJsZSB0b2tlbnMgd2hpY2ggd2VyZSBjcmVhdGVkIHdpdGggQVZNQVBJLmNyZWF0ZU5GVEFzc2V0XG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlciBwYXlpbmcgdGhlIHRyYW5zYWN0aW9uIGZlZSAoaW4gJEFWQVgpIGZvciBhc3NldCBjcmVhdGlvblxuICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIGZvciB0aGUgdXNlciBwYXlpbmcgdGhlIHRyYW5zYWN0aW9uIGZlZSAoaW4gJEFWQVgpIGZvciBhc3NldCBjcmVhdGlvblxuICAgKiBAcGFyYW0gZnJvbSBPcHRpb25hbC4gQW4gYXJyYXkgb2YgYWRkcmVzc2VzIG1hbmFnZWQgYnkgdGhlIG5vZGUncyBrZXlzdG9yZSBmb3IgdGhpcyBibG9ja2NoYWluIHdoaWNoIHdpbGwgZnVuZCB0aGlzIHRyYW5zYWN0aW9uXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyIE9wdGlvbmFsLiBBbiBhZGRyZXNzIHRvIHNlbmQgdGhlIGNoYW5nZVxuICAgKiBAcGFyYW0gYXNzZXRJRCBUaGUgYXNzZXQgaWQgd2hpY2ggaXMgYmVpbmcgc2VudFxuICAgKiBAcGFyYW0gdG8gQWRkcmVzcyBvbiBYLUNoYWluIG9mIHRoZSBhY2NvdW50IHRvIHdoaWNoIHRoaXMgTkZUIGlzIGJlaW5nIHNlbnRcbiAgICogQHBhcmFtIGVuY29kaW5nIE9wdGlvbmFsLiAgaXMgdGhlIGVuY29kaW5nIGZvcm1hdCB0byB1c2UgZm9yIHRoZSBwYXlsb2FkIGFyZ3VtZW50LiBDYW4gYmUgZWl0aGVyIFwiY2I1OFwiIG9yIFwiaGV4XCIuIERlZmF1bHRzIHRvIFwiaGV4XCIuXG4gICAqXG4gICAqIEByZXR1cm5zIElEIG9mIHRoZSB0cmFuc2FjdGlvblxuICAgKi9cbiAgbWludE5GVCA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgZnJvbTogc3RyaW5nW10gfCBCdWZmZXJbXSA9IHVuZGVmaW5lZCxcbiAgICBjaGFuZ2VBZGRyOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgcGF5bG9hZDogc3RyaW5nLFxuICAgIGFzc2V0SUQ6IHN0cmluZyB8IEJ1ZmZlcixcbiAgICB0bzogc3RyaW5nLFxuICAgIGVuY29kaW5nOiBzdHJpbmcgPSBcImhleFwiXG4gICk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgbGV0IGFzc2V0OiBzdHJpbmdcblxuICAgIGlmICh0eXBlb2YgdGhpcy5wYXJzZUFkZHJlc3ModG8pID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcIkVycm9yIC0gQVZNQVBJLm1pbnRORlQ6IEludmFsaWQgYWRkcmVzcyBmb3JtYXRcIilcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFzc2V0SUQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGFzc2V0ID0gYmludG9vbHMuY2I1OEVuY29kZShhc3NldElEKVxuICAgIH0gZWxzZSB7XG4gICAgICBhc3NldCA9IGFzc2V0SURcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbXM6IE1pbnRORlRQYXJhbXMgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgYXNzZXRJRDogYXNzZXQsXG4gICAgICBwYXlsb2FkLFxuICAgICAgdG8sXG4gICAgICBlbmNvZGluZ1xuICAgIH1cblxuICAgIGNvbnN0IGNhbGxlcjogc3RyaW5nID0gXCJtaW50TkZUXCJcbiAgICBmcm9tID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoZnJvbSwgY2FsbGVyKVxuICAgIGlmICh0eXBlb2YgZnJvbSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgcGFyYW1zW1wiZnJvbVwiXSA9IGZyb21cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNoYW5nZUFkZHIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJzZUFkZHJlc3MoY2hhbmdlQWRkcikgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcIkVycm9yIC0gQVZNQVBJLm1pbnRORlQ6IEludmFsaWQgYWRkcmVzcyBmb3JtYXRcIilcbiAgICAgIH1cbiAgICAgIHBhcmFtc1tcImNoYW5nZUFkZHJcIl0gPSBjaGFuZ2VBZGRyXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcImF2bS5taW50TkZUXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIE5GVCBmcm9tIG9uZSBhY2NvdW50IHRvIGFub3RoZXIgb24gWC1DaGFpblxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXIgcGF5aW5nIHRoZSB0cmFuc2FjdGlvbiBmZWUgKGluICRBVkFYKSBmb3IgYXNzZXQgY3JlYXRpb25cbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBmb3IgdGhlIHVzZXIgcGF5aW5nIHRoZSB0cmFuc2FjdGlvbiBmZWUgKGluICRBVkFYKSBmb3IgYXNzZXQgY3JlYXRpb25cbiAgICogQHBhcmFtIGZyb20gT3B0aW9uYWwuIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBtYW5hZ2VkIGJ5IHRoZSBub2RlJ3Mga2V5c3RvcmUgZm9yIHRoaXMgYmxvY2tjaGFpbiB3aGljaCB3aWxsIGZ1bmQgdGhpcyB0cmFuc2FjdGlvblxuICAgKiBAcGFyYW0gY2hhbmdlQWRkciBPcHRpb25hbC4gQW4gYWRkcmVzcyB0byBzZW5kIHRoZSBjaGFuZ2VcbiAgICogQHBhcmFtIGFzc2V0SUQgVGhlIGFzc2V0IGlkIHdoaWNoIGlzIGJlaW5nIHNlbnRcbiAgICogQHBhcmFtIGdyb3VwSUQgVGhlIGdyb3VwIHRoaXMgTkZUIGlzIGlzc3VlZCB0by5cbiAgICogQHBhcmFtIHRvIEFkZHJlc3Mgb24gWC1DaGFpbiBvZiB0aGUgYWNjb3VudCB0byB3aGljaCB0aGlzIE5GVCBpcyBiZWluZyBzZW50XG4gICAqXG4gICAqIEByZXR1cm5zIElEIG9mIHRoZSB0cmFuc2FjdGlvblxuICAgKi9cbiAgc2VuZE5GVCA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgZnJvbTogc3RyaW5nW10gfCBCdWZmZXJbXSA9IHVuZGVmaW5lZCxcbiAgICBjaGFuZ2VBZGRyOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgYXNzZXRJRDogc3RyaW5nIHwgQnVmZmVyLFxuICAgIGdyb3VwSUQ6IG51bWJlcixcbiAgICB0bzogc3RyaW5nXG4gICk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgbGV0IGFzc2V0OiBzdHJpbmdcblxuICAgIGlmICh0eXBlb2YgdGhpcy5wYXJzZUFkZHJlc3ModG8pID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcIkVycm9yIC0gQVZNQVBJLnNlbmRORlQ6IEludmFsaWQgYWRkcmVzcyBmb3JtYXRcIilcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFzc2V0SUQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGFzc2V0ID0gYmludG9vbHMuY2I1OEVuY29kZShhc3NldElEKVxuICAgIH0gZWxzZSB7XG4gICAgICBhc3NldCA9IGFzc2V0SURcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbXM6IFNlbmRORlRQYXJhbXMgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgYXNzZXRJRDogYXNzZXQsXG4gICAgICBncm91cElELFxuICAgICAgdG9cbiAgICB9XG5cbiAgICBjb25zdCBjYWxsZXI6IHN0cmluZyA9IFwic2VuZE5GVFwiXG4gICAgZnJvbSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb20sIGNhbGxlcilcbiAgICBpZiAodHlwZW9mIGZyb20gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHBhcmFtc1tcImZyb21cIl0gPSBmcm9tXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBjaGFuZ2VBZGRyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKGNoYW5nZUFkZHIpID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoXCJFcnJvciAtIEFWTUFQSS5zZW5kTkZUOiBJbnZhbGlkIGFkZHJlc3MgZm9ybWF0XCIpXG4gICAgICB9XG4gICAgICBwYXJhbXNbXCJjaGFuZ2VBZGRyXCJdID0gY2hhbmdlQWRkclxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJhdm0uc2VuZE5GVFwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC50eElEXG4gIH1cblxuICAvKipcbiAgICogRXhwb3J0cyB0aGUgcHJpdmF0ZSBrZXkgZm9yIGFuIGFkZHJlc3MuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgbmFtZSBvZiB0aGUgdXNlciB3aXRoIHRoZSBwcml2YXRlIGtleVxuICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIHVzZWQgdG8gZGVjcnlwdCB0aGUgcHJpdmF0ZSBrZXlcbiAgICogQHBhcmFtIGFkZHJlc3MgVGhlIGFkZHJlc3Mgd2hvc2UgcHJpdmF0ZSBrZXkgc2hvdWxkIGJlIGV4cG9ydGVkXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2Ugd2l0aCB0aGUgZGVjcnlwdGVkIHByaXZhdGUga2V5IGFzIHN0b3JlIGluIHRoZSBkYXRhYmFzZVxuICAgKi9cbiAgZXhwb3J0S2V5ID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgICBhZGRyZXNzOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBpZiAodHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKGFkZHJlc3MpID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcIkVycm9yIC0gQVZNQVBJLmV4cG9ydEtleTogSW52YWxpZCBhZGRyZXNzIGZvcm1hdFwiKVxuICAgIH1cbiAgICBjb25zdCBwYXJhbXM6IEV4cG9ydEtleVBhcmFtcyA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBhZGRyZXNzXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJhdm0uZXhwb3J0S2V5XCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnByaXZhdGVLZXlcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnRzIGEgcHJpdmF0ZSBrZXkgaW50byB0aGUgbm9kZSdzIGtleXN0b3JlIHVuZGVyIGFuIHVzZXIgYW5kIGZvciBhIGJsb2NrY2hhaW4uXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgbmFtZSBvZiB0aGUgdXNlciB0byBzdG9yZSB0aGUgcHJpdmF0ZSBrZXlcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCB0aGF0IHVubG9ja3MgdGhlIHVzZXJcbiAgICogQHBhcmFtIHByaXZhdGVLZXkgQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBwcml2YXRlIGtleSBpbiB0aGUgdm0ncyBmb3JtYXRcbiAgICpcbiAgICogQHJldHVybnMgVGhlIGFkZHJlc3MgZm9yIHRoZSBpbXBvcnRlZCBwcml2YXRlIGtleS5cbiAgICovXG4gIGltcG9ydEtleSA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgcHJpdmF0ZUtleTogc3RyaW5nXG4gICk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBJbXBvcnRLZXlQYXJhbXMgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcHJpdmF0ZUtleVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwiYXZtLmltcG9ydEtleVwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5hZGRyZXNzXG4gIH1cblxuICAvKipcbiAgICogU2VuZCBBTlQgKEF2YWxhbmNoZSBOYXRpdmUgVG9rZW4pIGFzc2V0cyBpbmNsdWRpbmcgQVZBWCBmcm9tIHRoZSBYLUNoYWluIHRvIGFuIGFjY291bnQgb24gdGhlIFAtQ2hhaW4gb3IgQy1DaGFpbi5cbiAgICpcbiAgICogQWZ0ZXIgY2FsbGluZyB0aGlzIG1ldGhvZCwgeW91IG11c3QgY2FsbCB0aGUgUC1DaGFpbidzIGBpbXBvcnRgIG9yIHRoZSBDLUNoYWlu4oCZcyBgaW1wb3J0YCBtZXRob2QgdG8gY29tcGxldGUgdGhlIHRyYW5zZmVyLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIEtleXN0b3JlIHVzZXIgdGhhdCBjb250cm9scyB0aGUgUC1DaGFpbiBvciBDLUNoYWluIGFjY291bnQgc3BlY2lmaWVkIGluIGB0b2BcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gdG8gVGhlIGFjY291bnQgb24gdGhlIFAtQ2hhaW4gb3IgQy1DaGFpbiB0byBzZW5kIHRoZSBhc3NldCB0by5cbiAgICogQHBhcmFtIGFtb3VudCBBbW91bnQgb2YgYXNzZXQgdG8gZXhwb3J0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGFzc2V0SUQgVGhlIGFzc2V0IGlkIHdoaWNoIGlzIGJlaW5nIHNlbnRcbiAgICpcbiAgICogQHJldHVybnMgU3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb24gaWRcbiAgICovXG4gIGV4cG9ydCA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgdG86IHN0cmluZyxcbiAgICBhbW91bnQ6IEJOLFxuICAgIGFzc2V0SUQ6IHN0cmluZ1xuICApOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogRXhwb3J0UGFyYW1zID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHRvLFxuICAgICAgYW1vdW50OiBhbW91bnQudG9TdHJpbmcoMTApLFxuICAgICAgYXNzZXRJRFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwiYXZtLmV4cG9ydFwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC50eElEXG4gIH1cblxuICAvKipcbiAgICogU2VuZCBBTlQgKEF2YWxhbmNoZSBOYXRpdmUgVG9rZW4pIGFzc2V0cyBpbmNsdWRpbmcgQVZBWCBmcm9tIGFuIGFjY291bnQgb24gdGhlIFAtQ2hhaW4gb3IgQy1DaGFpbiB0byBhbiBhZGRyZXNzIG9uIHRoZSBYLUNoYWluLiBUaGlzIHRyYW5zYWN0aW9uXG4gICAqIG11c3QgYmUgc2lnbmVkIHdpdGggdGhlIGtleSBvZiB0aGUgYWNjb3VudCB0aGF0IHRoZSBhc3NldCBpcyBzZW50IGZyb20gYW5kIHdoaWNoIHBheXNcbiAgICogdGhlIHRyYW5zYWN0aW9uIGZlZS5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSBLZXlzdG9yZSB1c2VyIHRoYXQgY29udHJvbHMgdGhlIGFjY291bnQgc3BlY2lmaWVkIGluIGB0b2BcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gdG8gVGhlIGFkZHJlc3Mgb2YgdGhlIGFjY291bnQgdGhlIGFzc2V0IGlzIHNlbnQgdG8uXG4gICAqIEBwYXJhbSBzb3VyY2VDaGFpbiBUaGUgY2hhaW5JRCB3aGVyZSB0aGUgZnVuZHMgYXJlIGNvbWluZyBmcm9tLiBFeDogXCJDXCJcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBzdHJpbmcgZm9yIHRoZSB0cmFuc2FjdGlvbiwgd2hpY2ggc2hvdWxkIGJlIHNlbnQgdG8gdGhlIG5ldHdvcmtcbiAgICogYnkgY2FsbGluZyBpc3N1ZVR4LlxuICAgKi9cbiAgaW1wb3J0ID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgICB0bzogc3RyaW5nLFxuICAgIHNvdXJjZUNoYWluOiBzdHJpbmdcbiAgKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IEltcG9ydFBhcmFtcyA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICB0byxcbiAgICAgIHNvdXJjZUNoYWluXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJhdm0uaW1wb3J0XCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0cyBhbGwgdGhlIGFkZHJlc3NlcyB1bmRlciBhIHVzZXIuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlciB0byBsaXN0IGFkZHJlc3Nlc1xuICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIG9mIHRoZSB1c2VyIHRvIGxpc3QgdGhlIGFkZHJlc3Nlc1xuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIGFuIGFycmF5IG9mIGFkZHJlc3Mgc3RyaW5ncyBpbiB0aGUgZm9ybWF0IHNwZWNpZmllZCBieSB0aGUgYmxvY2tjaGFpbi5cbiAgICovXG4gIGxpc3RBZGRyZXNzZXMgPSBhc3luYyAoXG4gICAgdXNlcm5hbWU6IHN0cmluZyxcbiAgICBwYXNzd29yZDogc3RyaW5nXG4gICk6IFByb21pc2U8c3RyaW5nW10+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IExpc3RBZGRyZXNzZXNQYXJhbXMgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJhdm0ubGlzdEFkZHJlc3Nlc1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5hZGRyZXNzZXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYWxsIGFzc2V0cyBmb3IgYW4gYWRkcmVzcyBvbiBhIHNlcnZlciBhbmQgdGhlaXIgYXNzb2NpYXRlZCBiYWxhbmNlcy5cbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3MgVGhlIGFkZHJlc3MgdG8gZ2V0IGEgbGlzdCBvZiBhc3NldHNcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBvZiBhbiBvYmplY3QgbWFwcGluZyBhc3NldElEIHN0cmluZ3Mgd2l0aCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBiYWxhbmNlIGZvciB0aGUgYWRkcmVzcyBvbiB0aGUgYmxvY2tjaGFpbi5cbiAgICovXG4gIGdldEFsbEJhbGFuY2VzID0gYXN5bmMgKGFkZHJlc3M6IHN0cmluZyk6IFByb21pc2U8b2JqZWN0W10+ID0+IHtcbiAgICBpZiAodHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKGFkZHJlc3MpID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIEFWTUFQSS5nZXRBbGxCYWxhbmNlczogSW52YWxpZCBhZGRyZXNzIGZvcm1hdFwiXG4gICAgICApXG4gICAgfVxuICAgIGNvbnN0IHBhcmFtczogR2V0QWxsQmFsYW5jZXNQYXJhbXMgPSB7XG4gICAgICBhZGRyZXNzXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJhdm0uZ2V0QWxsQmFsYW5jZXNcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuYmFsYW5jZXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYW4gYXNzZXRzIG5hbWUgYW5kIHN5bWJvbC5cbiAgICpcbiAgICogQHBhcmFtIGFzc2V0SUQgRWl0aGVyIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb3IgYW4gYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIGZvciB0aGUgQXNzZXRJRCBvciBpdHMgYWxpYXMuXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlIG9iamVjdCB3aXRoIGtleXMgXCJuYW1lXCIgYW5kIFwic3ltYm9sXCIuXG4gICAqL1xuICBnZXRBc3NldERlc2NyaXB0aW9uID0gYXN5bmMgKFxuICAgIGFzc2V0SUQ6IEJ1ZmZlciB8IHN0cmluZ1xuICApOiBQcm9taXNlPEdldEFzc2V0RGVzY3JpcHRpb25SZXNwb25zZT4gPT4ge1xuICAgIGxldCBhc3NldDogc3RyaW5nXG4gICAgaWYgKHR5cGVvZiBhc3NldElEICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICBhc3NldCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRClcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzZXQgPSBhc3NldElEXG4gICAgfVxuICAgIGNvbnN0IHBhcmFtczogR2V0QXNzZXREZXNjcmlwdGlvblBhcmFtcyA9IHtcbiAgICAgIGFzc2V0SUQ6IGFzc2V0XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJhdm0uZ2V0QXNzZXREZXNjcmlwdGlvblwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiByZXNwb25zZS5kYXRhLnJlc3VsdC5uYW1lLFxuICAgICAgc3ltYm9sOiByZXNwb25zZS5kYXRhLnJlc3VsdC5zeW1ib2wsXG4gICAgICBhc3NldElEOiBiaW50b29scy5jYjU4RGVjb2RlKHJlc3BvbnNlLmRhdGEucmVzdWx0LmFzc2V0SUQpLFxuICAgICAgZGVub21pbmF0aW9uOiBwYXJzZUludChyZXNwb25zZS5kYXRhLnJlc3VsdC5kZW5vbWluYXRpb24sIDEwKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0cmFuc2FjdGlvbiBkYXRhIG9mIGEgcHJvdmlkZWQgdHJhbnNhY3Rpb24gSUQgYnkgY2FsbGluZyB0aGUgbm9kZSdzIGBnZXRUeGAgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0gdHhJRCBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0cmFuc2FjdGlvbiBJRFxuICAgKiBAcGFyYW0gZW5jb2Rpbmcgc2V0cyB0aGUgZm9ybWF0IG9mIHRoZSByZXR1cm5lZCB0cmFuc2FjdGlvbi4gQ2FuIGJlLCBcImNiNThcIiwgXCJoZXhcIiBvciBcImpzb25cIi4gRGVmYXVsdHMgdG8gXCJjYjU4XCIuXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlIHN0cmluZyBvciBvYmplY3QgY29udGFpbmluZyB0aGUgYnl0ZXMgcmV0cmlldmVkIGZyb20gdGhlIG5vZGVcbiAgICovXG4gIGdldFR4ID0gYXN5bmMgKFxuICAgIHR4SUQ6IHN0cmluZyxcbiAgICBlbmNvZGluZzogc3RyaW5nID0gXCJoZXhcIlxuICApOiBQcm9taXNlPHN0cmluZyB8IG9iamVjdD4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogR2V0VHhQYXJhbXMgPSB7XG4gICAgICB0eElELFxuICAgICAgZW5jb2RpbmdcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcImF2bS5nZXRUeFwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC50eFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0YXR1cyBvZiBhIHByb3ZpZGVkIHRyYW5zYWN0aW9uIElEIGJ5IGNhbGxpbmcgdGhlIG5vZGUncyBgZ2V0VHhTdGF0dXNgIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHR4SUQgVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHJhbnNhY3Rpb24gSURcbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2Ugc3RyaW5nIGNvbnRhaW5pbmcgdGhlIHN0YXR1cyByZXRyaWV2ZWQgZnJvbSB0aGUgbm9kZVxuICAgKi9cbiAgZ2V0VHhTdGF0dXMgPSBhc3luYyAodHhJRDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IEdldFR4U3RhdHVzUGFyYW1zID0ge1xuICAgICAgdHhJRFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwiYXZtLmdldFR4U3RhdHVzXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnN0YXR1c1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgVVRYT3MgcmVsYXRlZCB0byB0aGUgYWRkcmVzc2VzIHByb3ZpZGVkIGZyb20gdGhlIG5vZGUncyBgZ2V0VVRYT3NgIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMgY2I1OCBzdHJpbmdzIG9yIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfXNcbiAgICogQHBhcmFtIHNvdXJjZUNoYWluIEEgc3RyaW5nIGZvciB0aGUgY2hhaW4gdG8gbG9vayBmb3IgdGhlIFVUWE8ncy4gRGVmYXVsdCBpcyB0byB1c2UgdGhpcyBjaGFpbiwgYnV0IGlmIGV4cG9ydGVkIFVUWE9zIGV4aXN0IGZyb20gb3RoZXIgY2hhaW5zLCB0aGlzIGNhbiB1c2VkIHRvIHB1bGwgdGhlbSBpbnN0ZWFkLlxuICAgKiBAcGFyYW0gbGltaXQgT3B0aW9uYWwuIFJldHVybnMgYXQgbW9zdCBbbGltaXRdIGFkZHJlc3Nlcy4gSWYgW2xpbWl0XSA9PSAwIG9yID4gW21heFVUWE9zVG9GZXRjaF0sIGZldGNoZXMgdXAgdG8gW21heFVUWE9zVG9GZXRjaF0uXG4gICAqIEBwYXJhbSBzdGFydEluZGV4IE9wdGlvbmFsLiBbU3RhcnRJbmRleF0gZGVmaW5lcyB3aGVyZSB0byBzdGFydCBmZXRjaGluZyBVVFhPcyAoZm9yIHBhZ2luYXRpb24uKVxuICAgKiBVVFhPcyBmZXRjaGVkIGFyZSBmcm9tIGFkZHJlc3NlcyBlcXVhbCB0byBvciBncmVhdGVyIHRoYW4gW1N0YXJ0SW5kZXguQWRkcmVzc11cbiAgICogRm9yIGFkZHJlc3MgW1N0YXJ0SW5kZXguQWRkcmVzc10sIG9ubHkgVVRYT3Mgd2l0aCBJRHMgZ3JlYXRlciB0aGFuIFtTdGFydEluZGV4LlV0eG9dIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAqIEBwYXJhbSBwZXJzaXN0T3B0cyBPcHRpb25zIGF2YWlsYWJsZSB0byBwZXJzaXN0IHRoZXNlIFVUWE9zIGluIGxvY2FsIHN0b3JhZ2VcbiAgICpcbiAgICogQHJlbWFya3NcbiAgICogcGVyc2lzdE9wdHMgaXMgb3B0aW9uYWwgYW5kIG11c3QgYmUgb2YgdHlwZSBbW1BlcnNpc3RhbmNlT3B0aW9uc11dXG4gICAqXG4gICAqL1xuICBnZXRVVFhPcyA9IGFzeW5jIChcbiAgICBhZGRyZXNzZXM6IHN0cmluZ1tdIHwgc3RyaW5nLFxuICAgIHNvdXJjZUNoYWluOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgbGltaXQ6IG51bWJlciA9IDAsXG4gICAgc3RhcnRJbmRleDogeyBhZGRyZXNzOiBzdHJpbmc7IHV0eG86IHN0cmluZyB9ID0gdW5kZWZpbmVkLFxuICAgIHBlcnNpc3RPcHRzOiBQZXJzaXN0YW5jZU9wdGlvbnMgPSB1bmRlZmluZWQsXG4gICAgZW5jb2Rpbmc6IHN0cmluZyA9IFwiaGV4XCJcbiAgKTogUHJvbWlzZTxHZXRVVFhPc1Jlc3BvbnNlPiA9PiB7XG4gICAgaWYgKHR5cGVvZiBhZGRyZXNzZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGFkZHJlc3NlcyA9IFthZGRyZXNzZXNdXG4gICAgfVxuXG4gICAgY29uc3QgcGFyYW1zOiBHZXRVVFhPc1BhcmFtcyA9IHtcbiAgICAgIGFkZHJlc3NlczogYWRkcmVzc2VzLFxuICAgICAgbGltaXQsXG4gICAgICBlbmNvZGluZ1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHN0YXJ0SW5kZXggIT09IFwidW5kZWZpbmVkXCIgJiYgc3RhcnRJbmRleCkge1xuICAgICAgcGFyYW1zLnN0YXJ0SW5kZXggPSBzdGFydEluZGV4XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzb3VyY2VDaGFpbiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgcGFyYW1zLnNvdXJjZUNoYWluID0gc291cmNlQ2hhaW5cbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwiYXZtLmdldFVUWE9zXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgY29uc3QgdXR4b3M6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgbGV0IGRhdGEgPSByZXNwb25zZS5kYXRhLnJlc3VsdC51dHhvc1xuICAgIGlmIChwZXJzaXN0T3B0cyAmJiB0eXBlb2YgcGVyc2lzdE9wdHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGlmICh0aGlzLmRiLmhhcyhwZXJzaXN0T3B0cy5nZXROYW1lKCkpKSB7XG4gICAgICAgIGNvbnN0IHNlbGZBcnJheTogc3RyaW5nW10gPSB0aGlzLmRiLmdldChwZXJzaXN0T3B0cy5nZXROYW1lKCkpXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNlbGZBcnJheSkpIHtcbiAgICAgICAgICB1dHhvcy5hZGRBcnJheShkYXRhKVxuICAgICAgICAgIGNvbnN0IHV0eG9TZXQ6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgICAgICAgdXR4b1NldC5hZGRBcnJheShzZWxmQXJyYXkpXG4gICAgICAgICAgdXR4b1NldC5tZXJnZUJ5UnVsZSh1dHhvcywgcGVyc2lzdE9wdHMuZ2V0TWVyZ2VSdWxlKCkpXG4gICAgICAgICAgZGF0YSA9IHV0eG9TZXQuZ2V0QWxsVVRYT1N0cmluZ3MoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmRiLnNldChwZXJzaXN0T3B0cy5nZXROYW1lKCksIGRhdGEsIHBlcnNpc3RPcHRzLmdldE92ZXJ3cml0ZSgpKVxuICAgIH1cbiAgICBpZiAoZGF0YS5sZW5ndGggPiAwICYmIGRhdGFbMF0uc3Vic3RyaW5nKDAsIDIpID09PSBcIjB4XCIpIHtcbiAgICAgIGNvbnN0IGNiNThTdHJzOiBzdHJpbmdbXSA9IFtdXG4gICAgICBkYXRhLmZvckVhY2goKHN0cjogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGNiNThTdHJzLnB1c2goYmludG9vbHMuY2I1OEVuY29kZShCdWZmZXIuZnJvbShzdHIuc2xpY2UoMiksIFwiaGV4XCIpKSlcbiAgICAgIH0pXG5cbiAgICAgIHV0eG9zLmFkZEFycmF5KGNiNThTdHJzLCBmYWxzZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdXR4b3MuYWRkQXJyYXkoZGF0YSwgZmFsc2UpXG4gICAgfVxuICAgIHJlc3BvbnNlLmRhdGEucmVzdWx0LnV0eG9zID0gdXR4b3NcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhbiB1bnNpZ25lZCB0cmFuc2FjdGlvbi4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zLCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcywgYW5kIFtbVHJhbnNmZXJPcGVyYXRpb25dXXMpLlxuICAgKlxuICAgKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAgKiBAcGFyYW0gYW1vdW50IFRoZSBhbW91bnQgb2YgQXNzZXRJRCB0byBiZSBzcGVudCBpbiBpdHMgc21hbGxlc3QgZGVub21pbmF0aW9uLCByZXByZXNlbnRlZCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfS5cbiAgICogQHBhcmFtIGFzc2V0SUQgVGhlIGFzc2V0SUQgb2YgdGhlIHZhbHVlIGJlaW5nIHNlbnRcbiAgICogQHBhcmFtIHRvQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdG8gc2VuZCB0aGUgZnVuZHNcbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHByb3ZpZGVkXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBDQjU4IEJ1ZmZlciBvciBTdHJpbmcgd2hpY2ggY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGxvY2t0aW1lIE9wdGlvbmFsLiBUaGUgbG9ja3RpbWUgZmllbGQgY3JlYXRlZCBpbiB0aGUgcmVzdWx0aW5nIG91dHB1dHNcbiAgICogQHBhcmFtIHRvVGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAgKiBAcGFyYW0gY2hhbmdlVGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgY2hhbmdlIFVUWE9cbiAgICpcbiAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gKFtbVW5zaWduZWRUeF1dKSB3aGljaCBjb250YWlucyBhIFtbQmFzZVR4XV0uXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIFRoaXMgaGVscGVyIGV4aXN0cyBiZWNhdXNlIHRoZSBlbmRwb2ludCBBUEkgc2hvdWxkIGJlIHRoZSBwcmltYXJ5IHBvaW50IG9mIGVudHJ5IGZvciBtb3N0IGZ1bmN0aW9uYWxpdHkuXG4gICAqL1xuICBidWlsZEJhc2VUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIGFtb3VudDogQk4sXG4gICAgYXNzZXRJRDogQnVmZmVyIHwgc3RyaW5nID0gdW5kZWZpbmVkLFxuICAgIHRvQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBmcm9tQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIG1lbW86IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSxcbiAgICB0b1RocmVzaG9sZDogbnVtYmVyID0gMSxcbiAgICBjaGFuZ2VUaHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyOiBzdHJpbmcgPSBcImJ1aWxkQmFzZVR4XCJcbiAgICBjb25zdCB0bzogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheSh0b0FkZHJlc3NlcywgY2FsbGVyKS5tYXAoXG4gICAgICAoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKVxuICAgIClcbiAgICBjb25zdCBmcm9tOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb21BZGRyZXNzZXMsIGNhbGxlcikubWFwKFxuICAgICAgKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSlcbiAgICApXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KFxuICAgICAgY2hhbmdlQWRkcmVzc2VzLFxuICAgICAgY2FsbGVyXG4gICAgKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG5cbiAgICBpZiAodHlwZW9mIGFzc2V0SUQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGFzc2V0SUQgPSBiaW50b29scy5jYjU4RGVjb2RlKGFzc2V0SUQpXG4gICAgfVxuXG4gICAgaWYgKG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgICAgbWVtbyA9IG1lbW8uZ2V0UGF5bG9hZCgpXG4gICAgfVxuXG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKClcbiAgICBjb25zdCBibG9ja2NoYWluSURCdWY6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpXG4gICAgY29uc3QgZmVlOiBCTiA9IHRoaXMuZ2V0VHhGZWUoKVxuICAgIGNvbnN0IGZlZUFzc2V0SUQ6IEJ1ZmZlciA9IGF3YWl0IHRoaXMuZ2V0QVZBWEFzc2V0SUQoKVxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDogVW5zaWduZWRUeCA9IHV0eG9zZXQuYnVpbGRCYXNlVHgoXG4gICAgICBuZXR3b3JrSUQsXG4gICAgICBibG9ja2NoYWluSURCdWYsXG4gICAgICBhbW91bnQsXG4gICAgICBhc3NldElELFxuICAgICAgdG8sXG4gICAgICBmcm9tLFxuICAgICAgY2hhbmdlLFxuICAgICAgZmVlLFxuICAgICAgZmVlQXNzZXRJRCxcbiAgICAgIG1lbW8sXG4gICAgICBhc09mLFxuICAgICAgbG9ja3RpbWUsXG4gICAgICB0b1RocmVzaG9sZCxcbiAgICAgIGNoYW5nZVRocmVzaG9sZFxuICAgIClcblxuICAgIGlmICghKGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRCYXNlVHg6RmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBjcmVhdGVzIGFuIHVuc2lnbmVkIE5GVCBUcmFuc2Zlci4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zLCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcywgYW5kIFtbVHJhbnNmZXJPcGVyYXRpb25dXXMpLlxuICAgKlxuICAgKiBAcGFyYW0gdXR4b3NldCAgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIHRvQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdG8gc2VuZCB0aGUgTkZUXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBORlQgZnJvbSB0aGUgdXR4b0lEIHByb3ZpZGVkXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPc1xuICAgKiBAcGFyYW0gdXR4b2lkIEEgYmFzZTU4IHV0eG9JRCBvciBhbiBhcnJheSBvZiBiYXNlNTggdXR4b0lEcyBmb3IgdGhlIG5mdHMgdGhpcyB0cmFuc2FjdGlvbiBpcyBzZW5kaW5nXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIENCNTggQnVmZmVyIG9yIFN0cmluZyB3aGljaCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICAgKiBAcGFyYW0gdG9UaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqIEBwYXJhbSBjaGFuZ2VUaHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBjaGFuZ2UgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiAoW1tVbnNpZ25lZFR4XV0pIHdoaWNoIGNvbnRhaW5zIGEgW1tORlRUcmFuc2ZlclR4XV0uXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIFRoaXMgaGVscGVyIGV4aXN0cyBiZWNhdXNlIHRoZSBlbmRwb2ludCBBUEkgc2hvdWxkIGJlIHRoZSBwcmltYXJ5IHBvaW50IG9mIGVudHJ5IGZvciBtb3N0IGZ1bmN0aW9uYWxpdHkuXG4gICAqL1xuICBidWlsZE5GVFRyYW5zZmVyVHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICB0b0FkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgZnJvbUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICB1dHhvaWQ6IHN0cmluZyB8IHN0cmluZ1tdLFxuICAgIG1lbW86IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSxcbiAgICB0b1RocmVzaG9sZDogbnVtYmVyID0gMSxcbiAgICBjaGFuZ2VUaHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyOiBzdHJpbmcgPSBcImJ1aWxkTkZUVHJhbnNmZXJUeFwiXG4gICAgY29uc3QgdG86IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkodG9BZGRyZXNzZXMsIGNhbGxlcikubWFwKFxuICAgICAgKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSlcbiAgICApXG4gICAgY29uc3QgZnJvbTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBjYWxsZXIpLm1hcChcbiAgICAgIChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpXG4gICAgKVxuICAgIGNvbnN0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShcbiAgICAgIGNoYW5nZUFkZHJlc3NlcyxcbiAgICAgIGNhbGxlclxuICAgICkubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuXG4gICAgaWYgKG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgICAgbWVtbyA9IG1lbW8uZ2V0UGF5bG9hZCgpXG4gICAgfVxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcblxuICAgIGxldCB1dHhvaWRBcnJheTogc3RyaW5nW10gPSBbXVxuICAgIGlmICh0eXBlb2YgdXR4b2lkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB1dHhvaWRBcnJheSA9IFt1dHhvaWRdXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHV0eG9pZCkpIHtcbiAgICAgIHV0eG9pZEFycmF5ID0gdXR4b2lkXG4gICAgfVxuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZE5GVFRyYW5zZmVyVHgoXG4gICAgICB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCksXG4gICAgICBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKSxcbiAgICAgIHRvLFxuICAgICAgZnJvbSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIHV0eG9pZEFycmF5LFxuICAgICAgdGhpcy5nZXRUeEZlZSgpLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLFxuICAgICAgYXNPZixcbiAgICAgIGxvY2t0aW1lLFxuICAgICAgdG9UaHJlc2hvbGQsXG4gICAgICBjaGFuZ2VUaHJlc2hvbGRcbiAgICApXG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgR29vc2VFZ2dDaGVja0Vycm9yKFxuICAgICAgICBcIkVycm9yIC0gQVZNQVBJLmJ1aWxkTkZUVHJhbnNmZXJUeDpGYWlsZWQgR29vc2UgRWdnIENoZWNrXCJcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbHRVbnNpZ25lZFR4XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYW4gdW5zaWduZWQgSW1wb3J0IFR4LiBGb3IgbW9yZSBncmFudWxhciBjb250cm9sLCB5b3UgbWF5IGNyZWF0ZSB5b3VyIG93blxuICAgKiBbW1Vuc2lnbmVkVHhdXSBtYW51YWxseSAod2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMsIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zLCBhbmQgW1tUcmFuc2Zlck9wZXJhdGlvbl1dcykuXG4gICAqXG4gICAqIEBwYXJhbSB1dHhvc2V0ICBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAgKiBAcGFyYW0gb3duZXJBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIGltcG9ydFxuICAgKiBAcGFyYW0gc291cmNlQ2hhaW4gVGhlIGNoYWluaWQgZm9yIHdoZXJlIHRoZSBpbXBvcnQgaXMgY29taW5nIGZyb21cbiAgICogQHBhcmFtIHRvQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdG8gc2VuZCB0aGUgZnVuZHNcbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHByb3ZpZGVkXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBDQjU4IEJ1ZmZlciBvciBTdHJpbmcgd2hpY2ggY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGxvY2t0aW1lIE9wdGlvbmFsLiBUaGUgbG9ja3RpbWUgZmllbGQgY3JlYXRlZCBpbiB0aGUgcmVzdWx0aW5nIG91dHB1dHNcbiAgICogQHBhcmFtIHRvVGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAgKiBAcGFyYW0gY2hhbmdlVGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgY2hhbmdlIFVUWE9cbiAgICpcbiAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gKFtbVW5zaWduZWRUeF1dKSB3aGljaCBjb250YWlucyBhIFtbSW1wb3J0VHhdXS5cbiAgICpcbiAgICogQHJlbWFya3NcbiAgICogVGhpcyBoZWxwZXIgZXhpc3RzIGJlY2F1c2UgdGhlIGVuZHBvaW50IEFQSSBzaG91bGQgYmUgdGhlIHByaW1hcnkgcG9pbnQgb2YgZW50cnkgZm9yIG1vc3QgZnVuY3Rpb25hbGl0eS5cbiAgICovXG4gIGJ1aWxkSW1wb3J0VHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICBvd25lckFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgc291cmNlQ2hhaW46IEJ1ZmZlciB8IHN0cmluZyxcbiAgICB0b0FkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgZnJvbUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMCksXG4gICAgdG9UaHJlc2hvbGQ6IG51bWJlciA9IDEsXG4gICAgY2hhbmdlVGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICk6IFByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IGNhbGxlcjogc3RyaW5nID0gXCJidWlsZEltcG9ydFR4XCJcbiAgICBjb25zdCB0bzogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheSh0b0FkZHJlc3NlcywgY2FsbGVyKS5tYXAoXG4gICAgICAoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKVxuICAgIClcbiAgICBjb25zdCBmcm9tOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb21BZGRyZXNzZXMsIGNhbGxlcikubWFwKFxuICAgICAgKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSlcbiAgICApXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KFxuICAgICAgY2hhbmdlQWRkcmVzc2VzLFxuICAgICAgY2FsbGVyXG4gICAgKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG5cbiAgICBsZXQgc3JjQ2hhaW46IHN0cmluZyA9IHVuZGVmaW5lZFxuXG4gICAgaWYgKHR5cGVvZiBzb3VyY2VDaGFpbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhyb3cgbmV3IENoYWluSWRFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIEFWTUFQSS5idWlsZEltcG9ydFR4OiBTb3VyY2UgQ2hhaW5JRCBpcyB1bmRlZmluZWQuXCJcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2VDaGFpbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgc3JjQ2hhaW4gPSBzb3VyY2VDaGFpblxuICAgICAgc291cmNlQ2hhaW4gPSBiaW50b29scy5jYjU4RGVjb2RlKHNvdXJjZUNoYWluKVxuICAgIH0gZWxzZSBpZiAoIShzb3VyY2VDaGFpbiBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRJbXBvcnRUeDogSW52YWxpZCBkZXN0aW5hdGlvbkNoYWluIHR5cGU6IFwiICtcbiAgICAgICAgICB0eXBlb2Ygc291cmNlQ2hhaW5cbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCBhdG9taWNVVFhPczogVVRYT1NldCA9IChcbiAgICAgIGF3YWl0IHRoaXMuZ2V0VVRYT3Mob3duZXJBZGRyZXNzZXMsIHNyY0NoYWluLCAwLCB1bmRlZmluZWQpXG4gICAgKS51dHhvc1xuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcbiAgICBjb25zdCBhdG9taWNzOiBVVFhPW10gPSBhdG9taWNVVFhPcy5nZXRBbGxVVFhPcygpXG5cbiAgICBpZiAoYXRvbWljcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBOb0F0b21pY1VUWE9zRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRJbXBvcnRUeDogTm8gYXRvbWljIFVUWE9zIHRvIGltcG9ydCBmcm9tIFwiICtcbiAgICAgICAgICBzcmNDaGFpbiArXG4gICAgICAgICAgXCIgdXNpbmcgYWRkcmVzc2VzOiBcIiArXG4gICAgICAgICAgb3duZXJBZGRyZXNzZXMuam9pbihcIiwgXCIpXG4gICAgICApXG4gICAgfVxuXG4gICAgaWYgKG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgICAgbWVtbyA9IG1lbW8uZ2V0UGF5bG9hZCgpXG4gICAgfVxuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZEltcG9ydFR4KFxuICAgICAgdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpLFxuICAgICAgYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRCksXG4gICAgICB0byxcbiAgICAgIGZyb20sXG4gICAgICBjaGFuZ2UsXG4gICAgICBhdG9taWNzLFxuICAgICAgc291cmNlQ2hhaW4sXG4gICAgICB0aGlzLmdldFR4RmVlKCksXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sXG4gICAgICBhc09mLFxuICAgICAgbG9ja3RpbWUsXG4gICAgICB0b1RocmVzaG9sZCxcbiAgICAgIGNoYW5nZVRocmVzaG9sZFxuICAgIClcblxuICAgIGlmICghKGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRJbXBvcnRUeDpGYWlsZWQgR29vc2UgRWdnIENoZWNrXCJcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbHRVbnNpZ25lZFR4XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYW4gdW5zaWduZWQgRXhwb3J0IFR4LiBGb3IgbW9yZSBncmFudWxhciBjb250cm9sLCB5b3UgbWF5IGNyZWF0ZSB5b3VyIG93blxuICAgKiBbW1Vuc2lnbmVkVHhdXSBtYW51YWxseSAod2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMsIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zLCBhbmQgW1tUcmFuc2Zlck9wZXJhdGlvbl1dcykuXG4gICAqXG4gICAqIEBwYXJhbSB1dHhvc2V0IEEgc2V0IG9mIFVUWE9zIHRoYXQgdGhlIHRyYW5zYWN0aW9uIGlzIGJ1aWx0IG9uXG4gICAqIEBwYXJhbSBhbW91bnQgVGhlIGFtb3VudCBiZWluZyBleHBvcnRlZCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBkZXN0aW5hdGlvbkNoYWluIFRoZSBjaGFpbmlkIGZvciB3aGVyZSB0aGUgYXNzZXRzIHdpbGwgYmUgc2VudC5cbiAgICogQHBhcmFtIHRvQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdG8gc2VuZCB0aGUgZnVuZHNcbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHByb3ZpZGVkXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBDQjU4IEJ1ZmZlciBvciBTdHJpbmcgd2hpY2ggY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGxvY2t0aW1lIE9wdGlvbmFsLiBUaGUgbG9ja3RpbWUgZmllbGQgY3JlYXRlZCBpbiB0aGUgcmVzdWx0aW5nIG91dHB1dHNcbiAgICogQHBhcmFtIHRvVGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAgKiBAcGFyYW0gY2hhbmdlVGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgY2hhbmdlIFVUWE9cbiAgICogQHBhcmFtIGFzc2V0SUQgT3B0aW9uYWwuIFRoZSBhc3NldElEIG9mIHRoZSBhc3NldCB0byBzZW5kLiBEZWZhdWx0cyB0byBBVkFYIGFzc2V0SUQuXG4gICAqIFJlZ2FyZGxlc3Mgb2YgdGhlIGFzc2V0IHdoaWNoIHlvdVwicmUgZXhwb3J0aW5nLCBhbGwgZmVlcyBhcmUgcGFpZCBpbiBBVkFYLlxuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiAoW1tVbnNpZ25lZFR4XV0pIHdoaWNoIGNvbnRhaW5zIGFuIFtbRXhwb3J0VHhdXS5cbiAgICovXG4gIGJ1aWxkRXhwb3J0VHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICBhbW91bnQ6IEJOLFxuICAgIGRlc3RpbmF0aW9uQ2hhaW46IEJ1ZmZlciB8IHN0cmluZyxcbiAgICB0b0FkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgZnJvbUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMCksXG4gICAgdG9UaHJlc2hvbGQ6IG51bWJlciA9IDEsXG4gICAgY2hhbmdlVGhyZXNob2xkOiBudW1iZXIgPSAxLFxuICAgIGFzc2V0SUQ6IHN0cmluZyA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPFVuc2lnbmVkVHg+ID0+IHtcbiAgICBjb25zdCBwcmVmaXhlczogb2JqZWN0ID0ge31cbiAgICB0b0FkZHJlc3Nlcy5tYXAoKGE6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgcHJlZml4ZXNbYS5zcGxpdChcIi1cIilbMF1dID0gdHJ1ZVxuICAgIH0pXG4gICAgaWYgKE9iamVjdC5rZXlzKHByZWZpeGVzKS5sZW5ndGggIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRFeHBvcnRUeDogVG8gYWRkcmVzc2VzIG11c3QgaGF2ZSB0aGUgc2FtZSBjaGFpbklEIHByZWZpeC5cIlxuICAgICAgKVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGVzdGluYXRpb25DaGFpbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhyb3cgbmV3IENoYWluSWRFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIEFWTUFQSS5idWlsZEV4cG9ydFR4OiBEZXN0aW5hdGlvbiBDaGFpbklEIGlzIHVuZGVmaW5lZC5cIlxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlc3RpbmF0aW9uQ2hhaW4gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGRlc3RpbmF0aW9uQ2hhaW4gPSBiaW50b29scy5jYjU4RGVjb2RlKGRlc3RpbmF0aW9uQ2hhaW4pIC8vXG4gICAgfSBlbHNlIGlmICghKGRlc3RpbmF0aW9uQ2hhaW4gaW5zdGFuY2VvZiBCdWZmZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgQ2hhaW5JZEVycm9yKFxuICAgICAgICBcIkVycm9yIC0gQVZNQVBJLmJ1aWxkRXhwb3J0VHg6IEludmFsaWQgZGVzdGluYXRpb25DaGFpbiB0eXBlOiBcIiArXG4gICAgICAgICAgdHlwZW9mIGRlc3RpbmF0aW9uQ2hhaW5cbiAgICAgIClcbiAgICB9XG4gICAgaWYgKGRlc3RpbmF0aW9uQ2hhaW4ubGVuZ3RoICE9PSAzMikge1xuICAgICAgdGhyb3cgbmV3IENoYWluSWRFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIEFWTUFQSS5idWlsZEV4cG9ydFR4OiBEZXN0aW5hdGlvbiBDaGFpbklEIG11c3QgYmUgMzIgYnl0ZXMgaW4gbGVuZ3RoLlwiXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgdG86IEJ1ZmZlcltdID0gW11cbiAgICB0b0FkZHJlc3Nlcy5tYXAoKGE6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgdG8ucHVzaChiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG4gICAgfSlcblxuICAgIGNvbnN0IGNhbGxlcjogc3RyaW5nID0gXCJidWlsZEV4cG9ydFR4XCJcbiAgICBjb25zdCBmcm9tOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb21BZGRyZXNzZXMsIGNhbGxlcikubWFwKFxuICAgICAgKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSlcbiAgICApXG5cbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoXG4gICAgICBjaGFuZ2VBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcblxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcbiAgICBpZiAodHlwZW9mIGFzc2V0SUQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGFzc2V0SUQgPSBiaW50b29scy5jYjU4RW5jb2RlKGF2YXhBc3NldElEKVxuICAgIH1cblxuICAgIGNvbnN0IG5ldHdvcmtJRDogbnVtYmVyID0gdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpXG4gICAgY29uc3QgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKVxuICAgIGNvbnN0IGFzc2V0SURCdWY6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUoYXNzZXRJRClcbiAgICBjb25zdCBmZWU6IEJOID0gdGhpcy5nZXRUeEZlZSgpXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZEV4cG9ydFR4KFxuICAgICAgbmV0d29ya0lELFxuICAgICAgYmxvY2tjaGFpbklELFxuICAgICAgYW1vdW50LFxuICAgICAgYXNzZXRJREJ1ZixcbiAgICAgIHRvLFxuICAgICAgZnJvbSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIGRlc3RpbmF0aW9uQ2hhaW4sXG4gICAgICBmZWUsXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sXG4gICAgICBhc09mLFxuICAgICAgbG9ja3RpbWUsXG4gICAgICB0b1RocmVzaG9sZCxcbiAgICAgIGNoYW5nZVRocmVzaG9sZFxuICAgIClcblxuICAgIGlmICghKGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRFeHBvcnRUeDpGYWlsZWQgR29vc2UgRWdnIENoZWNrXCJcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbHRVbnNpZ25lZFR4XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiB1bnNpZ25lZCB0cmFuc2FjdGlvbi4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zLCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcywgYW5kIFtbVHJhbnNmZXJPcGVyYXRpb25dXXMpLlxuICAgKlxuICAgKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICAqIEBwYXJhbSBpbml0aWFsU3RhdGUgVGhlIFtbSW5pdGlhbFN0YXRlc11dIHRoYXQgcmVwcmVzZW50IHRoZSBpbnRpYWwgc3RhdGUgb2YgYSBjcmVhdGVkIGFzc2V0XG4gICAqIEBwYXJhbSBuYW1lIFN0cmluZyBmb3IgdGhlIGRlc2NyaXB0aXZlIG5hbWUgb2YgdGhlIGFzc2V0XG4gICAqIEBwYXJhbSBzeW1ib2wgU3RyaW5nIGZvciB0aGUgdGlja2VyIHN5bWJvbCBvZiB0aGUgYXNzZXRcbiAgICogQHBhcmFtIGRlbm9taW5hdGlvbiBOdW1iZXIgZm9yIHRoZSBkZW5vbWluYXRpb24gd2hpY2ggaXMgMTBeRC4gRCBtdXN0IGJlID49IDAgYW5kIDw9IDMyLiBFeDogJDEgQVZBWCA9IDEwXjkgJG5BVkFYXG4gICAqIEBwYXJhbSBtaW50T3V0cHV0cyBPcHRpb25hbC4gQXJyYXkgb2YgW1tTRUNQTWludE91dHB1dF1dcyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgdHJhbnNhY3Rpb24uIFRoZXNlIG91dHB1dHMgY2FuIGJlIHNwZW50IHRvIG1pbnQgbW9yZSB0b2tlbnMuXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIENCNTggQnVmZmVyIG9yIFN0cmluZyB3aGljaCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gY2hhbmdlVGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgY2hhbmdlIFVUWE9cbiAgICpcbiAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gKFtbVW5zaWduZWRUeF1dKSB3aGljaCBjb250YWlucyBhIFtbQ3JlYXRlQXNzZXRUeF1dLlxuICAgKlxuICAgKi9cbiAgYnVpbGRDcmVhdGVBc3NldFR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgZnJvbUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBpbml0aWFsU3RhdGVzOiBJbml0aWFsU3RhdGVzLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzeW1ib2w6IHN0cmluZyxcbiAgICBkZW5vbWluYXRpb246IG51bWJlcixcbiAgICBtaW50T3V0cHV0czogU0VDUE1pbnRPdXRwdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBjaGFuZ2VUaHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyOiBzdHJpbmcgPSBcImJ1aWxkQ3JlYXRlQXNzZXRUeFwiXG4gICAgY29uc3QgZnJvbTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBjYWxsZXIpLm1hcChcbiAgICAgIChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpXG4gICAgKVxuICAgIGNvbnN0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShcbiAgICAgIGNoYW5nZUFkZHJlc3NlcyxcbiAgICAgIGNhbGxlclxuICAgICkubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuXG4gICAgaWYgKG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgICAgbWVtbyA9IG1lbW8uZ2V0UGF5bG9hZCgpXG4gICAgfVxuXG4gICAgaWYgKHN5bWJvbC5sZW5ndGggPiBBVk1Db25zdGFudHMuU1lNQk9MTUFYTEVOKSB7XG4gICAgICB0aHJvdyBuZXcgU3ltYm9sRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRDcmVhdGVBc3NldFR4OiBTeW1ib2xzIG1heSBub3QgZXhjZWVkIGxlbmd0aCBvZiBcIiArXG4gICAgICAgICAgQVZNQ29uc3RhbnRzLlNZTUJPTE1BWExFTlxuICAgICAgKVxuICAgIH1cbiAgICBpZiAobmFtZS5sZW5ndGggPiBBVk1Db25zdGFudHMuQVNTRVROQU1FTEVOKSB7XG4gICAgICB0aHJvdyBuZXcgTmFtZUVycm9yKFxuICAgICAgICBcIkVycm9yIC0gQVZNQVBJLmJ1aWxkQ3JlYXRlQXNzZXRUeDogTmFtZXMgbWF5IG5vdCBleGNlZWQgbGVuZ3RoIG9mIFwiICtcbiAgICAgICAgICBBVk1Db25zdGFudHMuQVNTRVROQU1FTEVOXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKClcbiAgICBjb25zdCBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpXG4gICAgY29uc3QgYXZheEFzc2V0SUQ6IEJ1ZmZlciA9IGF3YWl0IHRoaXMuZ2V0QVZBWEFzc2V0SUQoKVxuICAgIGNvbnN0IGZlZTogQk4gPSB0aGlzLmdldERlZmF1bHRDcmVhdGlvblR4RmVlKClcbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSB1dHhvc2V0LmJ1aWxkQ3JlYXRlQXNzZXRUeChcbiAgICAgIG5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIGZyb20sXG4gICAgICBjaGFuZ2UsXG4gICAgICBpbml0aWFsU3RhdGVzLFxuICAgICAgbmFtZSxcbiAgICAgIHN5bWJvbCxcbiAgICAgIGRlbm9taW5hdGlvbixcbiAgICAgIG1pbnRPdXRwdXRzLFxuICAgICAgZmVlLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLFxuICAgICAgYXNPZixcbiAgICAgIGNoYW5nZVRocmVzaG9sZFxuICAgIClcblxuICAgIGlmICghKGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgsIGZlZSkpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIEFWTUFQSS5idWlsZENyZWF0ZUFzc2V0VHg6RmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gdW5zaWduZWQgU2VjcCBtaW50IHRyYW5zYWN0aW9uLiBGb3IgbW9yZSBncmFudWxhciBjb250cm9sLCB5b3UgbWF5IGNyZWF0ZSB5b3VyIG93blxuICAgKiBbW09wZXJhdGlvblR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zLCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcywgYW5kIFtbVHJhbnNmZXJPcGVyYXRpb25dXXMpLlxuICAgKlxuICAgKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAgKiBAcGFyYW0gbWludE93bmVyIEEgW1tTRUNQTWludE91dHB1dF1dIHdoaWNoIHNwZWNpZmllcyB0aGUgbmV3IHNldCBvZiBtaW50ZXJzXG4gICAqIEBwYXJhbSB0cmFuc2Zlck93bmVyIEEgW1tTRUNQVHJhbnNmZXJPdXRwdXRdXSB3aGljaCBzcGVjaWZpZXMgd2hlcmUgdGhlIG1pbnRlZCB0b2tlbnMgd2lsbCBnb1xuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICAqIEBwYXJhbSBtaW50VVRYT0lEIFRoZSBVVFhPSUQgZm9yIHRoZSBbW1NDUE1pbnRPdXRwdXRdXSBiZWluZyBzcGVudCB0byBwcm9kdWNlIG1vcmUgdG9rZW5zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBjaGFuZ2V0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBjaGFuZ2UgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiAoW1tVbnNpZ25lZFR4XV0pIHdoaWNoIGNvbnRhaW5zIGEgW1tTRUNQTWludFR4XV0uXG4gICAqL1xuICBidWlsZFNFQ1BNaW50VHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICBtaW50T3duZXI6IFNFQ1BNaW50T3V0cHV0LFxuICAgIHRyYW5zZmVyT3duZXI6IFNFQ1BUcmFuc2Zlck91dHB1dCxcbiAgICBmcm9tQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIG1pbnRVVFhPSUQ6IHN0cmluZyxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBjaGFuZ2VUaHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICBjb25zdCBjYWxsZXI6IHN0cmluZyA9IFwiYnVpbGRTRUNQTWludFR4XCJcbiAgICBjb25zdCBmcm9tOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb21BZGRyZXNzZXMsIGNhbGxlcikubWFwKFxuICAgICAgKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSlcbiAgICApXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KFxuICAgICAgY2hhbmdlQWRkcmVzc2VzLFxuICAgICAgY2FsbGVyXG4gICAgKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG5cbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKVxuICAgIGNvbnN0IGJsb2NrY2hhaW5JRDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRClcbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG4gICAgY29uc3QgZmVlOiBCTiA9IHRoaXMuZ2V0TWludFR4RmVlKClcbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSB1dHhvc2V0LmJ1aWxkU0VDUE1pbnRUeChcbiAgICAgIG5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIG1pbnRPd25lcixcbiAgICAgIHRyYW5zZmVyT3duZXIsXG4gICAgICBmcm9tLFxuICAgICAgY2hhbmdlLFxuICAgICAgbWludFVUWE9JRCxcbiAgICAgIGZlZSxcbiAgICAgIGF2YXhBc3NldElELFxuICAgICAgbWVtbyxcbiAgICAgIGFzT2YsXG4gICAgICBjaGFuZ2VUaHJlc2hvbGRcbiAgICApXG4gICAgaWYgKCEoYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCkpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIEFWTUFQSS5idWlsZFNFQ1BNaW50VHg6RmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uLiBGb3IgbW9yZSBncmFudWxhciBjb250cm9sLCB5b3UgbWF5IGNyZWF0ZSB5b3VyIG93blxuICAgKiBbW1Vuc2lnbmVkVHhdXSBtYW51YWxseSAod2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMsIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zLCBhbmQgW1tUcmFuc2Zlck9wZXJhdGlvbl1dcykuXG4gICAqXG4gICAqIEBwYXJhbSB1dHhvc2V0IEEgc2V0IG9mIFVUWE9zIHRoYXQgdGhlIHRyYW5zYWN0aW9uIGlzIGJ1aWx0IG9uXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3NcbiAgICogQHBhcmFtIG1pbnRlclNldHMgaXMgYSBsaXN0IHdoZXJlIGVhY2ggZWxlbWVudCBzcGVjaWZpZXMgdGhhdCB0aHJlc2hvbGQgb2YgdGhlIGFkZHJlc3NlcyBpbiBtaW50ZXJzIG1heSB0b2dldGhlciBtaW50IG1vcmUgb2YgdGhlIGFzc2V0IGJ5IHNpZ25pbmcgYSBtaW50aW5nIHRyYW5zYWN0aW9uXG4gICAqIEBwYXJhbSBuYW1lIFN0cmluZyBmb3IgdGhlIGRlc2NyaXB0aXZlIG5hbWUgb2YgdGhlIGFzc2V0XG4gICAqIEBwYXJhbSBzeW1ib2wgU3RyaW5nIGZvciB0aGUgdGlja2VyIHN5bWJvbCBvZiB0aGUgYXNzZXRcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgQ0I1OCBCdWZmZXIgb3IgU3RyaW5nIHdoaWNoIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBtaW50IG91dHB1dFxuICAgKiBAcGFyYW0gY2hhbmdlVGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgY2hhbmdlIFVUWE9cbiAgICpcbiAgICogYGBganNcbiAgICogRXhhbXBsZSBtaW50ZXJTZXRzOlxuICAgKiBbXG4gICAqICAgICAge1xuICAgKiAgICAgICAgICBcIm1pbnRlcnNcIjpbXG4gICAqICAgICAgICAgICAgICBcIlgtYXZheDFnaHN0anVrcnR3ODkzNWxyeXF0bmg2NDN4ZTlhOTR1M3RjNzVjN1wiXG4gICAqICAgICAgICAgIF0sXG4gICAqICAgICAgICAgIFwidGhyZXNob2xkXCI6IDFcbiAgICogICAgICB9LFxuICAgKiAgICAgIHtcbiAgICogICAgICAgICAgXCJtaW50ZXJzXCI6IFtcbiAgICogICAgICAgICAgICAgIFwiWC1hdmF4MXllbGwzZTRubG4wbTM5Y2ZwZGhncXByc2Q4N2praDRxbmFra2x4XCIsXG4gICAqICAgICAgICAgICAgICBcIlgtYXZheDFrNG5yMjZjODBqYXF1em05MzY5ajVhNHNobXdjam4wdm1lbWNqelwiLFxuICAgKiAgICAgICAgICAgICAgXCJYLWF2YXgxenRrenNyam5rbjBjZWs1cnl2aHFzd2R0Y2cyM25oZ2Uzbm5yNWVcIlxuICAgKiAgICAgICAgICBdLFxuICAgKiAgICAgICAgICBcInRocmVzaG9sZFwiOiAyXG4gICAqICAgICAgfVxuICAgKiBdXG4gICAqIGBgYFxuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiAoW1tVbnNpZ25lZFR4XV0pIHdoaWNoIGNvbnRhaW5zIGEgW1tDcmVhdGVBc3NldFR4XV0uXG4gICAqXG4gICAqL1xuICBidWlsZENyZWF0ZU5GVEFzc2V0VHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICBmcm9tQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIG1pbnRlclNldHM6IE1pbnRlclNldFtdLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzeW1ib2w6IHN0cmluZyxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMClcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgY2FsbGVyOiBzdHJpbmcgPSBcImJ1aWxkQ3JlYXRlTkZUQXNzZXRUeFwiXG4gICAgY29uc3QgZnJvbTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBjYWxsZXIpLm1hcChcbiAgICAgIChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpXG4gICAgKVxuICAgIGNvbnN0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShcbiAgICAgIGNoYW5nZUFkZHJlc3NlcyxcbiAgICAgIGNhbGxlclxuICAgICkubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuXG4gICAgaWYgKG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgICAgbWVtbyA9IG1lbW8uZ2V0UGF5bG9hZCgpXG4gICAgfVxuXG4gICAgaWYgKG5hbWUubGVuZ3RoID4gQVZNQ29uc3RhbnRzLkFTU0VUTkFNRUxFTikge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBOYW1lRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRDcmVhdGVORlRBc3NldFR4OiBOYW1lcyBtYXkgbm90IGV4Y2VlZCBsZW5ndGggb2YgXCIgK1xuICAgICAgICAgIEFWTUNvbnN0YW50cy5BU1NFVE5BTUVMRU5cbiAgICAgIClcbiAgICB9XG4gICAgaWYgKHN5bWJvbC5sZW5ndGggPiBBVk1Db25zdGFudHMuU1lNQk9MTUFYTEVOKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IFN5bWJvbEVycm9yKFxuICAgICAgICBcIkVycm9yIC0gQVZNQVBJLmJ1aWxkQ3JlYXRlTkZUQXNzZXRUeDogU3ltYm9scyBtYXkgbm90IGV4Y2VlZCBsZW5ndGggb2YgXCIgK1xuICAgICAgICAgIEFWTUNvbnN0YW50cy5TWU1CT0xNQVhMRU5cbiAgICAgIClcbiAgICB9XG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKClcbiAgICBjb25zdCBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpXG4gICAgY29uc3QgY3JlYXRpb25UeEZlZTogQk4gPSB0aGlzLmdldENyZWF0aW9uVHhGZWUoKVxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSB1dHhvc2V0LmJ1aWxkQ3JlYXRlTkZUQXNzZXRUeChcbiAgICAgIG5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIGZyb20sXG4gICAgICBjaGFuZ2UsXG4gICAgICBtaW50ZXJTZXRzLFxuICAgICAgbmFtZSxcbiAgICAgIHN5bWJvbCxcbiAgICAgIGNyZWF0aW9uVHhGZWUsXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sXG4gICAgICBhc09mLFxuICAgICAgbG9ja3RpbWVcbiAgICApXG4gICAgaWYgKCEoYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCwgY3JlYXRpb25UeEZlZSkpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIEFWTUFQSS5idWlsZENyZWF0ZU5GVEFzc2V0VHg6RmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uLiBGb3IgbW9yZSBncmFudWxhciBjb250cm9sLCB5b3UgbWF5IGNyZWF0ZSB5b3VyIG93blxuICAgKiBbW1Vuc2lnbmVkVHhdXSBtYW51YWxseSAod2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMsIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zLCBhbmQgW1tUcmFuc2Zlck9wZXJhdGlvbl1dcykuXG4gICAqXG4gICAqIEBwYXJhbSB1dHhvc2V0ICBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAgKiBAcGFyYW0gb3duZXJzIEVpdGhlciBhIHNpbmdsZSBvciBhbiBhcnJheSBvZiBbW091dHB1dE93bmVyc11dIHRvIHNlbmQgdGhlIG5mdCBvdXRwdXRcbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIE5GVCBmcm9tIHRoZSB1dHhvSUQgcHJvdmlkZWRcbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICAqIEBwYXJhbSB1dHhvaWQgQSBiYXNlNTggdXR4b0lEIG9yIGFuIGFycmF5IG9mIGJhc2U1OCB1dHhvSURzIGZvciB0aGUgbmZ0IG1pbnQgb3V0cHV0IHRoaXMgdHJhbnNhY3Rpb24gaXMgc2VuZGluZ1xuICAgKiBAcGFyYW0gZ3JvdXBJRCBPcHRpb25hbC4gVGhlIGdyb3VwIHRoaXMgTkZUIGlzIGlzc3VlZCB0by5cbiAgICogQHBhcmFtIHBheWxvYWQgT3B0aW9uYWwuIERhdGEgZm9yIE5GVCBQYXlsb2FkIGFzIGVpdGhlciBhIFtbUGF5bG9hZEJhc2VdXSBvciBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIENCNTggQnVmZmVyIG9yIFN0cmluZyB3aGljaCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gY2hhbmdlVGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgY2hhbmdlIFVUWE9cbiAgICpcbiAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gKFtbVW5zaWduZWRUeF1dKSB3aGljaCBjb250YWlucyBhbiBbW09wZXJhdGlvblR4XV0uXG4gICAqXG4gICAqL1xuICBidWlsZENyZWF0ZU5GVE1pbnRUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIG93bmVyczogT3V0cHV0T3duZXJzW10gfCBPdXRwdXRPd25lcnMsXG4gICAgZnJvbUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICB1dHhvaWQ6IHN0cmluZyB8IHN0cmluZ1tdLFxuICAgIGdyb3VwSUQ6IG51bWJlciA9IDAsXG4gICAgcGF5bG9hZDogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KClcbiAgKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICBjb25zdCBjYWxsZXI6IHN0cmluZyA9IFwiYnVpbGRDcmVhdGVORlRNaW50VHhcIlxuICAgIGNvbnN0IGZyb206IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoZnJvbUFkZHJlc3NlcywgY2FsbGVyKS5tYXAoXG4gICAgICAoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKVxuICAgIClcbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoXG4gICAgICBjaGFuZ2VBZGRyZXNzZXMsXG4gICAgICBjYWxsZXJcbiAgICApLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcblxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGlmIChwYXlsb2FkIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIHBheWxvYWQgPSBwYXlsb2FkLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdXR4b2lkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB1dHhvaWQgPSBbdXR4b2lkXVxuICAgIH1cblxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcblxuICAgIGlmIChvd25lcnMgaW5zdGFuY2VvZiBPdXRwdXRPd25lcnMpIHtcbiAgICAgIG93bmVycyA9IFtvd25lcnNdXG4gICAgfVxuXG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKClcbiAgICBjb25zdCBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpXG4gICAgY29uc3QgdHhGZWU6IEJOID0gdGhpcy5nZXRUeEZlZSgpXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZENyZWF0ZU5GVE1pbnRUeChcbiAgICAgIG5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICAgIG93bmVycyxcbiAgICAgIGZyb20sXG4gICAgICBjaGFuZ2UsXG4gICAgICB1dHhvaWQsXG4gICAgICBncm91cElELFxuICAgICAgcGF5bG9hZCxcbiAgICAgIHR4RmVlLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLFxuICAgICAgYXNPZlxuICAgIClcbiAgICBpZiAoIShhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgR29vc2VFZ2dDaGVja0Vycm9yKFxuICAgICAgICBcIkVycm9yIC0gQVZNQVBJLmJ1aWxkQ3JlYXRlTkZUTWludFR4OkZhaWxlZCBHb29zZSBFZ2cgQ2hlY2tcIlxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gYnVpbHRVbnNpZ25lZFR4XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHdoaWNoIHRha2VzIGFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGFuZCBzaWducyBpdCwgcmV0dXJuaW5nIHRoZSByZXN1bHRpbmcgW1tUeF1dLlxuICAgKlxuICAgKiBAcGFyYW0gdXR4IFRoZSB1bnNpZ25lZCB0cmFuc2FjdGlvbiBvZiB0eXBlIFtbVW5zaWduZWRUeF1dXG4gICAqXG4gICAqIEByZXR1cm5zIEEgc2lnbmVkIHRyYW5zYWN0aW9uIG9mIHR5cGUgW1tUeF1dXG4gICAqL1xuICBzaWduVHggPSAodXR4OiBVbnNpZ25lZFR4KTogVHggPT4gdXR4LnNpZ24odGhpcy5rZXljaGFpbilcblxuICAvKipcbiAgICogQ2FsbHMgdGhlIG5vZGUncyBpc3N1ZVR4IG1ldGhvZCBmcm9tIHRoZSBBUEkgYW5kIHJldHVybnMgdGhlIHJlc3VsdGluZyB0cmFuc2FjdGlvbiBJRCBhcyBhIHN0cmluZy5cbiAgICpcbiAgICogQHBhcmFtIHR4IEEgc3RyaW5nLCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSwgb3IgW1tUeF1dIHJlcHJlc2VudGluZyBhIHRyYW5zYWN0aW9uXG4gICAqXG4gICAqIEByZXR1cm5zIEEgUHJvbWlzZSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvbiBJRCBvZiB0aGUgcG9zdGVkIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgaXNzdWVUeCA9IGFzeW5jICh0eDogc3RyaW5nIHwgQnVmZmVyIHwgVHgpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGxldCBUcmFuc2FjdGlvbiA9IFwiXCJcbiAgICBpZiAodHlwZW9mIHR4ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBUcmFuc2FjdGlvbiA9IHR4XG4gICAgfSBlbHNlIGlmICh0eCBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgY29uc3QgdHhvYmo6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4b2JqLmZyb21CdWZmZXIodHgpXG4gICAgICBUcmFuc2FjdGlvbiA9IHR4b2JqLnRvU3RyaW5nSGV4KClcbiAgICB9IGVsc2UgaWYgKHR4IGluc3RhbmNlb2YgVHgpIHtcbiAgICAgIFRyYW5zYWN0aW9uID0gdHgudG9TdHJpbmdIZXgoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IFRyYW5zYWN0aW9uRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBBVk1BUEkuaXNzdWVUeDogcHJvdmlkZWQgdHggaXMgbm90IGV4cGVjdGVkIHR5cGUgb2Ygc3RyaW5nLCBCdWZmZXIsIG9yIFR4XCJcbiAgICAgIClcbiAgICB9XG4gICAgY29uc3QgcGFyYW1zOiBJc3N1ZVR4UGFyYW1zID0ge1xuICAgICAgdHg6IFRyYW5zYWN0aW9uLnRvU3RyaW5nKCksXG4gICAgICBlbmNvZGluZzogXCJoZXhcIlxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwiYXZtLmlzc3VlVHhcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRFxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIHRoZSBub2RlJ3MgZ2V0QWRkcmVzc1R4cyBtZXRob2QgZnJvbSB0aGUgQVBJIGFuZCByZXR1cm5zIHRyYW5zYWN0aW9ucyBjb3JyZXNwb25kaW5nIHRvIHRoZSBwcm92aWRlZCBhZGRyZXNzIGFuZCBhc3NldElEXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIGZvciB3aGljaCB3ZSdyZSBmZXRjaGluZyByZWxhdGVkIHRyYW5zYWN0aW9ucy5cbiAgICogQHBhcmFtIGN1cnNvciBQYWdlIG51bWJlciBvciBvZmZzZXQuXG4gICAqIEBwYXJhbSBwYWdlU2l6ZSAgTnVtYmVyIG9mIGl0ZW1zIHRvIHJldHVybiBwZXIgcGFnZS4gT3B0aW9uYWwuIERlZmF1bHRzIHRvIDEwMjQuIElmIFtwYWdlU2l6ZV0gPT0gMCBvciBbcGFnZVNpemVdID4gW21heFBhZ2VTaXplXSwgdGhlbiBpdCBmZXRjaGVzIGF0IG1heCBbbWF4UGFnZVNpemVdIHRyYW5zYWN0aW9uc1xuICAgKiBAcGFyYW0gYXNzZXRJRCBPbmx5IHJldHVybiB0cmFuc2FjdGlvbnMgdGhhdCBjaGFuZ2VkIHRoZSBiYWxhbmNlIG9mIHRoaXMgYXNzZXQuIE11c3QgYmUgYW4gSUQgb3IgYW4gYWxpYXMgZm9yIGFuIGFzc2V0LlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHByb21pc2Ugb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgYXJyYXkgb2YgdHJhbnNhY3Rpb24gSURzIGFuZCBwYWdlIG9mZnNldFxuICAgKi9cbiAgZ2V0QWRkcmVzc1R4cyA9IGFzeW5jIChcbiAgICBhZGRyZXNzOiBzdHJpbmcsXG4gICAgY3Vyc29yOiBudW1iZXIsXG4gICAgcGFnZVNpemU6IG51bWJlciB8IHVuZGVmaW5lZCxcbiAgICBhc3NldElEOiBzdHJpbmcgfCBCdWZmZXJcbiAgKTogUHJvbWlzZTxHZXRBZGRyZXNzVHhzUmVzcG9uc2U+ID0+IHtcbiAgICBsZXQgYXNzZXQ6IHN0cmluZ1xuICAgIGxldCBwYWdlU2l6ZU51bTogbnVtYmVyXG5cbiAgICBpZiAodHlwZW9mIGFzc2V0SUQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGFzc2V0ID0gYmludG9vbHMuY2I1OEVuY29kZShhc3NldElEKVxuICAgIH0gZWxzZSB7XG4gICAgICBhc3NldCA9IGFzc2V0SURcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBhZ2VTaXplICE9PSBcIm51bWJlclwiKSB7XG4gICAgICBwYWdlU2l6ZU51bSA9IDBcbiAgICB9IGVsc2Uge1xuICAgICAgcGFnZVNpemVOdW0gPSBwYWdlU2l6ZVxuICAgIH1cblxuICAgIGNvbnN0IHBhcmFtczogR2V0QWRkcmVzc1R4c1BhcmFtcyA9IHtcbiAgICAgIGFkZHJlc3MsXG4gICAgICBjdXJzb3IsXG4gICAgICBwYWdlU2l6ZTogcGFnZVNpemVOdW0sXG4gICAgICBhc3NldElEOiBhc3NldFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJhdm0uZ2V0QWRkcmVzc1R4c1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdFxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmRzIGFuIGFtb3VudCBvZiBhc3NldElEIHRvIHRoZSBzcGVjaWZpZWQgYWRkcmVzcyBmcm9tIGEgbGlzdCBvZiBvd25lZCBvZiBhZGRyZXNzZXMuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlciB0aGF0IG93bnMgdGhlIHByaXZhdGUga2V5cyBhc3NvY2lhdGVkIHdpdGggdGhlIGBmcm9tYCBhZGRyZXNzZXNcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCB1bmxvY2tpbmcgdGhlIHVzZXJcbiAgICogQHBhcmFtIGFzc2V0SUQgVGhlIGFzc2V0SUQgb2YgdGhlIGFzc2V0IHRvIHNlbmRcbiAgICogQHBhcmFtIGFtb3VudCBUaGUgYW1vdW50IG9mIHRoZSBhc3NldCB0byBiZSBzZW50XG4gICAqIEBwYXJhbSB0byBUaGUgYWRkcmVzcyBvZiB0aGUgcmVjaXBpZW50XG4gICAqIEBwYXJhbSBmcm9tIE9wdGlvbmFsLiBBbiBhcnJheSBvZiBhZGRyZXNzZXMgbWFuYWdlZCBieSB0aGUgbm9kZSdzIGtleXN0b3JlIGZvciB0aGlzIGJsb2NrY2hhaW4gd2hpY2ggd2lsbCBmdW5kIHRoaXMgdHJhbnNhY3Rpb25cbiAgICogQHBhcmFtIGNoYW5nZUFkZHIgT3B0aW9uYWwuIEFuIGFkZHJlc3MgdG8gc2VuZCB0aGUgY2hhbmdlXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsLiBDQjU4IEJ1ZmZlciBvciBTdHJpbmcgd2hpY2ggY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgdGhlIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHRyYW5zYWN0aW9uJ3MgSUQuXG4gICAqL1xuICBzZW5kID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgICBhc3NldElEOiBzdHJpbmcgfCBCdWZmZXIsXG4gICAgYW1vdW50OiBudW1iZXIgfCBCTixcbiAgICB0bzogc3RyaW5nLFxuICAgIGZyb206IHN0cmluZ1tdIHwgQnVmZmVyW10gPSB1bmRlZmluZWQsXG4gICAgY2hhbmdlQWRkcjogc3RyaW5nID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IHN0cmluZyB8IEJ1ZmZlciA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPFNlbmRSZXNwb25zZT4gPT4ge1xuICAgIGxldCBhc3NldDogc3RyaW5nXG4gICAgbGV0IGFtbnQ6IEJOXG5cbiAgICBpZiAodHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKHRvKSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoXCJFcnJvciAtIEFWTUFQSS5zZW5kOiBJbnZhbGlkIGFkZHJlc3MgZm9ybWF0XCIpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhc3NldElEICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICBhc3NldCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRClcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzZXQgPSBhc3NldElEXG4gICAgfVxuICAgIGlmICh0eXBlb2YgYW1vdW50ID09PSBcIm51bWJlclwiKSB7XG4gICAgICBhbW50ID0gbmV3IEJOKGFtb3VudClcbiAgICB9IGVsc2Uge1xuICAgICAgYW1udCA9IGFtb3VudFxuICAgIH1cblxuICAgIGNvbnN0IHBhcmFtczogU2VuZFBhcmFtcyA9IHtcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgIGFzc2V0SUQ6IGFzc2V0LFxuICAgICAgYW1vdW50OiBhbW50LnRvU3RyaW5nKDEwKSxcbiAgICAgIHRvOiB0b1xuICAgIH1cblxuICAgIGNvbnN0IGNhbGxlcjogc3RyaW5nID0gXCJzZW5kXCJcbiAgICBmcm9tID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoZnJvbSwgY2FsbGVyKVxuICAgIGlmICh0eXBlb2YgZnJvbSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgcGFyYW1zW1wiZnJvbVwiXSA9IGZyb21cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNoYW5nZUFkZHIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJzZUFkZHJlc3MoY2hhbmdlQWRkcikgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcIkVycm9yIC0gQVZNQVBJLnNlbmQ6IEludmFsaWQgYWRkcmVzcyBmb3JtYXRcIilcbiAgICAgIH1cbiAgICAgIHBhcmFtc1tcImNoYW5nZUFkZHJcIl0gPSBjaGFuZ2VBZGRyXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtZW1vICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAodHlwZW9mIG1lbW8gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcGFyYW1zW1wibWVtb1wiXSA9IGJpbnRvb2xzLmNiNThFbmNvZGUobWVtbylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmFtc1tcIm1lbW9cIl0gPSBtZW1vXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJhdm0uc2VuZFwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdFxuICB9XG5cbiAgLyoqXG4gICAqIFNlbmRzIGFuIGFtb3VudCBvZiBhc3NldElEIHRvIGFuIGFycmF5IG9mIHNwZWNpZmllZCBhZGRyZXNzZXMgZnJvbSBhIGxpc3Qgb2Ygb3duZWQgb2YgYWRkcmVzc2VzLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXIgdGhhdCBvd25zIHRoZSBwcml2YXRlIGtleXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBgZnJvbWAgYWRkcmVzc2VzXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgdW5sb2NraW5nIHRoZSB1c2VyXG4gICAqIEBwYXJhbSBzZW5kT3V0cHV0cyBUaGUgYXJyYXkgb2YgU2VuZE91dHB1dHMuIEEgU2VuZE91dHB1dCBpcyBhbiBvYmplY3QgbGl0ZXJhbCB3aGljaCBjb250YWlucyBhbiBhc3NldElELCBhbW91bnQsIGFuZCB0by5cbiAgICogQHBhcmFtIGZyb20gT3B0aW9uYWwuIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBtYW5hZ2VkIGJ5IHRoZSBub2RlJ3Mga2V5c3RvcmUgZm9yIHRoaXMgYmxvY2tjaGFpbiB3aGljaCB3aWxsIGZ1bmQgdGhpcyB0cmFuc2FjdGlvblxuICAgKiBAcGFyYW0gY2hhbmdlQWRkciBPcHRpb25hbC4gQW4gYWRkcmVzcyB0byBzZW5kIHRoZSBjaGFuZ2VcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwuIENCNTggQnVmZmVyIG9yIFN0cmluZyB3aGljaCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciB0aGUgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb25cInMgSUQuXG4gICAqL1xuICBzZW5kTXVsdGlwbGUgPSBhc3luYyAoXG4gICAgdXNlcm5hbWU6IHN0cmluZyxcbiAgICBwYXNzd29yZDogc3RyaW5nLFxuICAgIHNlbmRPdXRwdXRzOiB7XG4gICAgICBhc3NldElEOiBzdHJpbmcgfCBCdWZmZXJcbiAgICAgIGFtb3VudDogbnVtYmVyIHwgQk5cbiAgICAgIHRvOiBzdHJpbmdcbiAgICB9W10sXG4gICAgZnJvbTogc3RyaW5nW10gfCBCdWZmZXJbXSA9IHVuZGVmaW5lZCxcbiAgICBjaGFuZ2VBZGRyOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogc3RyaW5nIHwgQnVmZmVyID0gdW5kZWZpbmVkXG4gICk6IFByb21pc2U8U2VuZE11bHRpcGxlUmVzcG9uc2U+ID0+IHtcbiAgICBsZXQgYXNzZXQ6IHN0cmluZ1xuICAgIGxldCBhbW50OiBCTlxuICAgIGNvbnN0IHNPdXRwdXRzOiBTT3V0cHV0c1BhcmFtc1tdID0gW11cblxuICAgIHNlbmRPdXRwdXRzLmZvckVhY2goXG4gICAgICAob3V0cHV0OiB7XG4gICAgICAgIGFzc2V0SUQ6IHN0cmluZyB8IEJ1ZmZlclxuICAgICAgICBhbW91bnQ6IG51bWJlciB8IEJOXG4gICAgICAgIHRvOiBzdHJpbmdcbiAgICAgIH0pID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnBhcnNlQWRkcmVzcyhvdXRwdXQudG8pID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFxuICAgICAgICAgICAgXCJFcnJvciAtIEFWTUFQSS5zZW5kTXVsdGlwbGU6IEludmFsaWQgYWRkcmVzcyBmb3JtYXRcIlxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG91dHB1dC5hc3NldElEICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgYXNzZXQgPSBiaW50b29scy5jYjU4RW5jb2RlKG91dHB1dC5hc3NldElEKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFzc2V0ID0gb3V0cHV0LmFzc2V0SURcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG91dHB1dC5hbW91bnQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICBhbW50ID0gbmV3IEJOKG91dHB1dC5hbW91bnQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYW1udCA9IG91dHB1dC5hbW91bnRcbiAgICAgICAgfVxuICAgICAgICBzT3V0cHV0cy5wdXNoKHtcbiAgICAgICAgICB0bzogb3V0cHV0LnRvLFxuICAgICAgICAgIGFzc2V0SUQ6IGFzc2V0LFxuICAgICAgICAgIGFtb3VudDogYW1udC50b1N0cmluZygxMClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICApXG5cbiAgICBjb25zdCBwYXJhbXM6IFNlbmRNdWx0aXBsZVBhcmFtcyA9IHtcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgIG91dHB1dHM6IHNPdXRwdXRzXG4gICAgfVxuXG4gICAgY29uc3QgY2FsbGVyOiBzdHJpbmcgPSBcInNlbmRcIlxuICAgIGZyb20gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tLCBjYWxsZXIpXG4gICAgaWYgKHR5cGVvZiBmcm9tICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBwYXJhbXMuZnJvbSA9IGZyb21cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNoYW5nZUFkZHIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJzZUFkZHJlc3MoY2hhbmdlQWRkcikgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcIkVycm9yIC0gQVZNQVBJLnNlbmQ6IEludmFsaWQgYWRkcmVzcyBmb3JtYXRcIilcbiAgICAgIH1cbiAgICAgIHBhcmFtcy5jaGFuZ2VBZGRyID0gY2hhbmdlQWRkclxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbWVtbyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHR5cGVvZiBtZW1vICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHBhcmFtcy5tZW1vID0gYmludG9vbHMuY2I1OEVuY29kZShtZW1vKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyYW1zLm1lbW8gPSBtZW1vXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJhdm0uc2VuZE11bHRpcGxlXCIsXG4gICAgICBwYXJhbXNcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgVmlydHVhbCBNYWNoaW5l4oCZcyBnZW5lc2lzIHN0YXRlLCBjcmVhdGUgdGhlIGJ5dGUgcmVwcmVzZW50YXRpb24gb2YgdGhhdCBzdGF0ZS5cbiAgICpcbiAgICogQHBhcmFtIGdlbmVzaXNEYXRhIFRoZSBibG9ja2NoYWluJ3MgZ2VuZXNpcyBkYXRhIG9iamVjdFxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIGEgc3RyaW5nIG9mIGJ5dGVzXG4gICAqL1xuICBidWlsZEdlbmVzaXMgPSBhc3luYyAoZ2VuZXNpc0RhdGE6IG9iamVjdCk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBCdWlsZEdlbmVzaXNQYXJhbXMgPSB7XG4gICAgICBnZW5lc2lzRGF0YVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwiYXZtLmJ1aWxkR2VuZXNpc1wiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5ieXRlc1xuICB9XG5cbiAgLyoqXG4gICAqIEBpZ25vcmVcbiAgICovXG4gIHByb3RlY3RlZCBfY2xlYW5BZGRyZXNzQXJyYXkoXG4gICAgYWRkcmVzc2VzOiBzdHJpbmdbXSB8IEJ1ZmZlcltdLFxuICAgIGNhbGxlcjogc3RyaW5nXG4gICk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCBhZGRyczogc3RyaW5nW10gPSBbXVxuICAgIGNvbnN0IGNoYWluSUQ6IHN0cmluZyA9IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKClcbiAgICAgID8gdGhpcy5nZXRCbG9ja2NoYWluQWxpYXMoKVxuICAgICAgOiB0aGlzLmdldEJsb2NrY2hhaW5JRCgpXG4gICAgaWYgKGFkZHJlc3NlcyAmJiBhZGRyZXNzZXMubGVuZ3RoID4gMCkge1xuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodHlwZW9mIGFkZHJlc3Nlc1tgJHtpfWBdID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgdHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKGFkZHJlc3Nlc1tgJHtpfWBdIGFzIHN0cmluZykgPT09XG4gICAgICAgICAgICBcInVuZGVmaW5lZFwiXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcbiAgICAgICAgICAgICAgYEVycm9yIC0gQVZNQVBJLiR7Y2FsbGVyfTogSW52YWxpZCBhZGRyZXNzIGZvcm1hdGBcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgYWRkcnMucHVzaChhZGRyZXNzZXNbYCR7aX1gXSBhcyBzdHJpbmcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgdHlwZTogU2VyaWFsaXplZFR5cGUgPSBcImJlY2gzMlwiXG4gICAgICAgICAgYWRkcnMucHVzaChcbiAgICAgICAgICAgIHNlcmlhbGl6YXRpb24uYnVmZmVyVG9UeXBlKFxuICAgICAgICAgICAgICBhZGRyZXNzZXNbYCR7aX1gXSBhcyBCdWZmZXIsXG4gICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgIHRoaXMuY29yZS5nZXRIUlAoKSxcbiAgICAgICAgICAgICAgY2hhaW5JRFxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYWRkcnNcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgaW5zdGFudGlhdGVkIGRpcmVjdGx5LiBJbnN0ZWFkIHVzZSB0aGUgW1tBdmFsYW5jaGUuYWRkQVBgJHtJfWBdXSBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSBjb3JlIEEgcmVmZXJlbmNlIHRvIHRoZSBBdmFsYW5jaGUgY2xhc3NcbiAgICogQHBhcmFtIGJhc2VVUkwgRGVmYXVsdHMgdG8gdGhlIHN0cmluZyBcIi9leHQvYmMvWFwiIGFzIHRoZSBwYXRoIHRvIGJsb2NrY2hhaW4ncyBiYXNlVVJMXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgVGhlIEJsb2NrY2hhaW5cInMgSUQuIERlZmF1bHRzIHRvIGFuIGVtcHR5IHN0cmluZzogXCJcIlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgY29yZTogQXZhbGFuY2hlQ29yZSxcbiAgICBiYXNlVVJMOiBzdHJpbmcgPSBcIi9leHQvYmMvWFwiLFxuICAgIGJsb2NrY2hhaW5JRDogc3RyaW5nID0gXCJcIlxuICApIHtcbiAgICBzdXBlcihjb3JlLCBiYXNlVVJMKVxuXG4gICAgdGhpcy5ibG9ja2NoYWluSUQgPSBjb3JlLmdldE5ldHdvcmsoKS5YLmJsb2NrY2hhaW5JRFxuXG4gICAgaWYgKGJsb2NrY2hhaW5JRCAhPT0gXCJcIiAmJiBibG9ja2NoYWluSUQgIT09IHRoaXMuYmxvY2tjaGFpbklEKSB7XG4gICAgICB0aGlzLmtleWNoYWluID0gbmV3IEtleUNoYWluKHRoaXMuY29yZS5nZXRIUlAoKSwgYmxvY2tjaGFpbklEKVxuICAgICAgdGhpcy5ibG9ja2NoYWluSUQgPSBibG9ja2NoYWluSURcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXljaGFpbiA9IG5ldyBLZXlDaGFpbihcbiAgICAgICAgdGhpcy5jb3JlLmdldEhSUCgpLFxuICAgICAgICBjb3JlLmdldE5ldHdvcmsoKS5YLmFsaWFzXG4gICAgICApXG4gICAgfVxuICB9XG59XG4iXX0=