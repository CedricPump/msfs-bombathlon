// src/controllers/UsersController.ts

import { Request, Response } from 'express';
import { User } from '../models/User';
import { CockroachDbService } from '../services/dbService';
import { AuthService } from  '../services/authServices';
import {
    DuplicateEmailException,
    DuplicateNameException,
    UserNotFoundException,
    UserService
} from '../services/userSerivce';
import { QueryResult } from "pg";
import NodeCache from "node-cache";
import {Squadron} from "../models/Squadron";
import {SquadronService} from "../services/squadronService";
import {CustomRequest} from "./customRequest";
import { Validator } from 'jsonschema';

import createUserSchema from "../schemas/createUserSchema.json";
import loginSchema from "../schemas/loginSchema.json";

const validator = new Validator();

export class UsersController {

    static getAllUsers(req: CustomRequest, res: Response) {
        console.log(`get all users`)
        res.status(200).json(UserService.getALlUsers())
    }

    static async login(req: CustomRequest, res: Response) {
        const validationResult = validator.validate(req.body, loginSchema);

        if (!validationResult.valid) {
            return res.status(400).json({ message: 'Invalid request body', errors: validationResult.errors });
        }

        const { email, password } = req.body;
        console.log(`login: ${email}`)

        try {
            const user: User = await UserService.getUserByEmail(email);

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
            return res.status(200).json({
                "userUUID": user.id,
                "userName": user.username,
                "accessToken": tokens.accessToken,
                "refreshToken": tokens.refreshToken,
                "accessTokenExpiration": tokens.accessTokenExpiration,
                "refreshTokenExpiration": tokens.refreshTokenExpiration
            });
        } catch (error) {
            if(error instanceof UserNotFoundException) {
                return res.status(404).json({message: 'User not found'});
            }
            console.error('Login error:', error);
            return res.status(500).json({ message: 'An error occurred' });
        }
    }


    static async createUser(req: CustomRequest, res: Response) {
        const validationResult = validator.validate(req.body, createUserSchema);
        if (!validationResult.valid) {
            return res.status(400).json({ message: 'Invalid request body', errors: validationResult.errors });
        }

        console.log(`createUser: ${req.body.username}`);
        UserService.createUser(req.body.username, req.body.email, req.body.password).then((result) => {
            res.status(201).json({"success": true});
        }).catch(error => {
            if (error instanceof DuplicateEmailException) { // PostgreSQL unique constraint violation error code
                console.error('Duplicate email address detected.');
                res.status(400).json({"message": "Email already in use"});
                return
            } else if (error instanceof DuplicateNameException) { // PostgreSQL unique constraint violation error code
                console.error('Duplicate name address detected.');
                res.status(400).json({"message": "Username already in use"});
                return
            }
            console.error('Unhandled error:', error);
            res.status(500).json({"message": "Internal server error"});
        });

    }


    static async checkSession(req: CustomRequest, res: Response) {
        if(req.user != null)
            res.status(200).json({"message": "valid", "data": {"userId": req.user.userId}})
        else
            res.status(401).json({"message": "unauthorized"})
    }


    static async getCurrentUser(req: CustomRequest, res: Response){
        if(req.user != null) {
            var user: User = await UserService.getUserById(req.user.userId);
            var squadron: Squadron|undefined = undefined;
            if(user.squadron_id != undefined) {
                squadron = await SquadronService.getSquadronById(user.squadron_id)
            }
            res.status(200).json({"data": {"user": user, "squadron": squadron}});
        }
        else
            res.status(401).json({"message": "unauthorized"})
    }


    static async refreshAccessToken(req: CustomRequest, res: Response) {
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


