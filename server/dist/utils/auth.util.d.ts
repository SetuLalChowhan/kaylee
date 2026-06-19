export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashed: string) => Promise<boolean>;
/**
 * Short-lived access token — expires in 15 minutes.
 */
export declare const generateAccessToken: (payload: object) => string;
/**
 * Long-lived refresh token — expires in 7 days.
 */
export declare const generateRefreshToken: (payload: object) => string;
/**
 * Short-lived password-reset token — expires in 10 minutes.
 */
export declare const generateResetToken: (payload: object) => string;
//# sourceMappingURL=auth.util.d.ts.map