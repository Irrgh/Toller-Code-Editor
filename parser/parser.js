const fs = require("fs");
const Stack = require("./stack.js");
const language = require("./language.js");


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

    const output = new Array();

    scopeStack.push(language.main);
    console.log(JSON.stringify(scopeStack.peek()));

    var inputBuffer = "";

    for (var i = 0; i < string.length; i++) {

        let c = inputChars[i];
        let scope = scopeStack.peek();
        let subScopes = scope.subScopes;

        inputBuffer += c;

        let startsWithBuffer = subScopes.filter(function (element) {      // multi character scope/reserved starting with inputbuffer
            return element.open.startsWith(inputBuffer);
        })  

        let startsWithOpener = subScopes.filter(function (element) {      // does the input Buffer start with the multi character scope/reserved?
            return inputBuffer.startsWith(element.open);
        })

        let both = startsWithBuffer.filter(function (element) {
            return startsWithOpener.includes(element);
        })


        console.log("input: " + inputBuffer);
        console.log("startsWithBuffer:");
        console.log(startsWithBuffer.length);
        console.log("startsWithOpener:");
        console.log(startsWithOpener.length);
        console.log("both:");
        console.log(both.length);
        console.log("\n\n");

        if (startsWithBuffer.length == 0 && startsWithOpener == 0 && both.length == 0) {      // this means input does not start with a reversed and reversed also doesnt start with input 
            output.push({type : "text" ,content : inputBuffer, stack : scopeStack});
            inputBuffer = "";
            
        } else if (both.length == 1 && startsWithBuffer.length == 1) {

            var res = both[0];            // TODO: differentiate between scopes and reserved chars
            scopeStack.push(res);
            output.push({type : "open", content : inputBuffer, stack : scopeStack});
            inputBuffer = "";
            
        } else if (startsWithBuffer.length == 0 && startsWithOpener.length > 0) {

            var res = startsWithOpener[0];      // this part is only for opening scopes rn
            var resChar = inputBuffer.slice(0,res.length);
            var rest = inputBuffer.slice(res.length);
            scopeStack.push(res);
            output.push({type : "open", content : resChar, stack : scopeStack});
            output.push({type : "text", content : rest, stack : scopeStack});
            inputBuffer = "";
            console.log("c");
        } else {

            console.log("why");
        }
          


        

    }

    return output
}

//console.log("html.json");
eee = lex(JSON.parse(read("parser/html.json")),"<html> <!--Hallo Welt-->  <body> </body> </html>")
console.log(eee);




