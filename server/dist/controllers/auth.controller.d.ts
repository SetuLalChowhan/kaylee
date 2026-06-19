import type { Request, Response, NextFunction } from "express";
export declare const register: (req: Request, res: Response, next: NextFunction) => void;
export declare const verifyEmail: (req: Request, res: Response, next: NextFunction) => void;
export declare const login: (req: Request, res: Response, next: NextFunction) => void;
export declare const googleLogin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
export declare const resendOtp: (req: Request, res: Response, next: NextFunction) => void;
export declare const verifyResetOtp: (req: Request, res: Response, next: NextFunction) => void;
export declare const resetPassword: (req: Request, res: Response, next: NextFunction) => void;
export declare const refreshTokenHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const logout: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.controller.d.ts.map