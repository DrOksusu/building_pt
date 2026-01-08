import { Router } from 'express';
import { buildingController } from '../controllers/buildingController';

const router = Router();

router.delete('/:id', buildingController.deleteLease);

export default router;
