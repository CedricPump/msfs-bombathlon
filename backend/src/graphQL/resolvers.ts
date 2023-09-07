// resolvers.ts


import { UserService } from '../services/userSerivce';
import { Squadron } from '../models/Squadron';
import { SquadronService } from '../services/squadronService';
import { GraphQLError } from 'graphql';
import {DuplicateEmailException, DuplicateNameException} from "../errors/errors";
import uuidSchema from "../schemas/uuidSchema.json";
import nameSchema from "../schemas/nameSchema.json";
import {Validator} from "jsonschema";
import {User} from "../models/User";
import {AuthService} from "../services/authServices";
import squadrons from "../routes/squadrons";

const validator = new Validator();

export const resolvers = {
    Query: {
        users: () => UserService.getAllUsers(),
        user: async (parent: any, args: any, context: any) => {
            var id: string = "";
            if (args.id == undefined) {
                if (!context.user) {
                    throw new GraphQLError('Unauthorized');
                } else {
                    id = context.user.userId
                }
            } else {

                const validationResult = validator.validate(args.id, uuidSchema);
                if (!validationResult.valid) {
                    throw new GraphQLError('Invalid argument '+ validationResult.errors);
                }

                id = args.id
            }
            console.log(id)
            var user = await UserService.getUserById(id);
            console.log(user)
            return user
        },
        squadron: (parent: any, args: any, context: any) => {
            return SquadronService.getSquadronById(args.id)
        },
        squadronInviteToken: async (_: any, args: any, context: any): Promise<string> => {
            var expDays = 5;
            if(args.expiration != undefined && args.expiration > 0) expDays = args.expiration
            var user = await UserService.getUserById(context.user.userId)
            if(user.squadron == null) throw new GraphQLError("User has no Squadron");
            var squadron = await SquadronService.getSquadronById(user.squadron)
            if(user.id != squadron.owner) throw new GraphQLError("User is not Squadron owner");
            var res = await AuthService.generateSquadronInviteToken(user.squadron, expDays)
            if(res == null) {
                throw new GraphQLError("Error creating Invite");
            }
            return res.inviteToken
        }
    },
    Squadron: {
        owner: async (parent: any, args: any, context: any):Promise<User|null> => {
            console.log("resolver: Squadron.owner")
            if(parent.owner == null) return null
            return UserService.getUserById(parent.owner);
        },
        members: async (parent: any, args: any, context: any):Promise<User[]>=> {
            console.log("resolver: Squadron.owner")
            if(parent.members == null) return []
            return parent.members.map((m: string) => {return UserService.getUserById(m)})
        }
    },
    User: {
        squadron: async (parent: any, args: any, context: any)=> {
            console.log("resolver: User.squadron")
            if(parent.squadron == null) return null
            return SquadronService.getSquadronById(parent.squadron);
        }
    },
    Mutation: {
        createUser: async (parent: any, args: any, context: any) => {
            try {
                const newUser = await UserService.createUser(args.username, args.email, args.password);
                return { success: true, user: newUser };
            } catch (error) {
                if (error instanceof DuplicateEmailException) {
                    throw new GraphQLError('Email already in use');
                } else if (error instanceof DuplicateNameException) {
                    throw new GraphQLError('Username already in use');
                } else {
                    throw new GraphQLError('Internal server error');
                }
            }
        },
        createSquadron : async (_: any, args: any, context: any) => {
            const validationResult = validator.validate(args, nameSchema);
            if (!validationResult.valid) {
                throw new GraphQLError('Invalid argument '+ validationResult.errors);
            }
            if (!context.user) {
                throw new GraphQLError('Unauthorized');
            }
            var userid = context.user.userId
            var currentUser = await UserService.getUserById(userid);
            console.log(currentUser.squadron)
            if(currentUser.squadron != null) {
                throw new GraphQLError('User already has a squadron');
            }

            var squadronId: string   = await SquadronService.createSquadron(args.name, userid);
            var squadron: Squadron = await SquadronService.getSquadronById(squadronId);
            console.log(squadron)
            return squadron
        },
        joinSquadron : async (_: any, args: any, context: any): Promise<Squadron> => {
            var squadronId = await AuthService.verifySquadronInviteToken(args.inviteToken)
            if(squadronId == null){
                throw new GraphQLError("Invalid Invite");
            }
            var squadron = await SquadronService.joinSquadron(squadronId,context.user.userId)
            return squadron
        },
        leaveSquadron : async (_: any, args: any, context: any): Promise<boolean> => {
            return SquadronService.leaveSquadron(context.user.userId)
        }

    },
};
