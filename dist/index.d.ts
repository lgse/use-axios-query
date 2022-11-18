import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import { UseQueryOptions, QueryKey, UseQueryResult } from '@tanstack/react-query';

declare const REQUEST_MANUALLY_CANCELLED = "REQUEST_MANUALLY_CANCELLED";
declare const REQUEST_AUTOMATICALLY_CANCELLED = "REQUEST_AUTOMATICALLY_CANCELLED";
type HookOptions = {
    authorizationHandler?: (e: AxiosError) => void;
    cancelAutomatically?: boolean;
};
type RequestGenerator<ResponseDataType> = (url: string, options?: AxiosRequestConfig) => Promise<AxiosResponse<ResponseDataType>>;
type RequestGeneratorWithoutDataOptions = Omit<AxiosRequestConfig, 'data'>;
type RequestGeneratorWithData<ResponseDataType> = (url: string, data: any, options: RequestGeneratorWithoutDataOptions) => Promise<AxiosResponse<ResponseDataType>>;
type RequestGenerators<ResponseDataType> = {
    delete: RequestGenerator<ResponseDataType>;
    get: RequestGenerator<ResponseDataType>;
    head: RequestGenerator<ResponseDataType>;
    options: RequestGenerator<ResponseDataType>;
    patch: RequestGeneratorWithData<ResponseDataType>;
    post: RequestGeneratorWithData<ResponseDataType>;
    put: RequestGeneratorWithData<ResponseDataType>;
};
type RequesterReturnType<ResponseDataType> = [RequestGenerators<ResponseDataType>, () => void];
declare const useAxiosRequest: <ResponseDataType>(axiosOptions?: AxiosRequestConfig, retryOptions?: IAxiosRetryConfig, hookOptions?: HookOptions) => [RequestGenerators<ResponseDataType>, () => void];

type QueryOptions<ReturnDataType> = Omit<UseQueryOptions<ReturnDataType, AxiosError>, 'queryFn' | 'queryKey'>;
declare const useAxiosQuery: <AxiosResponseDataType, ReturnDataType>(name: QueryKey, queryFn: (generator: RequestGenerators<AxiosResponseDataType>, canceller: () => void) => Promise<ReturnDataType>, options?: QueryOptions<ReturnDataType>, axiosOptions?: AxiosRequestConfig, retryOptions?: IAxiosRetryConfig, hookOptions?: HookOptions) => [ReturnDataType | undefined, Omit<UseQueryResult<ReturnDataType, AxiosError<unknown, any>>, "data">];

export { HookOptions, QueryOptions, REQUEST_AUTOMATICALLY_CANCELLED, REQUEST_MANUALLY_CANCELLED, RequestGenerator, RequestGeneratorWithData, RequestGeneratorWithoutDataOptions, RequestGenerators, RequesterReturnType, useAxiosQuery, useAxiosRequest };
