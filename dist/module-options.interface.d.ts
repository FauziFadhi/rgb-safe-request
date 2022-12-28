import { ILogInterface } from './safe-request.model';
export interface SafeRequestModuleOptions {
    logging?: boolean;
    log?: (value: ILogInterface) => void;
}
