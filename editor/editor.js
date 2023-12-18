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

            const scrollTop = editor.scrollTop;
            const maxScrollVertical = editor.scrollHeight - window.innerHeight;
            const ratioVertical = editor.scrollHeight / window.innerHeight;

            const scrollLeft = editor.scrollLeft;
            const maxScrollHorizontal = editor.scrollWidth - window.innerWidth;
            const ratioHorizontal = editor.scrollWidth / window.innerWidth;


            const scrollPercentageVertical = scrollTop / maxScrollVertical;
            const scrollPercentageHorizontal = scrollLeft / maxScrollHorizontal;

            // Calculate a color based on the scroll position
            const newColorVertical1 = `hsl(${scrollPercentageVertical * 360}, 70%, 80%)`;
            const newColorVertical2 = `hsl(${scrollPercentageVertical * 360 + 360  / ratioVertical}, 70%, 80%)`;

            const newColorHorizontal1 = `hsl(${scrollPercentageHorizontal * 360}, 70%, 80%)`;
            const newColorHorizontal2 = `hsl(${scrollPercentageHorizontal * 360 + 360  / ratioHorizontal }, 70%, 80%)`;



            // Set the color of the scrollbar thumb
        
            // Add the "scrolling" class to the target element
            

            editor.style.setProperty('--vertical-gradient', `linear-gradient(to bottom, ${newColorVertical1}, ${newColorVertical2})`);
            editor.style.setProperty('--horizontal-gradient', `linear-gradient(to right, ${newColorHorizontal1}, ${newColorHorizontal2})`);

        });


        editor.addEventListener("scroll", function () {

            clearTimeout(editor.scrollTimeout);

            editor.scrollTimeout = setTimeout(() => {
                editor.classList.remove('vertical-scrolling');
                editor.classList.remove('horizontal-scrolling');
            }, 250); // 500 milliseconds delay
            

        });


    });

}





function removeAllEventListeners(element) {
    const clone = element.cloneNode(true);
    element.replaceWith(clone);
}


