import { Inject, Injectable } from '@nestjs/common';
import { SafeRequestModuleOptions } from './module-options.interface';
import { MODULE_OPTIONS_TOKEN } from './safe-request.module-definition';
import { SafeRequestModel } from './sequelize-cache';

@Injectable()
export class SafeRequestModuleService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: SafeRequestModuleOptions,
  ) {
    SafeRequestModel.log = options.log;
    SafeRequestModel.showLog = options.logging;
  }
}
1;
