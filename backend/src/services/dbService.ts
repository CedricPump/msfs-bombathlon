// services/cockroachDbService.ts

import { Client, QueryResult } from 'pg';

class CockroachDbService {
    private client: Client;

    constructor() {
        this.client = new Client({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432, // Default port 5432
        });
        this.client.connect();
    }

    private mapRowsToType<T>(rows: any[]): T[] {
        return rows.map((row: any) => row as T);
    }

    async query<T>(query: string, params: any[] = []): Promise<T[]> {
        try {
            const result: QueryResult<any> = await this.client.query(query, params);
            return this.mapRowsToType<T>(result.rows);
        } catch (error) {
            throw error;
        }
    }

    async close() {
        // Implement close logic specific to CockroachDB
        await this.client.end();
    }
}

export default new CockroachDbService();
