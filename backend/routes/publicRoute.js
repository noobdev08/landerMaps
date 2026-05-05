import express from 'express';
import { getMapDetail, getMapList } from '../controllers/publicController.js';

const router = express.Router();

router.get('/', getMapList);
router.get('/:id', getMapDetail)

export default router