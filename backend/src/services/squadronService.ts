import {Squadron} from "../models/Squadron";
import {QueryResult} from "pg";
import {CockroachDbService, DbService, DBServiceFactory} from "./dbService";
import {v4 as uuidv4} from "uuid";


export class SquadronService{
    private static db: DbService = DBServiceFactory.createDBService();

    public static getSquadronById(id: string): Promise<Squadron> {
        return SquadronService.db.query("SELECT * FROM squadrons").then((result: QueryResult) => {
            return result.rows.map(row => new Squadron(
                row.id,
                row.name,
                row.owner,
                row.score
            ))[0];
        });
    }

    public static async createSquadron(name: string, owner: string): Promise<string> {
        return SquadronService.db.query("INSERT INTO squadrons (id, name, owner, score) VALUES ($1, $2, $3, 0)",[uuidv4(), name,owner]
        ).then((result: QueryResult) => {
            return SquadronService.db.query("SELECT * FROM squadrons WHERE owner = $1",[owner]
            ).then((result: QueryResult) => {
                var id = result.rows.pop().id as string;
                return SquadronService.db.query("INSERT INTO user_squadron_mapping (user_id, squadron_id) VALUES ($1, $2)",[owner,id]
                ).then((result: QueryResult) => {
                    return id
                });
            });
        });
    }

    public static async joinSquadron(squadronId: string, userId: string): Promise<string> {
        SquadronService.db.query("INSERT INTO user_squadron_mapping (user_id, squadron_id) VALUES ($1, $2)",[userId,squadronId]
        ).then((result: QueryResult) => {
            return
        });
        return squadronId;
    }
}