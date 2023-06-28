"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoAPI = void 0;
const jrpcapi_1 = require("../../common/jrpcapi");
const bn_js_1 = __importDefault(require("bn.js"));
/**
 * Class for interacting with a node's InfoAPI.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class InfoAPI extends jrpcapi_1.JRPCAPI {
    /**
     * This class should not be instantiated directly. Instead use the [[Avalanche.addAPI]] method.
     *
     * @param core A reference to the Avalanche class
     * @param baseURL Defaults to the string "/ext/info" as the path to rpc's baseURL
     */
    constructor(core, baseURL = "/ext/info") {
        super(core, baseURL);
        /**
         * Fetches the blockchainID from the node for a given alias.
         *
         * @param alias The blockchain alias to get the blockchainID
         *
         * @returns Returns a Promise string containing the base 58 string representation of the blockchainID.
         */
        this.getBlockchainID = (alias) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                alias
            };
            const response = yield this.callMethod("info.getBlockchainID", params);
            return response.data.result.blockchainID;
        });
        /**
         * Fetches the IP address from the node.
         *
         * @returns Returns a Promise string of the node IP address.
         */
        this.getNodeIP = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("info.getBlockchainID");
            return response.data.result.ip;
        });
        /**
         * Fetches the networkID from the node.
         *
         * @returns Returns a Promise number of the networkID.
         */
        this.getNetworkID = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("info.getNetworkID");
            return response.data.result.networkID;
        });
        /**
         * Fetches the network name this node is running on
         *
         * @returns Returns a Promise string containing the network name.
         */
        this.getNetworkName = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("info.getNetworkName");
            return response.data.result.networkName;
        });
        /**
         * Fetches the nodeID from the node.
         *
         * @returns Returns a Promise string of the nodeID.
         */
        this.getNodeID = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("info.getNodeID");
            return response.data.result.nodeID;
        });
        /**
         * Fetches the version of Gecko this node is running
         *
         * @returns Returns a Promise string containing the version of Gecko.
         */
        this.getNodeVersion = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("info.getNodeVersion");
            return response.data.result.version;
        });
        /**
         * Fetches the transaction fee from the node.
         *
         * @returns Returns a Promise object of the transaction fee in nAVAX.
         */
        this.getTxFee = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("info.getTxFee");
            return {
                txFee: new bn_js_1.default(response.data.result.txFee, 10),
                creationTxFee: new bn_js_1.default(response.data.result.creationTxFee, 10),
                createAssetTxFee: new bn_js_1.default(response.data.result.createAssetTxFee, 10),
                createSubnetTxFee: new bn_js_1.default(response.data.result.createSubnetTxFee, 10),
                createBlockchainTxFee: new bn_js_1.default(response.data.result.createBlockchainTxFee, 10)
            };
        });
        /**
         * Check whether a given chain is done bootstrapping
         * @param chain The ID or alias of a chain.
         *
         * @returns Returns a Promise boolean of whether the chain has completed bootstrapping.
         */
        this.isBootstrapped = (chain) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                chain
            };
            const response = yield this.callMethod("info.isBootstrapped", params);
            return response.data.result.isBootstrapped;
        });
        /**
         * Returns the peers connected to the node.
         * @param nodeIDs an optional parameter to specify what nodeID's descriptions should be returned.
         * If this parameter is left empty, descriptions for all active connections will be returned.
         * If the node is not connected to a specified nodeID, it will be omitted from the response.
         *
         * @returns Promise for the list of connected peers in PeersResponse format.
         */
        this.peers = (nodeIDs = []) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                nodeIDs
            };
            const response = yield this.callMethod("info.peers", params);
            return response.data.result.peers;
        });
        /**
         * Returns the network's observed uptime of this node.
         *
         * @returns Returns a Promise UptimeResponse which contains rewardingStakePercentage and weightedAveragePercentage.
         */
        this.uptime = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("info.uptime");
            return response.data.result;
        });
    }
}
exports.InfoAPI = InfoAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvaW5mby9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBS0Esa0RBQThDO0FBRTlDLGtEQUFzQjtBQVV0Qjs7Ozs7O0dBTUc7QUFDSCxNQUFhLE9BQVEsU0FBUSxpQkFBTztJQWlKbEM7Ozs7O09BS0c7SUFDSCxZQUFZLElBQW1CLEVBQUUsVUFBa0IsV0FBVztRQUM1RCxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBdkp0Qjs7Ozs7O1dBTUc7UUFDSCxvQkFBZSxHQUFHLENBQU8sS0FBYSxFQUFtQixFQUFFO1lBQ3pELE1BQU0sTUFBTSxHQUEwQjtnQkFDcEMsS0FBSzthQUNOLENBQUE7WUFFRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxzQkFBc0IsRUFDdEIsTUFBTSxDQUNQLENBQUE7WUFDRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQTtRQUMxQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxjQUFTLEdBQUcsR0FBMEIsRUFBRTtZQUN0QyxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxzQkFBc0IsQ0FDdkIsQ0FBQTtZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFBO1FBQ2hDLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7V0FJRztRQUNILGlCQUFZLEdBQUcsR0FBMEIsRUFBRTtZQUN6QyxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUN6RCxtQkFBbUIsQ0FDcEIsQ0FBQTtZQUNELE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFBO1FBQ3ZDLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7V0FJRztRQUNILG1C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blxuICogQG1vZHVsZSBBUEktSW5mb1xuICovXG5pbXBvcnQgQXZhbGFuY2hlQ29yZSBmcm9tIFwiLi4vLi4vY2FtaW5vXCJcbmltcG9ydCB7IEpSUENBUEkgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2pycGNhcGlcIlxuaW1wb3J0IHsgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gXCIuLi8uLi9jb21tb24vYXBpYmFzZVwiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCB7XG4gIEdldEJsb2NrY2hhaW5JRFBhcmFtcyxcbiAgR2V0VHhGZWVSZXNwb25zZSxcbiAgSXNCb290c3RyYXBwZWRQYXJhbXMsXG4gIFBlZXJzUGFyYW1zLFxuICBQZWVyc1Jlc3BvbnNlLFxuICBVcHRpbWVSZXNwb25zZVxufSBmcm9tIFwiLi9pbnRlcmZhY2VzXCJcblxuLyoqXG4gKiBDbGFzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIG5vZGUncyBJbmZvQVBJLlxuICpcbiAqIEBjYXRlZ29yeSBSUENBUElzXG4gKlxuICogQHJlbWFya3MgVGhpcyBleHRlbmRzIHRoZSBbW0pSUENBUEldXSBjbGFzcy4gVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIGRpcmVjdGx5IGNhbGxlZC4gSW5zdGVhZCwgdXNlIHRoZSBbW0F2YWxhbmNoZS5hZGRBUEldXSBmdW5jdGlvbiB0byByZWdpc3RlciB0aGlzIGludGVyZmFjZSB3aXRoIEF2YWxhbmNoZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEluZm9BUEkgZXh0ZW5kcyBKUlBDQVBJIHtcbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIGJsb2NrY2hhaW5JRCBmcm9tIHRoZSBub2RlIGZvciBhIGdpdmVuIGFsaWFzLlxuICAgKlxuICAgKiBAcGFyYW0gYWxpYXMgVGhlIGJsb2NrY2hhaW4gYWxpYXMgdG8gZ2V0IHRoZSBibG9ja2NoYWluSURcbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2Ugc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGJhc2UgNTggc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBibG9ja2NoYWluSUQuXG4gICAqL1xuICBnZXRCbG9ja2NoYWluSUQgPSBhc3luYyAoYWxpYXM6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBHZXRCbG9ja2NoYWluSURQYXJhbXMgPSB7XG4gICAgICBhbGlhc1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJpbmZvLmdldEJsb2NrY2hhaW5JRFwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5ibG9ja2NoYWluSURcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBJUCBhZGRyZXNzIGZyb20gdGhlIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlIHN0cmluZyBvZiB0aGUgbm9kZSBJUCBhZGRyZXNzLlxuICAgKi9cbiAgZ2V0Tm9kZUlQID0gYXN5bmMgKCk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcImluZm8uZ2V0QmxvY2tjaGFpbklEXCJcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LmlwXG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgbmV0d29ya0lEIGZyb20gdGhlIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlIG51bWJlciBvZiB0aGUgbmV0d29ya0lELlxuICAgKi9cbiAgZ2V0TmV0d29ya0lEID0gYXN5bmMgKCk6IFByb21pc2U8bnVtYmVyPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcImluZm8uZ2V0TmV0d29ya0lEXCJcbiAgICApXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0Lm5ldHdvcmtJRFxuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIG5ldHdvcmsgbmFtZSB0aGlzIG5vZGUgaXMgcnVubmluZyBvblxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZSBzdHJpbmcgY29udGFpbmluZyB0aGUgbmV0d29yayBuYW1lLlxuICAgKi9cbiAgZ2V0TmV0d29ya05hbWUgPSBhc3luYyAoKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwiaW5mby5nZXROZXR3b3JrTmFtZVwiXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5uZXR3b3JrTmFtZVxuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIG5vZGVJRCBmcm9tIHRoZSBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZSBzdHJpbmcgb2YgdGhlIG5vZGVJRC5cbiAgICovXG4gIGdldE5vZGVJRCA9IGFzeW5jICgpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFxuICAgICAgXCJpbmZvLmdldE5vZGVJRFwiXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5ub2RlSURcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSB2ZXJzaW9uIG9mIEdlY2tvIHRoaXMgbm9kZSBpcyBydW5uaW5nXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlIHN0cmluZyBjb250YWluaW5nIHRoZSB2ZXJzaW9uIG9mIEdlY2tvLlxuICAgKi9cbiAgZ2V0Tm9kZVZlcnNpb24gPSBhc3luYyAoKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwiaW5mby5nZXROb2RlVmVyc2lvblwiXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC52ZXJzaW9uXG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgdHJhbnNhY3Rpb24gZmVlIGZyb20gdGhlIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlIG9iamVjdCBvZiB0aGUgdHJhbnNhY3Rpb24gZmVlIGluIG5BVkFYLlxuICAgKi9cbiAgZ2V0VHhGZWUgPSBhc3luYyAoKTogUHJvbWlzZTxHZXRUeEZlZVJlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJpbmZvLmdldFR4RmVlXCIpXG4gICAgcmV0dXJuIHtcbiAgICAgIHR4RmVlOiBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQudHhGZWUsIDEwKSxcbiAgICAgIGNyZWF0aW9uVHhGZWU6IG5ldyBCTihyZXNwb25zZS5kYXRhLnJlc3VsdC5jcmVhdGlvblR4RmVlLCAxMCksXG4gICAgICBjcmVhdGVBc3NldFR4RmVlOiBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQuY3JlYXRlQXNzZXRUeEZlZSwgMTApLFxuICAgICAgY3JlYXRlU3VibmV0VHhGZWU6IG5ldyBCTihyZXNwb25zZS5kYXRhLnJlc3VsdC5jcmVhdGVTdWJuZXRUeEZlZSwgMTApLFxuICAgICAgY3JlYXRlQmxvY2tjaGFpblR4RmVlOiBuZXcgQk4oXG4gICAgICAgIHJlc3BvbnNlLmRhdGEucmVzdWx0LmNyZWF0ZUJsb2NrY2hhaW5UeEZlZSxcbiAgICAgICAgMTBcbiAgICAgIClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGNoYWluIGlzIGRvbmUgYm9vdHN0cmFwcGluZ1xuICAgKiBAcGFyYW0gY2hhaW4gVGhlIElEIG9yIGFsaWFzIG9mIGEgY2hhaW4uXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlIGJvb2xlYW4gb2Ygd2hldGhlciB0aGUgY2hhaW4gaGFzIGNvbXBsZXRlZCBib290c3RyYXBwaW5nLlxuICAgKi9cbiAgaXNCb290c3RyYXBwZWQgPSBhc3luYyAoY2hhaW46IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogSXNCb290c3RyYXBwZWRQYXJhbXMgPSB7XG4gICAgICBjaGFpblxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcbiAgICAgIFwiaW5mby5pc0Jvb3RzdHJhcHBlZFwiLFxuICAgICAgcGFyYW1zXG4gICAgKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5pc0Jvb3RzdHJhcHBlZFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBlZXJzIGNvbm5lY3RlZCB0byB0aGUgbm9kZS5cbiAgICogQHBhcmFtIG5vZGVJRHMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRvIHNwZWNpZnkgd2hhdCBub2RlSUQncyBkZXNjcmlwdGlvbnMgc2hvdWxkIGJlIHJldHVybmVkLlxuICAgKiBJZiB0aGlzIHBhcmFtZXRlciBpcyBsZWZ0IGVtcHR5LCBkZXNjcmlwdGlvbnMgZm9yIGFsbCBhY3RpdmUgY29ubmVjdGlvbnMgd2lsbCBiZSByZXR1cm5lZC5cbiAgICogSWYgdGhlIG5vZGUgaXMgbm90IGNvbm5lY3RlZCB0byBhIHNwZWNpZmllZCBub2RlSUQsIGl0IHdpbGwgYmUgb21pdHRlZCBmcm9tIHRoZSByZXNwb25zZS5cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgdGhlIGxpc3Qgb2YgY29ubmVjdGVkIHBlZXJzIGluIFBlZXJzUmVzcG9uc2UgZm9ybWF0LlxuICAgKi9cbiAgcGVlcnMgPSBhc3luYyAobm9kZUlEczogc3RyaW5nW10gPSBbXSk6IFByb21pc2U8UGVlcnNSZXNwb25zZVtdPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBQZWVyc1BhcmFtcyA9IHtcbiAgICAgIG5vZGVJRHNcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXG4gICAgICBcImluZm8ucGVlcnNcIixcbiAgICAgIHBhcmFtc1xuICAgIClcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQucGVlcnNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuZXR3b3JrJ3Mgb2JzZXJ2ZWQgdXB0aW1lIG9mIHRoaXMgbm9kZS5cbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2UgVXB0aW1lUmVzcG9uc2Ugd2hpY2ggY29udGFpbnMgcmV3YXJkaW5nU3Rha2VQZXJjZW50YWdlIGFuZCB3ZWlnaHRlZEF2ZXJhZ2VQZXJjZW50YWdlLlxuICAgKi9cbiAgdXB0aW1lID0gYXN5bmMgKCk6IFByb21pc2U8VXB0aW1lUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImluZm8udXB0aW1lXCIpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIGluc3RhbnRpYXRlZCBkaXJlY3RseS4gSW5zdGVhZCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIGNvcmUgQSByZWZlcmVuY2UgdG8gdGhlIEF2YWxhbmNoZSBjbGFzc1xuICAgKiBAcGFyYW0gYmFzZVVSTCBEZWZhdWx0cyB0byB0aGUgc3RyaW5nIFwiL2V4dC9pbmZvXCIgYXMgdGhlIHBhdGggdG8gcnBjJ3MgYmFzZVVSTFxuICAgKi9cbiAgY29uc3RydWN0b3IoY29yZTogQXZhbGFuY2hlQ29yZSwgYmFzZVVSTDogc3RyaW5nID0gXCIvZXh0L2luZm9cIikge1xuICAgIHN1cGVyKGNvcmUsIGJhc2VVUkwpXG4gIH1cbn1cbiJdfQ==