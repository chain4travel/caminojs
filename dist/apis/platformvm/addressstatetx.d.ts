/**
 * @packageDocumentation
 * @module API-PlatformVM-AddressStateTx
 */
import { Buffer } from "buffer/";
import { TransferableOutput } from "./outputs";
import { TransferableInput } from "./inputs";
import { BaseTx } from "./basetx";
import { SerializedEncoding } from "../../utils/serialization";
import { UpgradeVersionID } from "../../common";
import { SubnetAuth } from "../../apis/platformvm/subnetauth";
export declare enum AddressState {
    ROLE_ADMIN = 0,
    ROLE_KYC = 1,
    ROLE_OFFERS_ADMIN = 2,
    KYC_VERIFIED = 32,
    KYC_EXPIRED = 33,
    CONSORTIUM = 38,
    NODE_DEFERRED = 39,
    OFFERS_CREATOR = 50
}
/**
 * Class representing an unsigned AdressStateTx transaction.
 */
export declare class AddressStateTx extends BaseTx {
    protected _typeName: string;
    protected _typeID: number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected upgradeVersionID: UpgradeVersionID;
    protected address: Buffer;
    protected state: number;
    protected remove: boolean;
    protected executor: Buffer;
    protected executorAuth: SubnetAuth;
    /**
     * Returns the id of the [[AddressStateTx]]
     */
    getTxType(): number;
    /**
     * Returns the address
     */
    getAddress(): Buffer;
    /**
     * Returns the state
     */
    getState(): number;
    /**
     * Returns the remove flag
     */
    getRemove(): boolean;
    getExecutor(): Buffer;
    getExecutorAuth(): SubnetAuth;
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[AddressStateTx]], parses it, populates the class, and returns the length of the [[AddressStateTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[AddressStateTx]]
     *
     * @returns The length of the raw [[AddressStateTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddressStateTx]].
     */
    toBuffer(): Buffer;
    clone(): this;
    create(...args: any[]): this;
    /**
     * Class representing an unsigned RegisterNode transaction.
     *
     * @param version Optional. Transaction version number
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param address Optional address to alter state.
     * @param state Optional state to alter.
     * @param remove Optional if true remove the flag, otherwise set
     */
    constructor(version?: number, networkID?: number, blockchainID?: Buffer, outs?: TransferableOutput[], ins?: TransferableInput[], memo?: Buffer, address?: string | Buffer, state?: number, remove?: boolean, executor?: string | Buffer, executorAuth?: SubnetAuth);
}
//# sourceMappingURL=addressstatetx.d.ts.map