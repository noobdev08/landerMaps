import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { uploadFile, deleteMap, editMap, getMaps, postMaps } from '../controllers/adminController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/maps', getMaps);
router.post('/maps', postMaps);
router.patch('/maps/:id', editMap);
router.delete('/maps/:id', deleteMap);

export default router;