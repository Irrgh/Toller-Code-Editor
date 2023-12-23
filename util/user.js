const Permissions = require("./permissions.js");


class User {

    constructor (displayname,) {
        this.displayname = "local"
        this.selection = {selectionStart : 0, selectionEnd : 0, content : 0}
        this.permissions = Permissions.adminPermissisons();
        
    }



}


module.exports = User;