// src/controllers/SquadronsController.ts

import { Request, Response } from 'express';
import {CustomRequest} from "./customRequest";
import {AuthService} from "../services/authServices";
import {UserService} from "../services/userSerivce";
import {SquadronService} from "../services/squadronService";
import {NotImplementedError, OwnUserNotSetException} from "../errors/errors";


export class SquadronsController {

    static async getSquadronOwn(req: CustomRequest, res: Response){
        if(req.user == null) throw new OwnUserNotSetException();
        var currentUser = await UserService.getUserById(req.user.userId);
        if(currentUser.squadron_id == undefined) {
            res.status(404).json({"message":"User has no squadron"});
            return
        }
        var squadron = await SquadronService.getSquadronById(currentUser.squadron_id)
        res.status(200).json(squadron)
    }

    static async getSquadronOwnMembers(req: CustomRequest, res: Response){
        throw new NotImplementedError()
    }

    static async createSquadron(req: CustomRequest, res: Response) {
        if(req.user == null) throw new OwnUserNotSetException();
        var currentUser = await UserService.getUserById(req.user.userId);
        if(currentUser.squadron_id != undefined) {
            res.status(400).json({"message":"User already has a squadron"});
            return
        }
        var id = await SquadronService.createSquadron(req.body.name, currentUser.id)

        res.status(201).json({id});
    }

    static async createInvite(req: CustomRequest, res: Response) {
        if(req.user == null) throw new OwnUserNotSetException();
        var currentUser = await UserService.getUserById(req.user.userId);
        if(currentUser.squadron_id == undefined) {
            res.status(404).json({"message":"User has no squadron"});
            return
        }
        var squadron = await SquadronService.getSquadronById(currentUser.squadron_id)
        if(squadron.owner != currentUser.id) {
            res.status(400).json({"message":"User is not squadron owner"});
            return
        }
        var token = await AuthService.generateSquadronInviteToken(squadron.id, 1);
        res.status(200).json(token);
    }

    static setSquadronOwner(req: CustomRequest, res: Response) {}

    static async joinSquadron(req: CustomRequest, res: Response) {
        if(req.user == null) throw new OwnUserNotSetException();
        var currentUser = await UserService.getUserById(req.user.userId);
        if(currentUser.squadron_id != undefined) {
            res.status(400).json({"message":"User already has a squadron"});
            return
        }
        var squadronId = await AuthService.verifySquadronInviteToken(req.body.token)
        if(squadronId == null){
            res.status(400).json({"message":"Invalid Invite"});
            return
        }

        await SquadronService.joinSquadron(squadronId, currentUser.id)

        res.status(201).json({squadronId});
    }

    static leaveSquadron(req: CustomRequest, res: Response) {}

    // Add other squadron-related controller functions
}

