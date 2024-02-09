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
const multer = require("multer");


console.log(path.join(__dirname, "./private.key"));

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, "./private.key")),
    cert: fs.readFileSync(path.join(__dirname, "./certificate.crc"))
};


const app = https.createServer(sslOptions, server);


server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());


server.use(cookieparser());
server.use(express.static(path.resolve("./public")));
server.use(express.urlencoded({ extended: false, limit: '1mb' }));
server.use(express.json({ limit: "1mb" }));
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

    //console.log(cookie);
    //console.log(sessions);

    let matches = sessions[session];

    //console.log(matches);
    if (matches) {              // is defined?
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

        let id = Math.random();
        while (sessions[id]) {
            id = Math.random();
        }
        sessions[id] = { user: username };

        res.cookie("session", id);
        res.cookie("user", username);


        res.json({ success: true, redirectUrl: "/editor" });
    } else {
        res.status(401).json({ success: false, message: "Invalid username or password" });
    }


});



server.get("/register", (req, res) => {


    res.sendFile(path.resolve("public/login/register.html"));
});


server.post("/process-register", (req, res) => {


    const { username, email, password } = req.body;

    const collision = users.filter((user) => {
        return user.name.toLowerCase() === username.toLowerCase() || user.email === email;
    });


    if (collision.length >= 1) {

        res.status(401).json({ success: false, message: "There is already a Account with that username or email" });

    } else {

        let id = Math.random();

        while (sessions[id]) {
            id = Math.random();
        }

        sessions[id] = { user: username };

        res.cookie("session", id);
        res.cookie("user", username);




        users.push({ name: username, email: email, password: password });
        fileUtil.write("users.json", JSON.stringify(users));

        res.status(200).json({ success: true, redirectUrl: "/editor" });
    }
    console.log(users);
});


server.post("/logout", (req, res) => {

    const session = req.cookies;

    sessions[id] = undefined;


    fs.rmSync(path.join("server/uploads", req.cookies.user), { recursive: true });


    res.clearCookie("user");
    res.clearCookie("session");
    res.status(200).json({ success: true });
});






server.post("/highlight", (req, res) => {

    console.log(req.body);

    const type = req.body.type;


    switch (type) {
        case ".js":
            res.sendFile(path.resolve("public/parser/format/java.json"));
            break;
        case ".java":
            res.sendFile(path.resolve("public/parser/format/java.json"));
            break;
        case ".html":
            res.sendFile(path.resolve("public/parser/format/html.json"));
            break;
        default:
            res.status(404).json({ error: `no parser for ${type}` });
            break;
    }

});

server.post("/styles", (req, res) => {

    console.log(req.body);

    const type = req.body.type;


    switch (type) {
        case ".js":
            res.sendFile(path.resolve("public/parser/styles/java.css"));
            break;
        case ".java":
            res.sendFile(path.resolve("public/parser/styles/java.css"));
            break;
        case ".html":
            res.sendFile(path.resolve("public/parser/styles/html.css"));
            break;
        default:
            res.status(404).json({ error: `no parser for ${type}` });
            break;
    }



});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        let filePath = JSON.parse(req.body.path);
        filePath.pop();
        //console.log(filePath);

        const userFolder = path.join('server/uploads', req.cookies.user, filePath.join("/")); // Construct the directory path


        // Check if the directory exists, if not, create it
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true }); // Create directory recursively
        }
        cb(null, userFolder);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


const workspaces = [];



server.post("/upload", upload.single("file"), (req, res) => {

    const user = req.cookies.user;
    const workspaceElement = { path: JSON.parse(req.body.path), kind: req.body.kind };

    if (!workspaces[user]) {
        workspaces[user] = {};
    }


    if (req.body.root == "true") {

        workspaces[user].root = workspaceElement;

    } else {

        if (!workspaces[user].files) {
            workspaces[user].files = [workspaceElement];
        } else {
            workspaces[user].files.push(workspaceElement);
        }
    }



    let root = path.join("server/uploads", req.cookies.user);

    if (req.body.root == "true" && fs.existsSync(root)) {
        fs.rmSync(root, { recursive: true });
    }


    res.status(200);
    res.json({ success: true });
    res.end();
});




server.post("/workspaces", (req, res) => {

    const files = fs.readdirSync("server/uploads");

    const result = files.filter((file) => {

        console.log(workspaces[file] != undefined);
        const filePath = path.join("server/uploads", file);
        const stats = fs.statSync(filePath);
        console.log(stats.isDirectory());
        return stats.isDirectory() && workspaces[file];
    });

    res.status(200).json(result);

});

server.post("/workspaces/content", upload.none(), (req, res) => {

    let requested = req.body.workspace;
    console.log(req.body);

    console.log(workspaces[requested]);


    if (workspaces[requested]) {
        res.status(200).json(workspaces[requested]);
    } else {
        res.status(404).json({ error: "there is no such workspace" });
    }

});






/*** The websocket ***/
const websocket_package = require("ws");
const { fileURLToPath } = require("url");
const { emit } = require("process");
//const websocket_portnumber = 6009;
const serverSocket = new websocket_package.Server({ server: app });
let numberOfClients = 0;



const clients = [];

serverSocket.on('connection', function (socket) {

    numberOfClients++;

    socket.send("test");


    socket.onmessage = function (event) {

        


        console.log("Received message:", event.data);

    }
    socket.onclose = function (event) {
        // console.log(`client ${numberOfClients} closed the connection`);
        numberOfClients--;
    }



});




