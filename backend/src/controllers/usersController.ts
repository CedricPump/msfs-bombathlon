// src/controllers/UsersController.ts

import { Request, Response } from 'express';
import { User } from '../models/User';
import * as bcrypt from 'bcrypt';

const mockUsers: User[] = [
    new User('1', 'user1', 'user1@example.com',"", "", ""),
    new User('2', 'user2', 'user2@example.com',"", "", ""),
    // Add more mock users
];

export class UsersController {
    static getAllUsers(req: Request, res: Response) {
        res.json(mockUsers);
    }

    static createUser(req: Request, res: Response) {
        const newUser = new User(req.body.id, req.body.username, req.body.email, "", "", "");
        mockUsers.push(newUser);
        res.status(201).json(newUser);
    }


// Add other user-related controller functions
    static getUserByUsername(username: string): User  {
        return new User("", "", "", "", "", "")
    }
}
