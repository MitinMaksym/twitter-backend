
//type ErrorType = Error & CastError

class AppError extends Error {
  public isOperational: boolean;
  public status: string;
  public code?: number;
  public errors: Array<Error> = []
  public path?: string;
  public value?: string;
  public errmsg?: string;

  constructor(public message: string, public statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
  
  export default AppError