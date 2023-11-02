/**
 * @packageDocumentation
 * @module API-PlatformVM-DepositTx
 */
import { Buffer } from "buffer/";
import { TransferableOutput } from "./outputs";
import { TransferableInput } from "./inputs";
import { BaseTx } from "./basetx";
import { SerializedEncoding } from "../../utils/serialization";
import BN from "bn.js";
import { SubnetAuth } from "../../apis/platformvm/subnetauth";
import { Credential, SigIdx, UpgradeVersionID } from "../../common";
import { KeyChain } from "../../apis/platformvm/keychain";
export declare enum OfferFlag {
    NONE = "0",
    LOCKED = "1"
}
export declare class Offer {
    protected upgradeVersionID: UpgradeVersionID;
    protected interestRateNominator: Buffer;
    protected start: Buffer;
    protected end: Buffer;
    protected minAmount: Buffer;
    protected totalMaxAmount: Buffer;
    protected depositedAmount: Buffer;
    protected minDuration: Buffer;
    protected maxDuration: Buffer;
    protected unlockPeriodDuration: Buffer;
    protected noRewardsPeriodDuration: Buffer;
    protected memo: Buffer;
    protected flags: Buffer;
    protected totalMaxRewardAmount: Buffer;
    protected rewardedAmount: Buffer;
    protected ownerAddress: Buffer;
    constructor(upgradeVersion?: number, interestRateNominator?: BN, start?: BN, end?: BN, minAmount?: BN, totalMaxAmount?: BN, depositedAmount?: BN, minDuration?: number, maxDuration?: number, unlockPeriodDuration?: number, noRewardsPeriodDuration?: number, memo?: Buffer, flag?: OfferFlag | BN, totalMaxRewardAmount?: BN, rewardedAmount?: BN, ownerAddress?: Buffer);
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    serialize(encoding?: SerializedEncoding): object;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
    getUpgradeVersionID(): UpgradeVersionID;
    getInterestRateNominator(): Buffer;
    getStart(): Buffer;
    getEnd(): Buffer;
    getMinAmount(): Buffer;
    getTotalMaxAmount(): Buffer;
    getDepositedAmount(): Buffer;
    getMinDuration(): Buffer;
    getMaxDuration(): Buffer;
    getUnlockPeriodDuration(): Buffer;
    getNoRewardsPeriodDuration(): Buffer;
    getMemo(): Buffer;
    getFlags(): Buffer;
    getTotalMaxRewardAmount(): Buffer;
    getRewardedAmount(): Buffer;
    getOwnerAddress(): Buffer;
}
/**
 * Class representing an unsigned AddDepositOfferTx transaction.
 */
export declare class AddDepositOfferTx extends BaseTx {
    protected _typeName: string;
    protected _typeID: number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected depositOffer: Offer;
    protected depositOfferCreatorAddress: Buffer;
    protected depositOfferCreatorAuth: SubnetAuth;
    protected sigCount: Buffer;
    protected sigIdxs: SigIdx[];
    /**
     * Creates and adds a [[SigIdx]] to the [[AddDepositOfferTx]].
     *
     * @param addressIdx The index of the address to reference in the signatures
     * @param address The address of the source of the signature
     */
    addSignatureIdx(addressIdx: number, address: Buffer): void;
    /**
     * Returns the id of the [[RegisterNodeTx]]
     */
    getTxType(): number;
    getDepositOffer(): Offer;
    getDepositOfferCreatorAddress(): Buffer;
    getDepositOfferCreatorAuth(): SubnetAuth;
    getSigIdxs(): SigIdx[];
    /**
     * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
     *
     * @param msg A Buffer for the [[UnsignedTx]]
     * @param kc An [[KeyChain]] used in signing
     *
     * @returns An array of [[Credential]]s
     */
    sign(msg: Buffer, kc: KeyChain): Credential[];
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing a [[AddDepositOfferTx]], parses it, populates the class, and returns the length of the [[AddDepositOfferTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[AddDepositOfferTx]]
     *
     * @returns The length of the raw [[AddDepositOfferTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddDepositOfferTx]].
     */
    toBuffer(): Buffer;
    clone(): this;
    create(...args: any[]): this;
    /**
     * Class representing an unsigned AddDepositOfferTx transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param depositOffer Offer to be used for this deposit
     * @param depositOfferCreatorAddress Address of the node that created the offer
     */
    constructor(networkID?: number, blockchainID?: Buffer, outs?: TransferableOutput[], ins?: TransferableInput[], memo?: Buffer, depositOffer?: Offer, depositOfferCreatorAddress?: Buffer);
}
//# sourceMappingURL=adddepositoffertx.d.ts.map