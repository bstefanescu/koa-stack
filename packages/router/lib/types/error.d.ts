import { Context } from 'koa';
export type ErrorFormatter = (info: ErrorInfo, error: Error | any, opts: ErrorHandlerOpts) => string;
export declare enum ErrorContentType {
    "html" = 0,
    "json" = 1,
    "xml" = 2,
    "text" = 3
}
export interface ErrorInfo {
    status: number;
    statusCode: number;
    expose: boolean;
    ctypes?: ErrorContentType | ErrorContentType[];
    message?: string;
    details?: string;
    error?: string;
}
export interface ErrorHandlerOpts {
    htmlRoot?: string;
    renderHTML?: (content: string, info: ErrorInfo, error: Error | object, opts: ErrorHandlerOpts) => string;
    ctypes?: ErrorContentType | ErrorContentType[];
    json?: ErrorFormatter;
    xml?: ErrorFormatter;
    html?: ErrorFormatter;
    text?: ErrorFormatter;
    log?: (ctx: Context, error: Error | object, info?: ErrorInfo | undefined) => void;
    /**
     * Update / adjust the generated error info object
     * The error info is used to write the response to the client (and can also be used by the log function)
     */
    updateErrorInfo?: (ctx: Context, error: Error | object, info: ErrorInfo) => void;
}
/**
 * Allowed options: {
 *  dir,
 *  json,
 *  html,
 *  text,
 *  renderHTML
 * }
 * @param {*} opts
 * @returns
 */
export declare function errorHandler(ctx: Context, err: Error | any, opts?: ErrorHandlerOpts): void;
//# sourceMappingURL=error.d.ts.map