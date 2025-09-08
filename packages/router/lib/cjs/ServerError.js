"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = void 0;
class ServerError extends Error {
    constructor(msgOrCode1, msgOrCode2, details) {
        super();
        Object.defineProperty(this, "statusCode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "details", {
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
        this.name = 'ServerError';
        this.details = details;
        let message;
        if (!msgOrCode1 && !msgOrCode2) {
            message = 'Server error';
            this.statusCode = 500;
        }
        else if (msgOrCode2 == null) {
            if (typeof msgOrCode1 === 'number') {
                this.statusCode = msgOrCode1;
                message = String('Server error');
            }
            else {
                message = String(msgOrCode1);
                this.statusCode = 500;
            }
        }
        else {
            const type1 = typeof msgOrCode1;
            const type2 = typeof msgOrCode2;
            if (type1 === 'number') {
                this.statusCode = msgOrCode1;
                message = String(msgOrCode2);
            }
            else if (type2 === 'number') {
                this.statusCode = msgOrCode2;
                message = String(msgOrCode1);
            }
            else {
                message = String(msgOrCode1);
                this.statusCode = 500;
            }
        }
        this.message = this.statusCode + ' - ' + message;
    }
}
exports.ServerError = ServerError;
//# sourceMappingURL=ServerError.js.map