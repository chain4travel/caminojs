"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
class Socket extends isomorphic_ws_1.default {
    /**
     * Send a message to the server
     *
     * @param data
     * @param cb Optional
     */
    send(data, cb) {
        super.send(data, cb);
    }
    /**
     * Terminates the connection completely
     *
     * @param mcode Optional
     * @param data Optional
     */
    close(mcode, data) {
        super.close(mcode, data);
    }
    /**
     * Provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection.
     *
     * @param url Defaults to [[MainnetAPI]]
     * @param options Optional
     */
    constructor(url, options) {
        super(url, options);
    }
}
exports.Socket = Socket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvc29ja2V0L3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFLQSxrRUFBcUM7QUFDckMsTUFBYSxNQUFPLFNBQVEsdUJBQVM7SUFVbkM7Ozs7O09BS0c7SUFDSCxJQUFJLENBQUMsSUFBUyxFQUFFLEVBQVE7UUFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDdEIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLEtBQWMsRUFBRSxJQUFhO1FBQ2pDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQzFCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFlBQ0UsR0FBVyxFQUNYLE9BQXFEO1FBRXJELEtBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDckIsQ0FBQztDQUNGO0FBMUNELHdCQTBDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1Tb2NrZXRcbiAqL1xuaW1wb3J0IHsgQ2xpZW50UmVxdWVzdEFyZ3MgfSBmcm9tIFwiaHR0cFwiXG5pbXBvcnQgV2ViU29ja2V0IGZyb20gXCJpc29tb3JwaGljLXdzXCJcbmV4cG9ydCBjbGFzcyBTb2NrZXQgZXh0ZW5kcyBXZWJTb2NrZXQge1xuICAvLyBGaXJlcyBvbmNlIHRoZSBjb25uZWN0aW9uIGhhcyBiZWVuIGVzdGFibGlzaGVkIGJldHdlZW4gdGhlIGNsaWVudCBhbmQgdGhlIHNlcnZlclxuICBvbm9wZW46IGFueVxuICAvLyBGaXJlcyB3aGVuIHRoZSBzZXJ2ZXIgc2VuZHMgc29tZSBkYXRhXG4gIG9ubWVzc2FnZTogYW55XG4gIC8vIEZpcmVzIGFmdGVyIGVuZCBvZiB0aGUgY29tbXVuaWNhdGlvbiBiZXR3ZWVuIHNlcnZlciBhbmQgdGhlIGNsaWVudFxuICBvbmNsb3NlOiBhbnlcbiAgLy8gRmlyZXMgZm9yIHNvbWUgbWlzdGFrZSwgd2hpY2ggaGFwcGVucyBkdXJpbmcgdGhlIGNvbW11bmljYXRpb25cbiAgb25lcnJvcjogYW55XG5cbiAgLyoqXG4gICAqIFNlbmQgYSBtZXNzYWdlIHRvIHRoZSBzZXJ2ZXJcbiAgICpcbiAgICogQHBhcmFtIGRhdGFcbiAgICogQHBhcmFtIGNiIE9wdGlvbmFsXG4gICAqL1xuICBzZW5kKGRhdGE6IGFueSwgY2I/OiBhbnkpOiB2b2lkIHtcbiAgICBzdXBlci5zZW5kKGRhdGEsIGNiKVxuICB9XG5cbiAgLyoqXG4gICAqIFRlcm1pbmF0ZXMgdGhlIGNvbm5lY3Rpb24gY29tcGxldGVseVxuICAgKlxuICAgKiBAcGFyYW0gbWNvZGUgT3B0aW9uYWxcbiAgICogQHBhcmFtIGRhdGEgT3B0aW9uYWxcbiAgICovXG4gIGNsb3NlKG1jb2RlPzogbnVtYmVyLCBkYXRhPzogc3RyaW5nKTogdm9pZCB7XG4gICAgc3VwZXIuY2xvc2UobWNvZGUsIGRhdGEpXG4gIH1cblxuICAvKipcbiAgICogUHJvdmlkZXMgdGhlIEFQSSBmb3IgY3JlYXRpbmcgYW5kIG1hbmFnaW5nIGEgV2ViU29ja2V0IGNvbm5lY3Rpb24gdG8gYSBzZXJ2ZXIsIGFzIHdlbGwgYXMgZm9yIHNlbmRpbmcgYW5kIHJlY2VpdmluZyBkYXRhIG9uIHRoZSBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIERlZmF1bHRzIHRvIFtbTWFpbm5ldEFQSV1dXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbmFsXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICB1cmw6IHN0cmluZyxcbiAgICBvcHRpb25zPzogV2ViU29ja2V0LkNsaWVudE9wdGlvbnMgfCBDbGllbnRSZXF1ZXN0QXJnc1xuICApIHtcbiAgICBzdXBlcih1cmwsIG9wdGlvbnMpXG4gIH1cbn1cbiJdfQ==