"use strict";

const cheerio = require('cheerio')
const rp = require('request-promise');
var fs = require('fs');

const root_url = 'https://www.green-acres.pt/';
const searchPage_url = 'https://www.green-acres.pt/property-for-sale/sintra?p_n=';
const house_url = 'https://www.green-acres.pt/en/properties/53674a-124.htm';


const caracteristicsLables = ['Habitable area', 'Land', 'Bedrooms', 'Rooms'];
const caracteristicsKeyNames = ['living_area', 'land_area', 'bedrooms', 'rooms'];

function writeToJson(house){
    fs.readFile('housesData.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
        let obj = JSON.parse(data);
        console.log(obj);
        console.log(house);
        obj.houses.push(house);
        console.log(obj);
        fs.writeFile('housesData.json', JSON.stringify(obj, null, 2) , 'utf8', (err) => {
            if(err)
                console.log(err);
            console.log('success');
        });
    }});
}

function normaliceNumber(stringWithNumber){
    const number = stringWithNumber.match(/[0-9]*/gm);
    const fixedNumber = parseInt(number.join(''));
    return fixedNumber;
}
function NormaliceHouseInfo(houseInfo, price){
    let houseDetails = {
        address: null,
        price: null,
        living_area: null,
        land_area: null,
        rooms: null,
        bedrooms: null
    }

    houseDetails.price = parseInt(normaliceNumber(price.text()));
    houseDetails.address = houseInfo.find('.item-location p').text();

    const sz = houseInfo.length;
    for(let i = 0; i < sz; ++i){
        const elm = houseInfo.eq(i).text();
        caracteristicsLables.forEach((label, index) => {
            if(elm.match(label)){
                const number = normaliceNumber(elm);
                houseDetails[caracteristicsKeyNames[index]] = number;    
            }
        });
    }

    return new Promise(resolve => {
        resolve(houseDetails);   
    });
}

function extractHouseInfo(url, callback){
    const option = {
        'uri': url, 
        'headers': {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
        }
    };
    rp(option)
    .then((htmlContent) => {
        const $ = cheerio.load(htmlContent);
        let price = $('span.price', '.title-standard');
        let houseInfo = $('li','#mainInfoAdvertPage');
        const HouseInfoNormaliced = NormaliceHouseInfo(houseInfo, price);
        const housePromise = new Promise(resolve => {
            resolve(HouseInfoNormaliced);
        });
        callback(housePromise);
    })
    .catch((err) => {
        console.log(err.error);
        callback(null);
    });
}


let houses = [];
function proccessSearchPage(url){
    const option = {
        'uri': url, 
        'headers': {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
        }
      }
    rp(option)
    .then((htmlContent) => {
        const $ = cheerio.load(htmlContent);
        let housesList = $('a', 'figure.item-main');
        for(let i = 0; i < housesList.length; ++i){
            const houseLink = root_url + housesList.eq(i).attr('href');
            
            extractHouseInfo(houseLink, (housePromise) =>{
                housePromise.then((house) => {
                    // writeToJson(house)
                    // console.log(house);
                    houses.push(house);
                    console.log(houses);
                });
            });
        }
    })
    .catch((err) => {
        console.log(err.error);
    });
}

proccessSearchPage(searchPage_url);

function getSearchPage(searchUrl){
    setTimeout(() => {
        proccessSearchPage(searchUrl);
    }, 10000);
}

async function start(){
    for(let i = 1; i <= 10; ++i){
        const searchUrl = searchPage_url + i;
        getSearchPage(searchUrl);
    }
}

start();