// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number = 500) {
		super(message);
		this.statusCode = statusCode;
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

export const errorHandler = (
	err: Error | AppError,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// Si es un error personalizado, usar su statusCode
	const statusCode = err instanceof AppError ? err.statusCode : 500;

	// Mensaje genérico para errores internos
	const message =
		statusCode === 500 ? "Error interno del servidor" : err.message;

	console.error(`[ERROR] ${err.message}`); // log para debugging

	res.status(statusCode).json({
		success: false,
		error: message,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
};
