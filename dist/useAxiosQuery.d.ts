import { AxiosError, AxiosRequestConfig } from 'axios';
import { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { HookOptions, RequestGenerators } from './useAxiosRequest';
import { IAxiosRetryConfig } from 'axios-retry';
export declare type QueryOptions<ResponseDataType> = Omit<UseQueryOptions<ResponseDataType, AxiosError>, 'queryFn' | 'queryKey'>;
export declare const useAxiosQuery: <ResponseDataType>(name: QueryKey, queryFn: (generator: RequestGenerators<ResponseDataType>, canceller: () => void) => Promise<ResponseDataType>, options?: QueryOptions<ResponseDataType>, axiosOptions?: AxiosRequestConfig, retryOptions?: IAxiosRetryConfig, hookOptions?: HookOptions) => [ResponseDataType | undefined, Omit<UseQueryResult<ResponseDataType, AxiosError<unknown, any>>, "data">];
