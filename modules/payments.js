module.exports = {
    driverHasPending: function (driverId) {
        return pool.query("SELECT id FROM payment_request WHERE fk_driver = ? AND status = 'pending'", [driverId]);
    },
    getDriverUnpaidAmount: function (driverId) {
        return pool.query("SELECT credit,account_number FROM driver WHERE id = ?", [driverId]);
    },
    requestPayment: function (driverId, amount, accountNumber) {
        return pool.query("INSERT INTO payment_request (fk_driver,amount,account_number) VALUES (?,?,?)", [driverId, amount, accountNumber])
    }
};