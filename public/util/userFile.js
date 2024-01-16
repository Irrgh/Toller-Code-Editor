export async function readFile(fileHandle) {
    const file = await fileHandle.getFile();
    const fileContent = await file.text();
    return fileContent;
}

export async function writeFile(fileHandle, content) {
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
}




