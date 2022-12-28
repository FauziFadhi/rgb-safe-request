import { CONFIG } from './safe-request.interface';
export interface ILogInterface {
    config: CONFIG;
    message: string;
    stack: unknown;
    response: unknown;
    duration: number;
}
export declare class SafeRequestModel {
    static log: (value: ILogInterface) => void;
    static showLog: boolean;
}
