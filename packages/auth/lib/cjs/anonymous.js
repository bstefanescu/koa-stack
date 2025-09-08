"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonymousAuth = exports.AnonymousToken = void 0;
const module_js_1 = require("./module.js");
class AnonymousToken extends module_js_1.AuthToken {
    constructor(module) {
        super(module, "#anonymous");
    }
    get isAnonymous() {
        return true;
    }
}
exports.AnonymousToken = AnonymousToken;
class AnonymousAuth extends module_js_1.AuthModule {
    authorize() {
        return Promise.resolve(new AnonymousToken(this));
    }
}
exports.AnonymousAuth = AnonymousAuth;
//# sourceMappingURL=anonymous.js.map