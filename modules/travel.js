module.exports.insert = insert;
module.exports.setState = setState;
module.exports.getRiderId = getRiderId;
module.exports.getRiderIdByDriverId = getRiderIdByDriverId;
module.exports.getDriverIdByRiderId = getDriverIdByRiderId;
module.exports.getTravelIdByDriverId = getTravelIdByDriverId;
module.exports.setDriver = setDriver;
module.exports.getById = getById;
module.exports.start = start;
module.exports.finish = finish;
module.exports.getDriverTravelsById = getDriverTravelsById;
module.exports.getRiderTravelsById = getRiderTravelsById;
module.exports.getTravelIdByRiderId = getTravelIdByRiderId;
module.exports.getCallDataForDriver = getCallDataForDriver;
module.exports.getCallDataForRider = getCallDataForRider;
module.exports.hideTravel = hideTravel;
module.exports.calculateDriverTypesDefaultCost = calculateDriverTypesDefaultCost;
module.exports.TRAVEL_STATE_REQUESTED = 'requested';
module.exports.TRAVEL_STATE_DRIVER_ACCEPTED = 'driver accepted';
module.exports.TRAVEL_STATE_RIDER_ACCEPTED = 'rider accepted';
module.exports.TRAVEL_STATE_STARTED = 'travel started';
module.exports.TRAVEL_STATE_FINISHED_CREDIT = 'travel finished credit';
module.exports.TRAVEL_STATE_FINISHED_CASH = 'travel finished cash';
module.exports.TRAVEL_ERROR_NO_DRIVER_FOUND = 'not found';
module.exports.TRAVEL_ERROR_DRIVER_CANCELED = 'driver canceled';
module.exports.TRAVEL_ERROR_RIDER_CANCELED = 'rider canceled';

async function getById(travelId) {
    let result = await pool.query("SELECT * FROM travel WHERE id = ?", [travelId]);
    return result[0][0];
}
async function insert(riderId, pickupPoint, dropOffPoint, pickUpName, dropOffName, distanceBest, durationBest) {
    const travel = await pool.query("INSERT INTO travel (fk_rider, origin, destination, from_lat, from_lng, to_lat, to_lng,distance_best,duration_best) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)", [riderId, pickUpName, dropOffName, pickupPoint.latitude, pickupPoint.longitude, dropOffPoint.latitude, dropOffPoint.longitude, distanceBest, durationBest]);
    return {
        'id': travel[0].insertId,
        'origin': pickUpName,
        'destination': dropOffName,
        'from_lat': pickupPoint.latitude,
        'from_lng': pickupPoint.longitude,
        'to_lat': dropOffPoint.latitude,
        'to_lng': dropOffPoint.longitude,
        'distance_best': distanceBest,
        'duration_best': durationBest
    }
}
async function getRiderId(travelId) {
    let result = await pool.query("SELECT fk_rider FROM travel WHERE id = ? ORDER BY id DESC LIMIT 1", [travelId]);
    return result[0][0].fk_rider;
}
async function getRiderIdByDriverId(driverId) {
    let result = await pool.query("SELECT fk_rider FROM travel WHERE fk_driver = ? ORDER BY id DESC LIMIT 1", [driverId]);
    return result[0][0].fk_rider;
}
async function getDriverIdByRiderId(riderId) {
    let result = await pool.query("SELECT fk_driver FROM travel WHERE fk_rider = ? ORDER BY id DESC LIMIT 1", [riderId]);
    return result[0][0].fk_driver;
}
async function getTravelIdByDriverId(driverId) {
    let result = await pool.query("SELECT id FROM travel WHERE fk_driver = ? ORDER BY id DESC LIMIT 1", [driverId]);
    return result[0][0].id;
}
async function getTravelIdByRiderId(riderId) {
    let result = await pool.query("SELECT id FROM travel WHERE fk_rider = ? ORDER BY id DESC LIMIT 1", [riderId]);
    return result[0][0].id;
}
async function setState(travelId, state) {
    return pool.query("UPDATE travel SET status = ? WHERE id = ?", [state, travelId]);
}
async function setDriver(travelId, driverId) {
    return pool.query("UPDATE travel SET status = 'rider accepted', fk_driver = ? WHERE id = ?", [driverId, travelId]);
}
async function start(travelId, travelTypeId) {
    return pool.query("UPDATE travel SET status = ?, fk_travel_type = ? WHERE id = ?", [this.TRAVEL_STATE_STARTED, travelTypeId, travelId]);
}
async function finish(travelId, isPaidInCredit, cost, distance, time, log) {
    return pool.query("UPDATE travel SET status = ?, cost = ?, travel_duration = ?,travel_distance = ?, log=? WHERE id = ?", [isPaidInCredit ? this.TRAVEL_STATE_FINISHED_CREDIT : this.TRAVEL_STATE_FINISHED_CASH, cost, time, distance, log, travelId]);
}
async function getDriverTravelsById(driverId) {
    let result = await pool.query("SELECT id,cost,distance_best,travel_duration,origin,destination,request_time FROM travel WHERE fk_driver = ? AND is_hidden = FALSE ORDER BY id desc LIMIT 50", [driverId]);
    return result[0];
}
async function getRiderTravelsById(riderId) {
    let result = await pool.query("SELECT id,cost,distance_best,travel_duration,origin,destination,request_time FROM travel WHERE fk_rider = ? AND is_hidden = FALSE ORDER BY id desc LIMIT 50", [riderId]);
    return result[0];
}
async function getCallDataForDriver(driverId) {
    return pool.query("SELECT travel.id as id, driver.last_name as driverName,driver.mobile_number AS driverNumber,rider.last_name as riderName,rider.mobile_number as riderNumber FROM travel INNER JOIN rider ON rider.id = travel.fk_rider INNER JOIN driver ON driver.id = travel.fk_driver WHERE fk_driver = ? ORDER BY travel.id DESC LIMIT 1", [driverId]);
}
async function getCallDataForRider(driverId) {
    return pool.query("SELECT travel.id as id, driver.last_name as driverName,driver.mobile_number AS driverNumber,rider.last_name as riderName,rider.mobile_number as riderNumber FROM travel INNER JOIN rider ON rider.id = travel.fk_rider INNER JOIN driver ON driver.id = travel.fk_driver WHERE fk_rider = ? ORDER BY travel.id DESC LIMIT 1", [driverId]);
}
async function hideTravel(travelId) {
    let result = await pool.query("UPDATE travel SET is_hidden = TRUE WHERE id = ?", [travelId]);
    return result[0].affectedRows == 1;
}
async function calculateDriverTypesDefaultCost(driverTypeId, travelDistance) {
    let [defaultTravelType,ignored] = await pool.query("SELECT travel_type.initial AS initial, travel_type.every_km AS every_km,travel_type.every_minute_gone AS every_minute_gone FROM driver_type INNER JOIN travel_type ON travel_type.id = driver_type.default_travel_type WHERE driver_type.id = ?",[driverTypeId]);
    defaultTravelType = defaultTravelType[0];
    let cost = defaultTravelType.initial + ((travelDistance.distance.value / 1000) * defaultTravelType.every_km) + ((travelDistance.duration.value / 60) * defaultTravelType.every_minute_gone);
    return cost;
}