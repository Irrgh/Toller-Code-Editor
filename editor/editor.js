const Editor = {}




Editor.updatePage = function updateEditorWindows() {

    const editorwindows = document.querySelectorAll(".editor");

    editorwindows.forEach(editor => {
        removeAllEventListeners(editor);


        editor.addEventListener("scoll", function () {

            const scrollTop = editor.scrollTop;
            const maxScroll = editor.scrollHeight - window.innerHeight;
            const scrollPercentage = scrollTop / maxScroll;

            // Calculate a color based on the scroll position
            const newColor1 = `hsl(${scrollPercentage * 360}, 50%, 70%)`;
            const newColor2 = `hsl(${scrollPercentage * 360 + 90}, 50%, 70%)`;


            // Set the color of the scrollbar thumb
        
            // Add the "scrolling" class to the target element
            targetElement.classList.add('scrolling');

            // Clear the timeout if scrolling continues
            clearTimeout(targetElement.scrollTimeout);

            // Set a timeout to remove the class after a delay (adjust as needed)
            targetElement.scrollTimeout = setTimeout(() => {
                targetElement.classList.remove('scrolling');
            }, 500); // 500 milliseconds delay



        })









    });

}





function removeAllEventListeners(element) {
    const clone = element.cloneNode(true);
    element.replaceWith(clone);
}


