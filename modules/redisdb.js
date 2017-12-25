const redisObject = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redisObject.RedisClient.prototype);
bluebird.promisifyAll(redisObject.Multi.prototype);
const redis = redisObject.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
if(process.env.REDIS_PASSWORD)
    redis.auth(process.env.REDIS_PASSWORD);
redis.on("connect", function () {
    console.log('Redis Connected');
});
redis.on("Error", function (err) {
    console.log(err);
});
module.exports = {
    getConnectionId: async function (userId) {
        return redis.hgetAsync(userId, 'connectionId');
    },
    getConnectionIds: async function (prefix, ids) {
        let result = [];
        for (let id of ids) {
            result.push(redis.hgetAsync(prefix + id, 'connectionId'));
        }
        return result;
    },
    setConnectionId: async function (userId, connectionId) {
        redis.hsetAsync(userId, 'connectionId', connectionId);
    },
    deleteUser: async function (userId) {
        redis.hdelAsync(userId, 'connectionId');
    },
    getLocation: async function (userId,driverTypeId) {
        const location = await redis.hgetallAsync(driverPrefix + userId);
        let dtIds;
        if(!location)
            return {latitude:0,longitude:0};
        if(!location['driverType']){
            let [rows, ignored] = await pool.query("SELECT driver_type_id FROM driver_types WHERE driver_id = ?",[userId]);
            let set = new Set(rows.map(x => x.driver_type_id));
            dtIds = [...set];
            let tts = (dtIds).join(',');
            this.setDriverType(userId,tts);
        } else {
            dtIds = await location['driverType'].split(',').map(val => parseInt(val));
        }
        if((dtIds && dtIds.includes(driverTypeId)) || driverTypeId === 0) {
            const arr = location['loc'].split(',').map(val => Number(val));
            return {latitude: arr[0], longitude: arr[1]};
        }
        else
            return {latitude:0,longitude:0};
    },
    getLocations: async function (driverIds, driverTypeId) {
        if (driverIds.size < 1)
            throw new Error(404);
        let locations = [];
        for (const driverId of driverIds) {
            let _location = await this.getLocation(driverId,driverTypeId);
            let item = {
                id: driverId,
                location: _location
            };
            locations.push(item)
        }
        return (locations);
    },
    setLocation: async function (userId, lat, lng) {
        redis.hsetAsync(userId, 'loc', lat + ',' + lng);
    },
    setDriverType: async function (userId, driverTypeId) {
        redis.hsetAsync(userId, 'driverType', driverTypeId);
    },
    addCallRequest: async function (callData,from) {
        redis.hmsetAsync('complaint:' + callData.id, ['id', callData.id, 'driverNumber', callData.driverNumber, 'driverName', callData.driverName ? callData.driverName : "Unknown", 'riderNumber', callData.riderNumber, 'riderName', callData.riderName ? callData.riderName : "Unknown",'from',from]);
        redis.expireAsync('complaint:' + callData.id, 150);
    },
    getCallRequests: async function (from, pageSize) {
        let keys = await redis.keysAsync('complaint:*');
        let result = [];
        for (key of keys) {
            result.push(redis.hgetallAsync(key));
        }
        return result;
    },
    deleteCallRequests: async function (Ids) {
        Ids = Ids.map(x => 'complaint:' + x);
        return redis.delAsync(Ids);
    },
    assignDriversToTravel: async function (travelId, driverIds) {
        redis.hmsetAsync('travel:' + travelId, 'drivers', driverIds.join());
        redis.expireAsync('travel:' + travelId, 60);
    },
    getDriversAssignedToTravel: async function (travelId) {
        let driverIds = await redis.hgetAsync('travel:' + travelId, 'drivers');
        if (driverIds == "")
            return null;
        return driverIds.split(",").map(x => parseInt(x));
    }
};


