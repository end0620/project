
'use strict';

const express =  require('express');
const bodyParser = require('body-parser');
const db = require('./db_config.js');
const Chart = require('chart.js');;
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());

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
