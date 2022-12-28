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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeRequestModuleService = void 0;
const common_1 = require("@nestjs/common");
const safe_request_module_definition_1 = require("./safe-request.module-definition");
const safe_request_model_1 = require("./safe-request.model");
let SafeRequestModuleService = class SafeRequestModuleService {
    constructor(options) {
        this.options = options;
        safe_request_model_1.SafeRequestModel.log = options.log;
        safe_request_model_1.SafeRequestModel.showLog = options.logging;
    }
};
SafeRequestModuleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(safe_request_module_definition_1.MODULE_OPTIONS_TOKEN)),
    __metadata("design:paramtypes", [Object])
], SafeRequestModuleService);
exports.SafeRequestModuleService = SafeRequestModuleService;
1;
//# sourceMappingURL=safe-request.module-service.js.map