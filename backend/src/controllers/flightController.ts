import Flight from "../routes/flight";
import {Request, Response} from "express";
import {FlightService} from "../services/flightService";
import {CustomRequest} from "./customRequest";
import users from "../routes/users";


export class FlightController{
    public static receiveFlightData(req: CustomRequest, res: Response) {
        if(req.user != undefined) {
            FlightService.processFlightData(req.user.userId, req.body)
            res.status(200).json({received: true})
        }
    }
}