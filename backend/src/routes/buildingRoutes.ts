import { Router } from 'express';
import { buildingController } from '../controllers/buildingController';

const router = Router();

// 건물 CRUD
router.get('/', buildingController.getAllBuildings);
router.get('/:id', buildingController.getBuildingById);
router.post('/', buildingController.createBuilding);
router.put('/:id', buildingController.updateBuilding);
router.delete('/:id', buildingController.deleteBuilding);

// 분석 점수
router.put('/:id/analysis-score', buildingController.updateAnalysisScore);

// 임대차
router.post('/:id/leases', buildingController.addLease);

export default router;
