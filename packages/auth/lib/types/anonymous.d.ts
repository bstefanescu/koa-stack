import { AuthModule, AuthToken } from "./module.js";
export declare class AnonymousToken<PrincipalT> extends AuthToken<PrincipalT> {
    constructor(module: AnonymousAuth<PrincipalT>);
    get isAnonymous(): boolean;
}
export declare class AnonymousAuth<PrincipalT> extends AuthModule<AnonymousToken<PrincipalT>, PrincipalT> {
    authorize(): Promise<AnonymousToken<PrincipalT> | undefined>;
}
//# sourceMappingURL=anonymous.d.ts.map