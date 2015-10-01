var Q = require('q');
var mysql = require('mysql');
var strings = require('./strings.js');

var DB = {};

DB.pool = mysql.createPool({
	host: strings.MYSQL_SERVER,
	user: strings.MYSQL_USER,
	password: strings.MYSQL_PASS,
	database: strings.MYSQL_DB
});

DB.query = function(query, params) {
	var deferred = Q.defer()
	var obj = this
	obj.pool.getConnection(function(err, conn) {
		if (err) {
			console.log("[DB]\tConnect Error: "+err);
			throw "DB Connect Error";
		} else {
			conn.query({
				sql: query,
				values: params
			}, function(qErr, result) {
				conn.release();
				if (qErr) {
					console.log(
						"\n[DB]\tQuery Error: \n\t"+qErr + 
						"\n\n  Running Query:\n\t"+query + 
						"\n\n  With Values:\n\t"+params+"\n"
					);
				} else {
					deferred.resolve(result);
				}
			})
		}
	})
	return deferred.promise;
};


DB.select = function(columns, table, whereObj) {
  var deferred = Q.defer();
  //escape column name(s)
  if (Array.isArray(columns)) columns = '`' + columns.join('`, `') + '`';
  else if (columns != '*') columns = '`' + columns + '`';
  var values = [];
  var where = [];
  for (var field in whereObj) {
    if (whereObj.hasOwnProperty(field)) {
      where.push("`" + field + "` = ?");
      values.push(whereObj[field]);
    }
  }
  var whereString = (where.length) ? '(' + where.join(' AND ') + ')' : '1';
  DB.query("SELECT "+columns+" FROM `"+table+"` WHERE " + whereString, values).then(function(res) {
    deferred.resolve(res);
  })
  return deferred.promise;
}

//Compares version compare strings
//  v1 == v2: 0
//  v1  > v2: 1
//  v1  < v2: -1
function versionCompare(v1, v2) {
  var v1parts = v1.split('.')
  var v2parts = v2.split('.')

  //Make 1.0.0.0.0 == 1.0
  while (v1parts.length < v2parts.length) v1parts.push('0')
  while (v2parts.length < v1parts.length) v2parts.push('0')

  //Make each one an integer
  v1parts = v1parts.map(Number);
  v2parts = v2parts.map(Number);

  //test each string
  for (var i = 0; i < v1parts.length; ++i) 
  {
    if (v2parts.length == i) return 1;
    if (v1parts[i] == v2parts[i]) continue;
    else if (v1parts[i] > v2parts[i]) return 1;
    else return -1;
  }

  if (v1parts.length != v2parts.length) return -1;

  return 0;
}

//update script
console.log("[DB]\tChecking database version...")
DB.query("SELECT `value` FROM `db_info` WHERE `key`='framework_version'")
  .then(function(result) {
  if (result.length < 1) 
  {
    console.error("Missing record in db_info table. Database updates will not be automatic.")
    console.error("Please set up the database from the init file in the #database channel on Slack.")
  }
  else
  {
    updateDatabase(result[0].value)
  }
});

DB.done = function() {
  console.log('[DB]\tShutting down MySQL connections...');
  DB.pool.end();
};

function updateDatabase(fwVersion)
{
  var dbUpdates = [
    {
      'version' : '0.0.1',
      'queries' : [
      ]
    }
  ];
  //Check min database version
  if (versionCompare(fwVersion, dbUpdates[0].version) == -1)
  {
    console.error("[DB]\tYour database is too out-of-date for automatic updates.");
    exports.done()
    exports.internalInfo = {}
    throw "Out-of-date DB";
    return;
  }
  var queriesNeeded = [];
  var latestVersion = fwVersion;
  for (var i = 0; i < dbUpdates.length; i++) {
    if (versionCompare(fwVersion, dbUpdates[i].version) == -1) {
      Array.prototype.push.apply(queriesNeeded, dbUpdates[i].queries)
      latestVersion = dbUpdates[i].version
    }
  }
  if (queriesNeeded.length > 0) {
    //updates are happening
    console.log("[DB]\tUpdating database from "+fwVersion+" to "+latestVersion + ". This may take a few seconds...")
    queriesNeeded.push("UPDATE `db_info` SET `value`='"+latestVersion+"' WHERE `key`='framework_version'")
    exports.makeTransaction(queriesNeeded).then(function()
    {
      console.log("[DB]\tUpdate to "+latestVersion+" complete!")
    })
  } else { 
    console.log("[DB]\tYou're running DB v"+fwVersion+" and ready to go!")
  }
}

module.exports = DB;
