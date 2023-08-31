// src/models/User.ts

// User
export class User {
    constructor(public id: string, public username: string, public email: string,public currentAirport: string = "", public password_hash : string, public password_salt: string) {
        // You can add more logic here if needed
    }
}