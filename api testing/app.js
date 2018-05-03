const express = require('express');
const request = require('request');
const fs = require('fs');
const hbs = require('hbs');
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
var key = 'aFVE4X3HUdTMjVLm';

var app = express();

//SOMETHING WRONG WITH THE MAPS.HBS SCRIPT PART

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/views'));

app.get('/', (request, response) => {
    getArtistID("Post Malone", key).then((result) => {
        return getConcerts(result.id, key);
    }).then((result) => {
        // console.log(result);

        response.render('map.hbs', {
            title: 'Maps',
            events: result
        })
    })
});

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

// hbs.registerHelper('coordinates', function(information) {
//     var coords = [];
//     var coord = [];
//
//     for (var key in information){
//         coord = [];
//         coord.push(information[key].lat, information[key].lng);
//         coords.push(coord);
//     }
//     console.log(coords);
//     return coords;
// });


var getArtistID = (artist, apiKey) => {
    return new Promise((resolve,reject) => {
        request({
            url: `http://api.songkick.com/api/3.0/search/artists.json?apikey=${apiKey}&query=${encodeURIComponent(artist)}`,
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to Songkick API');
                console.log(error);
            }else if (body.resultsPage.totalEntries == 0) {
                resolve({
                    error : 'Artist Not Found'
                });
            }else {
                resolve({
                    uri: body.resultsPage.results.artist[0]['uri'],
                    id: body.resultsPage.results.artist[0]['id']
                });
            }
        });
    });
};

var getConcerts = (id, apiKey) => {
    return new Promise((resolve,reject) => {
        request({
            url: `http://api.songkick.com/api/3.0/artists/${id}/calendar.json?apikey=${apiKey}`,
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to Songkick API');
                console.log(error);
            }else if (body.resultsPage.totalEntries == 0) {
                resolve({
                    error : 'Concert not Found'
                });
            }else {
                var concertlist = [];
                var concertThing = {};
                var innerConcert = {};
                for (var i = 0; i < body.resultsPage.results.event.length; i++) {
                    concertThing['event' + i] = {
                        name: body.resultsPage.results.event[i].venue.displayName,
                        date: body.resultsPage.results.event[i].start.date,
                        city: body.resultsPage.results.event[i].location.city,
                        lat: body.resultsPage.results.event[i].location.lat,
                        lng: body.resultsPage.results.event[i].location.lng
                    };
                }
                resolve(concertThing);
                // resolve({
                //     uri: body.resultsPage.results.artist[0]['uri'],
                //     id: body.resultsPage.results.artist[0]['id']
                // });
            }
        });
    });
};



//Chaining Promises to get to the concert


app.listen(port, () => {
    console.log('Server is up on the port ' +port);
});