import {Flight} from "../models/Flight";
import WebSocket from "ws";

class MSFSClientService{
    private static clientConnections: Map<string, WebSocket> = new Map<string, WebSocket>();

    public static AddClient(userId: string, ws: WebSocket) {
        MSFSClientService.clientConnections.set(userId,ws);
    }

    public static RemoveClient(userId: string) {
        MSFSClientService.clientConnections.delete(userId);
    }

    public static Send(userId: string, message: string) {
        var ws = MSFSClientService.clientConnections.get(userId);
        ws?.send(message);
    }
}

export { MSFSClientService };