import * as CircuitBreaker from 'opossum';
import { AxiosRequestConfig } from 'axios';
export declare type CBOptions = CircuitBreaker.Options & {
    logState?: boolean;
};
export declare type CONFIG = AxiosRequestConfig & {
    circuitBreaker?: CBOptions;
    responseLogging?: boolean;
};
