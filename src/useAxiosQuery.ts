import { AxiosError, AxiosRequestConfig } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { HookOptions, RequestGenerators, useAxiosRequest } from './useAxiosRequest';

export type QueryOptions<ResponseDataType> = Omit<
  UseQueryOptions<ResponseDataType, AxiosError>,
  'queryFn' | 'queryKey'
>;

export const useAxiosQuery = <ResponseDataType>(
  name: QueryKey,
  queryFn: (
    generator: RequestGenerators<ResponseDataType>,
    canceller: () => void
  ) => Promise<ResponseDataType>,
  options: QueryOptions<ResponseDataType> = {},
  axiosOptions: AxiosRequestConfig = {},
  retryOptions: IAxiosRetryConfig = {},
  hookOptions: HookOptions = {}
): [
  ResponseDataType | undefined,
  Omit<UseQueryResult<ResponseDataType, AxiosError>, 'data'>
] => {
  const [request, canceller] = useAxiosRequest<ResponseDataType>(axiosOptions, retryOptions, hookOptions);

  const { data, ...otherProps } = useQuery<ResponseDataType, AxiosError>(
    name,
    () => queryFn(request, canceller),
    options
  );

  return [data, otherProps];
};
