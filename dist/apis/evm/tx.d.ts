/**
 * @packageDocumentation
 * @module API-EVM-Transactions
 */
import { Buffer } from "buffer/";
import { EVMStandardTx, EVMStandardUnsignedTx, SignerKeyChain, SignerKeyPair } from "../../common";
import { EVMBaseTx } from "./basetx";
import { SerializedEncoding } from "../../utils/serialization";
/**
 * Takes a buffer representing the output and returns the proper [[EVMBaseTx]] instance.
 *
 * @param txTypeID The id of the transaction type
 *
 * @returns An instance of an [[EVMBaseTx]]-extended class.
 */
export declare const SelectTxClass: (txTypeID: number, ...args: any[]) => EVMBaseTx;
export declare class UnsignedTx extends EVMStandardUnsignedTx<SignerKeyPair, SignerKeyChain, EVMBaseTx> {
    protected _typeName: string;
    protected _typeID: any;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    getTransaction(): EVMBaseTx;
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Signs this [[UnsignedTx]] and returns signed [[StandardTx]]
     *
     * @param kc An [[KeyChain]] used in signing
     *
     * @returns A signed [[StandardTx]]
     */
    sign(kc: SignerKeyChain): Tx;
}
export declare class Tx extends EVMStandardTx<SignerKeyPair, SignerKeyChain, UnsignedTx> {
    protected _typeName: string;
    protected _typeID: any;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[Tx]], parses it,
     * populates the class, and returns the length of the Tx in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[Tx]]
     * @param offset A number representing the starting point of the bytes to begin parsing
     *
     * @returns The length of the raw [[Tx]]
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
}
//# sourceMappingURL=tx.d.ts.map