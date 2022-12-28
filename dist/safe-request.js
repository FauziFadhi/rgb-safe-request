"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeRequestOptions = void 0;
class SafeRequestOptions {
    static logging(value) {
        if (!SafeRequestOptions.showLog)
            return;
        if (SafeRequestOptions.log)
            SafeRequestOptions.log(value);
    }
}
exports.SafeRequestOptions = SafeRequestOptions;
//# sourceMappingURL=safe-request.js.map