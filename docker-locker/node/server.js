'use strict';
const fs = require('fs');
const express = require('express');
const jsdom = require('jsdom');
const topojson = require('topojson');
const d3 = require('d3');
const d3_composite = require("d3-composite-projections");
const d3_geo = require("d3-geo");
const mongoose = require('mongoose');

let url = "mongodb://db/hourly_precip";

const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

var html;

var tempHTML = fs.readFileSync("template.html", "utf8");
console.log(html);

    function connectMongo(  ) {
        mongoose.connect("mongodb://db/hourly_precip");
        var db = mongoose.connection;
    
        let precipSchema = new mongoose.Schema({
            coop: String
            , station_name: String
            , country_name: String
            , utc_offset: String
            , datetime_utc: Date
            , lat: Number
            , lon: Number
            , precip_amt: Number
           }, { collection : 'posts'} );

        let posts = mongoose.model('posts', precipSchema); 

        posts.findOne().then(doc => console.log(doc));
        //return posts;

    }

    connectMongo();

/* app.get('/', function(req, res) {

    res.send( html );

}); */


/*app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);*/
