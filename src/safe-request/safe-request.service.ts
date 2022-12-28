import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse, Method } from 'axios';
import * as CircuitBreaker from 'opossum';
import urljoin from 'url-join';
import { SafeRequest } from './safe-request.abstract';
import { CBOptions, CONFIG } from './safe-request.interface';
import { SafeRequestModel } from './sequelize-cache';

/**
 * make axios request with circuit breaker pattern
 */
@Injectable()
export class SafeRequestService implements SafeRequest {
  private logger: Logger;
  private cbInstance: Record<string, CircuitBreaker> = {};

  constructor(private readonly httpService: HttpService) {
    this.logger = new Logger('Request Log');
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
        volumeThreshold: 10,
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
    let logResponse: unknown;

    // cb.on('fallback',
    //   (data) => console.log(`FALLBACK: ${JSON.stringify(data)}`));
    return this.cbInstance[key]
      .fire(...args)
      .then((response: any) => {
        logResponse = response?.data;
        return response;
      })
      .catch((e) => {
        logResponse = e.response?.data;
        const message = e.response?.message || e.message;
        this.logger.error(
          `[Error] [${method}] Request ${url} ${JSON.stringify(message || e)}`,
          e.stack,
        );
        throw e;
      })
      .finally(() => {
        const duration = new Date().getTime() - startTime;
        const showLog = args[1]?.responseLogging ?? SafeRequestModel.showLog;
        if (showLog) {
          SafeRequestModel.log({
            message: `[Info] [${method}] Request ${url}`,
            config: args[1],
            duration,
            response: logResponse,
            ...(args[1]?.logObject || {}),
          });
          this.logger.log({
            message: `[Info] [${method}] Request ${url}`,
            config: args[1],
            duration,
            response: logResponse,
            ...(args[1]?.logObject || {}),
          });
        }

        if (options.logState) {
          this.logger.log({
            message: `[State] The state cb for ${url}`,
            state: (this.cbInstance[key] as any).toJSON(),
            context: 'Circuit Breaker',
          });
          this.cbInstance[key];
        }
      }) as any;
  }
}
