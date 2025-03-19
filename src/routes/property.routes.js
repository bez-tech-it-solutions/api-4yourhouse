import { Router } from 'express';
import { getProperties, getSingleProperty } from '../controllers/property.controller.js';

const router = Router();

router.get('/properties', getProperties);
router.get('/properties/:id', getSingleProperty);

export default router;