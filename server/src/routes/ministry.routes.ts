import { Router } from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { createMinistry, getMinistries, getMinistryById, updateMinistry, deleteMinistry } from '../controllers/ministry.controller';

const router = Router();

// Protect all ministry routes with SuperTokens session verification
router.use(verifySession());

router.post('/', createMinistry);
router.get('/', getMinistries);
router.get('/:id', getMinistryById);
router.put('/:id', updateMinistry);
router.delete('/:id', deleteMinistry);

export default router;
