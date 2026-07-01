import express from "express";
// Bypasses global parsing for Stripe webhook to preserve raw body signature
export const jsonParserBypassWebhook = (req, res, next) => {
    if (req.originalUrl === "/api/subscriptions/webhook") {
        next();
    }
    else {
        express.json({ limit: "10kb" })(req, res, next);
    }
};
export const urlencodedParserBypassWebhook = (req, res, next) => {
    if (req.originalUrl === "/api/subscriptions/webhook") {
        next();
    }
    else {
        express.urlencoded({ extended: true, limit: "10kb" })(req, res, next);
    }
};
//# sourceMappingURL=parser.middleware.js.map