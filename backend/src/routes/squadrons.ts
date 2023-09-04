// src/routes/squadrons.ts

import express from 'express';
import { SquadronsController } from '../controllers';

const router = express.Router();

// Define your routes
router.post('/', SquadronsController.createSquadron);
// Add other squadron-related routes

export default router;