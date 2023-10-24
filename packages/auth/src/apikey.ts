import { AuthError } from "./error.js";
import { AuthModule, AuthModuleOptions, AuthToken } from "./module.js";

export class ApiKeyToken<PrincipalT> extends AuthToken<PrincipalT> {

    constructor(module: ApiKeyAuth<PrincipalT>, apiKey: string) {
        super(module, apiKey);
    }

}

/**
 * the authorization scheme defaulots to "bearer"
 */
export interface ApiKeyAuthOptions<PrincipalT> extends AuthModuleOptions<ApiKeyToken<PrincipalT>, PrincipalT> {
    prefixes: string[];
    scheme?: string;
}

export class ApiKeyAuth<PrincipalT> extends AuthModule<ApiKeyToken<PrincipalT>, PrincipalT> {

    prefixes: string[];
    scheme: string;

    constructor(opts: ApiKeyAuthOptions<PrincipalT>) {
        super('apikey', opts);
        this.scheme = opts.scheme || 'bearer';
        this.prefixes = opts.prefixes;
        if (!this.prefixes || !this.prefixes.length) {
            throw new AuthError("ApiKey auth options must include a prefixes array", 500);
        }
    }

    authorize(authScheme: string, authToken: string): Promise<ApiKeyToken<PrincipalT> | undefined> {
        if (authScheme === this.scheme) {
            for (const prefix of this.prefixes) {
                if (authToken.startsWith(prefix)) {
                    return Promise.resolve(new ApiKeyToken<PrincipalT>(this, authToken));
                }
            }
        }
        return Promise.resolve(undefined);
    }
}
