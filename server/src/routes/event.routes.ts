import { Router } from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  updateRegistration,
  deleteRegistration,
} from '../controllers/event.controller';

const router = Router();

router.use(verifySession());

router.get('/', getEvents);
router.post('/', createEvent);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

// Registration routes
router.post('/:id/registrations', registerForEvent);
router.put('/:id/registrations/:registrationId', updateRegistration);
router.delete('/:id/registrations/:registrationId', deleteRegistration);

export default router;
