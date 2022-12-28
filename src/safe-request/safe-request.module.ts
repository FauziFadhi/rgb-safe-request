import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SafeRequest } from './safe-request.abstract';
import { ConfigurableModuleClass } from './safe-request.module-definition';
import { SafeRequestModuleService } from './safe-request.module-service';
import { SafeRequestService } from './safe-request.service';

@Module({
  imports: [HttpModule],
  providers: [
    {
      useClass: SafeRequestService,
      provide: SafeRequest,
    },
    SafeRequestModuleService,
  ],
  exports: [SafeRequest],
})
export class SafeRequestModule extends ConfigurableModuleClass {}
