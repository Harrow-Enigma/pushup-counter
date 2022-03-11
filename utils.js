const utils = {
  createElement: (type, attributes) => {
    let element = document.createElement(type);
    for (var key in attributes) {
      if (key == "class") {
        element.classList.add.apply(element.classList, attributes[key]);
      } else {
        element[key] = attributes[key];
      }
    }
    return element;
  },
  drawPoint: (ctx, y, x, r, name) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff0000";
    ctx.fill();

    ctx.font = "7px Arial";
    ctx.fillText(name, x + 7, y + 2);
  },
};
