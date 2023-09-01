// src/routes/index.ts

import express from 'express';
import usersRoutes from './users';
import squadronsRoutes from './squadrons';
import {AuthService} from "../services/authServices";

const router = express.Router();

router.use(AuthService.authMiddleware);
router.use('/users', usersRoutes);
router.use('/squadrons', squadronsRoutes);



export default router;