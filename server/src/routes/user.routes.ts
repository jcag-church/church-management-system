import { Router } from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { getUsers, updateUserRole, deleteUser, getMe } from '../controllers/user.controller';

const router = Router();

router.get('/me', verifySession(), getMe);
router.get('/', verifySession(), getUsers);
router.put('/:id/role', verifySession(), updateUserRole);
router.delete('/:id', verifySession(), deleteUser);

export default router;
