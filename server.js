var express = require('express');
var app = express();
var db = require('./modules/db');

var port = process.env.PORT || 3000;

app.post('/properties', function(req, res) {
    db.select(['id', 'value'], 'property', {}).then(function(props) {
        res.json(props);
    });
});  
app.post('/countries', function(req, res) {
    db.select(['id', 'name'], 'country', {}).then(function(countries) {
        res.json(countries);
    })
});
app.post('/property/:id', function(req, res) {
    db.select(['country_id', 'value'], 'country_property', {'property_id':req.params.id}).then(function(props) {
        var propDict = {};
        for (var i = 0; i < props.length; i++) {
            propDict[props[i].country_id] = props[i].value;
        }
        res.json(propDict);
    });
})

app.use('/', express.static(__dirname + '/public'));

app.listen(port, function() {
  console.log('Listening on port ' + port);
});


//error handling
process.stdin.resume();
function exitHandler(callback) {
  console.log("Node.js server shutting down gracefully.")
  db.done() 
  if (callback == null) {
    process.kill(process.pid)
  } else {
    callback()
  }
}
process.on('exit', function() {
  console.log('Exiting...')
  exitHandler(null);
})
process.on('SIGINT', function() {
  console.log("SIGINT error.")
  exitHandler(null)
})
process.on('uncaughtException', function(err) { 
  console.log('Uncaught Exception!: '+err.stack)
  exitHandler(null)
})

//Catch when gulp is restarting everything
process.once('SIGUSR2', function() {
  console.log("SIGUSR2 restart.")
  exitHandler(function() {
    process.kill(process.pid, 'SIGUSR2')
  });
})