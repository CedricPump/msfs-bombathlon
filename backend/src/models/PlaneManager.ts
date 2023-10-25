import {Loadout, PlaneType, Pylon} from "./Plane";
import aircraftJson from "./data/aircraft.json";
import {plainToClass, deserializeArray, plainToInstance} from "class-transformer";

class PlaneManager {
    private static planes: PlaneType[] = [];
    private static instance: PlaneManager;

    private constructor() {
        if(PlaneManager.planes.length == 0) {
            this.readPlaneTypeDefinitions();
        }
    }

    public static getInstance() : PlaneManager
    {
        if(PlaneManager.instance == undefined)
        {
            PlaneManager.instance = new PlaneManager();
        }
        return PlaneManager.instance;
    }

    private readPlaneTypeDefinitions() {
        //var jsonPlaneTypes = Object.assign(PlaneManager.planes, aircraftJson.planes);
        // PlaneManager.planes = aircraftJson.map(value => plainToInstance(PlaneType, value));
        PlaneManager.planes = aircraftJson.planes.map((obj) => mergeObjects(obj));

        console.log(`---- Read Planes: ${JSON.stringify(PlaneManager.planes)}`)
        // console.log(PlaneManager.planes[3].Pylons)
    }

    public getAllPlanesTypes(): PlaneType[] {
        return PlaneManager.planes;
    }

    public getPlaneTypeByIdent(title: string): PlaneType|undefined {
        var filtered: PlaneType[] = PlaneManager.planes.filter((pt)=>{
            var regex = new RegExp(pt.TitleRegex);
            console.log(`Checking: ${title} -> ${pt.TitleRegex} ${regex.test(title)}`)

            return regex.test(title)
        })
        return filtered.at(0);
    }
}

function mergeObjects(jsonObject: any) : PlaneType {
    const planeType = new PlaneType();
    // Populate the planeType object from the JSON object
    planeType.Title = jsonObject.Title;
    planeType.ATCType = jsonObject.ATCType;
    planeType.ATCmodel = jsonObject.ATCmodel;
    planeType.TitleRegex = jsonObject.TitleRegex;
    planeType.maxFuel = jsonObject.maxFuel;
    planeType.Year = jsonObject.Year;
    planeType.DisplayName = jsonObject.DisplayName;

    const pylons: Pylon[] = jsonObject.Pylons.map((pylonData: any) => {
        const pylon : Pylon = new Pylon();
        pylon.payloadStation = pylonData.payloadName;

        // Map the loadouts data
        //console.log(pylonData.loadouts)
        pylon.loadouts = pylonData.loadouts.map((loadoutData: any) => {
            const loadout : Loadout = new Loadout();
            loadout.BombTypeId = loadoutData.BombTypeId;
            loadout.number = loadoutData.number;
            loadout.weight = loadoutData.weight;
            return loadout;
        });

        return pylon;
    });

    planeType.Pylons = pylons;
    return planeType;
}

export { PlaneManager };