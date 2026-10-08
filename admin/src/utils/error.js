/**
 * Extracts a user-friendly error message from an API error response.
 * Handles Zod validation error arrays, custom API error structures, and network error fallbacks.
 *
 * @param {Error|Object} error - The caught Axios/fetch error object
 * @param {string} [fallback="An error occurred"] - Default fallback message
 * @returns {string} Clean error string
 */
export const getErrorMessage = (error, fallback = "An error occurred") => {
  if (!error) return fallback;

  if (error.response?.data) {
    const data = error.response.data;

    // 1. Check for Zod validation error list: { errors: [{ field, message }] }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const messages = data.errors
        .map((e) => (typeof e === "string" ? e : e.message || e.msg))
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join(". ");
      }
    }

    // 2. Check for string message that isn't generic "Validation failed"
    if (typeof data.message === "string" && data.message.trim() && data.message !== "Validation failed") {
      return data.message;
    }

    // 3. If message is "Validation failed" but data.errors was present (or empty), return detailed fallback
    if (data.message === "Validation failed") {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.map((e) => e.message || e.msg || e).filter(Boolean).join(". ");
      }
      return "Validation failed: Please check the required fields and criteria.";
    }

    // 4. Other fields like data.error
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  }

  return error.message || fallback;
};
