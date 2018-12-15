"use strict";

let houseData = require('./housesData.json');
const db = require('./db_config.js');

const column_names = ['url',
'location_country',
'location_city',
'location_address',
'location_coordinates_lat',
'location_coordinates_lng',
'size_parcelm2',
'size_grossm2',
'size_netm2',
'size_rooms',
'price_value',
'price_currency',
'description',
'title',
'images'];

houseData.forEach(x => delete x.url);

function spreadObjectValues(obj){
    let propValues = [];
    for (let prop in obj){
        if(typeof obj[prop] === 'object' && obj[prop] !== null)
            propValues = propValues.concat(spreadObjectValues(obj[prop]));
        else{
            if((prop === 'parcel_m2' || prop === 'gross_m2' || prop === 'net_m2' || prop === 'rooms' ) && !obj[prop])
                propValues.push(0)
            else if (prop === 'images')
                propValues.push("no images");
            else
                propValues.push(prop == 'lat' || prop == 'lng' ? 1 : obj[prop]);
        }
    }

    return propValues;
}
houseData = houseData.map(spreadObjectValues);

console.log(JSON.stringify(houseData[0], null, 2));
db.query("INSERT INTO portugal_houses VALUES ?" , [houseData], function(err, result, field){
    if(err)
        console.log(err);
    else
        console.log('insert successfully')
});
db.end();
