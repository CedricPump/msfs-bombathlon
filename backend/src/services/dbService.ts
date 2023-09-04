// services/cockroachDbService.ts
import sqlite3 from 'sqlite3';
import { Client, QueryResult } from 'pg';
import users from "../routes/users";
import * as path from "path";
import * as fs from "fs";

interface DbService {
    query(query: string, params?: any[]): Promise<QueryResult>;
    close(): Promise<void>;
}

class DBServiceFactory {
    static createDBService(): DbService {
        var dbType = process.env.DB_TYPE as string;
        switch (dbType) {
            case "cockroach": {
                return CockroachDbService.getInstance();
            }
            case "sqlite": {
                return  SQLiteDbService.getInstance();
            }
            default: {
                return CockroachDbService.getInstance();
            }
        }
    }
}

class CockroachDbService implements DbService{
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

class SQLiteDbService implements DbService{
    private db: sqlite3.Database;
    private static instance : SQLiteDbService|undefined = undefined;
    private dbFilePath: string = "";
    public static getInstance():SQLiteDbService {
        if(SQLiteDbService.instance == undefined)
        {
            SQLiteDbService.instance = new SQLiteDbService();
            return SQLiteDbService.instance;
        }
        else
        {
            return SQLiteDbService.instance;
        }
    }

    constructor() {
        this.dbFilePath = process.env.SQLITE_DB_FILE_PATH as string;
        console.log(`opening ${this.dbFilePath} ${fs.existsSync(this.dbFilePath)}`)

        this.db = new sqlite3.Database(this.dbFilePath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error('Error opening SQLite database:', err.message);
            } else {
                console.log('Connected to SQLite database.');
            }
        });
    }

    async query(query: string, params: any[] = []): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Simulate a QueryResult object to maintain compatibility with your existing code.
                    const result: QueryResult<any> = {
                        rows,
                        rowCount: rows.length,
                        command: '',
                        oid: 0,
                        fields: []
                    };
                    resolve(result);
                }
            });
        });
    }

    async close() {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing SQLite database:', err.message);
            } else {
                console.log('Closed SQLite database.');
            }
        });
    }
}


export {CockroachDbService, SQLiteDbService, DBServiceFactory,DbService};
