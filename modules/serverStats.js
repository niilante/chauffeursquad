module.exports = {
    incomes: function (groupBy, muchAgo) {
        let [colVal, group,dateWhereClause] = getDateFormat("request_time",groupBy);
        return pool.query("SELECT SUM(cost) AS amount," + colVal + " AS date FROM travel WHERE " + dateWhereClause + " GROUP BY " + group + " HAVING amount > 0", [muchAgo]);
    },
    servicesCount: function (groupBy, muchAgo) {
        let [colVal, group,dateWhereClause] = getDateFormat("request_time",groupBy);
        return pool.query("SELECT COUNT(id) AS amount," + colVal + " AS date FROM travel WHERE " + dateWhereClause + " GROUP BY  " + group + " HAVING amount > 0", [muchAgo]);
    },
    newUsers: function (groupBy, muchAgo) {
        let [colVal, group,dateWhereClause] = getDateFormat("register_date",groupBy);
        return pool.query("SELECT COUNT(id) AS amount," + colVal + " AS date FROM rider WHERE " + dateWhereClause + " GROUP BY " + group + " HAVING amount > 0", [muchAgo]);
    },
    travelStateByDays: function (days) {
        return pool.query("SELECT COUNT(id) AS amount,status FROM travel WHERE DATEDIFF(NOW(),request_time) <= ? GROUP BY status", [days]);
    }
};