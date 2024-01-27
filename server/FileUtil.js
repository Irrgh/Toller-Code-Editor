const fs = require("fs");
const path = require("path");


class FileUtil {

    static read (file) {

        console.log(path.join(__dirname,file))

        return fs.readFileSync(path.join(__dirname,file),{encoding:"utf-8"});
    }


    static write (file,content) {


        fs.writeFileSync(path.join(__dirname,file),content,{encoding:"utf-8"});
    }




}

module.exports = FileUtil;
