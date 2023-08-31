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

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user: User = UsersController.getUserByUsername(username);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await AuthService.validatePassword(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = await AuthService.generateToken(user.id);
        if (!token) {
            return res.status(500).json({ message: 'Failed to generate token' });
        }

        return res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'An error occurred' });
    }
});

export default router;