import { Flight, Position } from "../models/Flight";
import { Plane } from "../models/Plane";
import {MSFSClientService} from "./MSFSClientService";

class FlightService {
    private static flights: Map<string, Flight> = new Map<string, Flight>();

    public static processFlightData(userId: string, data: any) {
        if (!FlightService.flights.has(userId)) {
            this.InitFlight(userId, data)
        }

        const flight: Flight | undefined = FlightService.flights.get(userId);
        if (!flight) {
            console.error(`Flight not found for user ${userId}`);
            return;
        }

        console.log(`Flight data: ${JSON.stringify(data)}`);

        // Automatically map flight data to Position object
        const position: Position = {
            latitude: data.Latitude || 0.0,
            longitude: data.Longitude || 0.0,
            altitude: data.Altitude || 0.0,
            heading: data.Heading || 0.0,
            bank: data.Bank || 0.0,
            pitch: data.Pitch || 0.0,
            speed: data.GroundSpeed || 0.0,
            velocityX: data.vX || 0.0,
            velocityY: data.vY || 0.0,
            velocityZ: data.vZ || 0.0,
        };

        // Update the flight's current position
        flight.currentPosition = position;

        // Add the current position to the flight's last positions array
        flight.lastPositions.push(position);
        if(flight.lastPositions.length > 5) {
            flight.lastPositions.pop();
        }

        // You can add more logic here if needed
    }

    public static InitFlight(userId: string, data: any) {


        var plane = new Plane()
        plane.atcType = "";
        FlightService.flights.set(userId, new Flight(userId, new Plane()));
    }

    public static OnClientEventHandle(userId: string, event: PlaneEvent){
        console.log(`OnClientEventHandle ${event.Event} ${event.Parameter}`);
        MSFSClientService.Send(userId,"AKN");
    }
}

export { FlightService };
