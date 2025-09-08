export declare class ServerError extends Error {
    statusCode: number;
    details?: string;
    expose: boolean;
    constructor(msgOrCode1: string | number, msgOrCode2?: number | string, details?: string);
}
//# sourceMappingURL=ServerError.d.ts.map