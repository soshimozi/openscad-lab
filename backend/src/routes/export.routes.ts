import { Router } from 'express';
import multer from 'multer';
import {
  postExport,
  getExportStatus,
  downloadExport
} from '../controllers/export.controller';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage()
});

router.post('/', upload.single('file'), postExport);
router.get('/:jobId', getExportStatus);
router.get('/:jobId/download', downloadExport);

export default router;