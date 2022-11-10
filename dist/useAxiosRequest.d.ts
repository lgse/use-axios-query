import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
export declare const REQUEST_MANUALLY_CANCELLED = "REQUEST_MANUALLY_CANCELLED";
export declare const REQUEST_AUTOMATICALLY_CANCELLED = "REQUEST_AUTOMATICALLY_CANCELLED";
export declare type HookOptions = {
    authorizationHandler?: (e: AxiosError) => void;
    cancelAutomatically?: boolean;
};
export declare type RequestGenerator<ResponseDataType> = (url: string, options?: AxiosRequestConfig) => Promise<AxiosResponse<ResponseDataType>>;
export declare type RequestGeneratorWithoutDataOptions = Omit<AxiosRequestConfig, 'data'>;
export declare type RequestGeneratorWithData<ResponseDataType> = (url: string, data: any, options: RequestGeneratorWithoutDataOptions) => Promise<AxiosResponse<ResponseDataType>>;
export declare type RequestGenerators<ResponseDataType> = {
    delete: RequestGenerator<ResponseDataType>;
    get: RequestGenerator<ResponseDataType>;
    head: RequestGenerator<ResponseDataType>;
    options: RequestGenerator<ResponseDataType>;
    patch: RequestGeneratorWithData<ResponseDataType>;
    post: RequestGeneratorWithData<ResponseDataType>;
    put: RequestGeneratorWithData<ResponseDataType>;
};
export declare type RequesterReturnType<ResponseDataType> = [RequestGenerators<ResponseDataType>, () => void];
export declare const useAxiosRequest: <ResponseDataType>(axiosOptions?: AxiosRequestConfig, retryOptions?: IAxiosRetryConfig, hookOptions?: HookOptions) => [RequestGenerators<ResponseDataType>, () => void];
