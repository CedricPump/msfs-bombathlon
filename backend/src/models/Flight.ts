// src/models/Plane.ts

// instance of a current flight in progress
import {Plane} from "./Plane";

class Impact {
    public position: Position;
    public bomb: string;
    public score: number = 0;
    public tnt: number = 0.0;
    public damage: number = 0.0;

    constructor(pos: Position, bomb: string) {
        this.position = pos;
        this.bomb = bomb;
    }
}

class Flight {
    public userId: string
    public plane: Plane
    public impacts: Impact[] = [];
    constructor(userId: string, plane: Plane) {
        this.userId = userId;
        this.plane = plane;
    }
}

// Position and attitude of Plane
class Position {
    public latitude: number = 0.0;
    public longitude: number = 0.0;
    public altitude: number = 0.0;

    constructor(lat: number, long: number, alt: number = 0.0) {
        this.latitude = lat;
        this.longitude = long;
        this.altitude = alt;
    }
}

export {Flight, Position}