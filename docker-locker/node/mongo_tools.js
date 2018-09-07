var mongoose = require('mongoose');
//var url = process.env.DB_PORT_27017_TCP_ADDR + ":27017";
let url = "mongodb://mongo:27017/hourly_precip";
console.log(url);

mongoose.connect(url);

let Schema = mongoose.Schema;

let precipSchema = new Schema({
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

posts.findOne({datetime_utc : new Date(2014, 01, 03, 01)}, function(err, doc) {
    console.log(doc);
});


