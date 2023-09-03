import flight from "../routes/flight";
import Flight from "../routes/flight";

class FlightService{
    static flights: Map<string, Flight>

    public static processFlightData(userId:string, data: any) {
        if(!(userId in FlightService.flights.keys())) {
            FlightService.flights.set(userId, new Flight(userId, new Plane()))
        }

        console.log(`flight data: ${JSON.stringify(data)}`)
    }

}

export {FlightService}