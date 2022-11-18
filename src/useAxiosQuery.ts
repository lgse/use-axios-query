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
  options: QueryOptions<TDataType> = {},
  axiosOptions: AxiosRequestConfig = {},
  retryOptions: IAxiosRetryConfig = {},
  hookOptions: HookOptions = {}
): [
  TDataType | undefined,
  Omit<UseQueryResult<TDataType, AxiosError>, 'data'>
] => {
  const [request, canceller] = useAxiosRequest(axiosOptions, retryOptions, hookOptions);

  const { data, ...otherProps } = useQuery<TDataType, AxiosError>(
    name,
    () => queryFn(request, canceller),
    options
  );

  return [data, otherProps];
};
