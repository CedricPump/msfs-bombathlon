// src/controllers/UsersController.ts

import { Request, Response } from 'express';
import { User } from '../models/User';
import { CockroachDbService } from '../services/dbService';
import { AuthService } from  '../services/authServices';
import {QueryResult} from "pg";
import NodeCache from "node-cache";

const userCache = new NodeCache({ stdTTL: 30 * 60 }); // 39 min

export class UsersController {

    private static db: CockroachDbService = CockroachDbService.getInstance()

    static getAllUsers(req: Request, res: Response) {
        console.log(`get all users`)
        var result = UsersController.db.query("SELECT * FROM users").then((result: QueryResult) => {

            const users: User[] = result.rows.map(row => new User(
                row.id,
                row.username,
                row.email,
                row.currentairport,
                row.password_hash,
                row.password_salt
            ));
            res.status(200).json(users)
        })
    }

    static async login(req: Request, res: Response) {

        const { email, password } = req.body;
        console.log(`login: ${email}`)

        try {
            const user: User = await UsersController.getUserByEmail(email);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isPasswordValid = await AuthService.validatePassword(password, user.passwordHash);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const tokens = await AuthService.generateTokens(user.id);
            if (!tokens) {
                return res.status(500).json({ message: 'Failed to generate token' });
            }

            console.log("return tokens")
            return res.status(200).json({ "accessToken": tokens.accessToken, "refreshToken": tokens.refreshToken });
        } catch (error) {
            if(error instanceof UserNotFoundException) {
                return res.status(404).json({message: 'User not found'});
            }
            console.error('Login error:', error);
            return res.status(500).json({ message: 'An error occurred' });
        }
    }

    static async createUser(req: Request, res: Response) {
        console.log(`createUser: ${req.body.username}`);
        var password_hash = await AuthService.hashPassword(req.body.password);

        UsersController.db.query("INSERT INTO users (id, username, email, password_hash, password_salt) VALUES ( UUID_GENERATE_V4(), $1, $2, $3, $4);", [req.body.username, req.body.email, password_hash, ""])
            .then((result: QueryResult) => {
                // Successful insertion
                res.status(201).json({"success": true});
            })
            .catch(error => {
                if (error.code === '23505') { // PostgreSQL unique constraint violation error code
                    console.error('Duplicate email address detected.');
                    res.status(404).json({"message": "Email already in use"});
                    // Handle the duplicate email address error
                } else {
                    console.error('Unhandled error:', error);
                    res.status(500).json({"message": "Internal server error"});
                    // Handle other types of errors
                }
            });
    }


    static getUserById(id: string): Promise<User> {
        const cachedUser = userCache.get(id);
        if (cachedUser) {
            return Promise.resolve(cachedUser as User);
        }

        return UsersController.db.query("SELECT * FROM users WHERE id = $1;", [id]).then((result: QueryResult) => {
            const users: User[] = result.rows.map(row => new User(
                row.id,
                row.username,
                row.email,
                row.currentairport,
                row.password_hash,
                row.password_salt
            ));
            if(users.length == 0 ) {
                throw new Error("User not found")
            }

            const user = users[0];
            if (user) {
                userCache.set(user.id, user); // Cache the user data
            }

            return user;
        }).catch(error => {
            throw error; // Rethrow the error for further handling
        });
    }

    static getUserByUsername(username: string): Promise<User> {
        const cachedUser = userCache.get(username);
        if (cachedUser) {
            return Promise.resolve(cachedUser as User);
        }

        return UsersController.db.query("SELECT * FROM users WHERE username = $1;", [username]).then((result: QueryResult) => {
            const users: User[] = result.rows.map(row => new User(
                row.id,
                row.username,
                row.email,
                row.currentairport,
                row.password_hash,
                row.password_salt
            ));
            if(users.length == 0 ) {
                throw new Error("User not found")
            }

            const user = users[0];
            if (user) {
                userCache.set(user.id, user); // Cache the user data
            }

            return user;
        }).catch(error => {
            throw error; // Rethrow the error for further handling
        });
    }

    static getUserByEmail(email: string): Promise<User> {
        const cachedUser = userCache.get(email);
        if (cachedUser) {
            return Promise.resolve(cachedUser as User);
        }

        return UsersController.db.query("SELECT * FROM users WHERE email = $1;", [email]).then((result: QueryResult) => {
            const users: User[] = result.rows.map(row => new User(
                row.id,
                row.username,
                row.email,
                row.currentairport,
                row.password_hash,
                row.password_salt
            ));
            if(users.length == 0 ) {
                throw new UserNotFoundException()
            }

            const user = users[0];
            if (user) {
                userCache.set(user.id, user); // Cache the user data
            }

            return user;
        }).catch(error => {
            throw error; // Rethrow the error for further handling
        });
    }


    static async checkSession(req: Request, res: Response) {
        const authHeader = req.headers['authorization'];
        var accessTokenCookie = undefined
        if(req.cookies != undefined) {
            accessTokenCookie = req.cookies['access_token']; // Assuming you use cookies for access tokens
        }

        const token = authHeader?.split(' ')[1] || accessTokenCookie;
        var userId = await AuthService.verifyAccessToken(token);
        if(userId != null)
            res.status(200).json({"message": "valid", "data": {"userId": userId}})
        else
            res.status(401).json({"message": "unauthorized"})
    }


    static async refreshAccessToken(req: Request, res: Response) {
        const refreshToken = req.body.refreshToken; // or from the request body
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not provided.' });
        }

        const userId = await AuthService.verifyRefreshToken(refreshToken);
        if (!userId) {
            return res.status(401).json({ message: 'Invalid refresh token.' });
        }

        const accessTokens = await AuthService.generateTokens(userId);
        if (!accessTokens) {
            return res.status(500).json({ message: 'Error generating new access token.' });
        }

        res.status(200).json({ "token": accessTokens?.accessToken });
    }

}

class UserNotFoundException extends Error {
    constructor(message: string = "UserNotFoundException") {
        super(message);
        this.name = "UserNotFoundException";
    }
}
