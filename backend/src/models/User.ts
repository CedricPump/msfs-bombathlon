// src/models/User.ts

export class User {
    constructor(
        public id: string,
        public name: string,
        public email: string,
        public currentAirport: string = "",
        public passwordHash: string,
        public passwordSalt: string,
        public squadron: string | undefined,
    ) {
        // You can add more logic here if needed
    }
}
