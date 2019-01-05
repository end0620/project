"use strict";

let houseData = require('./housesData.json');
const db = require('./db_config.js');
const fs = require('fs');

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

writeToJson(houseData);
houseData = houseData.map(spreadObjectValues);

// console.log(JSON.stringify(houseData[0], null, 2));
// db.query("INSERT INTO portugal_houses VALUES ?" , [houseData], function(err, result, field){
//     if(err)
//         console.log(err);
//     else
//         console.log('insert successfully')
// });

// db.query("SELECT * FROM portugal_houses", function(err, result){

//     writeToJson(result);
    // console.log(JSON.stringify(result, null, 2));
// });

function writeToJson(houses){
    fs.readFile('new.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {

        let obj = JSON.parse(data);
        houses.forEach((elm) => {
            elm.location.lng = Math.random() * 60 - 30;
            elm.location.lat = Math.random() * 60 - 30;
            elm.market_date = randomDate(new Date(2018, 0, 1), new Date());
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

db.end();
