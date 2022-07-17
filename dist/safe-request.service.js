"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeRequestService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const CircuitBreaker = require("opossum");
const urljoin = require('url-join');
let SafeRequestService = class SafeRequestService {
    constructor(httpService) {
        this.httpService = httpService;
        this.cbInstance = {};
        this.logger = new common_1.Logger('CIRCUIT BREAKER');
    }
    get circuitInstance() {
        return this.cbInstance;
    }
    async get(url, config) {
        return this.request(url, { ...config, method: 'get' });
    }
    async delete(url, config) {
        return this.request(url, { ...config, method: 'delete' });
    }
    async head(url, config) {
        return this.request(url, { ...config, method: 'head' });
    }
    async post(url, data, config) {
        return this.request(url, data, { ...config, method: 'post' });
    }
    async put(url, data, config) {
        return this.request(url, data, { ...config, method: 'put' });
    }
    async patch(url, data, config) {
        return this.request(url, data, { ...config, method: 'patch' });
    }
    async request(...args) {
        const { circuitBreaker = {}, ...axiosConfig } = args.at(-1) || {};
        const { method, baseUrl } = axiosConfig || {};
        const fullUrl = baseUrl ? urljoin(baseUrl, args[0]) : args[0];
        return this.fireCircuitBreaker(fullUrl, circuitBreaker, method, ...args);
    }
    async fireCircuitBreaker(fullUrl, options = {}, method, ...args) {
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
                .on('open', () => this.logger.warn(`OPEN: The cb for ${url} just opened.`))
                .on('timeout', () => this.logger.warn(`TIMEOUT: ${url} is taking too long to respond.`))
                .on('halfOpen', () => this.logger.warn(`HALF_OPEN: The cb for ${url}  is half open.`))
                .on('close', () => this.logger.log(`CLOSE: The cb for ${url} has closed. Service OK.`));
        }
        if (args.length === 3) {
            args[0] = args[0];
            args[1] = {
                ...args[2],
                data: args[1],
            };
        }
        const startTime = args[1]?.responseLogging ? new Date().getTime() : 0;
        let responseData;
        return this.cbInstance[key]
            .fire(...args)
            .then((response) => {
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
                    state: this.cbInstance[key].toJSON(),
                });
                this.cbInstance[key];
            }
        });
    }
    logging(startTime, ...args) {
        const endTime = new Date().getTime();
        const duration = endTime - startTime;
        this.logger.log({
            message: args[1]?.url,
            config: args[1],
            duration,
            response: args.at(-1),
        });
    }
};
SafeRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], SafeRequestService);
exports.SafeRequestService = SafeRequestService;
//# sourceMappingURL=safe-request.service.js.map