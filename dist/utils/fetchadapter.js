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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAdapter = void 0;
function createRequest(config) {
    const headers = new Headers(config.headers);
    if (config.auth) {
        const username = config.auth.username || "";
        const password = config.auth.password
            ? encodeURIComponent(config.auth.password)
            : "";
        headers.set("Authorization", `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`);
    }
    const method = config.method.toUpperCase();
    const options = {
        headers: headers,
        method
    };
    if (method !== "GET" && method !== "HEAD") {
        options.body = config.data;
    }
    if (config.withCredentials) {
        options.credentials = config.withCredentials ? "include" : "omit";
    }
    const fullPath = new URL(config.url, config.baseURL);
    const params = new URLSearchParams(config.params);
    const url = `${fullPath}${params}`;
    return new Request(url, options);
}
function getResponse(request, config) {
    return __awaiter(this, void 0, void 0, function* () {
        let stageOne;
        try {
            stageOne = yield fetch(request);
        }
        catch (e) {
            const error = Object.assign(Object.assign({}, new Error("Network Error")), { config,
                request, isAxiosError: true, toJSON: () => error });
            return Promise.reject(error);
        }
        const response = {
            status: stageOne.status,
            statusText: stageOne.statusText,
            headers: Object.assign({}, stageOne.headers),
            config: config,
            request,
            data: undefined // we set it below
        };
        if (stageOne.status >= 200 && stageOne.status !== 204) {
            switch (config.responseType) {
                case "arraybuffer":
                    response.data = yield stageOne.arrayBuffer();
                    break;
                case "blob":
                    response.data = yield stageOne.blob();
                    break;
                case "json":
                    response.data = yield stageOne.json();
                    break;
                case "formData":
                    response.data = yield stageOne.formData();
                    break;
                default:
                    response.data = yield stageOne.text();
                    break;
            }
        }
        return Promise.resolve(response);
    });
}
function fetchAdapter(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = createRequest(config);
        const promiseChain = [getResponse(request, config)];
        if (config.timeout && config.timeout > 0) {
            promiseChain.push(new Promise((res, reject) => {
                setTimeout(() => {
                    const message = config.timeoutErrorMessage
                        ? config.timeoutErrorMessage
                        : "timeout of " + config.timeout + "ms exceeded";
                    const error = Object.assign(Object.assign({}, new Error(message)), { config,
                        request, code: "ECONNABORTED", isAxiosError: true, toJSON: () => error });
                    reject(error);
                }, config.timeout);
            }));
        }
        const response = yield Promise.race(promiseChain);
        return new Promise((resolve, reject) => {
            if (response instanceof Error) {
                reject(response);
            }
            else {
                if (!response.status ||
                    !response.config.validateStatus ||
                    response.config.validateStatus(response.status)) {
                    resolve(response);
                }
                else {
                    const error = Object.assign(Object.assign({}, new Error("Request failed with status code " + response.status)), { config,
                        request, code: response.status >= 500 ? "ERR_BAD_RESPONSE" : "ERR_BAD_REQUEST", isAxiosError: true, toJSON: () => error });
                    reject(error);
                }
            }
        });
    });
}
exports.fetchAdapter = fetchAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2hhZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2ZldGNoYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFFQSxTQUFTLGFBQWEsQ0FBQyxNQUEwQjtJQUMvQyxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBaUMsQ0FBQyxDQUFBO0lBRXJFLElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtRQUNmLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQTtRQUMzQyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVE7WUFDbkMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQzFDLENBQUMsQ0FBQyxFQUFFLENBQUE7UUFDTixPQUFPLENBQUMsR0FBRyxDQUNULGVBQWUsRUFDZixTQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FDckUsQ0FBQTtLQUNGO0lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUMxQyxNQUFNLE9BQU8sR0FBZ0I7UUFDM0IsT0FBTyxFQUFFLE9BQU87UUFDaEIsTUFBTTtLQUNQLENBQUE7SUFDRCxJQUFJLE1BQU0sS0FBSyxLQUFLLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRTtRQUN6QyxPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7S0FDM0I7SUFFRCxJQUFJLE1BQU0sQ0FBQyxlQUFlLEVBQUU7UUFDMUIsT0FBTyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FB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QUFDLENBQUE7aUJBQ2Q7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUFBO0FBcERELG9DQW9EQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF4aW9zUmVxdWVzdENvbmZpZywgQXhpb3NSZXNwb25zZSwgQXhpb3NFcnJvciB9IGZyb20gXCJheGlvc1wiXG5cbmZ1bmN0aW9uIGNyZWF0ZVJlcXVlc3QoY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcpOiBSZXF1ZXN0IHtcbiAgY29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKGNvbmZpZy5oZWFkZXJzIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4pXG5cbiAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgY29uc3QgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCBcIlwiXG4gICAgY29uc3QgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZFxuICAgICAgPyBlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpXG4gICAgICA6IFwiXCJcbiAgICBoZWFkZXJzLnNldChcbiAgICAgIFwiQXV0aG9yaXphdGlvblwiLFxuICAgICAgYEJhc2ljICR7QnVmZmVyLmZyb20oYCR7dXNlcm5hbWV9OiR7cGFzc3dvcmR9YCkudG9TdHJpbmcoXCJiYXNlNjRcIil9YFxuICAgIClcbiAgfVxuXG4gIGNvbnN0IG1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKVxuICBjb25zdCBvcHRpb25zOiBSZXF1ZXN0SW5pdCA9IHtcbiAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgIG1ldGhvZFxuICB9XG4gIGlmIChtZXRob2QgIT09IFwiR0VUXCIgJiYgbWV0aG9kICE9PSBcIkhFQURcIikge1xuICAgIG9wdGlvbnMuYm9keSA9IGNvbmZpZy5kYXRhXG4gIH1cblxuICBpZiAoY29uZmlnLndpdGhDcmVkZW50aWFscykge1xuICAgIG9wdGlvbnMuY3JlZGVudGlhbHMgPSBjb25maWcud2l0aENyZWRlbnRpYWxzID8gXCJpbmNsdWRlXCIgOiBcIm9taXRcIlxuICB9XG5cbiAgY29uc3QgZnVsbFBhdGggPSBuZXcgVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5iYXNlVVJMKVxuICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGNvbmZpZy5wYXJhbXMpXG5cbiAgY29uc3QgdXJsID0gYCR7ZnVsbFBhdGh9JHtwYXJhbXN9YFxuXG4gIHJldHVybiBuZXcgUmVxdWVzdCh1cmwsIG9wdGlvbnMpXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFJlc3BvbnNlKHJlcXVlc3QsIGNvbmZpZyk6IFByb21pc2U8QXhpb3NSZXNwb25zZT4ge1xuICBsZXQgc3RhZ2VPbmVcbiAgdHJ5IHtcbiAgICBzdGFnZU9uZSA9IGF3YWl0IGZldGNoKHJlcXVlc3QpXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zdCBlcnJvcjogQXhpb3NFcnJvciA9IHtcbiAgICAgIC4uLm5ldyBFcnJvcihcIk5ldHdvcmsgRXJyb3JcIiksXG4gICAgICBjb25maWcsXG4gICAgICByZXF1ZXN0LFxuICAgICAgaXNBeGlvc0Vycm9yOiB0cnVlLFxuICAgICAgdG9KU09OOiAoKSA9PiBlcnJvclxuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpXG4gIH1cblxuICBjb25zdCByZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IHtcbiAgICBzdGF0dXM6IHN0YWdlT25lLnN0YXR1cyxcbiAgICBzdGF0dXNUZXh0OiBzdGFnZU9uZS5zdGF0dXNUZXh0LFxuICAgIGhlYWRlcnM6IHsgLi4uc3RhZ2VPbmUuaGVhZGVycyB9LCAvLyBtYWtlIGEgY29weSBvZiB0aGUgaGVhZGVyc1xuICAgIGNvbmZpZzogY29uZmlnLFxuICAgIHJlcXVlc3QsXG4gICAgZGF0YTogdW5kZWZpbmVkIC8vIHdlIHNldCBpdCBiZWxvd1xuICB9XG5cbiAgaWYgKHN0YWdlT25lLnN0YXR1cyA+PSAyMDAgJiYgc3RhZ2VPbmUuc3RhdHVzICE9PSAyMDQpIHtcbiAgICBzd2l0Y2ggKGNvbmZpZy5yZXNwb25zZVR5cGUpIHtcbiAgICAgIGNhc2UgXCJhcnJheWJ1ZmZlclwiOlxuICAgICAgICByZXNwb25zZS5kYXRhID0gYXdhaXQgc3RhZ2VPbmUuYXJyYXlCdWZmZXIoKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcImJsb2JcIjpcbiAgICAgICAgcmVzcG9uc2UuZGF0YSA9IGF3YWl0IHN0YWdlT25lLmJsb2IoKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcImpzb25cIjpcbiAgICAgICAgcmVzcG9uc2UuZGF0YSA9IGF3YWl0IHN0YWdlT25lLmpzb24oKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBcImZvcm1EYXRhXCI6XG4gICAgICAgIHJlc3BvbnNlLmRhdGEgPSBhd2FpdCBzdGFnZU9uZS5mb3JtRGF0YSgpXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXNwb25zZS5kYXRhID0gYXdhaXQgc3RhZ2VPbmUudGV4dCgpXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSlcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQWRhcHRlcihcbiAgY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWdcbik6IFByb21pc2U8QXhpb3NSZXNwb25zZT4ge1xuICBjb25zdCByZXF1ZXN0ID0gY3JlYXRlUmVxdWVzdChjb25maWcpXG5cbiAgY29uc3QgcHJvbWlzZUNoYWluID0gW2dldFJlc3BvbnNlKHJlcXVlc3QsIGNvbmZpZyldXG5cbiAgaWYgKGNvbmZpZy50aW1lb3V0ICYmIGNvbmZpZy50aW1lb3V0ID4gMCkge1xuICAgIHByb21pc2VDaGFpbi5wdXNoKFxuICAgICAgbmV3IFByb21pc2UoKHJlcywgcmVqZWN0KSA9PiB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZVxuICAgICAgICAgICAgPyBjb25maWcudGltZW91dEVycm9yTWVzc2FnZVxuICAgICAgICAgICAgOiBcInRpbWVvdXQgb2YgXCIgKyBjb25maWcudGltZW91dCArIFwibXMgZXhjZWVkZWRcIlxuICAgICAgICAgIGNvbnN0IGVycm9yOiBBeGlvc0Vycm9yID0ge1xuICAgICAgICAgICAgLi4ubmV3IEVycm9yKG1lc3NhZ2UpLFxuICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgICAgIGNvZGU6IFwiRUNPTk5BQk9SVEVEXCIsXG4gICAgICAgICAgICBpc0F4aW9zRXJyb3I6IHRydWUsXG4gICAgICAgICAgICB0b0pTT046ICgpID0+IGVycm9yXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgfSwgY29uZmlnLnRpbWVvdXQpXG4gICAgICB9KVxuICAgIClcbiAgfVxuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgUHJvbWlzZS5yYWNlKHByb21pc2VDaGFpbilcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAocmVzcG9uc2UgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgcmVqZWN0KHJlc3BvbnNlKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoXG4gICAgICAgICFyZXNwb25zZS5zdGF0dXMgfHxcbiAgICAgICAgIXJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cyB8fFxuICAgICAgICByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKVxuICAgICAgKSB7XG4gICAgICAgIHJlc29sdmUocmVzcG9uc2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBlcnJvcjogQXhpb3NFcnJvciA9IHtcbiAgICAgICAgICAuLi5uZXcgRXJyb3IoXCJSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlIFwiICsgcmVzcG9uc2Uuc3RhdHVzKSxcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgICBjb2RlOiByZXNwb25zZS5zdGF0dXMgPj0gNTAwID8gXCJFUlJfQkFEX1JFU1BPTlNFXCIgOiBcIkVSUl9CQURfUkVRVUVTVFwiLFxuICAgICAgICAgIGlzQXhpb3NFcnJvcjogdHJ1ZSxcbiAgICAgICAgICB0b0pTT046ICgpID0+IGVycm9yXG4gICAgICAgIH1cbiAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cbiJdfQ==