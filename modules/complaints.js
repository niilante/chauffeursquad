module.exports = {
    driverComplaint: async function(travelId,subject,content){
        let result = await pool.query("INSERT INTO travel_complaint (fk_travel_id,fk_complaint_type_driver_id,subject,content) VALUES (?,?,?,?)",[travelId,1,subject,content]);
        return result[0].affectedRows;
    },
    riderComplaint: async function(travelId,subject,content){
        let result = await pool.query("INSERT INTO travel_complaint (fk_travel_id,fk_complaint_type_rider_id,subject,content) VALUES (?,?,?,?)",[travelId,1,subject,content]);
        return result[0].affectedRows;
    }
};