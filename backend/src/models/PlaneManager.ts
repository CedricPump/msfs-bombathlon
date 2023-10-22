import {Plane, PlaneType} from "./Plane";
import aircraftJson from "./data/aircraft.json";

class PlaneManager {
    private static planes: PlaneType[] = [];

    constructor() {
        if(PlaneManager.planes.length == 0) {
            this.readPlaneTypeDefinitions();
        }
    }

    private readPlaneTypeDefinitions() {
        Object.assign(PlaneManager.planes, aircraftJson);
    }

    public getAllPlanesTypes(): PlaneType[] {
        return PlaneManager.planes;
    }

    public  getPlaneTypeByIdent(title: string): PlaneType|undefined {
        var filtered: PlaneType[] = PlaneManager.planes.filter((pt)=>{
            var regex = new RegExp(pt.titleRegex);
            return regex.test(title)
        })
        return filtered.pop();
    }
}