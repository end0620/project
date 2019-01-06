
'use strict';

const express =  require('express');
const bodyParser = require('body-parser');
const db = require('./db_config.js');
const Chart = require('chart.js');;
const app = express();
const validate = require('./validate.js');
const writeToDB = require('./db_insertion.js');
const busboy = require('connect-busboy');
var fs = require('fs-extra');  

app.set('view engine', 'ejs');
app.use(busboy());

app.use(bodyParser.json());

app.get("/submitData", (request, response) => {
    response.render('submit');   
});

app.post("/upload", (request, response) => {

    request.pipe(request.busboy);

    request.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        console.log(__dirname);
        let fstream = fs.createWriteStream(__dirname +'/uploads/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {    
            console.log("Upload Finished of " + filename); 
            
            fs.readFile(__dirname +'/uploads/' + filename, 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                    let obj = JSON.parse(data);
                    
                    console.log(obj);
                    let correctData = [];
                    obj.houses.forEach((elm) => {
                        const result = validate(elm);
                        if(!result.err)
                            correctData.push(elm);
                        else
                            console.log(result.err);
                    });

                    writeToDB(correctData);
                   
                   
            }});
            response.redirect('back');
        });
    });
});

app.get("/searchData",(request, response) => {

    return new Promise((res) => { 
        
        let queryString = `SELECT location_city, location_address, price_value, price_currency, DATE_FORMAT(market_date, '%Y-%c-%d') as market_date FROM portugal_houses`;

        queryString = queryString + (request.query.city ? ` WHERE location_city = ${db.escape(request.query.city)}` : ``) ;
        queryString = queryString + ` ORDER BY market_date DESC`

        db.query(queryString, function(err, result, field){
        if(err){
            console.log(err);
            //    response.render('error', {error: err}); 
        }
        else{
            
             res(result);
        }
    });

    }).then((res) => {

        return new Promise((res2) => { 
        
            let queryString = `SELECT location_city, SUM(price_value) as total_price, COUNT(price_value) as total_houses, AVG(price_value) as avg_price FROM portugal_houses`;

            queryString = queryString + (request.query.city ? ` WHERE location_city = ${db.escape(request.query.city)} GROUP BY location_city` : ` GROUP BY location_city`);
            
            db.query(queryString, function(err, result, field){
                if(err){
                    console.log(err);
                    //    response.render('error', {error: err}); 
                }
                else{
                    res2({result:res, chartResult:result});
                }
            })
        
    })}).then((res2) => {

        
        const chartData = res2.result.map((elm) => {
            return {x: new Date(elm.market_date).getTime(), y: elm.price_value}
        }).filter((elm, index) => index < 100);

        response.render('search', {...res2, city: (request.query.city ? request.query.city : 'all cities'), chartData: chartData});
    });
}); 

app.listen(3030);