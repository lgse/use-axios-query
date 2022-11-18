import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Canceler,
} from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { useCallback, useEffect, useRef } from 'react';

export const REQUEST_MANUALLY_CANCELLED = 'REQUEST_MANUALLY_CANCELLED';
export const REQUEST_AUTOMATICALLY_CANCELLED =
  'REQUEST_AUTOMATICALLY_CANCELLED';

export type HookOptions = {
  authorizationHandler?: (e: AxiosError) => void;
  cancelAutomatically?: boolean;
};

export type RequestGenerator = <TResponseType>(
  url: string,
  options?: AxiosRequestConfig
) => Promise<AxiosResponse<TResponseType>>;

export type RequestGeneratorWithoutDataOptions = Omit<AxiosRequestConfig, 'data'>;

export type RequestGeneratorWithData = <TResponseType>(
  url: string,
  data: any,
  options: RequestGeneratorWithoutDataOptions
) => Promise<AxiosResponse<TResponseType>>;

export type Axios = {
  delete: RequestGenerator;
  get: RequestGenerator;
  head: RequestGenerator;
  options: RequestGenerator;
  patch: RequestGeneratorWithData;
  post: RequestGeneratorWithData;
  put: RequestGeneratorWithData;
};

export const useAxiosRequest = (
  axiosOptions: AxiosRequestConfig = {},
  retryOptions: IAxiosRetryConfig = {},
  hookOptions: HookOptions = {}
): [Axios, () => void] => {
  const mergedHookOptions = {
    authorizationHandler: null,
    cancelAutomatically: true,
    ...hookOptions,
  };

  const cancelRef = useRef<Canceler[]>([]);

  const canceler = (reason?: string) => {
    cancelRef.current.forEach((callback: (reason?: string) => void) => {
      if (typeof callback === 'function') {
        callback(reason);
      }
    });
  };

  const request = useCallback(
    <TResponseType>(url: string, method: string, requestOptions: AxiosRequestConfig = {}) =>
      new Promise<AxiosResponse<TResponseType>>((resolve, reject) => {
        const { cancel, token } = axios.CancelToken.source();
        cancelRef.current.push(cancel);

        const instance = axios.create();
        const { headers, ...otherOptions } = {
          ...axiosOptions,
          ...requestOptions,
        };

        axiosRetry(instance, {
          ...{
            retries: 5,
            retryDelay: (retryCount: number) => retryCount * 3000,
          },
          ...retryOptions,
        });

        instance
          .request({
            cancelToken: token,
            headers: {
              ...headers,
            },
            method,
            url,
            withCredentials: true,
            ...otherOptions,
          })
          .then(resolve)
          .catch((e: AxiosError) => {
            reject(e);

            if (e && e.response && e.response.status === 401) {
              const { authorizationHandler } = mergedHookOptions;
              if (typeof authorizationHandler === 'function') {
                authorizationHandler(e);
              }
            }
          });
      }),
    []
  );

  const generators: Axios = {
    delete: <TResponseType>(url: string, options: AxiosRequestConfig = {}) =>
      request<TResponseType>(url, 'delete', options),
    get: <TResponseType>(url: string, options: AxiosRequestConfig = {}) =>
      request<TResponseType>(url, 'get', options),
    head: <TResponseType>(url: string, options: AxiosRequestConfig = {}) =>
      request<TResponseType>(url, 'head', options),
    patch: <TResponseType>(
      url: string,
      data: any = null,
      options: RequestGeneratorWithoutDataOptions = {}
    ) => request<TResponseType>(url, 'patch', { ...options, data }),
    options: <TResponseType>(url: string, options: AxiosRequestConfig = {}) =>
      request<TResponseType>(url, 'options', options),
    post: <TResponseType>(
      url: string,
      data: any = null,
      options: RequestGeneratorWithoutDataOptions = {}
    ) => request<TResponseType>(url, 'post', { ...options, data }),
    put: <TResponseType>(
      url: string,
      data: any = null,
      options: RequestGeneratorWithoutDataOptions = {}
    ) => request<TResponseType>(url, 'put', { ...options, data }),
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
