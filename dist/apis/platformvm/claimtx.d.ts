/**
 * @packageDocumentation
 * @module API-PlatformVM-ClaimTx
 */
import { Buffer } from "buffer/";
import { TransferableOutput } from "./outputs";
import { TransferableInput } from "./inputs";
import { BaseTx } from "./basetx";
import { SerializedEncoding } from "../../utils/serialization";
import BN from "bn.js";
import { Credential, SigIdx } from "../../common";
import { KeyChain } from "caminojs/apis/platformvm/keychain";
import { SubnetAuth } from "./subnetauth";
export declare enum ClaimType {
    VALIDATOR_REWARD = "0",
    EXPIRED_DEPOSIT_REWARD = "1",
    ALL_TREASURY_REWARD = "2",
    ACTIVE_DEPOSIT_REWARD = "3"
}
export declare class ClaimAmount {
    protected id: Buffer;
    protected type: Buffer;
    protected amount: Buffer;
    protected auth: SubnetAuth;
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    serialize(encoding?: SerializedEncoding): object;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
    /**
     * Class representing a ClaimAmount.
     *
     * @param id Optional either depositTxID or OwnableHash, depends on claimType
     * @param claimType Optional specifies the type of reward to claim
     * @param amount Optional the amount to claim from this reward source
     */
    constructor(id?: Buffer, claimType?: ClaimType, amount?: BN, auth?: Buffer[]);
    getID(): Buffer;
    getType(): Buffer;
    getAmount(): Buffer;
}
/**
 * Class representing an unsigned ClaimTx transaction.
 */
export declare class ClaimTx extends BaseTx {
    protected _typeName: string;
    protected _typeID: number;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    serialize(encoding?: SerializedEncoding): object;
    protected numClaimAmounts: Buffer;
    protected claimAmounts: ClaimAmount[];
    protected sigIdxs: SigIdx[][];
    /**
     * Returns the id of the [[RegisterNodeTx]]
     */
    getTxType(): number;
    getClaimAmounts(): ClaimAmount[];
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing a [[ClaimTx]], parses it, populates the class, and returns the length of the [[ClaimTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[ClaimTx]]
     *
     * @returns The length of the raw [[ClaimTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ClaimTx]].
     */
    toBuffer(): Buffer;
    clone(): this;
    create(...args: any[]): this;
    /**
     * Adds an array of [[SigIdx]] to the [[ClaimTx]].
     *
     * @param sigIdxs The Signature indices to verify one claimAmount
     */
    addSigIdxs(sigIdxs: SigIdx[]): void;
    /**
     * Returns the array of [[SigIdx[]]] for this [[TX]]
     */
    getSigIdxs(): SigIdx[][];
    /**
     * Class representing an unsigned Claim transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param claimAmounts Optional array of ClaimAmount class instances
     */
    constructor(networkID?: number, blockchainID?: Buffer, outs?: TransferableOutput[], ins?: TransferableInput[], memo?: Buffer, claimAmounts?: ClaimAmount[]);
    /**
     * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
     *
     * @param msg A Buffer for the [[UnsignedTx]]
     * @param kc An [[KeyChain]] used in signing
     *
     * @returns An array of [[Credential]]s
     */
    sign(msg: Buffer, kc: KeyChain): Credential[];
}
//# sourceMappingURL=claimtx.d.ts.map