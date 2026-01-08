import { Request, Response } from 'express';
import { buildingService } from '../services/buildingService';

export const buildingController = {
  // GET /api/buildings
  async getAllBuildings(req: Request, res: Response) {
    try {
      const buildings = await buildingService.getAllBuildings();
      res.json({ success: true, data: buildings });
    } catch (error) {
      console.error('Error fetching buildings:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch buildings' });
    }
  },

  // GET /api/buildings/:id
  async getBuildingById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const building = await buildingService.getBuildingById(id);
      
      if (!building) {
        return res.status(404).json({ success: false, error: 'Building not found' });
      }
      
      res.json({ success: true, data: building });
    } catch (error) {
      console.error('Error fetching building:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch building' });
    }
  },

  // POST /api/buildings
  async createBuilding(req: Request, res: Response) {
    try {
      console.log('Creating building with data:', JSON.stringify(req.body, null, 2));
      const building = await buildingService.createBuilding(req.body);
      res.status(201).json({ success: true, data: building });
    } catch (error: any) {
      console.error('Error creating building:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      res.status(500).json({
        success: false,
        error: 'Failed to create building',
        details: error?.message || 'Unknown error'
      });
    }
  },

  // PUT /api/buildings/:id
  async updateBuilding(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const building = await buildingService.updateBuilding(id, req.body);
      res.json({ success: true, data: building });
    } catch (error) {
      console.error('Error updating building:', error);
      res.status(500).json({ success: false, error: 'Failed to update building' });
    }
  },

  // DELETE /api/buildings/:id
  async deleteBuilding(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await buildingService.deleteBuilding(id);
      res.json({ success: true, message: 'Building deleted successfully' });
    } catch (error) {
      console.error('Error deleting building:', error);
      res.status(500).json({ success: false, error: 'Failed to delete building' });
    }
  },

  // PUT /api/buildings/:id/analysis-score
  async updateAnalysisScore(req: Request, res: Response) {
    try {
      const buildingId = parseInt(req.params.id);
      const score = await buildingService.updateAnalysisScore(buildingId, req.body);
      res.json({ success: true, data: score });
    } catch (error) {
      console.error('Error updating analysis score:', error);
      res.status(500).json({ success: false, error: 'Failed to update analysis score' });
    }
  },

  // POST /api/buildings/:id/leases
  async addLease(req: Request, res: Response) {
    try {
      const buildingId = parseInt(req.params.id);
      const lease = await buildingService.addLease(buildingId, req.body);
      res.status(201).json({ success: true, data: lease });
    } catch (error) {
      console.error('Error adding lease:', error);
      res.status(500).json({ success: false, error: 'Failed to add lease' });
    }
  },

  // DELETE /api/leases/:id
  async deleteLease(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      await buildingService.deleteLease(id);
      res.json({ success: true, message: 'Lease deleted successfully' });
    } catch (error) {
      console.error('Error deleting lease:', error);
      res.status(500).json({ success: false, error: 'Failed to delete lease' });
    }
  },
};
