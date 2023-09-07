// src/models/Squadron.ts

// Squadron
export class Squadron {
    public airports : string[] = [];        // airport ICAO-Codes
    public aircraftTypes : string[] = [];      // planeTypeUUIDs
    public members: string[] = [];          // userUUIDs
    constructor(public id: string, public name: string, public owner: string, public score: number = 0) {
        // You can add more logic here if needed
    }
}
