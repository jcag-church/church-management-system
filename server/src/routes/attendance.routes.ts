import { Router } from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { checkIn, undoCheckIn, getAttendance, getAttendanceSummary, getAttendanceDates } from '../controllers/attendance.controller';
import { validateResource } from '../middleware/validateResource';
import { checkInSchema } from '../schemas/attendance.schema';

const router = Router();

router.post('/check-in', verifySession(), validateResource(checkInSchema), checkIn);
router.post('/check-in/undo', verifySession(), validateResource(checkInSchema), undoCheckIn);
router.get('/summary', verifySession(), getAttendanceSummary);
router.get('/dates', verifySession(), getAttendanceDates);
router.get('/', verifySession(), getAttendance);

export default router;
