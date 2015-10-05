window.countryIndex = {};
window.colorMap = {};

var Point = function(x, y) {
    this.x = x;
    this.y = y;
    this.destX = x;
    this.destY = y;
    this.area = null;
};

Point.prototype.set = function(xy) {
    this.destX = xy[0];
    this.destY = xy[1];
};

Point.prototype.move = function() {
    //move toward the destination
    if (this.x < this.destX) this.x += 1;
    if (this.x > this.destX) this.x -= 1;
    if (this.y < this.destY) this.y += 1;
    if (this.y > this.destY) this.y -= 1;
};

var Country = function(id) {
    this.id = id;
    this.points = [];
    this.name = GEODICT[id].name;
    this.parts = GEODICT[id].parts;
    this.continent = GEODICT[id].continent;
    this.val = null;
    this.centroid = {x:null,y:null};
    this.maxAreaOfPartSoFar = null;
    this.maxX = null;
    this.maxY = null;
    this.color = getRandomColor();

    window.countryIndex[this.id] = this;
    window.colorMap[this.color] = this;

    //set points from GEODICT
    var points = GEODICT[this.id].points;
    for (var i = 0; i < points.length; i++) {
        this.points[i] = new Point(points[i][0], points[i][1]);
    }
};

Country.prototype.generatePriority = function() {
    var param = 0.0000001293445;
    var median = 110860;
    var sizeRank = sigmoid(param, median, this.area);
    return (Math.pow(this.val*2,2)/Math.pow(sizeRank,2));
};

Country.prototype.generatePreferences = function(result) {
    var cx = this.centroid.x;
    var cy = this.centroid.y;
    
    if (this.val >= 0) {
        var scaleFactor = 2;
    }
    else {
        var scaleFactor = 0.8;
    }


    for (var i = 0; i < this.points.length; i++) {
        var p = this.points[i];
        var endX = cx + (p.destX - cx) * this.val * scaleFactor;
        var endY = cy + (p.destY - cy) * this.val * scaleFactor;
        var startPoint = [p.destX, p.destY];
        if (!result[startPoint]) result[startPoint] = [];

        var priority = this.generatePriority()

        result[startPoint].push([endX, endY, priority]);

        if (endX == null || endY == null) {
            console.log("\t" + this.id);
            console.log(this);
    for (var thing in result) {
        if (result[thing].length == 1 && this.val > 0) { //point borders the ocean!
            var tempX = result[thing][0];
            var tempY = result[thing][1];
            var newX = cx + (tempX - cx) * 70;
            var newY = cy + (tempY - cy) * 70;
            result[thing] = [[newX,newY]];
        }
    }
        }
    }
    return result;
};

Country.prototype.resetCoords = function() {
    for (var i = 0; i < this.points.length; i++) {
        this.points[i].destX = GEODICT[this.id].points[i][0];
        this.points[i].destY = GEODICT[this.id].points[i][1];
    }
}

Country.prototype.draw = function() {
    // draw to canvas
    for (var i = 0; i < this.points.length; i++) {
        this.points[i].move();
    }

    if (window.currentCountry && this.id == window.currentCountry.id) {
      drawCountryWithBorder(this);
    } else {
      drawCountry(this);
    }
};

//calculates the centroids (and the area) of the country
Country.prototype.calcCentroid = function() {
    var i;
    var x = [];
    var y = [];
    for (i = 0; i < this.points.length; i++) {
        x.push(this.points[i].destX);
        y.push(this.points[i].destY);
    }
    // we have a sequence of x_i's and y_i's at this point
    this.getArea(x, y);
    var n = this.maxX.length;
    var maxX = this.maxX;
    var maxY = this.maxY;
    var cx = 0.0;
    var cy = 0.0;
    for (var i = 0; i < n; i++) {
        common = (maxX[i] * maxY[(i+1) % n] - maxX[(i+1) % n] * maxY[i]);
        cx += (maxX[i] + maxX[(i+1) % n]) * common;
        cy += (maxY[i] + maxY[(i+1) % n]) * common;
    }
    cx /= (6 * this.maxAreaOfPartSoFar);
    cy /= (6 * this.maxAreaOfPartSoFar);
    this.centroid.x = cx * this.signOfMax;
    this.centroid.y = cy * this.signOfMax;
};

//Uses proprietary lists from calcCentroid
Country.prototype.getArea = function(x, y) {
    //var n = x.length;
    this.area = 0.0;
    var parts = this.parts;
    var points = this.points;
    this.maxAreaOfPartSoFar = 0.0;
    for (var i = 0; i < parts.length; i++) {
        var low = parts[i];
        var high;
        if (i === parts.length - 1) high = points.length;
        else high = parts[i+1];
        areaOfPart = this.getAreaOfClosedShape(x.slice(low, high), y.slice(low, high));
        absAreaOfPart = Math.abs(areaOfPart);
        if (absAreaOfPart >= this.maxAreaOfPartSoFar) {
            this.maxX = x.slice(low, high);
            this.maxY = y.slice(low, high);
            this.maxAreaOfPartSoFar = absAreaOfPart;
            this.signOfMax = absAreaOfPart/areaOfPart;
        }
        this.area += absAreaOfPart;
    }
};

Country.prototype.getAreaOfClosedShape = function(x, y) {
    // x and y are coordinates (in a cycle) for closed shape
    var n = x.length;
    var area = 0.0;
    for (var i = 0; i < n; i++) {
        area += x[i] * y[(i+1) % n] - x[(i+1) % n] * y[i];
    }
    area /= 2.0
    return area;
};

Country.prototype.smooth = function() {
    var n = this.points.length;
    this.points[0].destX = (this.points[n-1].destX 
                            + this.points[0].destX 
                            + this.points[1].destX)/3;
    this.points[0].destY = (this.points[n-1].destY 
                            + this.points[0].destY 
                            + this.points[1].destY)/3;
    for (var i = 1; i < n; i++) {
        this.points[i].destX = (this.points[i-1].destX 
                                + this.points[i].destX 
                                + this.points[(i+1) % n].destX)/3;
        this.points[i].destY = (this.points[i-1].destY 
                                + this.points[i].destY 
                                + this.points[(i+1) % n].destY)/3;
    }
};
