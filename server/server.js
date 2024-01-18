/*** The usual HTTP server ***/
const path = require("path");
const express = require("express");
const portnumber = 6008;
const server = express();
const cookieparser = require("cookie-parser");


console.log(path.resolve("./public"));
server.use(cookieparser());
server.use(express.static(path.resolve("./public")));
server.use(express.urlencoded({ extended: false, limit: '1mb' }));
server.use(express.json());
server.listen(portnumber, function () {
    console.log(`listening at port ${portnumber}`)
});



const sessions = []



server.get("/", (req, res) => {
  
    let cookie = { username, sessionId} = req.cookies
  
    console.log(cookie);
  
    let matches = sessions.filter(function (session) {
      return session.user == username && session.sessionId == sessionId;
    })
    
    console.log(matches);
    if (matches.length > 0) {
      res.redirect("/editor");
    }
    
    
    res.redirect("/login");
  });



server.get("/editor", (req,res) => {

    console.log(req.cookies)







    res.sendFile(path.resolve("public/editor/index.html"));
});


server.get("/login", (req,res) =>{

    console.log(__dirname);
    res.sendFile(path.resolve("public/login/login.html"));
});




server.get("/workspaces", (req,res) => {

    
    console.log(req.cookies);
    res.writeHead(200)
    res.write("eee");
    res.end();
});















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
