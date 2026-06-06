import { Router } from 'express';
import * as utilityController from '../controllers/utility.controller';

const router = Router();

router.get('/states', utilityController.getStates);
router.get('/districts', utilityController.getDistricts);
router.post('/reverse-geocode', utilityController.handleReverseGeocode);

export default router;
