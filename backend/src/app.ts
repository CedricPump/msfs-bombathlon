// src/app.ts

import express from 'express';
import routes from './routes'; // Importing from the index.ts file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(requestLogger); // Use the custom middleware

// Routes
app.use('/api', routes); // Use the exported router from index.ts

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

function requestLogger(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(`Incoming request: ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`);
    next();
}