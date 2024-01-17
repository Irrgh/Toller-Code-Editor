const Permissions = require("./permissions.js");


class User {

    constructor (displayname,selection,permissions) {
        this.displayname = displayname;
        this.selection = selection
        this.permissions = permissions;
        
    }

    static defaultUser () {


        return new User("unknown");
    }

}


module.exports = User;