export class AuthError extends Error {
    statusCode: number;
    expose = true; // this will expose the error to the client - see error handling in @koa-stack/server
    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'AuthError';
        this.statusCode = statusCode;
    }

    static notAuthorized(message?: string) {
        return new AuthError('Unauthorized' + (message ? ': ' + message : ''), 401);
    }

    static noMatchingUserFound(message?: string) {
        return new AuthError('No matching user found' + (message ? ': ' + message : ''), 401);
    }

    static notSupported(message?: string) {
        return new AuthError('Feature not supported' + (message ? ': ' + message : ''), 401);
    }

    static malformedAuthorizationHeader(message?: string) {
        return new AuthError('Malformed authorization header' + (message ? ': ' + message : ''), 401)
    }

    static unexpectedError(message?: string) {
        return new AuthError('Unexpected error' + (message ? ': ' + message : ''), 500);
    }
}
