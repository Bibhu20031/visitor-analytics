const express= require('express');
const http= require('http');
const webSocket = require('ws');
const path = require('path');
const apiRoutes = require('../routes/api.routes.js');

const app = express();
const server= http.createServer(app);
const wss = new webSocket.Server({server});

const socketHandler = require('../websocket/socket.js');
socketHandler(wss);

app.use(express.json());
app.use('/api', apiRoutes);

app.use(express.static(path.join(__dirname,'..','public')));

const PORT = 3000;
server.listen(PORT, ()=>{
    console.log("Server running on:", PORT);
})