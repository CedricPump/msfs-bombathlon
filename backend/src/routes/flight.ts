// src/routes/squadrons.ts

import express from 'express';
import {FlightController} from "../controllers/flightController";

const router = express.Router();

// Define your routes
router.post('/data', FlightController.receiveFlightData);


export default router;