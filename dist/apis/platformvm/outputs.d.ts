/**
 * @packageDocumentation
 * @module API-PlatformVM-Outputs
 */
import { Buffer } from "buffer/";
import { BaseOutput, Output, StandardAmountOutput, StandardTransferableOutput, StandardParseableOutput } from "../../common/output";
import { SerializedEncoding } from "../../utils/serialization";
import BN from "bn.js";
import { LockedIDs } from "./locked";
/**
 * Takes a buffer representing the output and returns the proper Output instance.
 *
 * @param outputid A number representing the inputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Output]]-extended class.
 */
export declare const SelectOutputClass: (outputid: number, ...args: any[]) => BaseOutput;
export declare class TransferableOutput extends StandardTransferableOutput {
    protected _typeName: string;
    protected _typeID: any;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    fromBuffer(bytes: Buffer, offset?: number): number;
    static fromArray(b: Buffer): TransferableOutput[];
}
export declare class ParseableOutput extends StandardParseableOutput {
    protected _typeName: string;
    protected _typeID: any;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    fromBuffer(bytes: Buffer, offset?: number): number;
}
export declare abstract class AmountOutput extends StandardAmountOutput {
    protected _typeName: string;
    protected _typeID: any;
    /**
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID: Buffer): TransferableOutput;
}
/**
 * An [[Output]] class which specifies an Output that carries an ammount for an assetID and uses secp256k1 signature scheme.
 */
export declare class SECPTransferOutput extends AmountOutput {
    protected _typeName: string;
    protected _typeID: number;
    /**
     * Returns the outputID for this output
     */
    getOutputID(): number;
    create(...args: any[]): this;
    clone(): this;
}
/**
 * An [[Output]] class which specifies an output that has a locktime which can also enable
 * staking of the value held, preventing transfers but not validation.
 */
export declare class StakeableLockOut extends ParseableOutput {
    protected _typeName: string;
    protected _typeID: number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected stakeableLocktime: Buffer;
    getStakeableLocktime(): BN;
    /**
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID: Buffer): TransferableOutput;
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[StakeableLockOut]] and returns the size of the output.
     */
    fromBuffer(outbuff: Buffer, offset?: number): number;
    /**
     * Returns the buffer representing the [[StakeableLockOut]] instance.
     */
    toBuffer(): Buffer;
    /**
     * Returns the outputID for this output
     */
    getOutputID(): number;
    create(...args: any[]): this;
    clone(): this;
    /**
     * Returns the amount from the underlying output
     */
    getAmount(): BN;
    /**
     * Backwards compatibility
     */
    getTransferableOutput(): ParseableOutput;
    /**
     * A [[Output]] class which specifies a [[ParseableOutput]] that has a locktime which can also
     * enable staking of the value held, preventing transfers but not validation.
     *
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the output
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing addresses
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the the threshold number of signers required to sign the transaction
     * @param stakeableLocktime A {@link https://github.com/indutny/bn.js/|BN} representing the stakeable locktime
     * @param output A [[BaseOutput]] which is embedded into this output.
     */
    constructor(amount?: BN, addresses?: Buffer[], locktime?: BN, threshold?: number, stakeableLocktime?: BN, output?: ParseableOutput);
}
/**
 * An [[Output]] class which only specifies an Output ownership and uses secp256k1 signature scheme.
 */
export declare class SECPOwnerOutput extends Output {
    protected _typeName: string;
    protected _typeID: number;
    /**
     * Returns the outputID for this output
     */
    getOutputID(): number;
    /**
     *
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID: Buffer): TransferableOutput;
    create(...args: any[]): this;
    clone(): this;
}
/**
 * An [[Output]] class which specifies an output that is controlled by deposit and bond tx.
 */
export declare class LockedOut extends ParseableOutput {
    protected _typeName: string;
    protected _typeID: number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected ids: LockedIDs;
    getLockedIDs(): LockedIDs;
    /**
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID: Buffer): TransferableOutput;
    create(...args: any[]): this;
    clone(): this;
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[LockedOut]] and returns the size of the output.
     */
    fromBuffer(outbuff: Buffer, offset?: number): number;
    /**
     * Returns the buffer representing the [[LockedOut]] instance.
     */
    toBuffer(): Buffer;
    /**
     * Returns the outputID for this output
     */
    getOutputID(): number;
    /**
     * Returns the amount from the underlying output
     */
    getAmount(): BN;
    /**
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the output
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing addresses
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the the threshold number of signers required to sign the transaction
     * @param ids LockIDs set of deposit and bond txIDs
     */
    constructor(amount?: BN, addresses?: Buffer[], locktime?: BN, threshold?: number, ids?: LockedIDs);
}
//# sourceMappingURL=outputs.d.ts.map