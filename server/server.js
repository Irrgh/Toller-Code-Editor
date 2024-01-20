/*** The usual HTTP server ***/
const path = require("path");
const express = require("express");
const portnumber = 443;
const server = express();
const cookieparser = require("cookie-parser");
const fileUtil = require("./FileUtil.js");
const bodyParser = require('body-parser');
const https = require("https");
const fs = require("fs");


console.log(path.join(__dirname,"./private.key"));

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname,"./private.key")),
    cert: fs.readFileSync(path.join(__dirname,"./certificate.crc"))
};


const app = https.createServer(sslOptions, server);


server.use(bodyParser.urlencoded({ extended: false }));


server.use(cookieparser());
server.use(express.static(path.resolve("./public")));
server.use(express.urlencoded({ extended: false, limit: '1mb' }));
server.use(express.json());
//server.listen(portnumber, function () {
//    console.log(`listening at port ${portnumber}`)
//});


app.listen(portnumber, () => {
    console.log(`Server is running on https://localhost:${portnumber}`);
});






const users = JSON.parse(fileUtil.read("users.json"));

console.log(users);


const sessions = []



server.on('error', (error) => {
    console.error('Server error:', error);
  });


server.get("/", (req, res) => {

    let cookie = { user, session } = req.cookies

    console.log(cookie);
    console.log(sessions);

    let matches = sessions.filter(function (el) {
        return el.sessionId == session;
    })

    console.log(matches);
    if (matches.length > 0) {
        res.redirect("/editor");
    } else {

        res.redirect("/login");
    }


});



server.get("/editor", (req, res) => {

    
    res.sendFile(path.resolve("public/editor/editor.html"));
    



});


server.get("/login", (req, res) => {

    res.sendFile(path.resolve("public/login/login.html"));
});


server.post("/process-login", (req, res) => {

    const { username, password } = req.body;


    const matches = users.filter((user) => {
        return user.name.toLowerCase() === username.toLowerCase() && user.password === password
    })

    if (matches.length == 1) {
        console.log(`correct login with: ${username}`);

        const id = Math.random();

        sessions.push({ user: username, sessionId: id })

        res.cookie("session", id);


        res.json({ success: true, redirectUrl: "/editor" });
    } else {
        res.status(401).json({ success: false, message: "Invalid username or password" });
    }


});



server.get("/register", (req, res) => {

    
    res.sendFile(path.resolve("public/login/register.html"));
});


server.post("/process-register", (req,res) => {


    const {username,email,password} = req.body;

    const collision = users.filter((user) => {
        return user.name.toLowerCase() === username.toLowerCase() || user.email === email;
    });


    if (collision.length >= 1) {

        res.status(401).json({success:false,message:"There is already a Account with that username or email"});

    } else {


        users.push({name:username,email:email,password:password});

        res.status(200).json({success:true,redirectUrl:"/editor"});
    }
    console.log(users);
});







server.get("/workspaces", (req, res) => {


    console.log(req.cookies);
    res.writeHead(200)
    res.write("eee");
    res.end();
});














/*** The websocket ***/
const websocket_package = require("ws");
const { fileURLToPath } = require("url");
const { emit } = require("process");
const websocket_portnumber = 6009;
const serverSocket = new websocket_package.Server({ port: websocket_portnumber });
let numberOfClients = 0;

const clients = [];


serverSocket.on('connection', function (socket) {
    let client_id = numberOfClients;
    numberOfClients++;
    let client = { id: client_id, socket: socket };
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




