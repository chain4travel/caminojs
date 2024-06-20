/**
 * @packageDocumentation
 * @module Common-UpgradeVersionID
 */
import { Buffer } from "buffer/";
import BN from "bn.js";
/**
 * Class for representing a UpgradeVersionID
 */
export declare class UpgradeVersionID {
    protected upgradeVersionID: BN;
    version(): number;
    clone(): this;
    create(): this;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
    constructor(version?: number);
}
//# sourceMappingURL=upgradeversionid.d.ts.map