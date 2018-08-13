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

var tempHTML = fs.readFileSync("template.html", "utf8");
console.log(html);

// virtual DOM
jsdom.env({
    html: tempHTML,
    features: { QuerySelector: true },
    done: function(errors, window) {
    window.d3 = d3.select(window.document);

    var width = 950,
        height = 550;
    
    var projection = d3_composite.geoAlbersUsaTerritories();

    var path = d3.geoPath().projection(projection);

    var margin = {top: 20, right: 30, bottom: 30, left: 40};

    var svg = window.d3.select('body')
                  .append('div')
                    .attr('top', margin.top) // these attr don't change anything
                    .attr('right', margin.right)
                    .attr('left', margin.left)
                    .attr('bottom', margin.bottom)
                  .append('svg')
                  .attr('width', width + margin.right + margin.left)
                  .attr('height', height + margin.top + margin.bottom);

    var g = svg.append("g")
                .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    fs.readFile("states_2017_topo.json", function(err, dat) { 
        
        var topo = JSON.parse( dat );

        var states = topojson.feature(topo, topo.objects.states_2017).features;

        var voronoi = d3.voronoi()
            .x(function(d) { return projection([ +d.lon, +d.lat ] )[0]; })
            .y(function(d) { return projection([ +d.lon, +d.lat ] )[1]; })
            .extent([[0, 0], [width, height]])

        var vG = svg.append("g");

        svg.selectAll("path")
                 .data(states).enter()
                 .append("path")
                 .attr("class", "feature")
                 .style("fill", "none")
                 .attr("d", path);

        d3.csv('precip_extract.csv', function(error, data) {

            if (error) { 
                console.log('CANNOT OPEN PRECIP EXTRACT');
            }
            else {

                svg.append("path")
                    .datum(topojson.mesh(topo, topo.objects.states_2017, function(a, b) { return a === b; }))
                    .attr("class", "mesh")
                    .attr("d", path);

                vG.selectAll("path")
                    .data(voronoi.polygons( data ))
                    .enter().append("path")
                        .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });
                        .attr("station_name", function(d) { return  


                html = window.d3.select('.test').html();    
           }
        });
      });                  
    }
});

app.get('/', function(req, res) {

    res.send( html );

});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
