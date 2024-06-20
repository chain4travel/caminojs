/**
 * @packageDocumentation
 * @module API-PlatformVM-DepositTx
 */
import { Buffer } from "buffer/";
import { ParseableOutput, TransferableOutput } from "./outputs";
import { TransferableInput } from "./inputs";
import { BaseTx } from "./basetx";
import { SerializedEncoding } from "../../utils/serialization";
import { SubnetAuth } from "../../apis/platformvm/subnetauth";
import { KeyChain } from "../../apis/platformvm/keychain";
import { Credential, SigIdx, UpgradeVersionID } from "../../common";
/**
 * Class representing an unsigned DepositTx transaction.
 */
export declare class DepositTx extends BaseTx {
    protected _typeName: string;
    protected _typeID: number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected upgradeVersionID: UpgradeVersionID;
    protected depositOfferID: Buffer;
    protected depositDuration: Buffer;
    protected rewardsOwner: ParseableOutput;
    protected depositCreator: Buffer;
    protected depositCreatorAuth: SubnetAuth;
    protected ownerSignatures: Buffer[];
    protected ownerAuth: SubnetAuth;
    protected sigCount: Buffer[];
    protected sigIdxs: SigIdx[][];
    /**
     * Returns the id of the [[RegisterNodeTx]]
     */
    getTxType(): number;
    /**
     * Returns the depositOfferID
     */
    getDepositOfferID(): Buffer;
    /**
     * Returns the depositOfferID
     */
    getDepositDuration(): Buffer;
    /**
     * Returns the depositOfferID
     */
    getRewardsOwner(): ParseableOutput;
    addDepositCreatorAuth(auth: [number, Buffer][]): void;
    addOwnerAuth(auth: [number, Buffer][], sigs: Buffer[]): void;
    getOwnerSignatures(): [Buffer, Buffer][];
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing a [[DepositTx]], parses it, populates the class, and returns the length of the [[DepositTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[DepositTx]]
     *
     * @returns The length of the raw [[DepositTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[DepositTx]].
     */
    toBuffer(): Buffer;
    clone(): this;
    create(...args: any[]): this;
    /**
     * Creates and adds a [[SigIdx]] to the [[DepositTx]].
     *
     * @param addressIdx The index of the address to reference in the signatures
     * @param address The address of the source of the signature
     */
    addSignatureIdx(credPos: number, auth: SubnetAuth, addressIdx: number, address: Buffer): void;
    sign(msg: Buffer, kc: KeyChain): Credential[];
    /**
     * Class representing an unsigned RegisterNode transaction.
     *
     * @param version Optional. Transaction version number
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param depositOfferID Optional ID of the deposit offer.
     * @param duration Optional Duration of depositing.
     * @param rewardsOwner Optional the owner of the rewards
     * @param depositCreator Address that is authorized to create deposit with given offer.
     */
    constructor(version?: number, networkID?: number, blockchainID?: Buffer, outs?: TransferableOutput[], ins?: TransferableInput[], memo?: Buffer, depositOfferID?: Buffer, depositDuration?: number, rewardsOwner?: ParseableOutput, depositCreator?: Buffer);
}
//# sourceMappingURL=depositTx.d.ts.map