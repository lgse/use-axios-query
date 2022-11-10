"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAxiosRequest = exports.REQUEST_AUTOMATICALLY_CANCELLED = exports.REQUEST_MANUALLY_CANCELLED = void 0;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const react_1 = require("react");
exports.REQUEST_MANUALLY_CANCELLED = 'REQUEST_MANUALLY_CANCELLED';
exports.REQUEST_AUTOMATICALLY_CANCELLED = 'REQUEST_AUTOMATICALLY_CANCELLED';
const useAxiosRequest = (axiosOptions = {}, retryOptions = {}, hookOptions = {}) => {
    const mergedHookOptions = Object.assign({ authorizationHandler: null, cancelAutomatically: true }, hookOptions);
    const cancelRef = (0, react_1.useRef)([]);
    const canceler = (reason) => {
        cancelRef.current.forEach((callback) => {
            if (typeof callback === 'function') {
                callback(reason);
            }
        });
    };
    const request = (0, react_1.useCallback)((url, method, requestOptions = {}) => new Promise((resolve, reject) => {
        const { cancel, token } = axios_1.default.CancelToken.source();
        cancelRef.current.push(cancel);
        const instance = axios_1.default.create();
        const _a = Object.assign(Object.assign({}, axiosOptions), requestOptions), { headers } = _a, otherOptions = __rest(_a, ["headers"]);
        (0, axios_retry_1.default)(instance, Object.assign({
            retries: 5,
            retryDelay: (retryCount) => retryCount * 3000,
        }, retryOptions));
        instance
            .request(Object.assign({ cancelToken: token, headers: Object.assign({}, headers), method,
            url, withCredentials: true }, otherOptions))
            .then(resolve)
            .catch((e) => {
            reject(e);
            if (e && e.response && e.response.status === 401) {
                const { authorizationHandler } = mergedHookOptions;
                if (typeof authorizationHandler === 'function') {
                    authorizationHandler(e);
                }
            }
        });
    }), []);
    const generators = {
        delete: (url, options = {}) => request(url, 'delete', options),
        get: (url, options = {}) => request(url, 'get', options),
        head: (url, options = {}) => request(url, 'head', options),
        patch: (url, data = null, options = {}) => request(url, 'patch', Object.assign(Object.assign({}, options), { data })),
        options: (url, options = {}) => request(url, 'options', options),
        post: (url, data = null, options = {}) => request(url, 'post', Object.assign(Object.assign({}, options), { data })),
        put: (url, data = null, options = {}) => request(url, 'put', Object.assign(Object.assign({}, options), { data })),
    };
    (0, react_1.useEffect)(() => () => {
        const { cancelAutomatically } = mergedHookOptions;
        if (cancelAutomatically) {
            canceler(exports.REQUEST_AUTOMATICALLY_CANCELLED);
        }
    }, []);
    return [generators, () => canceler(exports.REQUEST_MANUALLY_CANCELLED)];
};
exports.useAxiosRequest = useAxiosRequest;
