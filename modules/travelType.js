module.exports = {
    getById: function (travelTypeId) {
        return pool.query("SELECT title FROM travel_type WHERE id = ?", [travelTypeId]);
    },
    getAll: function () {
        return pool.query("SELECT * from travel_type");
    },
    getDriversWithTravelType: async function(travelTypeId){
        let result = await pool.query("SELECT fk_driver FROM driver_travel_type WHERE fk_travel_type = ?",[travelTypeId]);
        return result[0].map(x=>x.fk_driver);

    },
    getDriverTravelTypes: async function (driverId) {
        return pool.query("SELECT fk_travel_type as id FROM driver_travel_type WHERE fk_driver = ?", [driverId]);
    },
    setDriverTravelTypes: async function (driverId, travelTypeIds) {
        travelTypeIds = travelTypeIds.map(x=>[driverId,x]);
        if(travelTypeIds.length === 0)
            return true;
        return pool.query("INSERT INTO driver_travel_type (fk_driver, fk_travel_type) VALUES ?",[travelTypeIds]);
    },
    deleteDriverTravelType: async function(driverId){
        return pool.query("DELETE FROM driver_travel_type WHERE fk_driver = ?",[driverId]);
    }
};