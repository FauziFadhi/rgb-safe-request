import * as CircuitBreaker from 'opossum';
import { AxiosRequestConfig } from 'axios';

export type CBOptions = CircuitBreaker.Options & { logState?: boolean };

export type CONFIG = AxiosRequestConfig & {
  /**
   * circuit breaker options
   * set some options at this attribute to override default options
   */
  circuitBreaker?: CBOptions;

  /**
   * @default false
   * `true` to make your http request get log
   */
  responseLogging?: boolean;

  /**
   * this object will appears at your log
   */
  logObject?: {
    message?: string;
    context?: string;
    [key: string]: string | undefined;
  };
};
