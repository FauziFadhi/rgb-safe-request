import { Inject, Injectable } from '@nestjs/common';
import { SafeRequestModuleOptions } from './module-options.interface';
import { SafeRequestOptions } from './safe-request';
import { MODULE_OPTIONS_TOKEN } from './safe-request.module-definition';

@Injectable()
export class SafeRequestModuleService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: SafeRequestModuleOptions,
  ) {
    SafeRequestOptions.log = options.log;
    SafeRequestOptions.showLog = options.logging;
  }
}
1;
