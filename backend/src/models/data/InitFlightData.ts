import {Ident} from "./Ident";
import {Telemetrie} from "./Telemetrie";
import {AircraftState} from "./AircraftState";

class InitFlightData{
    public Ident: Ident = new Ident;
    public Telemetrie: Telemetrie = new Telemetrie;
    public State: AircraftState = new AircraftState;
}

export { InitFlightData };