import {Squadron} from "../models/Squadron";
import {QueryResult} from "pg";
import {User} from "../models/User";
import {CockroachDbService} from "./dbService";


export class SquadronService{
    private static db: CockroachDbService = CockroachDbService.getInstance()

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
}