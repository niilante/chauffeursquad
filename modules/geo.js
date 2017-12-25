const geoLib = require('geolib');
const bluebird = require('bluebird');
const gMapObject = bluebird.promisifyAll(require('@google/maps'));
const gMap = gMapObject.createClient({
    key: process.env.GOOGLE_MAPS_API_KEY,
    Promise: Promise
});
module.exports.orderCoordinates = orderCoordinates;
module.exports.calculateDistance = calculateDistance;
module.exports.calculateDistances = calculateDistances;
module.exports.latLngToPoint = latLngToPoint;
module.exports.getDriverLocation = getDriverLocation;
module.exports.geoParser = geoParser;

function orderCoordinates(referencePoint, drivers, maxPoints, maxDistance) {
    let distances = geoLib.orderByDistance(
        referencePoint,
        drivers.map(getDriverLocation)
    );
    let result = [];
    for (let i = 0; i < distances.length; i++) {
        if (i == maxPoints)
            break;
        if (distances[i].distance > maxDistance)
            break;
        result.push({
            id: drivers[distances[i].key].id,
            location: drivers[distances[i].key].location,
            distance: distances[i].distance
        });
    }
    if (result.length < 1)
        throw new Error(303);
    return result;
}
async function calculateDistance(referencePoint, coordinate) {
    return await gMap.distanceMatrix({
        'origins': [[referencePoint.latitude, referencePoint.longitude]],
        'destinations': [[coordinate.latitude, coordinate.longitude]]
    }).asPromise();
}
async function calculateDistances(referencePoint, coordinates) {
    let points = [];
    for (let coordinate of coordinates) {
        let geo = gMap.distanceMatrix({
            'origins': [[referencePoint.latitude, referencePoint.longitude]],
            'destinations': [[coordinate.location.latitude, coordinate.location.longitude]]
        }).asPromise();
        points.push(geo);
    }
    return points;
}
function geoParser(geo) {
    if (geo.json.rows[0].elements[0].status == "ZERO_RESULTS")
        return {
            distance: {
                text: 0,
                value: 0
            },
            duration: {
                text: 0,
                value: 0
            }
        };
    else
        return {
            distance: {
                text: geo.json.rows[0].elements[0].distance.text,
                value: geo.json.rows[0].elements[0].distance.value
            },
            duration: {
                text: geo.json.rows[0].elements[0].duration.text,
                value: geo.json.rows[0].elements[0].duration.value
            }
        };
}
function getDriverLocation(driver) {
    return driver.location;
}
function latLngToPoint(lat, lng) {
    return {latitude: lat, longitude: lng};
}