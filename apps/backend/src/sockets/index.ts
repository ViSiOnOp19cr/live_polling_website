import {Socket, Server} from 'socket.io';
import { Poll } from './manager.ts';

export function setupSocketHandlers(io: Server) {
    const pollManager = new Poll(io);
    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('create-room', (data) => {
            pollManager.createRoom(socket, data);
        });
        socket.on('join-room', (data) => {
            pollManager.joinRoom(socket, data);
        });
        socket.on('post-question', (data)=>{
            pollManager.postQuestion(socket,data);
        });
        socket.on('poll-submit',(data)=>{
            pollManager.pollResponse(socket,data);
        });
        socket.on('end-poll',(data)=>{
            pollManager.endPoll(socket,data);
        })
        socket.on('leave-room', (data) => {
            pollManager.leaveRoom(socket, data);
        });
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
} 
