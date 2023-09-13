import { AuthError } from "./error.js";
import { AuthModule, AuthModuleOptions, IAuthUser, Principal } from "./module.js";

export class ApiKeyPrincipal<UserT extends IAuthUser> extends Principal<UserT> {

    constructor(module: ApiKeyAuth<UserT>, apiKey: string) {
        super(module, apiKey);
    }

}

/**
 * the authorization scheme defaulots to "bearer"
 */
export interface ApiKeyAuthOptions<UserT extends IAuthUser> extends AuthModuleOptions<ApiKeyPrincipal<UserT>, UserT> {
    prefixes: string[];
    scheme?: string;
}

export class ApiKeyAuth<UserT extends IAuthUser> extends AuthModule<ApiKeyPrincipal<UserT>, UserT> {

    prefixes: string[];
    scheme: string;

    constructor(opts: ApiKeyAuthOptions<UserT>) {
        super('apikey', opts);
        this.scheme = opts.scheme || 'bearer';
        this.prefixes = opts.prefixes;
        if (!this.prefixes || !this.prefixes.length) {
            throw new AuthError("ApiKey auth options must include a prefixes array", 500);
        }
    }

    authorize(authScheme: string, authToken: string): Promise<ApiKeyPrincipal<UserT> | undefined> {
        if (authScheme === this.scheme) {
            for (const prefix of this.prefixes) {
                if (authToken.startsWith(prefix)) {
                    return Promise.resolve(new ApiKeyPrincipal<UserT>(this, prefix));
                }
            }
        }
        return Promise.resolve(undefined);
    }
}
