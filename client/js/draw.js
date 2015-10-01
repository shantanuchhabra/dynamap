// Helper drawing functions

function getRandomColor() {
    var letters = '0123456789abcde'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 15)];
    }
    return color;
}

// Map x, y from [-180, +180] to the domain of canvas x
function translateX(x) {
  return x * 4 + 960;
}
function translateY(y) {
  return 1080 - (y * 4 + 540);
}

function moveToPoint(point, ctx) {
  var x = translateX(point.x);
  var y = translateY(point.y);

  ctx.moveTo(x, y);
}

function lineToPoint(point, ctx) {
  var x = translateX(point.x);
  var y = translateY(point.y);

  ctx.lineTo(x, y);
}

function drawShape(points, color, ctx) {
  var start = points[0],
      rest  = points.slice(1);

  ctx.fillStyle = color;
  ctx.beginPath();

  moveToPoint(start, ctx);

  rest.forEach(function(point) {
    lineToPoint(point, ctx);
  });

  ctx.closePath();
  ctx.fill();
}

function drawCountry(country) {
  var ctx = window.ctx;

  var parts  = country.parts.slice(0),
      points = country.points,
      color  = country.color;

  parts.push(points.length);

  if (parts.length == 1) {
    drawShape(points, color, ctx);
  } else {
    for (var i = 0; i < parts.length - 1; i++) {
      drawShape(points.slice(parts[i], parts[i + 1]), color, ctx);
    }
  }
}

// Drawing with borders
function drawShapeWithBorder(points, color, ctx) {
  var start = points[0],
      rest  = points.slice(1);

  ctx.fillStyle = color;
  ctx.strokeStyle = '#333';

  ctx.lineWidth = 3;
  ctx.beginPath();

  moveToPoint(start, ctx);

  rest.forEach(function(point) {
    lineToPoint(point, ctx);
  });

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawCountryWithBorder(country) {
  var ctx = window.ctx;

  var parts  = country.parts.slice(0),
      points = country.points,
      color  = country.color;

  parts.push(points.length);

  if (parts.length == 1) {
    drawShapeWithBorder(points, color, ctx);
  } else {
    for (var i = 0; i < parts.length - 1; i++) {
      drawShapeWithBorder(points.slice(parts[i], parts[i + 1]), color, ctx);
    }
  }
}
