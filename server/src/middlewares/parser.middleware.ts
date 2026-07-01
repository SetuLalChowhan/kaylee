import express from "express";
import type { Request, Response, NextFunction } from "express";

// Bypasses global parsing for Stripe webhook to preserve raw body signature
export const jsonParserBypassWebhook = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/api/subscriptions/webhook") {
    next();
  } else {
    express.json({ limit: "10kb" })(req, res, next);
  }
};

export const urlencodedParserBypassWebhook = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/api/subscriptions/webhook") {
    next();
  } else {
    express.urlencoded({ extended: true, limit: "10kb" })(req, res, next);
  }
};
