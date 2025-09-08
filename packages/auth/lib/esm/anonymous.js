import { AuthModule, AuthToken } from "./module.js";
export class AnonymousToken extends AuthToken {
    constructor(module) {
        super(module, "#anonymous");
    }
    get isAnonymous() {
        return true;
    }
}
export class AnonymousAuth extends AuthModule {
    authorize() {
        return Promise.resolve(new AnonymousToken(this));
    }
}
//# sourceMappingURL=anonymous.js.map