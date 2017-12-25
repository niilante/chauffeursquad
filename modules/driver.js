global.DRIVER_STATE_OFFLINE = "offline";
global.DRIVER_STATE_ONLINE = "online";
global.DRIVER_STATE_IN_SERVICE = "in service";
global.TIME_QUERY_DAILY = 1;
global.TIME_QUERY_WEEKLY = 2;
global.TIME_QUERY_MONTHLY = 3;
module.exports = {
    updateInfoChangedStatus: async function (driverId, status) {
        return pool.query("UPDATE driver SET info_changed = ? WHERE id = ?", [status, driverId]);
    },
    getIsInfoChanged: async function (driverId) {
        let result = await pool.query("SELECT info_changed FROM driver WHERE id = ?", [driverId]);
        return (!!result[0][0].info_changed);
    },
    getProfile: async function (driverId) {
        let driver;
        if (driverId > 1000000)
            driver = (await this.authenticate(driverId));
        else
            driver = (await this.getDriverInfo(driverId));
        if(driver==null)
            return null;
        return {
            id: driver.id,
            first_name: driver.first_name,
            last_name: driver.last_name,
            status: driver.status,
            gender: driver.gender,
            mobile_number: driver.mobile_number,
            driver_image: driver.driver_image,
            car_image: driver.car_image,
            car_color: driver.car_color,
            car_plate: driver.car_plate,
            email: driver.email,
            address: driver.address,
            credit: driver.credit,
            min_pay: process.env.MINIMUM_AMOUNT_TO_REQUEST_PAYMENT
        };
    },
    getAllPaymentRequests: async function (searchTerm, sort, from, pageSize, isPaid) {
        const likeTerm = searchTerm ? " AND CONCAT_WS('|',driver.last_name,payment_request.account_number) LIKE '%" + searchTerm + "%'" : "";
        return pool.query("SELECT payment_request.id,DATE_FORMAT(request_date,'%b %d %Y %h:%i %p') as request_date,DATE_FORMAT(paid_date,'%b %d %Y %h:%i %p') as paid_date,payment_request.amount, payment_request.account_number, CONCAT_WS(' ',driver.first_name,driver.last_name) AS driver_name,driver.mobile_number AS driver_number FROM payment_request LEFT JOIN driver ON driver.id = fk_driver WHERE payment_request.status = ?" + likeTerm + " ORDER BY ? ? LIMIT ? OFFSET ?", [isPaid, sort.property, sort.direction, pageSize, from]);
    },
    markPaymentRequestsPaid: async function (Ids) {
        let [ignored, ignored2, driverIds] = await Promise.all([
            pool.query("UPDATE driver LEFT JOIN payment_request ON driver.id = payment_request.fk_driver SET driver.credit = driver.credit - payment_request.amount WHERE payment_request.id IN (?)", [Ids]),
            pool.query("UPDATE payment_request SET status = 'paid', paid_date = NOW() WHERE id IN (?)", [Ids]),
            pool.query("SELECT fk_driver FROM payment_request WHERE id IN (?)", [Ids])]
        );
        return driverIds[0].map(x => x.fk_driver);
    },
    addCredit: async function (driverId, amount) {
        await pool.query("UPDATE driver SET credit = credit + ? WHERE id = ?", [amount, driverId]);
        return true;

    },
    setState: async function (driverId, state) {
        let credit = await pool.query("SELECT credit FROM driver WHERE id = ?",[driverId]);
        if (credit < 0){
            return false;
        }
        if (state === DRIVER_STATE_ONLINE)
            onlineDrivers.add(driverId);
        else
            onlineDrivers.delete(driverId);
        await pool.query("UPDATE driver SET status = ? WHERE id = ?", [state, driverId]);
        return true;
    },
    authenticate: async function (mobileNumber) {
        let result = await pool.query("SELECT * FROM driver WHERE mobile_number = ?", [mobileNumber]);
        if (result[0].length == 0) {
            await pool.query("INSERT INTO driver (mobile_number) VALUES (?)", [mobileNumber]);
            result = await pool.query("SELECT * FROM driver WHERE mobile_number = ?", [mobileNumber]);
        }
        return result[0][0];

    },
    getTravelTypes: async function (driverId) {
        let result = await pool.query("SELECT * FROM driver_travel_type INNER JOIN travel_type ON travel_type.id = fk_travel_type WHERE fk_driver = ?", [driverId]);
        return result[0];
    },
    getDriverInfo: async function (driverId) {
        let result = await pool.query("SELECT driver.id as id, driver.mobile_number AS mobile_number, driver.car_image AS car_image, driver.status AS status, driver.credit AS credit, driver.driver_image AS driver_image, driver.first_name AS first_name, driver.last_name AS last_name, driver.rating AS rating, car.title AS car_name, driver.gender AS gender, travel_type.initial AS initial, travel_type.every_km AS every_km, travel_type.every_minute_gone AS every_minute_gone FROM driver LEFT JOIN car ON car.id = fk_car_id LEFT JOIN travel_type ON travel_type.id = (SELECT default_travel_type FROM driver_type WHERE driver_type.id = driver.fk_driver_type) where driver.id = ?", [driverId]);
        return result[0][0];
    },
    getProfileImage: async function (driverId) {
        let result = await pool.query("SELECT driver_image FROM driver WHERE id = ?", [driverId]);
        return result[0][0].driver_image;
    },
    getHeaderImage: async function (driverId) {
        let result = await pool.query("SELECT car_image FROM driver WHERE id = ?", [driverId]);
        return result[0][0].car_image;
    },
    getRating: async function (driverId) {
        return pool.query("SELECT review_count,rating FROM driver WHERE id = ?", [driverId]);
    },
    updateScore: async function (driverId, score) {
        let rating = await this.getRating(driverId);
        let reviewCount = rating[0][0].review_count + 1;
        let newScore = (score - rating[0][0].rating) / reviewCount;
        return pool.query("UPDATE driver SET review_count = ?, rating = rating + ? WHERE id = ?", [reviewCount, newScore, driverId]);
    },
    saveReview: async function (riderId, driverId, review, score) {
        return pool.query("INSERT INTO driver_review (fk_rider,fk_driver,review,score) VALUES (?,?,?,?)", [riderId, driverId, review, score]);
    },
    editProfile: async function (driverId, user) {
        const driver = JSON.parse(user);
        return pool.query("UPDATE driver SET first_name = ?,last_name = ?, gender = ?, email = ?, car_color = ?, car_production_year = ?, car_plate = ?,address = ? WHERE id = ?", [driver.first_name, driver.last_name, driver.gender, driver.email, driver.car_color, driver.car_production_year, driver.plate_number, driver.address, driverId]);
    },
    setProfileImage: async function (driverId, fileName) {
        return pool.query("UPDATE driver SET driver_image = ? WHERE id = ?", [fileName, driverId]);
    },
    setHeaderImage: async function (driverId, fileName) {
        return pool.query("UPDATE driver SET car_image = ? WHERE id = ?", [fileName, driverId]);
    },
    getDailyStats: async function (driverId) {
        return pool.query("SELECT SUM(cost) as amount, COUNT(id) as services, AVG(rating) as rating from travel WHERE DATE(request_time) = DATE(NOW()) AND fk_driver = ? GROUP BY DATE(request_time)", [driverId]);
    },
    getDailyReport: async function (driverId) {
        return pool.query("SELECT DATE_FORMAT(request_time, '%e/%c') as date,SUM(cost) as amount from travel WHERE DATEDIFF(NOW(),request_time) < 7 AND fk_driver = ? GROUP BY DATE(request_time)", [driverId]);
    },
    getWeeklyStats: async function (driverId) {
        return pool.query("SELECT SUM(cost) as amount, COUNT(id) as services, AVG(rating) as rating from travel WHERE DATE(request_time) >= DATE(SUBDATE(NOW(), WEEKDAY(NOW()))) AND fk_driver = ?", [driverId]);
    },
    getWeeklyReport: async function (driverId) {
        return pool.query("SELECT (WEEK(NOW()) - WEEK(request_time)) as date, SUM(cost) as amount from travel WHERE fk_driver = ? GROUP BY YEAR(request_time), WEEK(request_time) HAVING date <= 12 AND date >= 0", [driverId]);
    },
    getMonthlyStats: async function (driverId) {
        return pool.query("SELECT SUM(cost) as amount, COUNT(id) as services, AVG(rating) as rating from travel WHERE DATE(request_time) >= DATE(SUBDATE(NOW(), DAYOFMONTH(NOW()))) AND fk_driver = ?", [driverId]);
    },
    getMonthlyReport: async function (driverId) {
        return pool.query("SELECT DATE_FORMAT(request_time, '%b') as date, SUM(cost) as amount from travel WHERE DATE(request_time) > DATE(MAKEDATE(year(now()),1)) AND fk_driver = ? GROUP BY YEAR(request_time), MONTH(request_time)", [driverId]);
    },
    getDriverTypes: async function(driverId) {
        let [rows, ignored] = await pool.query("SELECT driver_type_id FROM driver_types WHERE driver_id = ?",[driverId]);
        let set = new Set(rows.map(x => x.driver_type_id));
        return [...set];
    },
    chargeAccount:async function (driverId,amount){
        await pool.query("UPDATE driver SET credit = credit + ? WHERE id = ?",[amount,driverId]);
        return true;
    },
    getAllTypes: async function() {
        let rows = await pool.query("SELECT * FROM driver_type");
        return rows[0];
    },
    getTransactions: async function(driverId) {
        let [rows, ignored] = await pool.query("SELECT * FROM driver_transaction WHERE driver_id = ?",[driverId]);
        return rows;
    }
};

