global.IMAGE_RIDER = 0;
global.IMAGE_DRIVER = 1;
global.IMAGE_DRIVER_HEADER = 2;
global.IMAGE_OPERATOR = 3;
global.IMAGE_RIDE = 4;
global.IMAGE_DRIVER_TYPE = 5;
const shortId = require('shortid');
const imageMin = require('imagemin');
const imageMinWebp = require('imagemin-webp');

const mysql = require('./mysqldb');
function getRelativePath(type, fileName){
    switch (type) {
        case IMAGE_RIDER:
            return 'img/rider/' + fileName;
            break;
        case IMAGE_DRIVER:
            return 'img/driver/' + fileName;
            break;
        case IMAGE_DRIVER_HEADER:
            return 'img/driver-header/' + fileName;
            break;
        case IMAGE_OPERATOR:
            return 'img/operator/' + fileName;
            break;
        case IMAGE_RIDE:
            return 'img/ride/' + fileName;
            break;
        case IMAGE_DRIVER_TYPE:
            return 'img/driver-type/' + fileName;
    }
}
async function removePicture(type, id) {
    try {
        let previousImage;
        switch (type) {
            case(IMAGE_RIDER):
                previousImage = await mysql.rider.getProfileImage(id);
                break;
            case(IMAGE_DRIVER):
                previousImage = await mysql.driver.getProfileImage(id);
                break;
            case(IMAGE_DRIVER_HEADER):
                previousImage = await mysql.driver.getHeaderImage(id);
                break;
            case(IMAGE_OPERATOR):
                previousImage = (await pool.query("SELECT image_address FROM operator WHERE id = ?",[id]))[0][0].image_address;
                break;
            case(IMAGE_RIDE):
                previousImage = (await pool.query("SELECT image_address FROM car WHERE id = ?", [id]))[0][0].image_address;
                break;
            case IMAGE_DRIVER_TYPE:
                previousImage = (await pool.query("SELECT icon FROM driver_type WHERE id = ?", [id]))[0][0].icon;
        }
        previousImage = publicDir + previousImage;
        if (previousImage != null) {
            await fs.statAsync(previousImage);
            return fs.unlinkAsync(previousImage);
        }
    }
    catch (err) {
        console.log(err);
    }
}
async function updateDatabase(type, id, fileName) {
    let result;
    switch (type) {
        case(IMAGE_RIDER):
            result = mysql.rider.setProfileImage(id, getRelativePath(IMAGE_RIDER,fileName));
            break;
        case(IMAGE_DRIVER):
            result = mysql.driver.setProfileImage(id, getRelativePath(IMAGE_DRIVER,fileName));
            break;
        case(IMAGE_DRIVER_HEADER):
            result = mysql.driver.setHeaderImage(id, getRelativePath(IMAGE_DRIVER_HEADER,fileName));
            break;
        case(IMAGE_OPERATOR):
            result = mysql.operator.setProfilePicture(id, getRelativePath(IMAGE_OPERATOR,fileName));
            break;
        case(IMAGE_RIDE):
            result = pool.query("UPDATE car SET image_address = ? WHERE id = ?", [getRelativePath(IMAGE_RIDE,fileName),id]);
            break;
        case(IMAGE_DRIVER_TYPE):
            result = pool.query("UPDATE driver_type SET icon = ? WHERE id = ?", [getRelativePath(IMAGE_RIDE,fileName),id]);
    }
}
module.exports = {
    getRelativePath: getRelativePath,
    doUpload: async function (type, buffer, id) {
        const fileName = shortId.generate() + '.webp';
        const path = getRelativePath(type, fileName);
        const realPath = publicDir + path;
        let newBuffer = await imageMin.buffer(buffer, {
            use: [
                imageMinWebp({quality: 50})
            ]
        });
        let fd = await fs.openAsync(realPath, 'a', 0o755);
        await fs.writeAsync(fd, newBuffer, 'binary');
        await fs.closeAsync(fd);
        await removePicture(type, id);
        await updateDatabase(type,id,fileName);
        return path;
    }
};
