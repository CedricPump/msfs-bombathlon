// src/models/Plane.ts

class PlaneType {
    public displayName: string = "";
    public atcType :string = "";
    public atcModel :string = "";
    public title :string = "";
    public titleRegex: string = "";
    public maxFuel : number = 0.0;
    public year: number = 1903;
    public pylons: Map<number,Pylon> = new Map<number,Pylon>();
    constructor() {

    }
}

// an instance of a plane
class Plane extends PlaneType {

}

class Pylon {
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