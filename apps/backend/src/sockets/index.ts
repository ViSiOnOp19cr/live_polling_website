import {Socket, Server} from 'socket.io';
import { Poll } from './manager.ts';
import { socketAuth} from '../middlewares/socket.auth.ts';

export function setupSocketHandlers(io: Server) {
    const pollManager = new Poll(io);
    io.use(socketAuth);
    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('create-room', (data) => {
            if(socket.user?.role !== 'TEACHER'){
                socket.emit('error',{
                    success:false,
                    error:'Access denied only teacher can create room'
                })
            }
            pollManager.createRoom(socket, data);
        });
        socket.on('join-room', (data) => {
            pollManager.joinRoom(socket, data);
        });
        socket.on('post-question', (data)=>{
            if(socket.user?.role !== 'TEACHER'){
                socket.emit('error',{
                    success:false,
                    error:'Access denied only teacher can post question'
                })
            }
            pollManager.postQuestion(socket,data);
        });
        socket.on('poll-submit',(data)=>{
            pollManager.pollResponse(socket,data);
        });
        socket.on('end-poll',(data)=>{
            if(socket.user?.role !== 'TEACHER'){
                socket.emit('error',{
                    success:false,
                    error:'Access denied only teacher can end poll'
                })
            }
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
