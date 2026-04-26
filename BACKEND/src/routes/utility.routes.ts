import { Router } from 'express';
import * as utilityController from '../controllers/utility.controller';

const router = Router();

router.get('/states', utilityController.getStates);
router.get('/districts', utilityController.getDistricts);

export default router;
