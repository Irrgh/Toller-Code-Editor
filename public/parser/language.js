import { Stack } from "./stack.js";


class Language {

    static isSubScope(language, start, targetName) {

        if (Language.isRef(start)) {
            return false;
        } else if (start.name === targetName) {
            return true;
        } else if (start.name !== targetName) {
            let children = start.subScopes;

            let res = children.map(function (child) {         // recursive scope descent??
                return helper(language, child, targetName);
            })

            return res.reduce(function (acc, cur) {          // is atleast one true??
                return acc || cur;
            }, false)
        }

    }



    static languageContainsScope(language, scopeName) {
        return isSubScope(language, language.main, scopeName)
    }


    static isRef(value) {
        return typeof value === 'string';
    }


    static getReserved(language, scopeStack) {                // i must have been high?!?

        //console.log(language.main);

        // THE UNDERLYING STACK IS MODIFIED!!! NOT GOOD ::: FIXED
        //console.log(scopeStack);

        let scope = scopeStack.peek();

        if (scope == null) {
            return [];
        }



        if (scope == language.main) {
            //console.log("scope == main: " + JSON.stringify(scope));
            return scope.reserved || [];
        } else if (scope.reserved == undefined) {
            //console.log("scope reserved undefined: " + JSON.stringify(scope) + JSON.stringify(scope.reserved));
            scopeStack.pop();
            return Language.getReserved(language, scopeStack);
        } else if (scope.reserved == []) {
            //console.log("scope reserved == []: " + JSON.stringify(scope));
            scopeStack.pop();
            return Language.getReserved(language, scopeStack);
        } else {
            return scope.reserved || [];
        }


    }





    static getScopeByName(name, language) {

        function helper(name, start) {

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

        const temp = helper(name, language.main);

        if (temp == language.main) {

            return language.main.subScopes;

        }
        return [temp]
    }

}


export {Language};








