import { Request, Response } from 'express';
import { parseBuildingPdf } from '../services/pdfParserService';

export const pdfController = {
  // POST /api/pdf/parse
  async parsePdf(req: Request, res: Response) {
    try {
      console.log('PDF parse request received');

      if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({ success: false, error: 'No PDF file uploaded' });
      }

      console.log('File received:', req.file.originalname, 'Size:', req.file.size);

      const parsedData = await parseBuildingPdf(req.file.buffer);

      console.log('Parsed data:', JSON.stringify(parsedData, null, 2).substring(0, 500));

      res.json({
        success: true,
        data: parsedData,
      });
    } catch (error) {
      console.error('Error parsing PDF:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      res.status(500).json({
        success: false,
        error: 'Failed to parse PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};
