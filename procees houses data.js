"use strict";

const housesData = require('./housesData.json');
const geolocatio_url = 'https://geocode.xyz/';
const rp = require('request-promise');
var fs = require('fs');



const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBmI9w-SYrXfpNN094alfMOh9cyHFY3aEY',
    Promise: Promise
  });
   
googleMapsClient.geocode({address: 'Sintra (Santa Maria E São Miguel)'})
.asPromise()
.then((response) => {
    console.log(response.json.results);
})
.catch((err) => {
    console.log(err);
});

// (() => {
//     const geoQuery = geolocatio_url + housesData[0].location.address + '?json=1';
//     rp(geoQuery).then((x) => {console.log(x)}).catch((err) => {console.log(err)})
//     // console.log(jsonLocation);
//     // housesData.forEach((elm) => {
//     //     const geoQuery = geolocatio_url + elm.location.address + '?json=1';
//     //     let jsonLocation = JSON.parse(await rp(geoQuery));
//     //     elm.location.coordinates.lat = parseFloat(jsonLocation.latt);
//     //     elm.location.coordinates.lng = parseFloat(jsonLocation.longt);
//     //     console.log(elm);
//     // });
// })();