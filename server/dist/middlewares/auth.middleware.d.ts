import type { Request, Response, NextFunction } from "express";
export interface JwtPayload {
    userId: string;
    role: string;
    type?: string;
    iat: number;
    exp: number;
}
export declare const requireUserId: (req: Request) => string;
export declare const authGuard: (req: Request, _res: Response, next: NextFunction) => void;
export declare const adminGuard: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map