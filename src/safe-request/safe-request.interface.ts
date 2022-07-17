import * as CircuitBreaker from 'opossum';
import { AxiosRequestConfig } from 'axios';

export type CBOptions = CircuitBreaker.Options & { logState?: boolean };

export type CONFIG = AxiosRequestConfig & {
  circuitBreaker?: CBOptions;
  responseLogging?: boolean;
};
