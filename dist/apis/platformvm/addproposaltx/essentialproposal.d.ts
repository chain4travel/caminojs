import { Buffer } from "buffer/";
import { SerializedEncoding } from "../../../utils/serialization";
import { NBytes } from "../../../common";
export declare class VoteOption extends NBytes {
    protected _typeName: string;
    protected _typeID: any;
    protected bytes: Buffer;
    protected bsize: number;
    clone(): this;
    create(): this;
    /**
     * VoteOption for a [[Tx]]
     */
    constructor();
}
export declare abstract class EssentialProposal {
    protected start: Buffer;
    protected end: Buffer;
    protected options: VoteOption[];
    protected numOptions: Buffer;
    constructor(start?: Buffer, end?: Buffer);
    getStart(): Buffer;
    getEnd(): Buffer;
    getOptions(): VoteOption[];
    /**
     * Adds a option to the proposal and returns the index off the added option.
     */
    addOption(option: VoteOption): number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[BaseProposal]].
     */
    toBuffer(): Buffer;
}
//# sourceMappingURL=essentialproposal.d.ts.map