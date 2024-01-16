const parser = require("../parser/parser.js");
const v8 = require("v8");


class RopeNode {
    constructor(value, left = null, right = null, weight = value.length) {
      this.value = value;
      this.left = left;
      this.right = right;
      this.weight = weight;
    }
  }
  
  class Rope {
    constructor(str) {
      this.root = this.buildRope(str);
    }
  
    buildRope(str) {
      if (str.length <= 128) {
        return new RopeNode(str);
      }
  
      const mid = Math.floor(str.length / 2);
      const leftSubtree = this.buildRope(str.slice(0, mid));
      const rightSubtree = this.buildRope(str.slice(mid));
  
      return new RopeNode(null, leftSubtree, rightSubtree, str.length);
    }
  
    concatenate(node1, node2) {
      return new RopeNode(null, node1, node2, node1.weight + node2.weight);
    }
  
    insert(index, subStr, node = this.root) {
      if (!node.left && !node.right) {
        const leftPart = new RopeNode(node.value.slice(0, index));
        const insertedNode = new RopeNode(subStr);
        const rightPart = new RopeNode(node.value.slice(index));
  
        node.value = null;
        node.left = this.concatenate(leftPart, insertedNode);
        node.right = rightPart;
        node.weight = node.left.weight + node.right.weight;
      } else {
        if (index <= node.left.weight) {
          this.insert(index, subStr, node.left);
        } else {
          this.insert(index - node.left.weight, subStr, node.right);
        }
        node.weight = node.left.weight + node.right.weight;
      }
    }

    cut(start, end) {
        if (start < 0 || end < start || end > this.root.weight) {
          throw new Error("Invalid indices");
        }
    
        const [left, right] = this._cut(start, end, this.root);
        this.root = left ? this.concatenate(left, right) : right;
      }
    
      _cut(start, end, node) {
        if (!node.left && !node.right) {
          const leftPart = new RopeNode(node.value.slice(0, start));
          const cutPart = new RopeNode(node.value.slice(start, end));
          const rightPart = new RopeNode(node.value.slice(end));
    
          node.value = null;
          return [leftPart, rightPart];
        } else {
          let leftResult = null;
          let rightResult = null;
    
          if (start < node.left.weight) {
            [leftResult, rightResult] = this._cut(start, Math.min(end, node.left.weight), node.left);
          }
          if (end > node.left.weight) {
            const [left, right] = this._cut(Math.max(0, start - node.left.weight), end - node.left.weight, node.right);
            leftResult = left;
            rightResult = this.concatenate(rightResult, right);
          }
    
          return [leftResult, rightResult];
        }
      }


  
    toString(node = this.root) {
      if (!node.left && !node.right) {
        return node.value;
      }
      return this.toString(node.left) + this.toString(node.right);
    }
  }
  

  // Example usage:
  let start = performance.now()
  const rope = new Rope(parser.read("editor/editor.js"));
  let end = performance.now();


  //console.log("Original Rope:", rope.toString());
  console.log(`time needed for rope: ${end-start} ms`);
  
  start = performance.now();
  rope.insert(1000 , "Awesome ");
  end = performance.now();

  console.log(`time needed for insert: ${end-start} ms`);

  start = performance.now();
  const text = rope.toString();
  end = performance.now();

  console.log(text);
  console.log(`time needed for toString: ${end-start} ms`);
  