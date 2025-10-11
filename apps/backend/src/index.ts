import express from "express";
import {PORT} from './config.ts';
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocketHandlers } from './sockets/index.ts';
import {router} from './routes/index.ts';


const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use('/api/v1', router);

export const io = new Server(httpServer, {
    cors:{
        origin:"*",
        methods:["GET", "POST", "PUT", "DELETE"]
    }
});


setupSocketHandlers(io);



app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

httpServer.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});