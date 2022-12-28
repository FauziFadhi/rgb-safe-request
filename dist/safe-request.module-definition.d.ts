import { SafeRequestModuleOptions } from './module-options.interface';
export declare const ConfigurableModuleClass: import("@nestjs/common").ConfigurableModuleCls<SafeRequestModuleOptions, "register", "create", {
    isGlobal: boolean;
}>, MODULE_OPTIONS_TOKEN: string | symbol, ASYNC_OPTIONS_TYPE: import("@nestjs/common").ConfigurableModuleAsyncOptions<SafeRequestModuleOptions, "create"> & {
    isGlobal: boolean;
}, OPTIONS_TYPE: SafeRequestModuleOptions & {
    isGlobal: boolean;
};
