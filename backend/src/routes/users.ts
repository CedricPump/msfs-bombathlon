// src/routes/users.ts

import express from 'express';
import { UsersController } from '../controllers';
import {AuthService} from "../services/authServices";
import {User} from "../models/User";

const router = express.Router();

// Define your routes using the imported controllers
router.get('/', UsersController.getAllUsers);
router.post('/', UsersController.createUser);
// Add other user-related routes

// login
router.post('/login', UsersController.login);
router.get('/session', UsersController.checkSession);
router.post('/refreshtoken', UsersController.refreshAccessToken);

export default router;