const FileManager = {}

FileManager.window = document.querySelector("#filemanager")

FileManager.init = function () {

    const selectDir = document.createElement("button");
    selectDir.id = "selectDir";
    selectDir.onclick = handleDirectorySelect;
    selectDir.style.width = "50%";
    selectDir.style.height = "20px";








    this.window.append(selectDir);





}



async function handleFileSelect() {

    try {
        // Request file system access
        const fileHandle = await window.showFilePicker();

        
            if (fileHandle.kind) {
                // Read content from a file
                const fileContent = await readFile(entry);
                console.log(`File Content (${entry.name}):`, fileContent);

                // Write content back to the file (modify as needed)
                //await writeFile(entry, 'Modified content');
                console.log(`File Content after modification (${entry.name}):`, await readFile(entry));
            } else {
                console.log("Not a file");
            }
        
    } catch (error) {
        console.error('Error accessing the directory:', error);
    }




}



async function handleDirectorySelect() {
    try {
        // Request file system access
        const directoryHandle = await window.showDirectoryPicker();

        // Iterate through the directory entries
        for await (const entry of directoryHandle.values()) {
            if (entry.kind) {
                // Read content from a file
                const fileContent = await readFile(entry);
                console.log(`File Content (${entry.name}):`, fileContent);

                // Write content back to the file (modify as needed)
                //await writeFile(entry, 'Modified content');
                console.log(`File Content after modification (${entry.name}):`, await readFile(entry));
            } else {
                console.log(entry);
            }
        }
    } catch (error) {
        console.error('Error accessing the directory:', error);
    }
}

async function readFile(fileHandle) {
    const file = await fileHandle.getFile();
    console.log("e")
    const fileContent = await file.text();
    console.log("e")
    return fileContent;
}

async function writeFile(fileHandle, content) {
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
}

// Trigger the directory selection process
//handleDirectorySelect();





















