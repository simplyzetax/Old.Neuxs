import { MiddlewareHandler } from "hono";
import { ApiError, ResponseBody } from "../aids/error/error.utility";

export const addSendStatus: MiddlewareHandler = (c, next) => {
    c.sendStatus = function(statusCode: number) {
        this.status(statusCode);
        return this.body(null);
    };

    return next();
};

export const addIniSend: MiddlewareHandler = (c, next) => {
    c.sendIni = function(ini: string) {
        this.res.headers.set("Content-Type", "text/plain");
        return this.body(ini);
    };

    return next();
}

export const addErrorSend: MiddlewareHandler = (c, next) => {
    c.sendError = function(error: ApiError) {
        c.status(error.statusCode);
        return this.json(error);
    };
    return next();
};