import { AxiosError, AxiosRequestConfig } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';
import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { HookOptions, RequestGenerators, useAxiosRequest } from './useAxiosRequest';

export type QueryOptions<ReturnDataType> = Omit<
  UseQueryOptions<ReturnDataType, AxiosError>,
  'queryFn' | 'queryKey'
>;

export const useAxiosQuery = <AxiosResponseDataType, ReturnDataType>(
  name: QueryKey,
  queryFn: (
    generator: RequestGenerators<AxiosResponseDataType>,
    canceller: () => void
  ) => Promise<ReturnDataType>,
  options: QueryOptions<ReturnDataType> = {},
  axiosOptions: AxiosRequestConfig = {},
  retryOptions: IAxiosRetryConfig = {},
  hookOptions: HookOptions = {}
): [
  ReturnDataType | undefined,
  Omit<UseQueryResult<ReturnDataType, AxiosError>, 'data'>
] => {
  const [request, canceller] = useAxiosRequest<AxiosResponseDataType>(axiosOptions, retryOptions, hookOptions);

  const { data, ...otherProps } = useQuery<ReturnDataType, AxiosError>(
    name,
    () => queryFn(request, canceller),
    options
  );

  return [data, otherProps];
};
