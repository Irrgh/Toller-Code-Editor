
import { Stack } from "./stack.js";
import { Language } from "./language.js";



class Lexer {

    lastResult;
    userPositions;          //[{user:"name", index:123}]
    language;



    constructor(language) {
        this.language = language;
    }


    lex = (selection, action) => {


        let initStart = performance.now();

        // action is something like "paste","backspace","delete","move"

        // override = selection.start < selection.end


        //const startPos = this.lastResult ? startPos : 0;   // if there is no previous result start pos must be 0
        const override = selection.selectionStart < selection.selectionEnd;

        var before;         // does not need to be parsed again
        var after;          // might have to be parsed again
        var inputString;     // has to be parsed


        switch (action.type) {

            case ("paste"):
                if (override) {
                    const temp = Lexer.split(this.lastResult, selection.selectionStart);
                    before = temp.beforeInsert;
                    const temp2 = Lexer.split(before, selection.selectionEnd);
                    after = temp2.afterInsert;
                    inputString = action.content;
                } else {
                    const temp = Lexer.split(this.lastResult, selection.selectionStart);
                    before = temp.beforeInsert;
                    after = temp.afterInsert;
                    inputString = action.content;
                }
                break;
            case ("backspace"):
                if (override) {
                    const temp = Lexer.split(this.lastResult, selection.selectionStart);
                    before = temp.beforeInsert;
                    const temp2 = Lexer.split(before, selection.selectionEnd);
                    after = temp2.afterInsert;
                    inputString = "";
                } else {
                    const temp = Lexer.split(this.lastResult, selection.selectionStart - 1);    // removes the single char before selection.start
                    before = temp.beforeInsert;
                    const temp2 = Lexer.split(before, selection.selectionStart);
                    after = temp2.afterInsert;
                    inputString = "";
                }
                break;
            case ("delete"):
                if (override) {
                    const temp = Lexer.split(this.lastResult, selection.selectionStart);
                    before = temp.beforeInsert;
                    const temp2 = Lexer.split(before, selection.selectionEnd);
                    after = temp2.afterInsert;
                    inputString = ""
                } else {
                    const temp = Lexer.split(this.lastResult, selection.selectionStart);    // removes the single char after selection.start
                    before = temp.beforeInsert;
                    const temp2 = Lexer.split(before, selection.selectionStart + 1);
                    after = temp2.afterInsert;
                    inputString = "";
                }
                break;
            case ("move"):
                if (override) {

                } else {// need some cursor / selection mover function

                }
                break;
            default:
                throw `unknown action: ${action}`;

        }

        let output = before;                                           // output initiation


        if (before.length !== 0) {
            var scopeStack = before[before.length - 1].stack;           // stack initiation
        } else {
            var scopeStack = new Stack();
            scopeStack.push(this.language.main);
        }

        var inputBuffer = "";

        let inputChars = inputString.split("");


        let initEnd = performance.now()
        let initTime = initEnd - initStart;
        // Initiation over

        //console.log(`init (split) took ${initEnd-initStart}ms`);


        let parseInsertStart = performance.now();

        var buffer = "";


        let partialResult = this.parseStep(output, scopeStack, buffer, inputChars);

        output = partialResult.output;
        scopeStack = partialResult.stack;
        buffer = partialResult.buffer;


        let parseInsertEnd = performance.now();

        let parseInsertTime = parseInsertEnd - parseInsertStart;

        //console.log(`insert parsing took ${parseEnd-parseStart}ms`);



        if (output.length !== 0 && after.length !== 0) {                                             // inserted input did not change the scopeStack!
            if (output[output.length - 1].stack == after[0].stack) {


                this.lastResult = output.concat(after);

                //console.log(`efficient combine took ${combineEnd-combineStart}ms`);
                return { result: this.lastResult, times: { parseInsert: parseInsertTime, init: initTime } };
            }
        }


        let afterToStringStart = performance.now();
        inputChars = Lexer.resultToString(after).split("");
        let afterToStringEnd = performance.now();
        let afterToStringTime = afterToStringEnd - afterToStringStart;



        let parseAppendStart = performance.now();


        partialResult = this.parseStep(output, scopeStack, buffer, inputChars);

        output = partialResult.output;
        scopeStack = partialResult.stack;
        buffer = partialResult.buffer;


        let parseAppendEnd = performance.now();
        let parseAppendTime = parseAppendEnd - parseAppendStart;



        this.lastResult = output;
        //return this.lastResult;
        return { result: this.lastResult, times: { parseInsert: parseInsertTime, init: initTime, afterToString: afterToStringTime, parseAppend: parseAppendTime } };
    }


    static split = (input, splitPos) => {

        if (!input) {
            return { beforeInsert: [], afterInsert: [] };
        }

        if (splitPos == 0) {
            return { beforeInsert: [], afterInsert: input };
        }


        let totalChars = 0;
        var lastSafe;

        //console.log(`input.length: ${input.length}`);

        for (var i = 0; i < input.length; i++) {

            const parseElement = input[i];

            //console.log(parseElement);

            if (parseElement.type != "controll") {

                totalChars += parseElement.content.length;
            }

            if (totalChars > splitPos) {
                lastSafe = i - 1;
                break;
            } else if (totalChars == splitPos) {
                lastSafe = i;
                break;
            }
            lastSafe = i;
        }

        if (totalChars < splitPos) {
            return { beforeInsert: input, afterInsert: [] };
        }


        const before = input.slice(0, lastSafe + 1);

        const after = input.slice(lastSafe + 2);

        if (totalChars > splitPos) {

            var toDissect = { ...input[lastSafe + 1] };

            var diff = toDissect.content.length - (totalChars - splitPos);

            var frontContent = toDissect.content.slice(0, diff);
            var backContent = toDissect.content.slice(diff);

            var backHalf = { ...toDissect }
            backHalf.content = backContent;

            toDissect.content = frontContent;


            before.push(toDissect)

            after.unshift(backHalf);
        } else {
            after.unshift(input[lastSafe + 1]);
        }

        return { beforeInsert: before, afterInsert: after };
    }

    static resultToString = (result) => {

        if (!result) { return "" };

        const onlyContent = result.map((element) => {
            if (element.type != "controll") {
                return element.content;
            }
            return "";
        });
        return onlyContent.join("");
    }

    parseStep = (output, scopeStack, inputBuffer, inputChars) => {

        const controll = [{type:"controll",name:"CR",string:"\r"},{type:"controll",name:"NL",string:"\n"}];



        for (var i = 0; i < inputChars.length; i++) {

            const scope = scopeStack.peek();
            //console.log(scopeStack);


            //console.log(scope);

            inputBuffer += inputChars[i];


            const subScopes = scope.subScopes.map((el) => { // extracts the proper scopes

                if (Language.isRef(el)) {
                    return Language.getScopeByName(el, this.language);
                }
                return el;
            }).reduce((acc, curr) => {           // makes it a Set and filters out undefined

                if (!curr) {

                } else if (Array.isArray(curr)) {
                    curr.forEach((el) => {
                        if (!acc.includes(el)) { acc.push({ ...el, type: "open" }) };
                    })
                } else {

                    acc.push({ ...curr, type: "open" });
                }
                return acc;
            }, []);

            const list = subScopes.concat((this.language.main === scope ? [] : { ...scope, type: "close" }),controll);

            const reserved = Language.getReserved(this.language, scopeStack.copy());
            //console.log(reserved);

            for (const categorie of reserved) {

                let vals = categorie.values

                for (const symbol in vals) {
                    list.push({ type: "reserved", name: categorie.name, string: vals[symbol] });
                }

            }

            const startsWithBuffer = (element, string) => {
                return element.startsWith(string);
            }

            const startsWithElement = (element, string) => {
                return string.startsWith(element);
            }





            //console.log(list);


            const startBuffer = list.filter((el) => {
                switch (el.type) {
                    case "open":
                        return startsWithBuffer(el.open, inputBuffer);
                    case "reserved":
                        return startsWithBuffer(el.string, inputBuffer);
                    case "close":
                        return startsWithBuffer(el.close, inputBuffer);
                    case "controll":
                        return startsWithBuffer(el.string, inputBuffer);
                }
            });

            const startElement = list.filter((el) => {
                switch (el.type) {
                    case "open":
                        return startsWithElement(el.open, inputBuffer);
                    case "reserved":
                        return startsWithElement(el.string, inputBuffer);
                    case "close":
                        return startsWithElement(el.close, inputBuffer);
                    case "controll":
                        return startsWithElement(el.string,inputBuffer);
                }
            });

            const both = startElement.filter((el) => {
                return startBuffer.includes(el);
            });

            //console.log(list);


            if (startBuffer.length == 0 && startElement == 0 && both.length == 0) {      // this means input does not start with a reversed and reversed also doesnt start with input 

                let last = output.pop();

                //console.log(last);
                //console.log(last.stack, scope);

                if (last) {

                    if (last.type === "text" && last.stack.peek() == scope) {
                        last.content = last.content + inputBuffer;
                        output.push(last);
                    } else {
                        output.push(last);
                        output.push({ type: "text", content: inputBuffer, stack: scopeStack.copy() });
                    }

                } else {
                    output.push({ type: "text", content: inputBuffer, stack: scopeStack.copy() });
                }





                inputBuffer = "";

            } else if (both.length == 1 && startBuffer.length == 1) {

                var res = both[0];            // TODO: differentiate between scopes and reserved chars
                //console.log(res);

                switch (res.type) {

                    case "open":
                        scopeStack.push(res);
                        output.push({ type: "open", name: res.name, content: inputBuffer, stack: scopeStack.copy() });
                        break;
                    case "close":
                        output.push({ type: "close", name: res.name, content: inputBuffer, stack: scopeStack.copy() });
                        scopeStack.pop();
                        break;
                    case "reserved":
                        output.push({ type: "reserved", name: res.name, content: inputBuffer, stack: scopeStack.copy() });
                        break;
                    case "controll":
                        output.push({type:"controll", name: res.name, content: inputBuffer, stack: scopeStack.copy()});
                        break;

                }

                inputBuffer = "";

            } else if (startBuffer.length == 0 && startElement.length > 0) {

                var res = startElement[0];
                //console.log(res);     // this part is only for opening scopes rn

                switch (res.type) {
                    case "open":
                        var resChar = inputBuffer.slice(0, res.open.length);
                        var rest = inputBuffer.slice(res.open.length);
                        scopeStack.push(res);
                        output.push({ type: "open", name: res.name, content: resChar, stack: scopeStack.copy() });
                        output.push({ type: "text", content: rest, stack: scopeStack.copy() });
                        break;
                    case "close":
                        var resChar = inputBuffer.slice(0, res.close.length);
                        var rest = inputBuffer.slice(res.close.length);
                        output.push({ type: "close", name: res.name, content: resChar, stack: scopeStack.copy() });
                        output.push({ type: "text", content: rest, stack: scopeStack.copy() });
                        scopeStack.pop();
                        break;
                    case "reserved":
                        var resChar = inputBuffer.slice(0, res.string.length);
                        var rest = inputBuffer.slice(res.string.length);
                        output.push({ type: "reversed", name: res.name, content: resChar, stack: scopeStack.copy() });
                        output.push({ type: "text", content: rest, stack: scopeStack.copy() });
                        break;
                    case "controll":
                        var resChar = inputBuffer.slice(0, res.string.length);
                        var rest = inputBuffer.slice(res.string.length);
                        output.push({type:"controll", name: res.name, content: resChar, stack: scopeStack.copy()});
                        output.push({ type: "text", content: rest, stack: scopeStack.copy() });
                        break;
                }

                inputBuffer = "";

            }


        }

        return { output: output, buffer: inputBuffer, stack: scopeStack };

    }


}







export { Lexer };


/*

//console.log("html.json");
let lexer = new Lexer(JSON.parse(read("public/parser/html.json")));


let res = lexer.lex({ selectionStart: 0, selectionEnd: 0 }, { type: "paste", content: read("public/editor/editor.html") });

console.log(res.times);



res = lexer.lex({selectionStart:94,selectionEnd:94}, {type:"paste",content: "<e>"});


console.log(res.times);


eee = Lexer.split(res.result,98).beforeInsert;

console.log(eee);

//console.log(res.result.map((el) => {return el.stack.toArray().length}));

*/