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
  getDistance: (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  },
  getPointToLine: (shoulderX, shoulderY, elbow1X, elbow1Y, elbow2X, elbow2Y) => {
    var A = shoulderX - elbow1X;
    var B = shoulderY - elbow1Y;
    var C = elbow2X - elbow1X;
    var D = elbow2Y - elbow1Y;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;

    // in case of 0 length line
    if (len_sq != 0) {
      param = dot / len_sq;
    }

    var xx, yy;

    if (param < 0) {
      xx = elbow1X;
      yy = elbow1Y;
    } else if (param > 1) {
      xx = elbow2X;
      yy = elbow2Y;
    } else {
      xx = elbow1X + param * C;
      yy = elbow1Y + param * D;
    }

    var dx = shoulderX - xx;
    var dy = shoulderY - yy;
    return Math.sqrt(dx * dx + dy * dy);
  },
};
