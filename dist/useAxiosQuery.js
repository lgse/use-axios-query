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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAxiosQuery = void 0;
const react_query_1 = require("@tanstack/react-query");
const useAxiosRequest_1 = require("./useAxiosRequest");
const useAxiosQuery = (name, queryFn, options = {}, axiosOptions = {}, retryOptions = {}, hookOptions = {}) => {
    const [request, canceller] = (0, useAxiosRequest_1.useAxiosRequest)(axiosOptions, retryOptions, hookOptions);
    const _a = (0, react_query_1.useQuery)(name, () => queryFn(request, canceller), options), { data } = _a, otherProps = __rest(_a, ["data"]);
    return [data, otherProps];
};
exports.useAxiosQuery = useAxiosQuery;
