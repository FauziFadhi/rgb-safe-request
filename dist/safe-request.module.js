"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeRequestModule = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const safe_request_abstract_1 = require("./safe-request.abstract");
const safe_request_module_definition_1 = require("./safe-request.module-definition");
const safe_request_module_service_1 = require("./safe-request.module-service");
const safe_request_service_1 = require("./safe-request.service");
let SafeRequestModule = class SafeRequestModule extends safe_request_module_definition_1.ConfigurableModuleClass {
};
SafeRequestModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule],
        providers: [
            { useClass: safe_request_service_1.SafeRequestService, provide: safe_request_abstract_1.SafeRequest },
            safe_request_module_service_1.SafeRequestModuleService,
        ],
        exports: [safe_request_abstract_1.SafeRequest],
    })
], SafeRequestModule);
exports.SafeRequestModule = SafeRequestModule;
//# sourceMappingURL=safe-request.module.js.map