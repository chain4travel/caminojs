import { Buffer } from "buffer/";
import { Serializable, SerializedEncoding } from "../../../utils/serialization";
export declare class GeneralVoteOption extends Serializable {
    protected _typeName: string;
    protected _typeID: any;
    protected option: Buffer;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
    getSize(): number;
    getOption(): Buffer;
    constructor(option?: Buffer);
}
export declare class GeneralProposal {
    private readonly _typeID;
    protected numOptions: Buffer;
    protected options: GeneralVoteOption[];
    protected start: Buffer;
    protected end: Buffer;
    protected totalVotedThresholdNominator: Buffer;
    protected mostVotedThresholdNominator: Buffer;
    protected allowEarlyFinish: boolean;
    addGeneralOption(option: string): number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
    constructor(start?: number, end?: number, totalVotedThresholdNominator?: number, mostVotedThresholdNominator?: number, allowEarlyFinish?: boolean);
    getTypeID(): number;
    getAllowEarlyFinish(): boolean;
}
//# sourceMappingURL=generalproposal.d.ts.map