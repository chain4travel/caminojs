import {AVMAPI} from "caminojs/apis/avm";
import {

    PlatformVMAPI,
} from "../../../src/apis/platformvm";
interface RetryFunctionCallerConfig {
    txId: string;       // Transaction ID
    delay: number; // Delay in milliseconds
    warningThreshold: number;  // Warning threshold - number of attempts before warning
    failureThreshold: number;  // Failure threshold - number of attempts before failure added to warning threshold
    functionName: string; // function name to call
    functionParams: any; // parameters to pass to the function
    expectedResult: {key: string, value: string} // expected format of the result, example: result.status = "Accepted", status is the key and Accepted is the value

}

import { getAvalanche } from "../../e2etestlib"
import {KeystoreAPI} from "caminojs/apis/keystore";


export class RetryFunctionCaller {
    private config: RetryFunctionCallerConfig | null = null;
    private pChain: PlatformVMAPI;
    private avalanche = getAvalanche()


    constructor() {
    }

    setConfig(config: RetryFunctionCallerConfig) {
        this.config = config;
    }

    async executeFunctionCall() {
        await this.avalanche.fetchNetworkSettings();
        this.pChain = this.avalanche.PChain();

        if (!this.config) {
            throw new Error("Configuration not set");
        }

        const totalAttempts = this.config.warningThreshold + this.config.failureThreshold;

        let attempt = 0;
        while (attempt < totalAttempts) {
            attempt++;
            console.log(`Attempt ${attempt} for txId ${this.config.txId}`);

            try {
                const result = await this.callFunction(
                    this.config.functionName,
                    this.config.functionParams
                );
                if (result && result[this.config.expectedResult.key] === this.config.expectedResult.value) {
                    console.log("attempt", attempt, "callFunction", this.config.functionName, "result", result)
                    return result[this.config.expectedResult.key];
                }

                if (attempt === this.config.warningThreshold) {
                    console.warn(`Warning: Attempt ${attempt} reached warning threshold for txId ${this.config.txId}`);
                }

                if (attempt === totalAttempts) {
                    console.error(`Error: Attempt ${attempt} reached failure threshold for txId ${this.config.txId}`);
                    return result[this.config.expectedResult.key];
                }
            } catch (error) {
                console.error(`Error on attempt ${attempt} for txId ${this.config.txId}: ${error}`);
            }

            await new Promise(resolve => setTimeout(resolve, this.config.delay));
        }

        return null;
    }

    private async callFunction(functionName: string, params: any[]) {
       return this.pChain[functionName](params);
    }
}
