

const FileManager = {}

FileManager.window = document.querySelector(".filemanager")

FileManager.init = function () {

    const iconDiv = document.createElement("div");
    iconDiv.classList.add("menu-bar")


    const selectDir = document.createElement("span");
    selectDir.id = "select-dir";
    selectDir.classList.add("menu-icon");
    selectDir.classList.add("material-symbols-outlined")
    selectDir.onclick = handleDirectorySelect;
    selectDir.append(document.createTextNode("folder_open"));
    
    const shareDir = document.createElement("span");
    selectDir.id = "upload-dir";
    shareDir.classList.add("menu-icon");
    shareDir.classList.add("material-symbols-outlined")
    shareDir.onclick = console.log("upload tried");
    shareDir.append(document.createTextNode("drive_folder_upload"));
    
    iconDiv.appendChild(selectDir);
    iconDiv.appendChild(shareDir);




    this.window.append(iconDiv);

    const files = document.createElement("pre");
    files.id = "files";

    this.window.append(files);


    FileManager.openFilesAndDirs = [];

    FileManager.selected = undefined;

}


FileManager.redraw = async function () {

    let files = document.querySelector("#files");

    let newFrag = document.createDocumentFragment();



    



    // Fetch all entries asynchronously
    const entries = await Promise.all(
        Array.from(FileManager.openFilesAndDirs.values()).map(async (entry) => {
            if (entry.kind === "file") {
                
                return FileManager.drawFile(entry, 0);
            } else if (entry.kind === "directory") {
                
                // Recursively process subdirectories
                return await FileManager.drawDir(entry,0);
            }
        })
    );

    // Append all entries to the item
    entries.forEach((entry) => newFrag.appendChild(entry));
    

    files.innerHTML = "";
    files.append(newFrag);

    console.log(files);

}



FileManager.drawDir = async function processDirectory(directoryHandle, depth) {

    console.log(`Directory: ${directoryHandle.name}`);
    const name = document.createTextNode(directoryHandle.name);
    const div = document.createElement("div");

    div.append(name);
    div.classList.add("dir");
    div.style.margin = "0";
    div.style.marginLeft = `${depth*10}px`
    div.setAttribute("opened","false");


    div.addEventListener("dblclick", function (event) {
        event.preventDefault();

    })


    div.addEventListener("click", async function (event) {

        event.preventDefault();

        event.stopPropagation();

        if (div.getAttribute("opened") === "false") {
            div.setAttribute("opened","true");

            for await (const entry of directoryHandle.values()) {
                if (entry.kind === "file") {
        
                    div.appendChild(FileManager.drawFile(entry, depth+0.5));
        
                } else if (entry.kind === "directory") {
                    
                    // Recursively process subdirectories        
        
                    div.appendChild(await processDirectory(entry,depth+0.5));
                }
            }



        } else if (div.getAttribute("opened") === "true") {
            div.setAttribute("opened", "false");

            this.innerHTML = "";
            div.appendChild(name);



        }



    })








    
    return div;
}



FileManager.drawFile = function (fileHandle,depth) {


    console.log(`File: ${fileHandle.name}`);
    const name = document.createTextNode(fileHandle.name);
    const div = document.createElement("div");

    div.append(name);
    div.style.margin = "0";
    div.style.marginLeft = `${depth*10}px`;   

    div.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        console.log(`${fileHandle.name} was clicked`);
    })

    div.addEventListener("dblclick", async function (event) {
        event.stopPropagation();
        event.preventDefault();

        const content =  await readFile(fileHandle);
        console.log(content);


        window.editor.loadContent(content);
    })



    return div;
}





//FileManager.redraw = function () {
//
//    const fileSelectionFragment = document.createDocumentFragment();
//
//    const list = document.createElement("ul");
//
//
//
//
//    FileManager.fileHandle.forEach(element => {
//        const name = document.createTextNode(element.name);
//        const item = document.createElement("li");
//        const div = document.createElement("div");
//
//
//        div.addEventListener("click", function () {
//            div.style.color = "red";
//        })
//
//
//
//        div.addEventListener("dblclick", function () {
//
//            alert(element.name);
//        })
//
//        div.append(name);
//        item.append(div);
//        list.append(item);
//    });
//
//    this.window.append(list);
//}




async function handleFileSelect() {

    try {
        // Request file system access
        const fileHandle = await window.showOpenFilePicker();
        const entry = fileHandle[0];

        if (entry.kind === "file") {
            // Read content from a file
            const fileContent = await readFile(entry);
            console.log(`File Content (${entry.name}):`, fileContent);

            // Write content back to the file (modify as needed)
            //await writeFile(entry, 'Modified content');
            console.log(`File Content after modification (${entry.name}):`, await readFile(entry));
        } else {
            console.log("Not a file" + fileHandle.isFile);
        }

        FileManager.openFilesAndDirs.push(entry);
        FileManager.redraw();


    } catch (error) {
        console.error('Error accessing the directory:', error);
    }




}



async function handleDirectorySelect() {
    try {
        // Request file system access
        const directoryHandle = await window.showDirectoryPicker();

        // Iterate through the directory entries
        //for await (const entry of directoryHandle.values()) {
        //    if (entry.kind === "file") {
        //        // Read content from a file
        //        const fileContent = await readFile(entry);
        //        console.log(`File Content (${entry.name}):`, fileContent);
        //
        //
        //    } else {
        //        console.log(entry);
        //    }
        //
        //
        //}

        FileManager.openFilesAndDirs.push(directoryHandle);
        FileManager.redraw();




    } catch (error) {
        console.error('Error accessing the directory:', error);
    }
}

async function readFile(fileHandle) {
    const file = await fileHandle.getFile();
    const fileContent = await file.text();
    return fileContent;
}

async function writeFile(fileHandle, content) {
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
}

// Trigger the directory selection process
//handleDirectorySelect();





















