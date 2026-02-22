import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export function requestIdMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const id = randomUUID();
    req.headers["x-request-id"] = id;
    next();
}
