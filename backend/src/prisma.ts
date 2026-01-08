import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// 환경변수 로드 (process.cwd()는 backend 폴더)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export default prisma;
