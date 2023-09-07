import NodeCache from "node-cache";
import {DbService, DBServiceFactory} from "./dbService";
import {QueryResult} from "pg";
import {User} from "../models/User";
import {AuthService} from "./authServices";
import {DuplicateEmailException, DuplicateNameException, UserNotFoundException} from "../errors/errors";
//import uuid from "uuid";
import {v4 as uuidv4} from "uuid";


const userCache = new NodeCache({ stdTTL: 30 * 60 }); // 39 min

class UserService {
    private static db: DbService = DBServiceFactory.createDBService();

    public static async getAllUsers(): Promise<User[]> {
        return UserService.db.query("SELECT * FROM users").then((result: QueryResult) => {
            return result.rows.map(row => new User(
                row.id,
                row.username,
                "",
                row.currentairport,
                "",
                "",
                undefined
            ));
        });
    }

    static async createUser(username: string, email: string, password: string): Promise<boolean> {
        var password_hash = await AuthService.hashPassword(password);

        return UserService.db.query("INSERT INTO users (id, username, email, password_hash, password_salt) VALUES ( $1, $2, $3, $4, $5 );", [uuidv4(), username, email, password_hash, ""])
            .then((result: QueryResult) => {
                // Successful insertion
                return true
            })
            .catch(error => {
                console.error(error.toString(), error.code)
                if (error.code === '23505') { // PostgreSQL unique constraint violation error code
                    if (error.toString().includes("users_username_key"))
                        throw new DuplicateNameException();
                    if (error.toString().includes("users_email_key"))
                        throw new DuplicateEmailException();
                }
                throw error;

            });
    }

    static getUserById(id: string): Promise<User> {

        return UserService.db.query("SELECT u.id, u.name, u.email, u.currentairport, usm.squadron_id AS squadron_id FROM users u LEFT JOIN user_squadron_mapping usm ON u.id = usm.user_id WHERE u.id = $1;", [id])
            .then((result: QueryResult) => {
            const users: User[] = result.rows.map(row => new User(
                row.id,
                row.name,
                row.email,
                row.currentairport,
                "",
                "",
                row.squadron_id
            ));
            console.log("getUserById "+users)
            if(users.length == 0 ) {
                throw new UserNotFoundException()
            }

            const user = users[0];
            if (user) {
                userCache.set(user.id, user); // Cache the user data
            }

            return user;
        }).catch(error => {
            throw error; // Rethrow the error for further handling
        });
    }

    static getUserByUsername(username: string): Promise<User> {
        /*
        const cachedUser = userCache.get(username);
        if (cachedUser) {
            return Promise.resolve(cachedUser as User);
        }
        */

        return UserService.db.query("SELECT * FROM users WHERE username = $1;", [username]).then((result: QueryResult) => {
            const users: User[] = result.rows.map(row => new User(
                row.id,
                row.username,
                row.email,
                row.currentairport,
                row.password_hash,
                row.password_salt,
                undefined
            ));
            if(users.length == 0 ) {
                throw new UserNotFoundException()
            }

            const user = users[0];
            if (user) {
                userCache.set(user.id, user); // Cache the user data
            }

            return user;
        }).catch(error => {
            throw error; // Rethrow the error for further handling
        });
    }

    static getUserByEmail(email: string): Promise<User> {

        return UserService.db.query("SELECT * FROM users WHERE email = $1;", [email]).then((result: QueryResult) => {
            const users: User[] = result.rows.map(row => new User(
                row.id,
                row.name,
                row.email,
                row.currentairport,
                row.password_hash,
                row.password_salt,
                undefined
            ));
            if(users.length == 0 ) {
                throw new UserNotFoundException()
            }

            const user = users[0];
            if (user) {
                userCache.set(user.id, user); // Cache the user data
            }

            return user;
        }).catch(error => {
            throw error; // Rethrow the error for further handling
        });
    }
}



export {UserService};