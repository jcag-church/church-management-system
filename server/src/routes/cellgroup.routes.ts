import { Router } from 'express';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { getCellGroups, createCellGroup, updateCellGroup, deleteCellGroup } from '../controllers/cellgroup.controller';

const router = Router();

router.get('/', verifySession(), getCellGroups);
router.post('/', verifySession(), createCellGroup);
router.put('/:id', verifySession(), updateCellGroup);
router.delete('/:id', verifySession(), deleteCellGroup);

export default router;
