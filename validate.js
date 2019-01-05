const validator = require('validator');

const mainProps = ['link', 'location', 'market_date', 'price', 'size', 'sold'];

const locationProps = ['address', 'city', 'coordinates', 'country'];
const coordinatesProps = ['lat', 'lng'];
const sizeProps = ['gross_m2', 'rooms'];
const priceProps = ['currency', 'value'];


function isNumeric(n) {
    return !isNaN(n);
}

function isString(s){
    return typeof s === 'string' || s instanceof String;
}

function isValidDate(s){
    const d = new Date(s);
    return isNumeric(d.getTime());
}
function checkProps(obj, props) {
   return props.every((el) => obj.hasOwnProperty(el));
}

function validateProps(obj) {
    return checkProps(obj, mainProps) && checkProps(obj.location, locationProps) && checkProps(obj.location.coordinates, coordinatesProps)
        && checkProps(obj.price, priceProps) && checkProps(obj.size, sizeProps);
}

function validateHouseObj(obj){

    let result = {
        err : null,
    };

    if(!validateProps(obj)) {
        result.err = ["Invalid object. Property missing!"];
        return result;
    }
    if(!isString(obj.location.city)) {
        result.err = 'invalid city!';
        return result;
    }
    if(!isString(obj.location.country)) {
        result.err = 'invalid country!';
        return result;
    }
    
    if(!validator.isURL(obj.link)) {
        result.err = 'invalid link!';
        return result;
    }
    if(!isValidDate(obj.market_date)) {
        result.err = 'invalid date!';
        return result;
    }
    if(!isString(obj.location.address)) {
        result.err = 'invalid address!';
        return result;
    }
    
    if(!isString(obj.price.currency)){
        result.err = 'invalid currency!';
        return result;
    }
    if(!isNumeric(obj.price.value)){
        result.err = 'invalid price!';
        return result;
    }

    if(!isNumeric(obj.size.rooms) || obj.size.rooms < 0) {
        result.err = 'invalid number of rooms!';
        return result;
    }

    if(!isNumeric(obj.size.gross_m2) || !isNumeric(obj.size.gross_m2 <= 0 )){
        result.err = 'invalid house area!';
        return result;
    }
    
    if(typeof obj.sold !== 'boolean') {
        result.err = 'invalid sold parameter!';
        return result;
    }
    if(!isNumeric(obj.location.coordinates.lat) || !isNumeric(obj.location.coordinates.lat)||
    !isNumeric(obj.location.coordinates.lng) || !isNumeric(obj.location.coordinates.lng)) {
        result.err = 'invalid location coordinates!';
        return result;
    }
    return result;
}

module.exports = validateHouseObj;