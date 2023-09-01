import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

class AuthService {
    static async validatePassword(userProvidedPassword: string, storedHashedPassword: string) {
        try {
            const result = await bcrypt.compare(userProvidedPassword, storedHashedPassword);

            if (result) {
                // Passwords match, user is authenticated
                console.log('Password is correct');
                return true;
            } else {
                // Passwords do not match, user is not authenticated
                console.log('Password is incorrect');
                return false;
            }
        } catch (error) {
            // Handle error
            console.error('Error comparing passwords:', error);
            return false;
        }
    }

    static async hashPassword(plaintextPassword: string) {
        try {
            // Generate a salt and hash the password
            return await bcrypt.hash(plaintextPassword, 10);
        } catch (err) {
            console.error('Error hashing password:', err);
            return null;
        }
    }

    static async generateTokens(userId: string): Promise<{ accessToken: string, refreshToken: string } | null> {
        try {
            const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });
            return { accessToken, refreshToken };
        } catch (err) {
            console.error('Error generating tokens:', err);
            return null;
        }
    }

    static async verifyAccessToken(token: string): Promise<string | null> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
            return decoded.userId;
        } catch (err) {
            console.error('Error verifying access token:', err);
            return null;
        }
    }

    static async verifyRefreshToken(token: string): Promise<string | null> {
        try {
            const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as { userId: string };
            return decoded.userId;
        } catch (err) {
            console.error('Error verifying refresh token:', err);
            return null;
        }
    }


    static async authMiddleware(req: Request, res: Response, next: NextFunction) {
        // Define an array of paths that should skip authentication
        const excludedPaths = ['/users/login', '/users/refreshtoken', '/users/register'];
        console.log(req.path)
        // Check if the current path is in the excludedPaths array
        if (excludedPaths.includes(req.path)) {
            return next(); // Skip authentication
        }

        const authHeader = req.headers['authorization'];
        var accessTokenCookie = undefined
        if(req.cookies != undefined) {
            accessTokenCookie = req.cookies['access_token']; // Assuming you use cookies for access tokens
        }

        const token = authHeader?.split(' ')[1] || accessTokenCookie;

        if (!token) {
            return res.status(401).json({ message: 'Access token not provided.' });
        }

        var userId = await AuthService.verifyAccessToken(token);
        if(userId == null)
            return res.status(403).json({ message: 'Invalid token.' });

        //req.body["userId"] = userId;
        next();
    }
}

export { AuthService };
