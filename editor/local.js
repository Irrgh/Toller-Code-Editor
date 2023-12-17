function convertElementToPlainText() {
    var htmlContent = document.getElementById('htmlContent');
    var plainText = getPlainText(htmlContent);
    console.log(plainText);
  }

  function getPlainText(element) {
    var text = '';

    for (var i = 0; i < element.childNodes.length; i++) {
      var node = element.childNodes[i];

      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        text += getPlainText(node);
      }

      // Add a line break after each node (customize as needed)
      text += '\n';
    }

    return text;
  }