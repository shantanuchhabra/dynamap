function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function moveToPoint(point, ctx) {
  // Need to make the coords positive
  var x = 180 + parseFloat(point[0]);
  var y = 180 - parseFloat(point[1]);

  ctx.moveTo(x * 3, y * 3);
}

function lineToPoint(point, ctx) {
  // Need to make the coords positive
  var x = 180 + parseFloat(point[0]);
  var y = 180 - parseFloat(point[1]);

  ctx.lineTo(x * 3, y * 3);
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

function drawCountry(country, ctx) {
  var parts  = country.parts,
      points = country.points;

  parts.push(points.length);

  var color = getRandomColor();
  
  if (parts.length == 1) {
    drawShape(points, color, ctx);
  } else {
    for (var i = 0; i < country.parts.length - 1; i++) {
      drawShape(points.slice(parts[i], parts[i + 1]), color, ctx);
    }
  }
}

$(document).ready(function() {
  function draw() {
    var canvas = document.getElementById("canvas");
    if (canvas.getContext) {
      var ctx = canvas.getContext("2d");

      $.each(GEODICT, function(c_id, country) {
        drawCountry(country, ctx);
      });
    }
  }

  draw();
});
