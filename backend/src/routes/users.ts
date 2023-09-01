// src/routes/users.ts

import express from 'express';
import { UsersController } from '../controllers';
import {AuthService} from "../services/authServices";
import {User} from "../models/User";

const router = express.Router();

router.get('/', UsersController.getAllUsers);
router.post('/register', UsersController.createUser);

// login
router.post('/login', UsersController.login);
router.get('/session', UsersController.checkSession);
router.post('/refreshtoken', UsersController.refreshAccessToken);

export default router;