//1. prefPositions is used to get each country's preferred positions. 
    //Returns an arr

//
function deformMap(propertyID) {
    $.post("/property/"+propertyID, function(metricData) {
        metricData = transformData(metricData);
        for (var i = 0; i < window.allCountries.length; i++) {
            window.allCountries[i].resetCoords();
        }
        var newPositions = finalPositions(prefPositions(metricData));
        applyTransformations(newPositions);
    });
}

//Applies transformations to all points in all countries
function applyTransformations(transObj) {
    //console.log(transObj)
    for (var i = 0; i < window.allCountries.length; i++) {
        var c = window.allCountries[i];
        for (var j = 0; j < c.points.length; j++) {
            if (transObj[[c.points[j].destX, c.points[j].destY]]) {
                var newPos = transObj[[c.points[j].destX, c.points[j].destY]];
                c.points[j].destX = newPos[0];
                c.points[j].destY = newPos[1];
            }
        }
        // for (var y = 0; y < 3; y++) {
        //     c.smooth()
        // }
    }
}

function transformData(metricData) {
    var k = logisticParam(metricData);
    var med = median(metricData);

    transformedData = {};
    for (var key in metricData) {
        transformedData[key] = sigmoid(k,med,metricData[key]);
    }
    return transformedData;

}

function logisticParam(metricData) {
    return Math.log(9)/rangeOfValues(metricData);
}

function sigmoid(k,m,x) {
    return 1/(1+Math.exp(-k*(x-m)));
}

function rangeOfValues(metricData) {
    var values = [];
    for (var key in metricData) {
        values.push(metricData[key]);
    }
    values.sort(myCompFn);
    var median = values[Math.floor(values.length/2)];
    var a = median - values[0];
    var b = values[values.length-1] - median;
    return Math.max(a,b);
}

function myCompFn(a, b) {
    return a - b;
}

// Returns median of values of a dict
function median(metricData) {
    console.log("Metric Data");
    console.log(metricData);
    var values = [];
    for (var key in metricData) {
        values.push(metricData[key]);
    }
    values.sort(myCompFn);
    console.log("SORTED");
    console.log(values);
    console.log("Median");
    console.log(values[Math.floor(values.length/2)]);
    console.log("Min");
    console.log(values[0]);
    console.log("Max");
    console.log(values[values.length - 1]);
    return values[Math.floor(values.length/2)];
}

//This function is used first from the initial template to get each country's preferred positions.
//This returns an object mapping coordinates to a list of preferred endpoints.
function prefPositions(metricData) {
    var result = {};
    for (var i = 0; i < window.allCountries.length; i++) {
        var c = window.allCountries[i];
        c.val = metricData[c.id];
        c.calcCentroid();
        c.generatePreferences(result);
    }
    return result;
}

//g
function finalPositions(p) {
    // console.log("Here's what g gets for my values:")
    // console.log(JSON.stringify(p));
    for (var xyw in p) {
        if (p.hasOwnProperty(xyw)) {
            var x = 0;
            var y = 0;
            var sumW = 0;
            for (var i = 0; i < p[xyw].length; i++) {
                var w = p[xyw][i][2];
                x += w * p[xyw][i][0];
                y += w * p[xyw][i][1];
                sumW += w;
            }
            x /= sumW;
            y /= sumW;
            p[xyw] = [x, y];
        }
    }
    return p;
}

