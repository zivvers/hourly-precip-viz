'use strict';
const fs = require('fs');
const express = require('express');
const jsdom = require('jsdom');
const d3 = require('d3');
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.get('/', function(req, res) {

    // virtual DOM
    jsdom.env({
        html: '',
        features: { QuerySelector: true },
        done: function(errors, window) {
        window.d3 = d3.select(window.document);

        var svg = window.d3.select('body')
                    .append('div')
                      .attr('class', 'feast')
                    .append('svg')
                    .append('g')
                    .append('text')
                    .attr('x', '100')
                    .attr('y', '100')
                    .text('NOW WE ARE COOKING');
        console.log(window.d3.select('.feast').html());
        res.send(window.d3.select('.feast').html());
        }
    });

});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
