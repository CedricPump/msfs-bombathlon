// services/cockroachDbService.ts

import { Client, QueryResult } from 'pg';
import users from "../routes/users";

class CockroachDbService {
    private client: Client;
    private static instance : CockroachDbService|undefined = undefined;
    private user;
    private password;
    private host;
    private port;
    private database;

    public static getInstance():CockroachDbService {
        if(CockroachDbService.instance == undefined)
        {
            CockroachDbService.instance = new CockroachDbService();
            return CockroachDbService.instance;
        }
        else
        {
            return CockroachDbService.instance;
        }
    }

    constructor() {
        this.user = process.env.DB_USER
        this.password = process.env.DB_PASSWORD
        this.host = process.env.DB_HOST
        this.port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 26257 // Default port 5432
        this.database = process.env.DB_NAME
        console.log(`connecting to ${this.user}@${this.host}:${this.port} ${this.database}`)

        this.client = new Client({
            host: this.host,
            port: this.port,
            user: this.user,
            password: this.password,
            database: this.database,
            ssl: true
        });
        this.client.connect().then((value)=>{console.log(`connected`)}, (reason)=>{console.log(`connection failed: ${reason}`)});
    }

    private mapRowsToType<T>(rows: any[]): T[] {
        return rows.map((row: any) => row as T);
    }

    async query(query: string, params: any[] = []): Promise<QueryResult> {
        try {
            const result: QueryResult<any> = await this.client.query(query, params);
            return result
        } catch (error) {
            throw error;
        }
    }

    async close() {
        // Implement close logic specific to CockroachDB
        await this.client.end();
    }
}

export {CockroachDbService};
