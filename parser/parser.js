const fs = require("fs");
const Stack = require("./stack.js");



function write (data, path) {
    return fs.writeFileSync(path,data);
}


function read(path) {
    return fs.readFileSync(path,{ encoding: 'utf8', flag: 'r' });
}





function lex(language, string) {

    const scopeStack = new Stack();

    console.log(string);
    const inputChars = string.split("");
    console.log(inputChars);

    const output = new Array(inputChars.length);

    scopeStack.push(language.main);
    console.log(scopeStack.peek())

    const inputBuffer = new Stack();

    for (var i = 0; i < string.length; i++) {

        let c = inputChars[i];
        let scope = scopeStack.peek();
        
        inputBuffer.push(c);

        let scopeOpeners = scope.subScopes.map(function (el) {
            return el.open;
        })

        let scopeClosers = scope.subScopes.map(function (el) {
            return el.close;
        })

        
        
        let filteredOpen = scopeOpeners.filter(function (el) {
            return el.startsWith(inputBuffer.toArray().join());
        })

        let filteredClose = scopeClosers.filter(function (el) {
            return el.startsWith(inputBuffer.toArray().join());
        })

        console.log(filteredOpen, filteredClose);


        output[i] = scopeStack.peek().name;

    
    }

    return output
}

//console.log("html.json");
eee = lex(JSON.parse(read("parser/html.json")),"<html>")
console.log(JSON.stringify(eee));




