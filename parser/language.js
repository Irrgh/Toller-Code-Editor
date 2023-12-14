

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


function getReserved(language, scopeStack) {
    let scope = scopeStack.peek();
    if (scope == language.main) {
        return scope.reserved;
    } else if (scope.reserved === undefined) {
        return getReserved(scopeStack.pop());
    } else if (scope.reserved == []) {
        return getReserved(scopeStack.pop());
    } else {
        return scope.reserved;
    }


}





function getScopeByName(name,language) {
    
    function helper (name, start) {

        if (start.name === name) {
            return start;
        } else if (start.subScopes == [] || start.subScopes == undefined) {
            return undefined;
        } else {
        
            for (var i = 0; i < start.subScopes.length; i++) {
                var res = helper(name, start.subScopes[i]);
                if (res) {      // if res exists or not (i think)
                    return res;
                }
            }
        }
    }
    return helper(name,language.main);
}




  module.exports = {isSubScope, languageContainsScope, isRef, getScopeByName};








