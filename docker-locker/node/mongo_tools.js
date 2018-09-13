var mongoose = require('mongoose');
//var url = process.env.DB_PORT_27017_TCP_ADDR + ":27017";
let url = "mongodb://db/hourly_precip";
console.log(url);

posts.findOne({}, function(err, doc) {
    console.log(doc);
});

var _posts;

module.exports = {


    // we're only using 1 collection so hand that over
    function connectMongo( callback ) {
        mongoose.connect("mongodb://db/hourly_precip");
        var db = mongoose.connection;
        
        db.on('error', console.error.bind(console, 'connection error: '));

        db.once('open', function() { 

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

            return posts;
        }

    }

}




}

