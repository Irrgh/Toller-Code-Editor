
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

        let newSelection;


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
                newSelection = { ...selection };
                newSelection.selectionStart += action.content.length;
                newSelection.selectionEnd = newSelection.selectionStart;


                break;
            case ("backspace"):

                newSelection = { ...selection };

                if (override) {
                    const temp = Lexer.split(this.lastResult, selection.selectionStart);
                    before = temp.beforeInsert;
                    const temp2 = Lexer.split(before, selection.selectionEnd);
                    after = temp2.afterInsert;
                    inputString = "";


                } else {
                    const temp = Lexer.split(this.lastResult, selection.selectionStart - 1);    // removes the single char before selection.start
                    before = temp.beforeInsert;

                    console.log([...before]);

                    let lastOfBefore = { ...before.pop() };
                    let firstOfAfter = { ...temp.afterInsert[0] };


                    console.log(lastOfBefore, firstOfAfter, before.length);

                    if (!(lastOfBefore.name == "CR")) {
                        before.push(lastOfBefore);
                    } else {
                        newSelection.selectionStart--;
                    }
                    console.log(before.length);


                    const temp2 = Lexer.split(temp.afterInsert, 1);
                    after = temp2.afterInsert;
                    inputString = "";

                    newSelection.selectionStart--;
                }

                newSelection.selectionEnd = newSelection.selectionStart;

                break;
            case ("delete"):

                newSelection = { ...selection };

                if (override) {
                    const temp = Lexer.split(this.lastResult, selection.selectionStart);
                    before = temp.beforeInsert;
                    const temp2 = Lexer.split(before, selection.selectionEnd);
                    after = temp2.afterInsert;
                    inputString = ""
                } else {
                    const temp = Lexer.split(this.lastResult, selection.selectionStart);    // removes the single char after selection.start
                    before = temp.beforeInsert;

                    let firstOfAfter = { ...temp.afterInsert[0] };
                    let lastOfBefore = { ...before.pop() };

                    console.log(lastOfBefore, firstOfAfter);
                    if (!(firstOfAfter.name == "CR")) {
                        before.push(lastOfBefore);
                    
                        if (lastOfBefore.name == "NL") {

                            newSelection.selectionStart -= (lastOfBefore.content.length - 1);
                        }

                    } 
                        

                    



                    const temp2 = Lexer.split(temp.afterInsert, 1);
                    after = temp2.afterInsert;
                    inputString = "";
                }


                
                newSelection.selectionEnd = newSelection.selectionStart;


                break;
            case ("move"):
                if (override) {

                } else {// need some cursor / selection mover function

                }
                break;
            default:
                throw `unknown action: ${action}`;

        }


        let output = before;         // output initiation



        if (before.length !== 0) {
            let last = before[before.length - 1];

            var scopeStack = before[before.length - 1].stack;
            if (last.type == "close") {
                scopeStack.pop();
            }                       // stack initiation
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

        let stackBeforeParse = scopeStack.copy();


        //console.log("before: ",[...before]);



        let partialResult = this.parseStep(output, scopeStack, buffer, inputChars);

        output = partialResult.output;
        scopeStack = partialResult.stack;
        buffer = partialResult.buffer;


        let parseInsertEnd = performance.now();

        let parseInsertTime = parseInsertEnd - parseInsertStart;

        //console.log(`insert parsing took ${parseEnd-parseStart}ms`);


        console.log("remaining buffer: ",buffer,buffer.length);



        if (output.length !== 0 && after.length !== 0) {
            let lastInOutput = output[output.length - 1];
            let firstInAfter = after[0];




            // inserted input did not change the scopeStack!
            if (scopeStack.equals(stackBeforeParse) && buffer.length == 0) {

                if (lastInOutput.type == "text" && lastInOutput.type == firstInAfter.type) {

                    lastInOutput.content = lastInOutput.content.concat(firstInAfter.content);

                    after = after.slice(1);

                }

                //console.log(lastInOutput.stack, " == ", firstInAfter.stack);


                this.lastResult = output.concat(after);

                //console.log(`efficient combine took ${combineEnd-combineStart}ms`);
                return { result: this.lastResult, times: { parseInsert: parseInsertTime, init: initTime }, selection: newSelection };
            } else {

                //console.log(lastInOutput.stack, " != ", firstInAfter.stack);

            }
        }


        let afterToStringStart = performance.now();
        inputChars = Lexer.resultToString(after).split("");
        let afterToStringEnd = performance.now();
        let afterToStringTime = afterToStringEnd - afterToStringStart;

        console.log(Lexer.resultToString(after));

        console.log(`append length: ${inputChars.length}`);


        let parseAppendStart = performance.now();


        partialResult = this.parseStep(output, scopeStack, buffer, inputChars);

        output = partialResult.output;
        scopeStack = partialResult.stack;
        buffer = partialResult.buffer;


        let parseAppendEnd = performance.now();
        let parseAppendTime = parseAppendEnd - parseAppendStart;



        this.lastResult = output;
        //return this.lastResult;
        return { result: this.lastResult, times: { parseInsert: parseInsertTime, init: initTime, afterToString: afterToStringTime, parseAppend: parseAppendTime }, selection: newSelection };
    }


    static split = (input, splitPos) => {




        if (!input) {
            return { beforeInsert: [], afterInsert: [] };
        }

        input = [...input];

        if (splitPos <= 0) {
            return { beforeInsert: [], afterInsert: input };
        }


        let totalChars = 0;
        var lastSafe;

        //console.log(`input.length: ${input.length}`);

        for (var i = 0; i < input.length; i++) {

            const parseElement = input[i];

            //console.log(parseElement);

            if (parseElement.type != "controll" || true) {

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
            return element.content;
        });
        return onlyContent.join("");
    }

    parseStep = (output, scopeStack, inputBuffer, inputChars) => {

        const controll = [{ type: "controll", name: "CR", string: "\r" }, { type: "controll", name: "NL", string: "\n" }];

        scopeStack = scopeStack.copy();

        for (var i = 0; i < inputChars.length; i++) {

            const scope = scopeStack.peek();

            if (!scope) {
                scope = { type: "open", name: "error", content: "", subScopes: [] };  // maybe error handling
            }


            //console.log(scopeStack);

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

            const list = subScopes.concat((this.language.main == scope ? [] : { ...scope, type: "close" }), controll);

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
                        return startsWithElement(el.string, inputBuffer);
                }
            });

            const both = startElement.filter((el) => {
                return startBuffer.includes(el);
            });

            //console.log(list);
            //console.log(startBuffer);
            //console.log(startElement);
            //console.log(both);





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

                var el = both[0];            // TODO: differentiate between scopes and reserved chars
                //console.log(res);

                switch (el.type) {

                    case "open":
                        scopeStack.push(el);
                        output.push({ type: "open", name: el.name, content: inputBuffer, stack: scopeStack.copy() });
                        break;
                    case "close":
                        output.push({ type: "close", name: el.name, content: inputBuffer, stack: scopeStack.copy() });
                        scopeStack.pop();
                        break;
                    case "reserved":
                        output.push({ type: "reserved", name: el.name, content: inputBuffer, stack: scopeStack.copy() });
                        break;
                    case "controll":
                        output.push({ type: "controll", name: el.name, content: inputBuffer, stack: scopeStack.copy() });
                        break;

                }





                inputBuffer = "";
            } else if (both.length > 1 && startBuffer.length > 1 && startElement.length > 1) {



                let onlyControllRead = true;

                for (let i = 0; i < both.length; i++) {

                    let el = both[i];

                    switch (el.type) {

                        case "open":
                            if (onlyControllRead) {
                                scopeStack.push(el);
                                output.push({ type: "open", name: el.name, content: inputBuffer, stack: scopeStack.copy() });
                                onlyControllRead = false;
                            }
                            break;
                        case "close":
                            if (onlyControllRead) {
                                output.push({ type: "close", name: el.name, content: inputBuffer, stack: scopeStack.copy() });
                                scopeStack.pop();
                                onlyControllRead = false;
                            }
                            break;
                        case "reserved":
                            if (onlyControllRead) {
                                output.push({ type: "reserved", name: el.name, content: inputBuffer, stack: scopeStack.copy() });
                                onlyControllRead = false;
                            }
                            break;
                        case "controll":
                            output.push({ type: "controll", name: el.name, content: inputBuffer, stack: scopeStack.copy() });
                            break;

                    }

                }

                //console.log(inputBuffer,both.length,startBuffer.length,startElement.length,output.length);
                inputBuffer = "";

            } else if (startBuffer.length == 0 && startElement.length > 0) {

                var el = startElement[0];
                //console.log(res);     // this part is only for opening scopes rn




                switch (el.type) {
                    case "open":
                        var resChar = inputBuffer.slice(0, el.open.length);
                        var rest = inputBuffer.slice(el.open.length);
                        scopeStack.push(el);

                        output.push({ type: "open", name: el.name, content: resChar, stack: scopeStack.copy() });

                        if (rest.length > 0) {
                            output.push({ type: "text", content: rest, stack: scopeStack.copy() });
                        }

                        break;
                    case "close":
                        var resChar = inputBuffer.slice(0, el.close.length);
                        var rest = inputBuffer.slice(el.close.length);
                        output.push({ type: "close", name: el.name, content: resChar, stack: scopeStack.copy() });

                        if (rest.length > 0) {
                            output.push({ type: "text", content: rest, stack: scopeStack.copy() });
                        }

                        scopeStack.pop();
                        break;
                    case "reserved":
                        var resChar = inputBuffer.slice(0, el.string.length);
                        var rest = inputBuffer.slice(el.string.length);
                        output.push({ type: "reserved", name: el.name, content: resChar, stack: scopeStack.copy() });

                        if (rest.length > 0) {
                            output.push({ type: "text", content: rest, stack: scopeStack.copy() });
                        }

                        break;
                    case "controll":
                        var resChar = inputBuffer.slice(0, el.string.length);
                        var rest = inputBuffer.slice(el.string.length);
                        output.push({ type: "controll", name: el.name, content: resChar, stack: scopeStack.copy() });

                        if (rest.length > 0) {
                            output.push({ type: "text", content: rest, stack: scopeStack.copy() });
                        }

                        break;
                }

                console.log(startElement, inputBuffer, i);

                inputBuffer = "";

            }


        }

        return { output: output, buffer: inputBuffer, stack: scopeStack };

    }


    static toHtml = (result) => {

        const localDepth = (segment) => {
            return Math.max(segment.stack.toArray().filter((el) => {
                return segment.name == el.name
            }).length - 1, 0);
        }

        const globalDepth = (segment) => {
            return Math.max(segment.stack.size() - 1, 0);
        }


        const fragment = document.createDocumentFragment();

        let currentLine = document.createElement("div");
        currentLine.classList.add("line");

        let spanStack = new Stack();

        let init = document.createElement("span");
        //init.append(document.createTextNode(result[0].content));
        init.style.setProperty("--local-depth", 0);
        init.style.setProperty("--global-depth", 0);


        //console.log(result.slice(0,31));

        for (let i = 0; i < result.length; i++) {

            let iter = result[i];
            //console.log(spanStack);

            //console.log(i,iter);


            switch (iter.type) {

                case "open": {
                    let span = document.createElement("span");
                    span.append(document.createTextNode(iter.content));
                    span.style.setProperty("--local-depth", localDepth(iter));
                    span.style.setProperty("--global-depth", globalDepth(iter));
                    span.classList.add(iter.name);

                    let parent = spanStack.peek();

                    (parent != null) ? parent.append(span) : currentLine.append(span);

                    spanStack.push(span);
                    break;
                }
                case "close": {
                    let span = document.createElement("span");


                    if (!iter.content.includes("\n") && !iter.content.includes("\r")) {
                        span.append(document.createTextNode(iter.content));
                    }

                    span.style.setProperty("--local-depth", localDepth(iter));
                    span.style.setProperty("--global-depth", globalDepth(iter));
                    span.classList.add(iter.name);


                    let parent = spanStack.peek();

                    (parent != null) ? parent.append(span) : currentLine.append(span);
                    spanStack.pop();

                    break;
                }
                case "text": {
                    let span = document.createElement("span");
                    span.innerText = iter.content;
                    span.style.setProperty("--global-depth", globalDepth(iter));






                    span.classList.add("plain");

                    let parent = spanStack.peek();


                    (parent != null) ? parent.append(span) : currentLine.append(span);

                    break;
                }
                case "reserved": {
                    let span = document.createElement("span");
                    span.innerText = iter.content;
                    span.style.setProperty("--global-depth", globalDepth(iter));
                    span.classList.add(`${iter.name}`);

                    let parent = spanStack.peek();


                    (parent != null) ? parent.append(span) : currentLine.append(span);

                    break;
                }


                case "controll": {
                    switch (iter.name) {
                        case "CR":
                            let br = document.createElement("br");
                            currentLine.append(br);
                            //console.log(currentLine);




                            break;
                        case "NL":
                            fragment.append(currentLine);

                            currentLine = document.createElement("div");
                            currentLine.classList.add("line");

                            //console.log(spanStack);

                            let temp = spanStack.toArray().reduce((acc, curr) => {

                                let last = acc.peek();
                                let copy = curr.cloneNode();

                                if (!last) {

                                    currentLine.append(copy);
                                } else {

                                    last.append(copy);
                                }

                                acc.push(copy);

                                return acc;
                            }, new Stack());
                            spanStack = temp;
                            break;
                    }
                    break;
                }
            }

        }




        return fragment;
    };


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