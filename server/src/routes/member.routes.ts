import { Router } from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { createMember, getMembers, getMemberById, updateMember, deleteMember } from '../controllers/member.controller';

const router = Router();

// Protect all member routes with SuperTokens session verification
router.use(verifySession());

router.post('/', createMember);
router.get('/', getMembers);
router.get('/:id', getMemberById);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

export default router;
