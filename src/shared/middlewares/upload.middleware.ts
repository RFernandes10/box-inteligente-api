import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import { AppError } from '../errors/AppError';

const MAGIC_BYTES: Record<string, Buffer> = {
  'image/jpeg': Buffer.from([0xFF, 0xD8, 0xFF]),
  'image/png': Buffer.from([0x89, 0x50, 0x4E, 0x47]),
  'image/webp': Buffer.from([0x52, 0x49, 0x46, 0x46]),
};

function validateMagicBytes(filePath: string, mimetype: string): boolean {
  const magic = MAGIC_BYTES[mimetype];
  if (!magic) return false;
  try {
    const buffer = Buffer.alloc(magic.length);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, magic.length, 0);
    fs.closeSync(fd);
    return buffer.equals(magic);
  } catch {
    return false;
  }
}

const storage = multer.diskStorage({
  destination: path.resolve(env.UPLOAD_PATH, 'products'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Formato de arquivo não suportado. Use JPG, PNG ou WEBP.', 400, 'INVALID_FILE_FORMAT'));
  }
};

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
  },
});

function validateUploadedFile(req: Express.Request, _res: Express.Response, next: NextFunction) {
  if (req.file) {
    const filePath = path.resolve(env.UPLOAD_PATH, 'products', req.file.filename);
    if (!validateMagicBytes(filePath, req.file.mimetype)) {
      fs.unlinkSync(filePath);
      return next(new AppError('Arquivo inválido ou corrompido', 400, 'INVALID_FILE_CONTENT'));
    }
  }
  next();
}

export const upload = {
  single: (fieldName: string) => [uploadMiddleware.single(fieldName), validateUploadedFile],
};
