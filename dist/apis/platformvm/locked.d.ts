/**
 * @packageDocumentation
 * @module API-PlatformVM-Locked
 */
import { Buffer } from "buffer/";
import { SerializedEncoding } from "../../utils/serialization";
export declare class SerializableTxID {
    encode(encoding?: SerializedEncoding): string;
    decode(value: string, encoding?: SerializedEncoding): void;
    protected txid: Buffer;
    isEmpty(): boolean;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
}
export declare class LockedIDs {
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected depositTxID: SerializableTxID;
    protected bondTxID: SerializableTxID;
    getDepositTxID(): SerializableTxID;
    getBondTxID(): SerializableTxID;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
    /**
     * Class representing an [[LockedIDs]] for LockedIn and LockedOut types.
     *
     * @param depositTxID txID where this Output is deposited on
     * @param bondTxID txID where this Output is bonded on
     */
    constructor(depositTxID?: Buffer, bondTxID?: Buffer);
}
//# sourceMappingURL=locked.d.ts.map