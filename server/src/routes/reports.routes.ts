import { Router } from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { getAttendanceMetrics } from '../controllers/reports.controller';

const router = Router();

router.get('/attendance', verifySession(), getAttendanceMetrics);

export default router;
