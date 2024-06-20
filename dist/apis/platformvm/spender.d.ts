/**
 * @packageDocumentation
 * @module API-PlatformVM-Spender
 */
import BN from "bn.js";
import { AssetAmountDestination, PlatformVMAPI } from ".";
import { LockMode } from "./builder";
export declare class Spender {
    platformAPI: PlatformVMAPI;
    constructor(platformAPI: PlatformVMAPI);
    getMinimumSpendable: (aad: AssetAmountDestination, asOf: BN, lockTime: BN, lockMode: LockMode) => Promise<Error>;
}
//# sourceMappingURL=spender.d.ts.map