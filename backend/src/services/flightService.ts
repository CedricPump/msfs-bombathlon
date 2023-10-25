import { Flight, Position } from "../models/Flight";
import {Loadout, Plane, PlaneType} from "../models/Plane";
import {MSFSClientService} from "./MSFSClientService";
import {Telemetrie} from "../models/data/Telemetrie";
import {InitFlightData} from "../models/data/InitFlightData";
import {PlaneManager} from "../models/PlaneManager";


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



    }

    public static OnClientEventHandle(userId: string, event: PlaneEvent){
        try {
            console.log(`OnClientEventHandle ${event.Event} ${event.Parameter}`);

            switch (event.Event) {
                case "TELEMETRIE": {
                    FlightService.handleTelemetrieEvent(userId, Object.assign(event.Parameter));
                    break;
                }
                case "BOMB_DROP": {

                    break;
                }
                case "INIT_FLIGHT": {
                    FlightService.handleInitFlightEvent(userId, Object.assign(event.Parameter));
                    break;
                }
            }

            // MSFSClientService.Send(userId,"AKN");
        } catch (error) {
            console.error(`Could not Handle Event: ${event.Event} ${event.Parameter}`, error)
        }
    }

    private static handleTelemetrieEvent(userId: string, event: Telemetrie) {
        var flight = FlightService.flights.get(userId);
        if(flight == undefined) {
            MSFSClientService.Send(userId,JSON.stringify({"type": "REQUEST_INIT", "parameters": ""}));
        }
    }


    private static handleInitFlightEvent(userId: string, event: InitFlightData) {
        var flight = FlightService.flights.get(userId);
        // check if PlaneType is valid
        var planeType = PlaneManager.getInstance().getPlaneTypeByIdent(event.Ident.Title);

        if(planeType == undefined) {
            MSFSClientService.Send(userId,JSON.stringify({"type": "ERROR", "parameters": "PlaneType not found"}));
            return;
        }
        var plane = Plane.GetPlane(planeType);


        // check if State is Valid


        // check if Position is Valid: On Ground and Parked
        // check parked
        if(event.State.OnGround == false || event.State.EngineOn == true || event.Telemetrie.GroundSpeed > 0.05) {
            MSFSClientService.Send(userId,JSON.stringify({"type": "ERROR", "parameters": "Plane needs to be parked at Airport"}));
        }
        // check Airport
        // check Fuel


        var pylonEquipedLoadouts: Map<number,Loadout> = new Map<number, Loadout>()

        for (let pylon of plane.Pylons) {
            if(pylon == undefined) continue;
            var loadout = pylon.loadouts.at(0)
            pylon.equipedLoadout = loadout;

            if (loadout != undefined) {
                pylonEquipedLoadouts.set(pylon.payloadIndex, loadout)
            }
        }

        if(flight == undefined) {
            MSFSClientService.Send(userId, JSON.stringify({
                "type": "SET_BOMBS",
                "parameters": JSON.stringify(pylonEquipedLoadouts)
            }));
        }

        // set telemetry



        plane.lastTelemetry = event.Telemetrie;
        // save flight
        FlightService.flights.set(userId, new Flight(userId, plane));
    }
}

export { FlightService };
