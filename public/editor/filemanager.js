import { readFile,writeFile } from "../util/userFile.js";
import { Editor } from "./editor.js";

const FileManager = {}

FileManager.window = document.querySelector(".filemanager")

FileManager.init = function () {

    const openFolder = this.window.querySelector("#openFolder");
    const shareFolder = this.window.querySelector("#shareFolder");

    openFolder.addEventListener("click", handleDirectorySelect);
    shareFolder.addEventListener("click", function () {console.log("share clicked @see filemanager.init()")});

    FileManager.openFilesAndDirs = [];

    FileManager.selected = undefined;

}


FileManager.redraw = async function () {

    let files = document.querySelector(".files");

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
    div.style.marginLeft = `0.5em`
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

    div.classList.add("file");
    div.append(name);
    div.style.margin = "0";
    div.style.marginLeft = `0.5em`;   

    div.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        console.log(`${fileHandle.name} was clicked`);
    })

    div.addEventListener("dblclick", async function (event) {
        event.stopPropagation();
        event.preventDefault();

        Editor.loadContent(fileHandle);
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


export {FileManager};



















