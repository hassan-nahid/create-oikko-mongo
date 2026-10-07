import { NextFunction, Request, Response } from "express";


export const validateRequest = (zodSchema: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body?.data) {
            req.body = req.body.data;
        }

        const parsed = await zodSchema.parseAsync({
            body: req.body || {},
            query: req.query,
            params: req.params,
        });

        req.body = parsed.body;
        next();
    } catch (error) {
        next(error);
    }
}