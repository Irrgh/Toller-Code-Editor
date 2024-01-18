import { readFile,writeFile } from "../util/userFile.js";



export {Editor};


class Editor {

    users;
    fileDisplay;
    quickAccess;
    pathDisplay;
    static instance;

    constructor () {
        this.fileDisplay = document.querySelector(".editor");
        this.quickAccess = document.querySelector(".quick-access-bar");
        this.pathDisplay = document.querySelector(".path-display");


        console.log(this);
        this.fixForEmptyDocument();
        this.addInputBehavior();
        this.addScrollBehavior();
    }

    static getInstance() {

        if (!Editor.instance) {
            Editor.instance = new Editor();
        }
        return Editor.instance;
    }



    addInputBehavior() {







        this.fileDisplay.addEventListener("keydown", (event) => {
    
            console.log(this.getSelectionIndecies(this.fileDisplay));
    
            let start = performance.now();
            this.getTextContent(this.fileDisplay);
            let end = performance.now();
    
            console.log(`time needed: ${end-start} ms`);
    
    
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
    
                    insertOnSameLine(document.createTextNode(plainText));
                    
                } else {
    
                    const sameLine = plainText.slice(0,firstNewLinePos);    // stuff added on the same line
                    const line = insertOnSameLine(document.createTextNode(sameLine));   // returns dom element "line" i hope
    
                    plainText = plainText.slice(firstNewLinePos+1);       // already added chars get cut off
    
                    const fragment = stringToLineFragment(plainText);
    
                    insertAfterLine(line,fragment);
    
    
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

    fixForEmptyDocument() {
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

    async loadContent (fileHandle) {

        const file = await fileHandle.getFile()
    
        const fileType = file.type;
    
        console.log(fileType);
    
        if (fileType.startsWith("image/")) {
    
            const image = await readFile(fileHandle);
    
            this.fileDisplay.innerHTML = "";
    
            const imageElement = new Image();
            imageElement.src = URL.createObjectURL(file);
            imageElement.classList.add("image");
    
            const imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");
            
            imageContainer.append(imageElement);
    
            this.fileDisplay.append(imageContainer);
    
    
    
    
    
    
        } else if (fileType.startsWith("text/")) {
    
            const text = await readFile(fileHandle);
    
            const newContent = Editor.stringToLineFragment(text);
    
            this.fileDisplay.innerHTML = "";
    
            this.fileDisplay.append(newContent);
    
        } else {
            console.log(`unknown file type: ${fileType}`);
        }
    
    
        console.log(fileHandle);
    
    
    
    
    }

    static getTextContentFromRange(range) {
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
    static stringToLineFragment(string) {


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


    getSelectionIndecies() {

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

    addScrollBehavior() {
        var scrolling = false;
    

        
        this.fileDisplay.addEventListener("wheel", (event) => {
            const isVerticalScroll = Math.abs(event.deltaY) > Math.abs(event.deltaX);
    
            
            if (isVerticalScroll && scrolling) {
                
                this.fileDisplay.classList.add("vertical-scrolling");
                // Your vertical scroll logic here
            } else {
                this.fileDisplay.classList.add("horizontal-scrolling");
            }
    
    
            const scrollPercentageVertical = (scrollPos) => {
                return Math.round(scrollPos) / Math.round(this.fileDisplay.scrollHeight - this.fileDisplay.clientHeight);
            }
    
            const scrollPercentageHorizontal = (scrollPos) => {
                return Math.round(scrollPos) / Math.round(this.fileDisplay.scrollWidth - this.fileDisplay.clientWidth);
            }
    
    
    
    
    
    
    
            // Calculate a color based on the scroll position
            const newColorVertical1 = `hsl(${scrollPercentageVertical(this.fileDisplay.scrollTop) * 360}, 70%, 80%)`;
            const newColorVertical2 = `hsl(${scrollPercentageVertical(this.fileDisplay.scrollTop) * 360}, 70%, 80%)`;
    
            const newColorHorizontal1 = `hsl(${scrollPercentageHorizontal(this.fileDisplay.scrollLeft) * 360}, 70%, 80%)`;
            const newColorHorizontal2 = `hsl(${scrollPercentageHorizontal(this.fileDisplay.scrollLeft) * 360}, 70%, 80%)`;
    
    
    
            // Set the color of the scrollbar thumb
            // Add the "scrolling" class to the target element
            this.fileDisplay.style.setProperty('--vertical-gradient', `linear-gradient(180deg in hsl longer hue,${newColorVertical1}, ${newColorVertical2})`);
            this.fileDisplay.style.setProperty('--horizontal-gradient', `linear-gradient(deg90 in hsl longer hue, ${newColorHorizontal1}, ${newColorHorizontal2})`);
    
        });
    
    
        this.fileDisplay.addEventListener("scroll", () => {
    
            scrolling = true;
            clearTimeout(this.fileDisplay.scrollTimeout);
    
            this.fileDisplay.scrollTimeout = setTimeout(() => {
                scrolling = false;
                this.fileDisplay.classList.remove('vertical-scrolling');
                this.fileDisplay.classList.remove('horizontal-scrolling');
            }, 350);
    
    
        });
    }


    insertOnSameLineAfterSelection(node) {
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
    
    insertAfterLine(line,fragment) {
    
        const range = document.createRange();
    
        range.setStartAfter(line);
        range.setEndAfter(line)
    
        range.insertNode(fragment);
    
    }
    
    getTextContent() {

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

}

