// app.ts
import {CustomRequest} from "./controllers/customRequest";
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { resolvers } from './graphQL/resolvers';
import { typeDefs } from './graphQL/schema';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import routes from './routes';
import http from 'http';
import {AuthService} from "./services/authServices";

interface MyContext {
    token?: string;
}

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors());

const httpServer = http.createServer(app);

// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Ensure we wait for our server to start
server.start().then(()=>{
    app.use(
        '/',
        cors<cors.CorsRequest>(),
        bodyParser.json(),
        // expressMiddleware accepts the same arguments:
        // an Apollo Server instance and optional configuration options
        expressMiddleware(server, {
            context: async ({ req }: { req: CustomRequest }) => {
                if(req.user == undefined)
                    return {};
                return { user: req.user };
            }
        }),
    );
});

// Add your existing REST API routes
app.use('/api', routes);

// Error handler middleware
function errorHandler(err: any, req: any, res: any, next: any) {
    console.error(err.stack); // Log the error stack for debugging purposes
    res.status(500).json({ error: 'Internal Server Error' });
}

// Request Logger Middleware
function requestLogger(req: express.Request, res: express.Response, next: express.NextFunction) {
    console.log(`Incoming request: ${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`);
    next();
}

app.use(errorHandler);
app.use(requestLogger);
app.use(AuthService.authMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});