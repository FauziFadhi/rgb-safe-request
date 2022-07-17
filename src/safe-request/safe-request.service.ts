import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse, Method } from 'axios';
import * as CircuitBreaker from 'opossum';
import { SafeRequest } from './safe-request.abstract';
import { CBOptions, CONFIG } from './safe-request.interface';

const urljoin = require('url-join');
/**
 * make axios request with circuit breaker pattern
 */
@Injectable()
export class SafeRequestService implements SafeRequest {
  private logger: Logger;
  private cbInstance: Record<string, CircuitBreaker> = {};

  constructor(private readonly httpService: HttpService) {
    this.logger = new Logger('CIRCUIT BREAKER');
  }

  /**
   * all circuit breaker instance
   */
  get circuitInstance() {
    return this.cbInstance;
  }

  /**
   * get request for with axios
   * @param {string} url
   * @param {CONFIG} config config.circuitBreaker is config for circuit breaker
   * @returns
   */
  async get<T>(url: string, config?: CONFIG): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: 'get' });
  }

  async delete<T>(url: string, config?: CONFIG): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: 'delete' });
  }

  async head<T>(url: string, config?: CONFIG): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: 'head' });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: CONFIG,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, data, { ...config, method: 'post' });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: CONFIG,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, data, { ...config, method: 'put' });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: CONFIG,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, data, { ...config, method: 'patch' });
  }

  /**
   * make axios request with add to circuit breaker
   * @param url
   * @param config
   */
  private async request<T>(
    url: string,
    config?: CONFIG,
  ): Promise<AxiosResponse<T>>;
  private async request<T>(
    url: string,
    data?: unknown,
    config?: CONFIG,
  ): Promise<AxiosResponse<T>>;
  private async request<T>(...args: any[]): Promise<AxiosResponse<T>> {
    const { circuitBreaker = {}, ...axiosConfig } = args.at(-1) || {};
    const { method, baseUrl } = axiosConfig || {};
    const fullUrl = baseUrl ? urljoin(baseUrl, args[0]) : args[0];

    return this.fireCircuitBreaker(fullUrl, circuitBreaker, method, ...args);
  }

  /**
   * add request to circuit breaker
   * with listener of state each request to url
   * only request that return `5xx` that can make circuit breaker fail
   * @param fullUrl for logging purpose which url that has failed state
   * @param request
   * @param options
   * @returns
   */
  private async fireCircuitBreaker(
    fullUrl: string,
    options: CBOptions = {},
    method: Method,
    ...args: any[]
  ): Promise<AxiosResponse> {
    const url = fullUrl;
    const key = `${url}_${method}`;

    if (!this.cbInstance[key]) {
      this.cbInstance[key] ||= new CircuitBreaker(this.httpService.axiosRef, {
        name: key,
        group: key,
        timeout: 1500,
        errorThresholdPercentage: 51,
        volumeThreshold: 3,
        errorFilter: (err) => {
          if (err.response?.status < 500) {
            return true;
          }
          return false;
        },
        ...options,
      });

      this.cbInstance[key]
        .on('reject', () => {
          this.logger.warn(`REJECT: ${url}`);
        })
        .on('open', () =>
          this.logger.warn(`OPEN: The cb for ${url} just opened.`),
        )
        .on('timeout', () =>
          this.logger.warn(`TIMEOUT: ${url} is taking too long to respond.`),
        )
        .on('halfOpen', () =>
          this.logger.warn(`HALF_OPEN: The cb for ${url}  is half open.`),
        )
        .on('close', () =>
          this.logger.log(`CLOSE: The cb for ${url} has closed. Service OK.`),
        );
    }

    // cb.on('reject',
    //   (e) => {
    //     console.log(e);
    //     console.log('REJECTED: The cb for  is open. Failing fast.');
    //   });

    if (args.length === 3) {
      args[0] = args[0];
      args[1] = {
        ...args[2],
        data: args[1],
      };
    }

    const startTime = args[1]?.responseLogging ? new Date().getTime() : 0;
    let responseData: unknown;

    // cb.on('fallback',
    //   (data) => console.log(`FALLBACK: ${JSON.stringify(data)}`));
    return this.cbInstance[key]
      .fire(...args)
      .then((response: any) => {
        responseData = response.data;
        return response;
      })
      .catch((e) => {
        responseData = e.response?.data;
        const message = e.response?.message || e.message;
        this.logger.error(message || e, e.stack);
        throw e;
      })
      .finally(() => {
        if (args[1]?.responseLogging) {
          this.logging(startTime, ...args, responseData);
        }
        if (options.logState) {
          this.logger.log({
            message: `The state cb for ${url}`,
            state: (this.cbInstance[key] as any).toJSON(),
          });
          this.cbInstance[key];
        }
      }) as any;
  }

  private logging(startTime: number, ...args: any[]) {
    const endTime = new Date().getTime();
    const duration = endTime - startTime;

    this.logger.log({
      message: args[1]?.url,
      config: args[1],
      duration,
      response: args.at(-1),
    });
  }
}
