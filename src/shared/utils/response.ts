import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse(res: Response, data: unknown, message = 'Operação realizada com sucesso', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function paginatedResponse(res: Response, data: unknown[], pagination: PaginationMeta, message = 'Operação realizada com sucesso') {
  return res.status(200).json({
    success: true,
    data,
    pagination,
    message,
  });
}

export function errorResponse(res: Response, message: string, statusCode = 400, code = 'BAD_REQUEST', details?: unknown[]) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(details && { details }),
  });
}
