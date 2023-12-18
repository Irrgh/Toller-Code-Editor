const Editor = {}











Editor.updatePage = function updateEditorWindows() {

    const editorwindows = document.querySelectorAll(".editor");

    editorwindows.forEach(editor => {




        editor.addEventListener("wheel", function (event) {
            const isVerticalScroll = Math.abs(event.deltaY) > Math.abs(event.deltaX);
    
            if (isVerticalScroll) {
              editor.classList.add("vertical-scrolling");
              // Your vertical scroll logic here
            } else {
              editor.classList.add("horizontal-scrolling");
            }

            console.log("scrolling");
            const scrollTop = editor.scrollTop;
            const maxScroll = editor.scrollHeight - window.innerHeight;

            const scrollPercentage = scrollTop / maxScroll;

            // Calculate a color based on the scroll position
            const newColor1 = `hsl(${scrollPercentage}, 50%, 70%)`;
            const newColor2 = `hsl(${scrollPercentage + 100}, 50%, 70%)`;


            // Set the color of the scrollbar thumb
        
            // Add the "scrolling" class to the target element
            

            editor.style.setProperty('--vertical-gradient', `linear-gradient(to bottom, ${newColor1}, ${newColor2})`);
            editor.style.setProperty('--horizontal-gradient', `linear-gradient(to right, ${newColor1}, ${newColor2})`);




            clearTimeout(editor.scrollTimeout);

            editor.scrollTimeout = setTimeout(() => {
                editor.classList.remove('vertical-scrolling');
                editor.classList.remove('horizontal-scrolling');
            }, 100); // 500 milliseconds delay

        });


        editor.addEventListener("scroll", function () {


            

        });


    });

}





function removeAllEventListeners(element) {
    const clone = element.cloneNode(true);
    element.replaceWith(clone);
}


