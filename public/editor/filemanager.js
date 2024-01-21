import { readFile, writeFile } from "../util/userFile.js";
import { Editor } from "./editor.js";





class FileManager {

    fileManager;
    createFile;
    createFolder;
    openFolder;
    shareFolder;
    openDirs;
    files;
    selected;
    static instance;

    constructor() {
        this.fileManager = document.querySelector(".filemanager");
        this.createFile = this.fileManager.querySelector("#create-file");
        this.createFolder = this.fileManager.querySelector("#create-folder");
        this.openFolder = this.fileManager.querySelector("#open-folder");
        this.shareFolder = this.fileManager.querySelector("#share-folder");
        this.files = this.fileManager.querySelector(".files");
        this.openDirs = [];

        this.openFolder.addEventListener("click", this.handleDirectorySelect);
        this.shareFolder.addEventListener("click", this.handleShareFolder);

        console.log(this);

        const menuBars = document.querySelectorAll(".menu-bar-horizontal");

        menuBars.forEach((menu) => {

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


    static getInstance() {
        if (!FileManager.instance) {
            FileManager.instance = new FileManager();
        }
        return FileManager.instance
    }


    redraw = async () => {



        let newFrag = document.createDocumentFragment();







        // Fetch all entries asynchronously
        const entries = await Promise.all(
            Array.from(this.openDirs.values()).map(async (entry) => {
                if (entry.kind === "file") {

                    return this.drawFile(entry, 0);
                } else if (entry.kind === "directory") {

                    // Recursively process subdirectories
                    return await this.drawDir(entry, 0);
                }
            })
        );

        // Append all entries to the item
        entries.forEach((entry) => newFrag.appendChild(entry));


        this.files.innerHTML = "";
        this.files.append(newFrag);

        console.log(this.files);

    }



    drawDir = async (directoryHandle, depth) => {

        console.log(`Directory: ${directoryHandle.name}`);
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



        })


        return div;
    }



    drawFile(fileHandle, depth) {


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

            this.openDirs.forEach(async (root) => {

                console.log(await root.resolve(fileHandle));

            });

            Editor.getInstance().loadContent(fileHandle);
        })



        return div;
    }




    async handleFileSelect() {

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

            this.openDirs.push(entry);
            this.redraw();


        } catch (error) {
            console.error('Error accessing the directory:', error);
        }




    }



    handleDirectorySelect = async () => {
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
            console.log(this);

            this.openDirs.push(directoryHandle);
            this.redraw();




        } catch (error) {
            console.error('Error accessing the directory:', error);
        }
    }


    handleShareFolder() {


        var request = new XMLHttpRequest();
        request.open("GET", "/workspaces", true);
        request.onload = function () {
            console.log(request.responseText);
        }
        request.send();



    }



}























export { FileManager };



















