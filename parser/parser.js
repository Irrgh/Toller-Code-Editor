const fs = require("fs");
const Stack = require("./stack.js");
const lang = require("./language.js");


function write (data, path) {
    return fs.writeFileSync(path,data);
}


function read(path) {
    return fs.readFileSync(path,{ encoding: 'utf8', flag: 'r' });
}





function lex(language, string) {

    const scopeStack = new Stack();

    //console.log(string);
    const inputChars = string.split("");

    const output = new Array();

    scopeStack.push(language.main);


    var inputBuffer = "";

    for (var i = 0; i < string.length; i++) {

        let c = inputChars[i];
        var scope = scopeStack.peek();
        let subScopes = scope.subScopes;

        let list = subScopes.map(function (scopeElement) {
            if (lang.isRef(scopeElement)) {
                return lang.getScopeByName(scopeElement,language);
            } else {
                return {...scopeElement, type : "open"};
            }
        }).filter(function (scopeElement) {         // gets all subScopes and also filters out undefined
            if (scopeElement) {
                return true;
            } else {
                return false;
            }
        });

        let re = lang.getReserved(language,scopeStack.copy());         // all reserved strings
        //console.log(re);


        for (names in re) {

            let vals = re[names].values

            for (symbol in vals) {
                list.push({type : "reserved", name : re[names].name, string : vals[symbol]});
            }

        } 


        if (scope != language.main && scope.close != undefined) {
            list.push({...scope, type : "close"});
        }        





        inputBuffer += c;

        //console.log(list);






        let startsWithBuffer = list.filter(function (element) {      // multi character scope/reserved starting with inputbuffer
            switch (element.type) {
                case "open":
                return element.open.startsWith(inputBuffer);

                case "reserved":
                return element.string.startsWith(inputBuffer);

                case "close":
                    //console.log(element);
                return element.close.startsWith(inputBuffer);
                default:
                return false;
            } 
        })  

        let startsWithOpener = list.filter(function (element) {      // does the input Buffer start with the multi character scope/reserved?
            switch (element.type) {
                case "open":
                return inputBuffer.startsWith(element.open);

                case "reserved":
                return inputBuffer.startsWith(element.string);

                case "close":
                return inputBuffer.startsWith(element.close);
                default:
                return false;
            } 
        })

        let both = startsWithBuffer.filter(function (element) {
            return startsWithOpener.includes(element);
        })


        //console.log("scope: " + JSON.stringify(scope));
        //console.log("list: " + JSON.stringify(list));
        //console.log("input: " + inputBuffer);
        //console.log("startsWithBuffer:");
        //console.log(startsWithBuffer.length);
        //console.log("startsWithOpener:");
        //console.log(startsWithOpener.length);
        //console.log("both:");
        //console.log(both.length);
        //console.log("\n\n");


        if (startsWithBuffer.length == 0 && startsWithOpener == 0 && both.length == 0) {      // this means input does not start with a reversed and reversed also doesnt start with input 
            
            let last = output.pop();


            if (last.type === "text" && last.stack === scopeStack) {
                last.content = last.content + inputBuffer;
                output.push(last);
            } else {
                output.push(last);
                output.push({type : "text" ,content : inputBuffer, stack : scopeStack});
            }
            
            
            
            inputBuffer = "";
            
        } else if (both.length == 1 && startsWithBuffer.length == 1) {

            var res = both[0];            // TODO: differentiate between scopes and reserved chars
            //console.log(res);

            switch (res.type) {

                case "open":
                    scopeStack.push(res);
                    output.push({type : "open", content : inputBuffer, stack : scopeStack});
                break;
                case "close":
                    output.push({type : "close", content : inputBuffer, stack : scopeStack});
                    scopeStack.pop();
                break;
                case "reserved":
                    output.push({type : "reserved", content : inputBuffer, stack : scopeStack});
                break;
                
            }
            
            inputBuffer = "";
            
        } else if (startsWithBuffer.length == 0 && startsWithOpener.length > 0) {

            var res = startsWithOpener[0]; 
            //console.log(res);     // this part is only for opening scopes rn

            switch (res.type) {
                case "open":
                    var resChar = inputBuffer.slice(0,res.open.length);
                    var rest = inputBuffer.slice(res.open.length);
                    scopeStack.push(res);
                    output.push({type : "open", content : resChar, stack : scopeStack});
                    output.push({type : "text", content : rest, stack : scopeStack});
                break;
                case "close":
                    var resChar = inputBuffer.slice(0,res.open.length);
                    var rest = inputBuffer.slice(res.open.length);
                    output.push({type : "close", content : resChar, stack : scopeStack});
                    output.push({type : "text", content : rest, stack : scopeStack});
                    scopeStack.pop();
                break;
                case "reserved":
                    var resChar = inputBuffer.slice(0,res.open.length);
                    var rest = inputBuffer.slice(res.open.length);
                    output.push({type : "reversed", content : resChar, stack : scopeStack});
                    output.push({type : "text", content : rest, stack : scopeStack});
                break;
            }
            
            inputBuffer = "";
        }
        //console.log("stack size after :" + scopeStack.size());
        //console.log("top scope on stack: " + JSON.stringify(scopeStack.peek()));
    }

    return output
}





//console.log("html.json");

let startTime = performance.now();

eee = lex(JSON.parse(read("parser/html.json")),read("editor/index.html"))

let endTime = performance.now();


//console.log(eee);

console.log(`time needed: ${endTime-startTime} ms`);




