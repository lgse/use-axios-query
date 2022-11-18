import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { useRef, useCallback, useEffect } from 'react';

const REQUEST_MANUALLY_CANCELLED = "REQUEST_MANUALLY_CANCELLED";
const REQUEST_AUTOMATICALLY_CANCELLED = "REQUEST_AUTOMATICALLY_CANCELLED";
const useAxiosRequest = (axiosOptions = {}, retryOptions = {}, hookOptions = {}) => {
  const mergedHookOptions = {
    authorizationHandler: null,
    cancelAutomatically: true,
    ...hookOptions
  };
  const cancelRef = useRef([]);
  const canceler = (reason) => {
    cancelRef.current.forEach((callback) => {
      if (typeof callback === "function") {
        callback(reason);
      }
    });
  };
  const request = useCallback(
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
  useEffect(
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

const useAxiosQuery = (name, queryFn, options = {}, axiosOptions = {}, retryOptions = {}, hookOptions = {}) => {
  const [request, canceller] = useAxiosRequest(axiosOptions, retryOptions, hookOptions);
  const { data, ...otherProps } = useQuery(
    name,
    () => queryFn(request, canceller),
    options
  );
  return [data, otherProps];
};

export { REQUEST_AUTOMATICALLY_CANCELLED, REQUEST_MANUALLY_CANCELLED, useAxiosQuery, useAxiosRequest };
//# sourceMappingURL=index.mjs.map
