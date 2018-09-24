'use strict';
const fs = require('fs');
const app = require('express')();
const jsdom = require('jsdom');
const topojson = require('topojson');
const d3 = require('d3');
const d3_composite = require("d3-composite-projections");
const d3_geo = require("d3-geo");
const mongoose = require('mongoose');
const http = require('http').Server(app);
const io = require('socket.io')(http);

let dbURL = "mongodb://db/hourly_precip";

const PORT = 8080;
const HOST = '0.0.0.0';

var tempHTML = fs.readFileSync("template.html", "utf8");

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

    //connectMongo();

app.get('/', function(req, res) {

    res.send( tempHTML );
    //var startDateTime = req.query.start;
    //var endDateTime = req.query.start;

});
app.get('/date', function(req, res) {

    var startDateTime = req.query.start;
    var endDateTime = req.query.end;

    console.log(startDateTime);
    console.log(endDateTime);
});
process.on('SIGINT', function() {
        process.exit();
});

/*app.listen(PORT, HOST);
console.log(`Running on http:${HOST}:${PORT}`);*/
http.listen(PORT, function(){
      console.log(`listening on http:${HOST}:${PORT}`);
});
