import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// .env 파일 경로 명시적 지정 (process.cwd()는 backend 폴더)
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Failed to load .env file:', result.error);
} else {
  console.log('Loaded env vars:', Object.keys(result.parsed || {}).length);
}

import routes from './routes';

const app = express();
const PORT = process.env.PORT || 4500;

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3100',
  credentials: true,
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
