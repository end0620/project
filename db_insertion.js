"use strict";

const db = require('./db_config.js');
const fs = require('fs');
const dataH = require('./housesData.json');

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

dataH.forEach((elm) => delete elm.url);

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
                propValues.push(obj[prop]);
        }
    }

    return propValues;
}


function writeToDatabase(houseArray){

    const houseData = houseArray.map(spreadObjectValues);
    
    db.query("REPLACE INTO portugal_houses VALUES ?" , [houseData], function(err, result, field){
    if(err)
        console.log(err);
    else
        console.log('insert successfully')
    });
    db.end();
}
function writeToJson(houses){
    fs.readFile('new.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {

        let obj = JSON.parse(data);
        houses.forEach((elm) => {
            elm.location.coordinates.lng = Math.random() * 60 - 30;
            elm.location.coordinates.lat = Math.random() * 60 - 30;
            elm.market_date = randomDate(new Date(2018, 0, 1), new Date()).toISOString().slice(0, 10);
            elm.sold = false;
        })

        console.log(JSON.stringify(houses[0], null, 2));
        obj.houses = obj.houses.concat(houses);
        fs.writeFile('new.json', JSON.stringify(obj, null, 2) , 'utf8', (err) => {
            if(err)
                console.log(err);
            console.log('success');
        });
    }});
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

module.exports = writeToDatabase;