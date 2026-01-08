import { Router } from 'express';
import buildingRoutes from './buildingRoutes';
import leaseRoutes from './leaseRoutes';
import pdfRoutes from './pdfRoutes';

const router = Router();

router.use('/buildings', buildingRoutes);
router.use('/leases', leaseRoutes);
router.use('/pdf', pdfRoutes);

export default router;
