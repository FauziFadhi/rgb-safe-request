import { ILogInterface } from './safe-request.model';

export interface SafeRequestModuleOptions {
  /** show log */
  logging?: boolean;

  log?: (value: ILogInterface) => void;
}
