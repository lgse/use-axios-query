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

export type RequestGenerator<ResponseDataType> = (
  url: string,
  options?: AxiosRequestConfig
) => Promise<AxiosResponse<ResponseDataType>>;

export type RequestGeneratorWithoutDataOptions = Omit<AxiosRequestConfig, 'data'>;

export type RequestGeneratorWithData<ResponseDataType> = (
  url: string,
  data: any,
  options: RequestGeneratorWithoutDataOptions
) => Promise<AxiosResponse<ResponseDataType>>;

export type RequestGenerators<ResponseDataType> = {
  delete: RequestGenerator<ResponseDataType>;
  get: RequestGenerator<ResponseDataType>;
  head: RequestGenerator<ResponseDataType>;
  options: RequestGenerator<ResponseDataType>;
  patch: RequestGeneratorWithData<ResponseDataType>;
  post: RequestGeneratorWithData<ResponseDataType>;
  put: RequestGeneratorWithData<ResponseDataType>;
};

export type RequesterReturnType<ResponseDataType> = [RequestGenerators<ResponseDataType>, () => void];

export const useAxiosRequest = <ResponseDataType>(
  axiosOptions: AxiosRequestConfig = {},
  retryOptions: IAxiosRetryConfig = {},
  hookOptions: HookOptions = {}
): [RequestGenerators<ResponseDataType>, () => void] => {
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
    (url: string, method: string, requestOptions: AxiosRequestConfig = {}) =>
      new Promise<AxiosResponse<ResponseDataType>>((resolve, reject) => {
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

  const generators: RequestGenerators<ResponseDataType> = {
    delete: (url: string, options: AxiosRequestConfig = {}) =>
      request(url, 'delete', options),
    get: (url: string, options: AxiosRequestConfig = {}) =>
      request(url, 'get', options),
    head: (url: string, options: AxiosRequestConfig = {}) =>
      request(url, 'head', options),
    patch: (
      url: string,
      data: any = null,
      options: RequestGeneratorWithoutDataOptions = {}
    ) => request(url, 'patch', { ...options, data }),
    options: (url: string, options: AxiosRequestConfig = {}) =>
      request(url, 'options', options),
    post: (
      url: string,
      data: any = null,
      options: RequestGeneratorWithoutDataOptions = {}
    ) => request(url, 'post', { ...options, data }),
    put: (
      url: string,
      data: any = null,
      options: RequestGeneratorWithoutDataOptions = {}
    ) => request(url, 'put', { ...options, data }),
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
