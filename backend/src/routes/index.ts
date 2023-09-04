// src/routes/index.ts

import express from 'express';
import usersRoutes from './users';
import squadronsRoutes from './squadrons';
import flightRoutes from './flight';
import {AuthService} from "../services/authServices";

const router = express.Router();

router.use(AuthService.authMiddleware);
router.use('/user', usersRoutes);
router.use('/squadron', squadronsRoutes);
router.use('/flight', flightRoutes)



export default router;

