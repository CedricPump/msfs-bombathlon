// src/routes/index.ts

import express from 'express';
import usersRoutes from './users';
import squadronsRoutes from './squadrons';

const router = express.Router();

router.use('/users', usersRoutes);
router.use('/squadrons', squadronsRoutes);
// Add other route usages here

export default router;