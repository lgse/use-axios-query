'use strict';

var reactQuery = require('@tanstack/react-query');
var axios = require('axios');
var axiosRetry = require('axios-retry');
var react = require('react');

const REQUEST_MANUALLY_CANCELLED = "REQUEST_MANUALLY_CANCELLED";
const REQUEST_AUTOMATICALLY_CANCELLED = "REQUEST_AUTOMATICALLY_CANCELLED";
const useAxiosRequest = (axiosOptions = {}, retryOptions = {}, hookOptions = {}) => {
  const mergedHookOptions = {
    authorizationHandler: null,
    cancelAutomatically: true,
    ...hookOptions
  };
  const cancelRef = react.useRef([]);
  const canceler = (reason) => {
    cancelRef.current.forEach((callback) => {
      if (typeof callback === "function") {
        callback(reason);
      }
    });
  };
  const request = react.useCallback(
    (url, method, requestOptions = {}) => new Promise((resolve, reject) => {
      const { cancel, token } = axios.CancelToken.source();
      cancelRef.current.push(cancel);
      const instance = axios.create();
      const { headers, ...otherOptions } = {
        ...axiosOptions,
        ...requestOptions
      };
      axiosRetry(instance, {
        ...{
          retries: 5,
          retryDelay: (retryCount) => retryCount * 3e3
        },
        ...retryOptions
      });
      instance.request({
        cancelToken: token,
        headers: {
          ...headers
        },
        method,
        url,
        withCredentials: true,
        ...otherOptions
      }).then(resolve).catch((e) => {
        reject(e);
        if (e && e.response && e.response.status === 401) {
          const { authorizationHandler } = mergedHookOptions;
          if (typeof authorizationHandler === "function") {
            authorizationHandler(e);
          }
        }
      });
    }),
    []
  );
  const generators = {
    delete: (url, options = {}) => request(url, "delete", options),
    get: (url, options = {}) => request(url, "get", options),
    head: (url, options = {}) => request(url, "head", options),
    patch: (url, data = null, options = {}) => request(url, "patch", { ...options, data }),
    options: (url, options = {}) => request(url, "options", options),
    post: (url, data = null, options = {}) => request(url, "post", { ...options, data }),
    put: (url, data = null, options = {}) => request(url, "put", { ...options, data })
  };
  react.useEffect(
    () => () => {
      const { cancelAutomatically } = mergedHookOptions;
      if (cancelAutomatically) {
        canceler(REQUEST_AUTOMATICALLY_CANCELLED);
      }
    },
    []
  );
  return [generators, () => canceler(REQUEST_MANUALLY_CANCELLED)];
};

const useAxiosQuery = (name, queryFn, queryOptions = {}, axiosOptions = {}, retryOptions = {}, axiosRequestHookOptions = {}) => {
  const mergedQueryOptions = {
    refetchOnWindowFocus: false,
    ...queryOptions
  };
  const [request, canceller] = useAxiosRequest(axiosOptions, retryOptions, axiosRequestHookOptions);
  const { data, ...otherProps } = reactQuery.useQuery(
    name,
    () => queryFn(request, canceller),
    mergedQueryOptions
  );
  return [data, otherProps];
};

exports.REQUEST_AUTOMATICALLY_CANCELLED = REQUEST_AUTOMATICALLY_CANCELLED;
exports.REQUEST_MANUALLY_CANCELLED = REQUEST_MANUALLY_CANCELLED;
exports.useAxiosQuery = useAxiosQuery;
exports.useAxiosRequest = useAxiosRequest;
//# sourceMappingURL=index.js.map
