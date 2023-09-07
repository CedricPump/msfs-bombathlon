import {Squadron} from "../models/Squadron";
import {QueryResult} from "pg";
import {CockroachDbService, DbService, DBServiceFactory} from "./dbService";
import {v4 as uuidv4} from "uuid";
import {UserService} from "./userSerivce";
import {AuthService} from "./authServices";


export class SquadronService{
    private static db: DbService = DBServiceFactory.createDBService();

    public static async getSquadronById(id: string): Promise<Squadron> {
        var sqd = await SquadronService.db.query("SELECT * FROM squadrons WHERE id = $1", [id]).then((result: QueryResult) => {
            return result.rows.map(row => new Squadron(
                row.id,
                row.name,
                row.owner,
                row.score
            ))[0];
        });
        if(sqd != undefined)
            sqd.members = await SquadronService.GetSquadronMembers(id);
        return sqd;
    }

    public static GetSquadronMembers(id:string) :Promise<string[]> {
        return SquadronService.db.query("SELECT user_id FROM user_squadron_mapping WHERE squadron_id = $1", [id]).then((result: QueryResult) => {
            return result.rows.map((r):string =>{return r.user_id as string})

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

    public static async joinSquadron(squadronId: string, userId: string): Promise<Squadron> {
        var currentUser = await UserService.getUserById(userId);
        if(currentUser.squadron != undefined) {
           throw new Error("User already has a squadron");
        }
        var sqd = await SquadronService.getSquadronById(squadronId);
        console.log(sqd)
        if(sqd == undefined) {throw new Error("Squadron not found");}
        SquadronService.db.query("INSERT INTO user_squadron_mapping (user_id, squadron_id) VALUES ($1, $2)",[userId,squadronId]
        ).then((result: QueryResult) => {
            return
        });
        return SquadronService.getSquadronById(squadronId);
    }

    public static async leaveSquadron(userId: string) {
        var currentUser = await UserService.getUserById(userId);
        if(currentUser.squadron == undefined) {
            throw new Error("User has no squadron");
        }
        var squadron = await SquadronService.getSquadronById(currentUser.squadron)
        if(squadron.owner == userId && squadron.members.length > 1) {
            throw new Error("Owner cant leave the squadron");
        }
        await SquadronService.db.query("DELETE FROM user_squadron_mapping WHERE user_id = $1 AND squadron_id = $2;",[userId,squadron.id]
        ).then((result: QueryResult) => {
            return
        });
        await SquadronService.db.query("DELETE FROM squadrons WHERE id = $1;",[squadron.id]
        ).then((result: QueryResult) => {
            return
        });
        return true
    }
}