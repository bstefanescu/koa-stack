import { AuthModule, AuthModuleOptions, AuthToken } from "./module.js";
export declare class ApiKeyToken<PrincipalT> extends AuthToken<PrincipalT> {
    constructor(module: ApiKeyAuth<PrincipalT>, apiKey: string);
}
/**
 * the authorization scheme defaulots to "bearer"
 */
export interface ApiKeyAuthOptions<PrincipalT> extends AuthModuleOptions<ApiKeyToken<PrincipalT>, PrincipalT> {
    prefixes: string[];
    scheme?: string;
}
export declare class ApiKeyAuth<PrincipalT> extends AuthModule<ApiKeyToken<PrincipalT>, PrincipalT> {
    prefixes: string[];
    scheme: string;
    constructor(opts: ApiKeyAuthOptions<PrincipalT>);
    authorize(authScheme: string, authToken: string): Promise<ApiKeyToken<PrincipalT> | undefined>;
}
//# sourceMappingURL=apikey.d.ts.map