class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
  
    // Duplicate key error (e.g., duplicate email)
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
      err = new ErrorHandler(message, 400);
    }
  
    // JWT errors
    if (err.name === "JsonWebTokenError") {
      const message = "Json Web Token is invalid, Try Again!";
      err = new ErrorHandler(message, 400);
    }
  
    if (err.name === "TokenExpiredError") {
      const message = "Json Web Token is Expired, Try Again!";
      err = new ErrorHandler(message, 400);
    }
  
    // Mongoose CastError (invalid _id, etc.)
    if (err.name === "CastError") {
      const message = `Invalid ${err.path}`;
      err = new ErrorHandler(message, 400);
    }
  
    // Validation Errors (from Mongoose)
    const errorMessage = err.errors
      ? Object.values(err.errors)
          .map((error) => error.message)
          .join(" ")
      : err.message;
  
    return res.status(err.statusCode).json({
      success: false,
      message: errorMessage, // ✅ Correct spelling
    });
  };
  
  export default ErrorHandler;
  