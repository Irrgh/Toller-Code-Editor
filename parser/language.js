


function isSubScope (language, start, targetName) {

    if (isRef(start)) {
        return false;
    }else if (start.name === targetName) {
        return true;
    } else if (start.name !== targetName) {
        let children = start.subScopes;

        let res = children.map(function (child) {         // recursive scope descent??
            return helper(language, child, targetName);
        })
        
        return res.reduce(function (acc,cur) {          // is atleast one true??
            return acc || cur;
        }, false)
    }

}






function languageContainsScope(language, scopeName) {    
    return isSubScope(language, language.main, scopeName)
}








function isRef(value) {
    return typeof value === 'string';
  }











