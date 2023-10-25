// src/models/Plane.ts

import {Telemetrie} from "./data/Telemetrie";
import {Type} from "class-transformer";

class PlaneType {
    public DisplayName: string = "";
    public ATCType :string = "";
    public ATCmodel :string = "";
    public Title :string = "";
    public TitleRegex: string = "";
    public maxFuel : number = 0.0;
    public Year: number = 1903;
    public Pylons: Pylon[] = [];


    constructor() {

    }
}

// an instance of a plane
class Plane extends PlaneType {

    public static GetPlane(planetype: PlaneType) {
        var plane = new Plane();
        plane.ATCType = planetype.ATCType;
        plane.ATCmodel = planetype.ATCmodel;
        plane.DisplayName = planetype.DisplayName;
        plane.Title = planetype.Title;
        plane.Year = planetype.Year;
        plane.Pylons = planetype.Pylons;
        plane.TitleRegex = planetype.TitleRegex;
        plane.maxFuel = planetype.maxFuel;
        return plane;
    }

    public lastTelemetry: Telemetrie | undefined = undefined;
}

class Pylon {
    public payloadIndex: number = 0;
    public payloadStation: string = "";
    public loadouts: Loadout[] = [];
    public equipedLoadout: Loadout|undefined = undefined
}

class Loadout {
    public BombTypeId: string = "";
    public number: number = 0;
    public weight: number = 0;
}

class BombType {
    public effectRadius: number = 0;
    public tnt: number = 0;
    constructor(public id: string, public name: string, public weight: string) {

    }
}

export {PlaneType, Plane, Pylon, Loadout}