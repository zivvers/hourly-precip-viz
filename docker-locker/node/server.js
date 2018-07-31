'use strict';
const fs = require('fs');
const express = require('express');
const jsdom = require('jsdom');
const topojson = require('topojson');
const d3 = require('d3');
const d3_composite = require("d3-composite-projections");
const d3_geo = require("d3-geo");

const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

var html;

 var html = fs.readFileSync("template.html", "utf8");
 console.log(html);

    // virtual DOM
    jsdom.env({
        html: html,
        features: { QuerySelector: true },
        done: function(errors, window) {
        window.d3 = d3.select(window.document);

        var width = 950,
            height = 550;
        
        var projection = d3_composite.geoAlbersUsaTerritories();

        var path = d3.geoPath().projection(projection);

        var svg = window.d3.select('body')
                      .append('div')
                      .append('svg')
                      .attr('width', width)
                      .attr('height', height);
        //d3.json("states_2017_topo.json", function(error, topo) {

        var contents = fs.readFileSync("states_2017_topo.json");
        var topo = JSON.parse(contents);

            var states = topojson.feature(topo, topo.objects.states_2017).features;
    
            svg.selectAll("path")
                     .data(states).enter()
                     .append("path")
                     .attr("class", "feature")
                     .style("fill", "steelblue")
                     .attr("d", path);
    

              svg.append("path")
                    .datum(topojson.mesh(topo, topo.objects.states_2017, function(a, b) { return a !== b; }))
                    .attr("class", "mesh")
                    .attr("d", path);
                                
        //});                  
        
        //console.log(window.d3.select('.testVG').html());
        //res.send(window.d3.select('.testVG').html());
        html = window.d3.select('.test').html();
        }
    });




app.get('/', function(req, res) {

    res.send( html );

});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
