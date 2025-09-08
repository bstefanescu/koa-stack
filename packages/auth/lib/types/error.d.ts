export declare class AuthError extends Error {
    statusCode: number;
    expose: boolean;
    constructor(message: string, statusCode: number);
    static notAuthorized(message?: string): AuthError;
    static noMatchingUserFound(message?: string): AuthError;
    static notSupported(message?: string): AuthError;
    static malformedAuthorizationHeader(message?: string): AuthError;
    static unexpectedError(message?: string): AuthError;
}
//# sourceMappingURL=error.d.ts.map