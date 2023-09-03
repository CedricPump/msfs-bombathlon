import { Request } from 'express';

export interface CustomRequest extends Request {
    user?: {
        userId: string;
        // Other user-related properties if needed
    };
}