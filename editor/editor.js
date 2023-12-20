const Editor = {}











Editor.updatePage = function updateEditorWindows() {

    const editor = document.querySelector(".editor");
    editor.childNodes[0].focus();

    addScrollBehavior(editor);
    addInputBehavior(editor);




}










function getTextContentFromRange(range) {
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

function getTextContent (editor) {

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

    for (const childNode of editor.childNodes) {
        extractText(childNode);
    }
    return textContent.join("");
}


function stringToLines (lineContainer, string) {
    
    




}












function getSelectionIndecies(element) {

    const selection = window.getSelection();

    if (!selection) {
        return undefined;
    }


    const range = selection.getRangeAt(0);

    const start = document.createRange();
    const end = document.createRange();
    const content = document.createRange();
    start.selectNodeContents(element);
    start.setEnd(range.startContainer, range.startOffset);
    end.selectNodeContents(element);
    end.setEnd(range.endContainer, range.endOffset);

    content.selectNodeContents(element);
    content.setStart(range.startContainer, range.startOffset);
    content.setEnd(range.endContainer, range.endOffset);

    const startStr = start.toString();
    const endStr = end.toString();
    const contentStr = getTextContentFromRange(content);

    return { selectionStart: startStr.length, selectionEnd: endStr.length, content: contentStr };
}






function addInputBehavior(editor) {







    editor.addEventListener("keydown", function (event) {

        console.log(getSelectionIndecies(editor));

    });


    editor.addEventListener("paste", function (event) {

        event.preventDefault();
        // only pasting plain text
        const clipboardData = event.clipboardData || window.clipboardData;

        if (clipboardData) {        // clipboard defined??

            // Get the plain text content
            const plainText = clipboardData.getData('text/plain');

            const plainTextNode = document.createTextNode(plainText);

            insertAtCaret(plainTextNode);

            const selection = window.getSelection();
            const range = document.createRange();
            range.setStartAfter(plainTextNode);
            range.setEndAfter(plainTextNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });






}


function insertAtCaret(node) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // If the range is collapsed, insert the node at the selection
    if (range.collapsed) {
        range.insertNode(node);
    } else {
        // If the range is not collapsed, delete the selected content and insert the node
        range.deleteContents();
        range.insertNode(node);
    }
}








function addScrollBehavior(editor) {
    var scrolling = false;

    editor.addEventListener("wheel", function (event) {
        const isVerticalScroll = Math.abs(event.deltaY) > Math.abs(event.deltaX);

        if (isVerticalScroll && scrolling) {
            editor.classList.add("vertical-scrolling");
            // Your vertical scroll logic here
        } else {
            editor.classList.add("horizontal-scrolling");
        }


        function scrollPercentageVertical(scrollPos) {
            return Math.round(scrollPos) / Math.round(editor.scrollHeight - editor.clientHeight);
        }

        function scrollPercentageHorizontal(scrollPos) {
            return Math.round(scrollPos) / Math.round(editor.scrollWidth - editor.clientWidth);
        }







        // Calculate a color based on the scroll position
        const newColorVertical1 = `hsl(${scrollPercentageVertical(editor.scrollTop) * 360}, 70%, 80%)`;
        const newColorVertical2 = `hsl(${scrollPercentageVertical(editor.scrollTop) * 360}, 70%, 80%)`;

        const newColorHorizontal1 = `hsl(${scrollPercentageHorizontal(editor.scrollLeft) * 360}, 70%, 80%)`;
        const newColorHorizontal2 = `hsl(${scrollPercentageHorizontal(editor.scrollLeft) * 360}, 70%, 80%)`;



        // Set the color of the scrollbar thumb
        // Add the "scrolling" class to the target element
        editor.style.setProperty('--vertical-gradient', `linear-gradient(180deg in hsl longer hue,${newColorVertical1}, ${newColorVertical2})`);
        editor.style.setProperty('--horizontal-gradient', `linear-gradient(deg90 in hsl longer hue, ${newColorHorizontal1}, ${newColorHorizontal2})`);

    });


    editor.addEventListener("scroll", function () {

        scrolling = true;
        clearTimeout(editor.scrollTimeout);

        editor.scrollTimeout = setTimeout(() => {
            scrolling = false;
            editor.classList.remove('vertical-scrolling');
            editor.classList.remove('horizontal-scrolling');
        }, 350);


    });
}

function removeAllEventListeners(element) {
    const clone = element.cloneNode(true);
    element.replaceWith(clone);
}


