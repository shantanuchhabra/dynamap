
/*
var Continent = function(name, countries) {
    this.name = name;
    this.countries = countries;
    this.setAllPoints()
    this.setValue();

    //set points from GEODICT
    var points = GEODICT[this.id].points;
    for (var i = 0; i < points.length; i++) {
        this.points[i] = new Point(points[i][0], points[i][1]);
    window.continentIndex[this.id] = this;
};

Continent.prototype.setAllPoints = function() {
    // this.countries is a list of countries, i.e. a list of instances of Country
    this.points = [];
    var countries = this.countries;
    for (var country in countries) {
        if (countries.hasOwnProperty(country)) {
            this.points.push.apply(this.points, country.points)
        }
    }
};

Continent.prototype.setValue = function() {
    this.val = 0.0;
    var countries = this.countries;
    var n = countries.length;
    for (var country in countries) {
        if (countries.hasOwnProperty(country)) {
            var countryValue = country.val;
            this.val += countryValue;
        }
    }
    this.val /= n;
};

Continent.prototype.calcCentroid = function() {
    var cx = 0.0;
    var cy = 0.0;
    var n = this.points.length;
    for (var i = 0; i < n; i++) {
        cx += this.points[i].destX;
        cy += this.points[i].destY;
    }
    cx /= n;
    cy /= n;
    this.centroid = [cx, cy];
};

Continent.prototype.generatePreferences = Country.prototype.generatePreferences;

Continent.prototype.deform = function(metricData) {
    var result = {};
    calcCentroid();
    var newListOfPreferences = this.generatePreferences(result);
    newPoints = finalPositions(newListOfPreferences);
    for (var p in newPoints) {
        if (newPoints.hasOwnProperty(p)) {
            p.set(newPoints[[p.destX, p.destY]][0]);
        }
    }
};

function deformContinents() {

}
*/
