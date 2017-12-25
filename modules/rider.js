const geo = require('./geo');

module.exports = {
    getProfile: async function (riderId) {
        let rider;
        if (riderId > 1000000)
            rider = (await this.authenticate(riderId))[0][0];
        else
            rider = (await this.getRiderInfo(riderId))[0][0];
        return {
            id: rider.id,
            mobile_number: rider.mobile_number,
            first_name: rider.first_name,
            last_name: rider.last_name,
            gender: rider.gender,
            balance_amount: rider.balance_amount,
            image_address: rider.image_address,
            email: rider.email,
            status: rider.status,
            address: rider.address
        }
    },
    authenticate: async function (mobileNumber) {
        let result = await pool.query("SELECT * FROM rider WHERE mobile_number = ?", [mobileNumber]);
        if(result[0].length == 0) {
            await pool.query("INSERT INTO rider (mobile_number) VALUES (?)", [mobileNumber]);
            result = await pool.query("SELECT * FROM rider WHERE mobile_number = ?", [mobileNumber]);
        }
        return result;
    },
    getRiderInfo: async function (riderId) {
        return pool.query("SELECT * FROM rider WHERE id = ?", [riderId]);
    },
    editProfile: async function (riderId, user) {
        const rider = JSON.parse(user);
        return pool.query("UPDATE rider SET first_name = ?,last_name = ?,gender = ?,email = ?,address = ? WHERE id = ?", [rider.first_name, rider.last_name, rider.gender, rider.email, rider.address, riderId]);
    },
    setProfileImage: async function (riderId, fileName) {
        return pool.query("UPDATE rider SET image_address = ? WHERE id = ?", [fileName, riderId]);
    },
    getProfileImage: async function (riderId) {
        let result = await pool.query("SELECT image_address FROM rider WHERE id = ?", [riderId]);
        return result[0][0].image_address;
    },
    getBalance: async function (riderId) {
        let result = await pool.query("SELECT balance_amount FROM rider WHERE id = ?", [riderId]);
        return result[0][0].balance_amount;
    },
    payMoney: async function (riderId, amount) {
        return pool.query("UPDATE rider SET balance_amount = balance_amount - ? WHERE id = ?", [amount, riderId]);
    },
    updateInfoChangedStatus: async function (riderId, status) {
        return pool.query("UPDATE rider SET info_changed = ? WHERE id = ?", [status, riderId]);
    },
    getIsInfoChanged: async function (riderId) {
        let result = await pool.query("SELECT info_changed FROM rider WHERE id = ?", [riderId]);
        return (!!result[0][0].info_changed);
    },
    chargeAccount:async function (riderId,amount){
        await pool.query("UPDATE rider SET balance_amount = balance_amount + ? WHERE id = ?",[amount,riderId]);
        return true;
    },
    valueChangedForAll: async function(){
        await pool.query("UPDATE rider SET info_changed = TRUE");
        return true;
    }

};