class Stack {
    constructor() {
        this.items = [];
    }

    // Add element to the stack
    push(element) {
        this.items.push(element);
    }

    // Remove and return the top element from the stack
    pop() {
        if (this.isEmpty()) {
            return;
        }
        return this.items.pop();
    }

    // Return the top element without removing it
    peek() {
        if (this.isEmpty()) {
            return null; // Stack is empty
        }
        return this.items[this.items.length - 1];
    }

    // Check if the stack is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Return the number of elements in the stack
    size() {
        return this.items.length;
    }

    // Clear the stack
    clear() {
        this.items = [];
    }

    toArray() {
        return this.items;
    }

    copy() {
        const stackCopy = new Stack();
        stackCopy.items = [...this.toArray()];
        return stackCopy;
    }

    static fromArray (stack) {

        const s = new Stack();
        s.items = [...stack];

        return s;
    }

    equals (other) {

        if (this.size() != other.size()) {
            return false;
        }

        let arr1 = this.toArray();
        let arr2 = other.toArray();

        for (let i = 0; i < arr1.length; i++) {

            if (arr1[i] != arr2[i]) {
                return false;
            }

        }

        return true;
    }


}



export {Stack};


//test = new Stack();
//test.push(2);
//test.push(3);
//
//copy = test.copy();
//
//test.push(4);
//
//console.log(test,copy);
