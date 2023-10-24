import { AuthModule, AuthToken } from "./module.js";

export class AnonymousToken<PrincipalT> extends AuthToken<PrincipalT> {

    constructor(module: AnonymousAuth<PrincipalT>) {
        super(module, "#anonymous");
    }

    get isAnonymous() {
        return true;
    }
}


export class AnonymousAuth<PrincipalT> extends AuthModule<AnonymousToken<PrincipalT>, PrincipalT> {

    authorize(): Promise<AnonymousToken<PrincipalT> | undefined> {
        return Promise.resolve(new AnonymousToken<PrincipalT>(this));
    }

} 
