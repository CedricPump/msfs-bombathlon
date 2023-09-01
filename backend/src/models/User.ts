// src/models/User.ts

export class User {
    constructor(
        public id: string,
        public username: string,
        public email: string,
        public currentAirport: string = "",
        public passwordHash: string,
        public passwordSalt: string
    ) {
        // You can add more logic here if needed
    }
}
