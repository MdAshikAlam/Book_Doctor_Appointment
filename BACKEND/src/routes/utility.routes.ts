import { Router } from 'express';
import * as utilityController from '../controllers/utility.controller';

const router = Router();

router.get('/geocode', utilityController.geocodeCity);

export default router;
