// src/app.ts

import express from 'express';
import routes from './routes'; // Importing from the index.ts file
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(requestLogger); // Use the custom middleware
app.use(cors());
// Routes
app.use('/api', routes); // Use the exported router from index.ts
// Error handler middleware
function errorHandler(err: any, req: any, res: any, next: any) {
    console.error(err.stack); // Log the error stack for debugging purposes
    res.status(500).json({ error: 'Internal Server Error' });
}

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

function requestLogger(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(`Incoming request: ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`);
    next();
}