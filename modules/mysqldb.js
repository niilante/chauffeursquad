global.GROUP_BY_DAY = 0;
global.GROUP_BY_WEEK = 1;
global.GROUP_BY_MONTH = 2;
global.mysql = require("mysql2/promise");
let config = {
    connectionLimit: 100,
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    debug:false,
    multipleStatements: true
};
if (process.env.INSTANCE_CONNECTION_NAME) {
  config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
  delete config.host;
}
global.pool = mysql.createPool(config);
/*global.pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'taxi',
    debug: true
});*/
pool.query("SELECT id FROM operator",[]).catch(async function (error) {
    if(error.code == "ER_NO_SUCH_TABLE") {

    }
});
module.exports.driver = require('./driver');
module.exports.rider = require('./rider');
module.exports.operator = require('./operator');
module.exports.serverStats = require('./serverStats');
module.exports.payments = require('./payments');
module.exports.travel = require('./travel');
module.exports.travelType = require('./travelType');
module.exports.complaints = require('./complaints');
global.getDateFormat = function (dateColumnName,groupBy) {
    let colVal,group,dateWhereClause;
    switch (groupBy) {
        case GROUP_BY_DAY:
            //DATE format would be: 7, Oct
            colVal = "DATE_FORMAT(" + dateColumnName + ",'%e, %b')";
            group = "DATE(" + dateColumnName + ")";
            dateWhereClause = "DATEDIFF(NOW()," + dateColumnName + ") <= ?";
            break;
            case GROUP_BY_WEEK:
            //DATE format would be: W5, 2017
            colVal = "DATE_FORMAT(" + dateColumnName + ",'W%V, %X')";
            group = "YEAR(" + dateColumnName + "),WEEK(" + dateColumnName + ")";
            dateWhereClause = "(WEEK(NOW()) - WEEK(" + dateColumnName + ")) BETWEEN 0 AND ?";
            break;
            case GROUP_BY_MONTH:
            //DATE format would be: Jan, 2017
            colVal = "DATE_FORMAT(" + dateColumnName + ",'%b, %Y')";
            group = "YEAR(" + dateColumnName + "),MONTH(" + dateColumnName + ")";
            dateWhereClause = "(MONTH(NOW()) - MONTH(" + dateColumnName + ")) BETWEEN 0 AND ?";
            break;
        }
        return [colVal,group,dateWhereClause];
    };