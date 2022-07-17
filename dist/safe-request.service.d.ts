import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import * as CircuitBreaker from 'opossum';
import { SafeRequest } from './safe-request.abstract';
import { CONFIG } from './safe-request.interface';
export declare class SafeRequestService implements SafeRequest {
    private readonly httpService;
    private logger;
    private cbInstance;
    constructor(httpService: HttpService);
    get circuitInstance(): Record<string, CircuitBreaker<unknown[], unknown>>;
    get<T>(url: string, config?: CONFIG): Promise<AxiosResponse<T>>;
    delete<T>(url: string, config?: CONFIG): Promise<AxiosResponse<T>>;
    head<T>(url: string, config?: CONFIG): Promise<AxiosResponse<T>>;
    post<T>(url: string, data?: unknown, config?: CONFIG): Promise<AxiosResponse<T>>;
    put<T>(url: string, data?: unknown, config?: CONFIG): Promise<AxiosResponse<T>>;
    patch<T>(url: string, data?: unknown, config?: CONFIG): Promise<AxiosResponse<T>>;
    private request;
    private fireCircuitBreaker;
    private logging;
}
