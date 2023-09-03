// src/models/Plane.ts

// instance of a current flight in progress
class Flight {
    public currentPosition: Position|undefined = undefined;
    public lastPositions: Position[] = [];
    constructor(public userId: string, public plane: Plane) {
        // You can add more logic here if needed
    }
}

// Position and attitude of Plane
class Position {
    public latitude: number = 0.0;
    public longitude: number = 0.0;
    public altitude: number = 0.0;
    public heading: number = 0.0;
    public bank: number = 0.0;
    public pitch: number = 0.0;
    public speed: number = 0.0;
    public velocityX: number = 0.0;
    public velocityY: number = 0.0;
    public velocityZ: number = 0.0;
}