require('dotenv').config();
import express, { Request, Response } from 'express';
import config from 'config';
import validateEnv from '../utils/validateEnv';
import { PrismaClient } from '@prisma/client';

validateEnv();

const prisma = new PrismaClient();
const app = express();

async function bootstrap() {

  app.get('/api/healthcheck', (req: Request, res: Response) => {
    const message = 'Hello, welcome to thirdspace API.';
    res.status(200).json({
      status: 'success',
      message,
    });
  });

  const port = config.get<number>('port');
  app.listen(port, () => {
    console.log(`Server on port: ${port}`);
  });
}



bootstrap()
  .catch((err) => {
    throw err;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
