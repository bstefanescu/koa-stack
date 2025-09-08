"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
class AuthError extends Error {
    constructor(message, statusCode) {
        super(message);
        Object.defineProperty(this, "statusCode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "expose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        }); // this will expose the error to the client - see error handling in @koa-stack/server
        this.name = 'AuthError';
        this.statusCode = statusCode;
    }
    static notAuthorized(message) {
        return new AuthError('Unauthorized' + (message ? ': ' + message : ''), 401);
    }
    static noMatchingUserFound(message) {
        return new AuthError('No matching user found' + (message ? ': ' + message : ''), 401);
    }
    static notSupported(message) {
        return new AuthError('Feature not supported' + (message ? ': ' + message : ''), 401);
    }
    static malformedAuthorizationHeader(message) {
        return new AuthError('Malformed authorization header' + (message ? ': ' + message : ''), 401);
    }
    static unexpectedError(message) {
        return new AuthError('Unexpected error' + (message ? ': ' + message : ''), 500);
    }
}
exports.AuthError = AuthError;
//# sourceMappingURL=error.js.map