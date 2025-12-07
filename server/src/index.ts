import express, { Express, Request, Response } from 'express';
import supertokens from 'supertokens-node';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import {// Trigger restart for prisma update
 logger } from './utils/logger';

import { middleware, errorHandler } from 'supertokens-node/framework/express';
import { initSuperTokens } from './config/supertokens';

import path from 'path';

const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  logger.error("Error loading .env file: " + result.error);
} else {
  logger.info(".env file loaded successfully");
}

initSuperTokens();

const app: Express = express();
const port = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
  credentials: true,
}));
app.use(hpp());

// SuperTokens Middleware
app.use(middleware());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Optimization & Logging
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

import memberRoutes from './routes/member.routes';
import eventRoutes from './routes/event.routes';
import userRoutes from './routes/user.routes';
import attendanceRoutes from './routes/attendance.routes';
import familyRoutes from './routes/family.routes';
import cellGroupRoutes from './routes/cellgroup.routes';
import ministryRoutes from './routes/ministry.routes';

// API Routes
import reportsRoutes from './routes/reports.routes';

app.use('/api/members', memberRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/cellgroups', cellGroupRoutes);
app.use('/api/ministries', ministryRoutes);
app.use('/api/reports', reportsRoutes);

// SuperTokens Error Handler
app.use(errorHandler());

// Server is running
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

export default app;
