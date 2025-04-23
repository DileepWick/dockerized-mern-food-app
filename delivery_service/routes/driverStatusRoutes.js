import express from 'express';
import {
  updateDriverStatus,
  getDriverStatus,
  getAvailableDrivers,
  findNearestDrivers
} from '../controllers/driverStatusController.js';

const router = express.Router();

router.post('/update', updateDriverStatus);
router.get('/:driverId', getDriverStatus);
router.get('/', getAvailableDrivers);
router.get('/nearest/find', findNearestDrivers);

export default router;