/**
 * Wraps an async Express handler and forwards any thrown error
 * to the global error handler via `next(err)`.
 */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
//# sourceMappingURL=catchAsync.js.map