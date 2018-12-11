"use strict";

const cheerio = require('cheerio')
const rp = require('request-promise');
var fs = require('fs');

const root_url = 'https://www.green-acres.pt/';
const searchPage_url = 'https://www.green-acres.pt/casa-em-venda/sintra?p_n=';


const geocodeUrl = 'http://www.mapquestapi.com/geocoding/v1/address?key=LmjL8NfyH3bKlGA6nMAZgLMCsisHkihH&location=Sintra (Santa Maria E São Miguel)';

const caracteristicsLables = ['Superfície habitável', 'Terreno', 'Divisões'];
const caracteristicsKeyNames = ['living_area', 'land_area', 'rooms'];

function writeToJson(houses){
    fs.readFile('housesData.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
        let obj = JSON.parse(data);
        obj.houses = obj.houses.concat(houses);
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

async function NormaliceHouseInfo($, link){
    let houseDetails = {
        address: null,
        price: null,
        living_area: null,
        land_area: null,
        rooms: null,
    };
    const title = $('h1.item-title', '#mainInfoAdvertPage').text().trim();
    const price = $('span.price', '.title-standard');
    const houseInfo = $('li','#mainInfoAdvertPage');
    const description = $('p', '#DescriptionDiv').text().trim();

    let newH = {
        link: "",
        location: {
          country: "Portugal",
          city: "Lisbon",
          address: "",
          coordinates: {
            lat: "",
            lng: ""
          }
        },
        size: {
          parcel_m2: "",
          gross_m2: "",
          net_m2: "",
          rooms: ""
        },
        price: {
          value: "",
          currency: "EUR"
        },
        description: "",
        title: "",
        images: [""]
      };

    newH.price = parseInt(normaliceNumber(price.text()));
    newH.location.address = houseInfo.find('.item-location p').text();
    newH.description = description;
    newH.title = title;

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

    newH.link = link;
    newH.size.parcel_m2 = houseDetails.land_area;
    newH.size.gross_m2 = houseDetails.living_area;
    newH.size.rooms = houseDetails.rooms;

    // HERE IS THE PROBLEM
    // console.log($('img', '.item-photo-prev').eq(1).attr('src'));

    const geoQuery = geolocatio_url + newH.location.address + '?json=1';
    let jsonLocation = JSON.parse(await rp(geoQuery));

    newH.location.coordinates.lat = parseFloat($('#locationMapDialog').data('lat'));
    newH.location.coordinates.lng = parseFloat($('#locationMapDialog').data('lng'));

    return new Promise(resolve => {
        resolve(newH);   
    });
}

function extractHouseInfo(url){
    const option = {
        'uri': url, 
        'headers': {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
        }
    };
    return rp(option)
        .then((htmlContent) => {
            const $ = cheerio.load(htmlContent);
            
            const HouseInfoNormaliced = NormaliceHouseInfo($, url);
            return HouseInfoNormaliced;
        })
        .catch((err) => {
            console.log(err.error);
            return null;
        });
}


function proccessSearchPage(url){
    const option = {
        'uri': url, 
        'headers': {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36',
        }
      }
    return rp(option)
        .then(async (htmlContent) => {
            const $ = cheerio.load(htmlContent);
            let housesList = $('a', 'figure.item-main');
            let houses = [];
            for(let i = 0; i < housesList.length; ++i){
                const houseLink = root_url + housesList.eq(i).attr('href');
                let houseData = await extractHouseInfo(houseLink);
                // houses.push(houseData);
                break;
                await sleep(1000);
            }
            return houses;
        })
        .catch((err) => {
            console.log(err.error);
            
            return null;
        });
}

async function loopSite(){
    let total = [];
    for(let i = 10; i <= 10; ++i){
        await proccessSearchPage(searchPage_url + i)
        .then((houses) => {
            // total = total.concat(houses);
        });
    }

    return Promise.all(total);
}

function sleep(duration){
    console.log('sleeping for', duration)
    return new Promise((res) => {
        setTimeout(() => res(), duration);
    })
}

loopSite()
.then((houses) => {
    // writeToJson(houses);
})
