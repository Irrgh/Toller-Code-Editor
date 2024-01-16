class Permissions {

    constructor(read,write,createFile,deleteFile,renameFile,managePermissions) {
        this.read = read;
        this.write = write;
        this.createFile = createFile;
        this.deleteFile = deleteFile;
        this.renameFile = renameFile;
        this.managePermissions = managePermissions;
    }

    static defaultPermissions () {
        return new Permissions(true,true,true,true,true,false);
    }

    static adminPermissisons () {
        return new Permissions(true,true,true,true,true,true);
    }

    static viewOnlyPermissions () {
        return new Permissions(true,false,false,false,false,false);
    }


}