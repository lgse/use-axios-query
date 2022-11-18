import { AxiosError, AxiosRequestConfig } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { Axios, HookOptions, useAxiosRequest } from './useAxiosRequest';

export type QueryOptions<TDataType> = Omit<
  UseQueryOptions<TDataType, AxiosError>,
  'queryFn' | 'queryKey'
>;

export const useAxiosQuery = <TDataType>(
  name: QueryKey,
  queryFn: (
    axios: Axios,
    canceller: () => void
  ) => Promise<TDataType>,
  queryOptions: QueryOptions<TDataType> = {},
  axiosOptions: AxiosRequestConfig = {},
  retryOptions: IAxiosRetryConfig = {},
  axiosRequestHookOptions: HookOptions = {}
): [
  TDataType | undefined,
  Omit<UseQueryResult<TDataType, AxiosError>, 'data'>
] => {
  const mergedQueryOptions: QueryOptions<TDataType> = {
    refetchOnWindowFocus: false,
    ...queryOptions,
  }

  const [request, canceller] = useAxiosRequest(axiosOptions, retryOptions, axiosRequestHookOptions);

  const { data, ...otherProps } = useQuery<TDataType, AxiosError>(
    name,
    () => queryFn(request, canceller),
    mergedQueryOptions
  );

  return [data, otherProps];
};
