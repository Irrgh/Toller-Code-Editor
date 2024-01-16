/*** The usual HTTP server ***/
const path = require("path");
const express = require("express");
const portnumber = 6008;
const server = express();
console.log(path.resolve("./public"));
server.use(express.static(path.resolve("./public"), {index : "editor/index.html"}));
server.use(express.urlencoded({ extended: false, limit: '1mb' }));
server.use(express.json());
server.listen(portnumber, function () {
    console.log(`listening at port ${portnumber}`)
});





server.post("/publish", (req,res) => {







    res.send("eee");
})















/*** The websocket ***/
const websocket_package = require("ws");
const { fileURLToPath } = require("url");
const websocket_portnumber = 6009;
const serverSocket = new websocket_package.Server({ port: websocket_portnumber });
let numberOfClients = 0;

const clients = [];


serverSocket.on('connection', function (socket) {
    let client_id = numberOfClients;
    numberOfClients++;
    let client = {id : client_id, socket : socket};
    clients.push(client);
    console.log(`client ${client_id} accepted`);
    
    socket.onmessage = function (event) {
        let client = clients[client_id];
        console.log(`message from ${client_id}: ${event.data}`);
        socket.send(`Hello client ${client_id}, here is ${Math.random()}`);
        
    }
    socket.onclose = function (event) {
        // console.log(`client ${numberOfClients} closed the connection`);
    }
    
});
