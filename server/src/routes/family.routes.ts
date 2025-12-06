import { Router } from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { getFamilies, createFamily, updateFamily, deleteFamily } from '../controllers/family.controller';

const router = Router();

router.get('/', verifySession(), getFamilies);
router.post('/', verifySession(), createFamily);
router.put('/:id', verifySession(), updateFamily);
router.delete('/:id', verifySession(), deleteFamily);

export default router;
