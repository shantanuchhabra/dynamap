window.ctx = null;
window.allCountries = [];
window.continentIndex = {};
window.currentCountry = null;

//TODO WINDOW>ALL CONTINENTS

function initMap() {
  window.allCountries = [];
  window.continentIndex = [];
  window.currentCountry = null;
  window.countryIndex = {};
  window.colorMap = {};

  $.each(GEODICT, function(c_id, country) {
    var newCountry = new Country(c_id);
    window.allCountries.push(newCountry);
  });
}

function initCanvas() {
  var canvas = document.getElementById("map");
  window.ctx = canvas.getContext("2d");
  window.ctx.clearRect(0, 0, 1920, 1080);
  window.ctx.lineWidth = 1;
  window.ctx.strokeStyle = '#ccc';

  window.ctx.beginPath();
  window.ctx.moveTo(240, 180);
  window.ctx.lineTo(240, 900);
  window.ctx.lineTo(1680, 900);
  window.ctx.lineTo(1680, 180);
  window.ctx.lineTo(240, 180);

  window.ctx.stroke();
}

function beginEventLoop() {
  window.setInterval(function() {
    window.ctx.clearRect(0, 0, 1920, 1080); // Clearing the screen
    window.allCountries.forEach(function(country) {
      country.draw();
    });

    var str = '';
    if (window.currentCountry) {
      str = window.currentCountry.name + '<br>';
      if (window.currentCountry.continent) {
        str += window.currentCountry.continent;
      }
      else {
        str += 'Oceania';
      }
    }
    $('#info-display').html(str);
  }, 50);
}

// For hovering effect

function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function mouseMove() {
  $('#map').mousemove(function(e) {
    var pos = findPos(this);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;
    var coord = "x=" + x + ", y=" + y;
    var c = this.getContext('2d');
    var p = c.getImageData(x, y, 1, 1).data;
    var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);

    var country = window.colorMap[hex];
    if (country) {
      window.currentCountry = country;
    } else {
      window.currentCountry = null;
    }
  });
}

// Run when the page is ready for manipulation
$(function() {
  initCanvas();
  initMap();
	beginEventLoop();
  mouseMove();

  //fetch all the properties
  $.post("/properties", function( properties ) {
    //now, populate the select
    $("#metrics").html('');

    // Default option
    $("#metrics").append('<option value="-1">Default</option>');
    for (var i = 0; i < properties.length; i++) {
        $("#metrics").append('<option value="'+properties[i].id+'">'+properties[i].value+'</option>');
    }
  });
}); 

// Whenever someone selects a property
$("#metrics").change(function() {
  if ($(this).val() == -1) {
    window.allCountries.forEach(function(country) {
      country.resetCoords();
    });
  } else {
    var newMetricID = $(this).val();
    deformMap(newMetricID);
  }
});
