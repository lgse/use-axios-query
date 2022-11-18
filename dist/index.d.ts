import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import { UseQueryOptions, QueryKey, UseQueryResult } from '@tanstack/react-query';

declare const REQUEST_MANUALLY_CANCELLED = "REQUEST_MANUALLY_CANCELLED";
declare const REQUEST_AUTOMATICALLY_CANCELLED = "REQUEST_AUTOMATICALLY_CANCELLED";
type HookOptions = {
    authorizationHandler?: (e: AxiosError) => void;
    cancelAutomatically?: boolean;
};
type RequestGenerator = <TResponseType>(url: string, options?: AxiosRequestConfig) => Promise<AxiosResponse<TResponseType>>;
type RequestGeneratorWithoutDataOptions = Omit<AxiosRequestConfig, 'data'>;
type RequestGeneratorWithData = <TResponseType>(url: string, data: any, options: RequestGeneratorWithoutDataOptions) => Promise<AxiosResponse<TResponseType>>;
type Axios = {
    delete: RequestGenerator;
    get: RequestGenerator;
    head: RequestGenerator;
    options: RequestGenerator;
    patch: RequestGeneratorWithData;
    post: RequestGeneratorWithData;
    put: RequestGeneratorWithData;
};
declare const useAxiosRequest: (axiosOptions?: AxiosRequestConfig, retryOptions?: IAxiosRetryConfig, hookOptions?: HookOptions) => [Axios, () => void];

type QueryOptions<TDataType> = Omit<UseQueryOptions<TDataType, AxiosError>, 'queryFn' | 'queryKey'>;
declare const useAxiosQuery: <TDataType>(name: QueryKey, queryFn: (axios: Axios, canceller: () => void) => Promise<TDataType>, queryOptions?: QueryOptions<TDataType>, axiosOptions?: AxiosRequestConfig, retryOptions?: IAxiosRetryConfig, axiosRequestHookOptions?: HookOptions) => [TDataType | undefined, Omit<UseQueryResult<TDataType, AxiosError<unknown, any>>, "data">];

export { Axios, HookOptions, QueryOptions, REQUEST_AUTOMATICALLY_CANCELLED, REQUEST_MANUALLY_CANCELLED, RequestGenerator, RequestGeneratorWithData, RequestGeneratorWithoutDataOptions, useAxiosQuery, useAxiosRequest };
