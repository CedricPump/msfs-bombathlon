import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import * as stream from "stream";

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
            const hash = await bcrypt.hash(plaintextPassword, 10);
            // Store the hash in the database
            console.log('Hashed Password:', hash);
            return hash;
        } catch (err) {
            console.error('Error hashing password:', err);
            return null;
        }
    }


    static async generateToken(userId: string): Promise<string | null> {
        try {
            return jwt.sign({userId}, process.env.JWT_SECRET as string, {expiresIn: '1h'});
        } catch (err) {
            console.error('Error generating JWT:', err);
            return null;
        }
    }

    static async verifyToken(token: string): Promise<string | null> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
            return decoded.userId;
        } catch (err) {
            console.error('Error verifying JWT:', err);
            return null;
        }
    }
}

export { AuthService };
