module.exports = {
    authenticate: async function (userName, password) {
        let result = await pool.query("SELECT * FROM operator WHERE email = ? And password = ?", [userName, password]);
        if(result[0].length != 1){
            throw new Error(300);
        }
        else
            return result[0][0];
    },
    getTableIds: function (tableName, searchTerm, sort, from, pageSize, callback) {
        queryString = "SELECT id FROM " + tableName + " ORDER BY " + sort.property + " " + sort.direction + " LIMIT " + pageSize + " OFFSET " + from;
        pool.query(queryString, function (error, rows) {
            ids = rows.map(function (object) {
                return object.id;
            });
            callback(ids);
        });
    },
    getAllComplaints: async function (searchTerm, sort, from, pageSize, isReviewed) {
        const likeTerm = searchTerm ? " AND CONCAT_WS('|',time_inscription) LIKE '%" + searchTerm + "%'" : "";
        return pool.query("SELECT travel_complaint.id as id, COALESCE(complaint_type_driver.title, complaint_type_rider.title) as complaint, COALESCE(complaint_type_driver.importance, complaint_type_rider.importance) as importance, (fk_complaint_type_driver_id IS NULL) AS fromRider, fk_travel_id as travelID, subject, DATE_FORMAT(time_inscription,'%b %d %Y %h:%i %p') as time_inscription, time_review,content FROM travel_complaint LEFT JOIN complaint_type_driver ON complaint_type_driver.id = fk_complaint_type_driver_id LEFT JOIN complaint_type_rider ON complaint_type_rider.id = fk_complaint_type_rider_id WHERE is_reviewed = ?" + likeTerm + " ORDER BY ? ? LIMIT ? OFFSET ?", [isReviewed, sort.property, sort.direction, pageSize, from]);
    },
    getAllDrivers: async function (searchTerm, sort, from, pageSize, status) {
        let likeTerm = searchTerm ? "WHERE CONCAT_WS('|',first_name,last_name,certificate_number,mobile_number,car.title,car_plate) LIKE '%" + searchTerm + "%'" : "";
        if(status !== ''){
            if(likeTerm === ""){
                likeTerm += " WHERE status = '" + status + "'";
            } else {
                likeTerm += " AND status = '" + status + "'";
            }
        }
        return pool.query("SELECT driver.*,driver_type.title AS driver_type,CONCAT_WS(' ',car.title,car_color,car_production_year) as car_title from driver LEFT JOIN car ON car.id = fk_car_id LEFT JOIN driver_type ON driver_type.id = fk_driver_type " + likeTerm + " ORDER BY ? ? LIMIT ? OFFSET ?", [sort.property, sort.direction, pageSize, from]);
    },
    deleteDrivers: async function (Ids) {
        return pool.query("DELETE FROM driver WHERE id in (?)", [Ids]);
    },
    insertRow: async function (tableName) {
        return pool.query("INSERT INTO " + tableName + " VALUES()");
    },
    getAllCars: async function () {
        return pool.query("SELECT * FROM car", []);
    },
    getDriverReviews: async function (driverId) {
        return pool.query("SELECT rider.first_name,rider.last_name,driver_review.score,driver_review.review FROM driver_review LEFT JOIN rider ON rider.id = fk_rider WHERE fk_driver = ?", [driverId]);
    },
    getAllTravels: async function (searchTerm, sort, from, pageSize) {
        const likeTerm = searchTerm ? "WHERE CONCAT_WS('|',	request_time, driver.last_name, rider.last_name, driver.mobile_number, rider.mobile_number) LIKE '%" + searchTerm + "%'" : "";
        return pool.query("SELECT travel.id,travel.origin,travel.destination,DATE_FORMAT(request_time,'%b %d %Y %h:%i %p') as request_time,travel.rating,CONCAT_WS('/',travel_distance,distance_best) AS distance,CONCAT_WS('/',travel_duration,duration_best) AS duration,travel.cost,CONCAT_WS(' ',driver.first_name,driver.last_name) AS driver_name, CONCAT_WS(' ',rider.first_name,rider.last_name) AS rider_name, travel_type.title AS travel_type FROM travel LEFT JOIN (driver,rider,travel_type) ON (driver.id = travel.fk_driver AND rider.id = travel.fk_rider AND travel_type.id = travel.fk_travel_type) " + likeTerm + " ORDER BY ? ? LIMIT ? OFFSET ?", [sort.property, sort.direction, pageSize, from]);
    },
    markComplaintsReviewed: async function (Ids) {
        return pool.query("UPDATE travel_complaint SET is_reviewed = true, time_review = NOW() WHERE id IN (?)", [Ids]);
    },
    getTableRows: function (tableName, Ids, callback) {
        queryString = "SELECT * FROM " + tableName + " WHERE `id` IN ('" + Ids.join() + "')";
        pool.query(queryString, function (error, rows) {
            callback(rows);
        });
    },
    getTodos: function (operatorId) {
        return pool.query("SELECT id,title,is_done FROM operator_todo WHERE fk_operator = ?", [operatorId]);
    },
    addTodo: function (operatorId, title) {
        return pool.query("INSERT INTO operator_todo (fk_operator,title) VALUES (?,?)", [operatorId, title]);
    },
    markTodosDone: function (Ids) {
        return pool.query("UPDATE operator_todo SET is_done = true WHERE id IN (?)", [Ids]);
    },
    deleteTodos: function (Ids) {
        return pool.query("DELETE FROM operator_todo WHERE id IN (?)", [Ids]);
    },
    getReminders: function (operatorId, date) {
        return pool.query("SELECT id,title FROM operator_reminder WHERE fk_operator = ? AND due = ?", [operatorId, date]);
    },
    addReminder: function (operatorId, date, title) {
        return pool.query("INSERT INTO operator_reminder (fk_operator,due,title) VALUES (?,?,?)", [operatorId, date, title]);
    },
    deleteReminder: function (Id) {
        return pool.query("DELETE FROM operator_reminder WHERE id = ?", [Id]);
    },
    getBaseData: async function () {
        try {
            let result = await pool.query("SELECT (SELECT COUNT(*) FROM driver) as driver_count, (SELECT COUNT(*) FROM travel) as travel_count, (SELECT COUNT(*) FROM payment_request WHERE payment_request.status = 'pending') AS unpaid_count,(SELECT COUNT(*) FROM payment_request WHERE status = 'paid') as paid_count,(SELECT COUNT(*) FROM rider) as rider_count,(SELECT COUNT(*) FROM travel_complaint WHERE is_reviewed = FALSE) AS waiting_complaints,(SELECT COUNT(*) FROM travel_complaint WHERE is_reviewed = TRUE) AS reviewed_complaints");
            return result[0][0];
        }
        catch (error){
            throw error;
        }
    },
    setColumnValue: function (tableName, id, column, value, callback) {

        queryString = "UPDATE " + tableName + " SET " + column + "='" + value + "' WHERE id = " + id;
        pool.query(queryString, function (error, rows) {
            callback(true);
        });
    },
    setProfilePicture:function (operatorId,imageAddress) {
        return pool.query("UPDATE operator SET image_address = ? WHERE id = ?",[imageAddress,operatorId]);
    },
    getAll: function (sort, from, pageSize) {
        return pool.query("SELECT * FROM operator ORDER BY ? ? LIMIT ? OFFSET ?", [sort.property, sort.direction, pageSize, from]);
    },
    deleteOperators: function (Ids) {
        return pool.query("DELETE FROM operator WHERE id IN (?)", [Ids]);
    },
    updateOperatorPassword: function (operatorId, oldPass, newPass) {
        return pool.query("UPDATE operator SET password = ? WHERE password = ? AND id = ?",[newPass,oldPass,operatorId]);
    },
    getIsRevoked: function (operatorId) {
        return pool.query("SELECT is_revoked FROM operator WHERE id = ?",operatorId);
    },
    setNotRevoked: function (operatorId) {
        return pool.query("UPDATE operator SET is_revoked = FALSE WHERE id = ?",operatorId);
    },
    setRevoked: function (operatorId) {
        return pool.query("UPDATE operator SET is_revoked = TRUE WHERE id = ?",operatorId);
    },
    getBaseTypes: function (type, sort, from, pageSize) {
        return pool.query("SELECT *,(SELECT COUNT(*) FROM " + type + ") as count FROM " + type + " ORDER BY ? ? LIMIT ? OFFSET ?",[sort.property, sort.direction, pageSize, from]);
    },
    addBaseType:function (type) {
        return pool.query("INSERT INTO " + type + " VALUES()");
    },
    deleteBaseTypes: async function (type, Ids) {
        if(type === 'travel_type'){
            await pool.query("DELETE FROM driver_travel_type WHERE fk_travel_type IN (?)",[Ids]);
        }
        await pool.query("DELETE FROM " + type + " WHERE id IN (?)",[Ids]);
        return true;
    },
    getAllDriverTypes: async function() {
        let rows = await pool.query("SELECT * FROM driver_type");
        return rows[0];
    },
    setDriverDriverTypes: async function (driverId, driverTypeIds) {
        driverTypeIds = driverTypeIds.map(x=>[driverId,x]);
        if(driverTypeIds.length === 0)
            return true;
        return pool.query("INSERT INTO driver_types (driver_id,driver_type_id) VALUES ?",[driverTypeIds]);
    },
    deleteDriverDriverTypes: async function(driverId){
        return pool.query("DELETE FROM driver_types WHERE driver_id = ?",[driverId]);
    }
};