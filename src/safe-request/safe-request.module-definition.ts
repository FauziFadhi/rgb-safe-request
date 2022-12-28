import { ConfigurableModuleBuilder } from '@nestjs/common';
import { SafeRequestModuleOptions } from './module-options.interface';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<SafeRequestModuleOptions>()
  .setFactoryMethodName('createSafeRequestOptions')
  .build();
