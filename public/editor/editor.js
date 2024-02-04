import { readFile, writeFile } from "../util/userFile.js";
import { Database } from "../util/database.js";
import { Lexer } from "../parser/lexer.js";


export { Editor };


class Editor {

    users;
    fileDisplay;
    quickAccess;
    pathDisplay;

    fileManager;
    createFile;
    createFolder;
    openFolder;
    shareFolder;
    openDir;
    files;
    selected;

    lexer;
    local;


    menuBars;
    db;


    static instance;

    constructor() {
        this.fileDisplay = document.querySelector(".editor");
        this.quickAccess = document.querySelector(".quick-access-bar");
        this.pathDisplay = document.querySelector(".path-display");

        this.fileManager = document.querySelector(".filemanager");
        console.log(this.fileManager);

        this.createFile = this.fileManager.querySelector("#create-file");
        this.createFolder = this.fileManager.querySelector("#create-folder");
        this.openFolder = this.fileManager.querySelector("#open-folder");
        this.shareFolder = this.fileManager.querySelector("#share-folder");
        // this.files = this.fileManager.querySelector(".files");


        this.openFolder.addEventListener("click", this.handleDirectorySelect);
        this.shareFolder.addEventListener("click", this.handleShareFolder);

        this.menuBars = document.querySelectorAll(".menu-bar-horizontal");


        this.local = true;
        this.openDir = undefined;
        this.lexer = undefined;
        this.db = this.initDB();



        this.addInvisibleScrollForMenuBars();
        this.initalFileOpenOptions();


        console.log(this);
        this.fixForEmptyDocument();
        this.addInputBehavior();
        this.addScrollBehavior();
    }

    initDB = async () => {
        this.db = await Database.init("test2");
        //this.db.clearTable();
        console.log(this.db);
    }

    static getInstance() {

        if (!Editor.instance) {
            Editor.instance = new Editor();
        }
        return Editor.instance;
    }

    addInvisibleScrollForMenuBars = () => {
        this.menuBars.forEach((menu) => {

            let scrollPercentage = 0;


            menu.addEventListener("wheel", (event) => {

                if (menu.scrollWidth > menu.clientWidth) {

                    let ratio = menu.scrollWidth / menu.clientWidth;

                    scrollPercentage = Math.max(0, Math.min(1, scrollPercentage - event.deltaY * ratio / 1000));

                    console.log(`scrolling to: ${scrollPercentage}`);
                    console.log(event.deltaY);

                    menu.scrollLeft = (menu.scrollWidth - menu.clientWidth) * scrollPercentage;

                } else {

                    scrollPercentage = 0;

                }
            });
        });
    }

    initalFileOpenOptions = () => {

        const nothing = document.querySelector(".nothing-selected");

        const any = nothing.querySelector("#open-any");
        const recent = nothing.querySelector("#open-recent");
        const coop = nothing.querySelector("#open-remote");

        const files = document.createElement("pre");
        files.classList.add("files");

        const common = () => {
            this.fileManager.removeChild(nothing);
            this.fileManager.append(files);
            this.files = files;

            console.log(this);

            this.createFile.classList.remove("invisible");
            this.createFolder.classList.remove("invisible");
            this.openFolder.classList.remove("invisible");
            this.shareFolder.classList.remove("invisible");
        }


        any.addEventListener("click", async (event) => {


            const res = await this.handleDirectorySelect();

            if (res === "success") {
                common();
                this.redraw();
            }

        });


        recent.addEventListener("click", async (event) => {
            //common();

            // look up indexedDb somehow ???

            const res = await this.db.readAll();

            console.log(res);

            this.fileDisplay.innerHTML = "";

            const links = document.createElement("ul");

            res.forEach((stored) => {

                const link = document.createElement("li");
                link.append(document.createTextNode(stored.name));

                link.addEventListener("click", async (event) => {
                    event.preventDefault();

                    console.log(stored.fileHandle.queryPermission({ mode: "readwrite" }));
                    const perm = await stored.fileHandle.requestPermission({ mode: "readwrite" });


                    if (perm === "granted") {
                        this.openDir = stored.fileHandle;

                        common();
                        this.redraw();
                    }

                })

                links.append(link);

            });
            nothing.append(links);
        });

        coop.addEventListener("click", (event) => {
            common();


            // request workspaces to choose from


        });






    }



    addInputBehavior = () => {







        this.fileDisplay.addEventListener("keydown", (event) => {

            console.log(this.getSelectionIndecies(this.fileDisplay));

            let start = performance.now();
            this.getTextContent(this.fileDisplay);
            let end = performance.now();

            console.log(`time needed: ${end - start} ms`);


            if (event.key === "Tab") {
                event.preventDefault(); // Prevent the default Tab behavior

                // Manually insert a tab character at the current caret position
                var tabNode = document.createTextNode("\t");
                var selection = window.getSelection();
                var range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(tabNode);
                range.setStartAfter(tabNode);
                range.setEndAfter(tabNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            if (event.key === "Enter") {
            }





        });


        this.fileDisplay.addEventListener("paste", (event) => {

            event.preventDefault();
            // only pasting plain text
            const clipboardData = event.clipboardData || window.clipboardData;

            if (clipboardData) {        // clipboard defined??

                // Get the plain text content
                var plainText = clipboardData.getData('text/plain');

                const firstNewLinePos = plainText.indexOf("\n");

                if (firstNewLinePos === -1) {                               // everything will be pasted into the current line

                    this.insertOnSameLineAfterSelection(document.createTextNode(plainText));

                } else {

                    const sameLine = plainText.slice(0, firstNewLinePos);    // stuff added on the same line
                    const line = this.insertOnSameLineAfterSelection(document.createTextNode(sameLine));   // returns dom element "line" i hope

                    plainText = plainText.slice(firstNewLinePos + 1);       // already added chars get cut off

                    const fragment = Editor.stringToLineFragment(plainText);

                    this.insertAfterLine(line, fragment);


                }






                //const selection = window.getSelection();
                //const range = document.createRange();
                //range.setStartAfter(fragment);
                //range.setEndAfter(fragment);
                //range.collapse(true);


                //selection.removeAllRanges();
                //selection.addRange(range);
            }




        });



        this.fileDisplay.addEventListener("cut", function (event) {



        })





    }

    fixForEmptyDocument = () => {
        this.fileDisplay.focus();
        const sel = window.getSelection();
        const range = document.createRange();

        const tempchild = document.createElement("br");
        const firstLine = document.createElement("div");
        firstLine.classList.add("line");

        if (this.fileDisplay.firstChild) {
            this.fileDisplay.removeChild(this.fileDisplay.firstChild);
        }

        this.fileDisplay.appendChild(firstLine);

        this.fileDisplay.firstChild.appendChild(tempchild);

        range.setStart(this.fileDisplay.firstChild, 0);
        range.setEnd(this.fileDisplay.firstChild, 0);


        sel.removeAllRanges();
        sel.addRange(range);
    }







    loadContent = async (fileHandle) => {

        const file = await fileHandle.getFile()

        const fileType = file.type;

        console.log(fileType);

        if (fileType.startsWith("image/")) {

            const image = await readFile(fileHandle);

            this.fileDisplay.innerHTML = "";
            this.fileDisplay.setAttribute("contenteditable", "false");

            const imageElement = new Image();
            imageElement.src = URL.createObjectURL(file);
            imageElement.classList.add("image");

            const imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");

            imageContainer.append(imageElement);

            this.fileDisplay.append(imageContainer);

        } else {

            this.fileDisplay.setAttribute("contenteditable", "true");
            const text = await readFile(fileHandle);

            const ending = file.name.slice(file.name.indexOf("."))

            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: ending })
            }


            const format = await fetch("/highlight", options);

            const style = await fetch("/styles", options);



            if (format.ok) {

                const json = await format.json();

                console.log(json);


                this.lexer = new Lexer(json);


            } else {

                this.lexer = new Lexer({ main: { subScopes: [] } });

            }

            const sel = { selectionStart: 0, selectionEnd: 0 };
            const action = { type: "paste", content: text };

            var res = this.lexer.lex(sel, action);
            console.log(res);



            let highlightStyles = document.querySelector("#colorStyles");
            if (!highlightStyles) {
                highlightStyles = document.createElement("style");
                highlightStyles.id = "colorStyles";
                document.head.append(highlightStyles);
            }


            if (style.ok) {

                highlightStyles.textContent = await style.text();

            } else {

                highlightStyles.textContent = `.line *:focus-within {color:red;}`;
            }

            

            const newContent = Lexer.toHtml(res.result);

            this.fileDisplay.innerHTML = "";

            this.fileDisplay.append(newContent);

        }

        console.log(fileType);
        console.log(fileHandle);




    }

    static getTextContentFromRange = (range) => {
        const documentFragment = range.cloneContents();
        const textContent = [];

        function extractText(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                textContent.push(node.nodeValue);
            } else if (node.nodeType === Node.ELEMENT_NODE) {

                for (const childNode of node.childNodes) {
                    extractText(childNode);
                }
                if (node.tagName.toLowerCase() === "div") {
                    textContent.push("\n")
                }
            }
        }


        for (const childNode of documentFragment.childNodes) {
            extractText(childNode);
        }

        return textContent.join("");
    }


    // TODO: need to highlighting to this
    static stringToLineFragment = (string) => {


        const fragment = document.createDocumentFragment();


        const splits = string.split("\n");


        for (var i = 0; i < splits.length; i++) {


            // TODO: insert syntax highlighter somewhere here


            const lineDiv = document.createElement("div");

            const lineContent = document.createTextNode(splits[i]);
            const carriageReturn = document.createElement("br");

            lineDiv.classList.add("line");
            lineDiv.append(lineContent);
            lineDiv.append(carriageReturn);

            fragment.append(lineDiv);




        }
        return fragment;
    }


    getSelectionIndecies = () => {

        const selection = window.getSelection();

        if (!selection) {
            return undefined;
        }


        const range = selection.getRangeAt(0);

        const start = document.createRange();
        const end = document.createRange();
        const content = document.createRange();
        start.selectNodeContents(this.fileDisplay);
        start.setEnd(range.startContainer, range.startOffset);

        end.selectNodeContents(this.fileDisplay);
        end.setEnd(range.endContainer, range.endOffset);

        content.selectNodeContents(this.fileDisplay);
        content.setStart(range.startContainer, range.startOffset);
        content.setEnd(range.endContainer, range.endOffset);

        const startStr = start.toString();
        const endStr = end.toString();
        const contentStr = Editor.getTextContentFromRange(content);

        return { selectionStart: startStr.length, selectionEnd: endStr.length, content: contentStr };
    }

    addScrollBehavior = () => {
        var scrolling = false;



        this.fileDisplay.addEventListener("wheel", (event) => {
            const isVerticalScroll = Math.abs(event.deltaY) > Math.abs(event.deltaX);
            const isHorizontalScroll = Math.abs(event.deltaY) < Math.abs(event.deltaX);


            if (isVerticalScroll && scrolling) {

                this.fileDisplay.classList.add("vertical-scrolling");
                // Your vertical scroll logic here
            } else if (isHorizontalScroll && scrolling) {
                this.fileDisplay.classList.add("horizontal-scrolling");
            }


            const scrollPercentageVertical = (scrollPos) => {
                return Math.round(scrollPos) / Math.round(this.fileDisplay.scrollHeight);
            }

            const scrollPercentageHorizontal = (scrollPos) => {
                return Math.round(scrollPos) / Math.round(this.fileDisplay.scrollWidth);
            }


            const makeGradientColors = (s, e) => {

                const start = s * 301;
                const end = e * 301;

                const diff = end - start;



                return `hsl(${Math.round(start)}, 70%, 50%) 0%,
                         hsl(${Math.round(start + diff * (1 / 6))}, 70%, 50%) 17%,
                         hsl(${Math.round(start + diff * (2 / 6))}, 70%, 50%) 34%,
                         hsl(${Math.round(start + diff * (3 / 6))}, 70%, 50%) 50%,
                         hsl(${Math.round(start + diff * (4 / 6))}, 70%, 50%) 66%,
                         hsl(${Math.round(start + diff * (5 / 6))}, 70%, 50%) 83%,
                         hsl(${Math.round(start + diff)}, 70%, 50%) 100%)`
            };





            // Calculate a color based on the scroll position
            const colorVert = makeGradientColors(scrollPercentageVertical(this.fileDisplay.scrollTop), scrollPercentageVertical(this.fileDisplay.scrollTop + this.fileDisplay.clientHeight));

            const colorHori = makeGradientColors(scrollPercentageHorizontal(this.fileDisplay.scrollLeft), scrollPercentageHorizontal(this.fileDisplay.scrollLeft + this.fileDisplay.clientWidth));



            // Set the color of the scrollbar thumb
            // Add the "scrolling" class to the target element
            this.fileDisplay.style.setProperty('--vertical-gradient', `linear-gradient(180deg,${colorVert}`);
            this.fileDisplay.style.setProperty('--horizontal-gradient', `linear-gradient(90deg,${colorHori}`);

        }, { passive: true });


        this.fileDisplay.addEventListener("scroll", () => {

            scrolling = true;
            clearTimeout(this.fileDisplay.scrollTimeout);

            this.fileDisplay.scrollTimeout = setTimeout(() => {
                scrolling = false;
                this.fileDisplay.classList.remove('vertical-scrolling');
                this.fileDisplay.classList.remove('horizontal-scrolling');
            }, 350);


        }, { passive: true });
    }


    insertOnSameLineAfterSelection = (node) => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);



        // If the range is collapsed, insert the node at the selection
        if (range.collapsed) {
            range.insertNode(node);
            return range.commonAncestorContainer;
        } else {
            // If the range is not collapsed, delete the selected content and insert the node
            range.deleteContents();
            range.insertNode(node);
            return node;
        }
        // if im not retarted that should be the <div class="line"> where i just add content
    }

    insertAfterLine = (line, fragment) => {

        const range = document.createRange();

        range.setStartAfter(line);
        range.setEndAfter(line)

        range.insertNode(fragment);

    }

    getTextContent = () => {

        const textContent = [];
        function extractText(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                textContent.push(node.nodeValue);
            } else if (node.nodeType === Node.ELEMENT_NODE) {

                for (const childNode of node.childNodes) {
                    extractText(childNode);
                }
                if (node.tagName.toLowerCase() === "div" && node.classList.contains("line")) {
                    textContent.push("\n")
                }
            }
        }

        for (const childNode of this.fileDisplay.childNodes) {
            extractText(childNode);
        }
        return textContent.join("");
    }



    redraw = async () => {

        let newFrag = document.createDocumentFragment();

        newFrag.append(await this.drawDir(this.openDir, 0));


        this.files.innerHTML = "";
        this.files.append(newFrag);

        console.log(this.files);

    }



    drawDir = async (directoryHandle, depth) => {

        console.log(`Directory: ${directoryHandle.name}`);
        console.log(directoryHandle);
        const nameSpan = document.createElement("div");
        const name = document.createTextNode(directoryHandle.name);
        const div = document.createElement("div");

        nameSpan.append(name);
        nameSpan.classList.add("dir-name");


        div.append(nameSpan);
        div.classList.add("dir");
        div.style.padding = "0";
        div.style.paddingLeft = `0.5em`
        div.setAttribute("opened", "false");


        nameSpan.addEventListener("dblclick", function (event) {
            event.preventDefault();

        })


        nameSpan.addEventListener("click", async (event) => {

            event.preventDefault();

            event.stopPropagation();

            if (div.getAttribute("opened") === "false") {
                div.setAttribute("opened", "true");

                for await (const entry of directoryHandle.values()) {
                    if (entry.kind === "file") {

                        div.appendChild(this.drawFile(entry, depth + 0.5));

                    } else if (entry.kind === "directory") {

                        // Recursively process subdirectories     

                        console.log(this);

                        div.appendChild(await this.drawDir(entry, depth + 0.5));
                    }
                }

            } else if (div.getAttribute("opened") === "true") {
                div.setAttribute("opened", "false");

                div.innerHTML = "";
                div.appendChild(nameSpan);



            }




        });


        return div;
    }



    drawFile = (fileHandle, depth) => {


        console.log(`File: ${fileHandle.name}`);
        const name = document.createTextNode(fileHandle.name);
        const div = document.createElement("div");

        div.classList.add("file");
        div.append(name);
        div.style.margin = "0";
        div.style.marginLeft = `0.5em`;

        div.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log(`${fileHandle.name} was clicked`);
        })

        div.addEventListener("dblclick", async (event) => {
            event.stopPropagation();
            event.preventDefault();

            console.log(this);

            const path = await this.openDir.resolve(fileHandle);

            console.log(path);

            this.pathDisplay.innerText = path


            this.loadContent(fileHandle);
        })



        return div;
    }



    handleDirectorySelect = async () => {
        try {
            // Request file system access
            const directoryHandle = await window.showDirectoryPicker();

            this.openDir = directoryHandle;

            console.log(this.db);

            this.db.write(directoryHandle);

            return "success";
        } catch (error) {
            console.error('Error accessing the directory:', error);
            return "error";
        }
    }


    handleShareFolder = () => {


        var request = new XMLHttpRequest();
        request.open("POST", "/workspaces", true);
        request.onload = function () {
            console.log(request.responseText);
        }
        request.send();



    }


    handleCoopFolder = () => {

    };



}

