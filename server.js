'use strict';

// Load Environment Variables from the .env file

// require('dotenv').config();n   
// Application Dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const request = require('superagent');

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// routes
app.get('/location', handelLocation);
app.get('/weather', handelWeather);
app.get('/parks', handelParks);
// numbers.map(number => {
//     console.log(number);
// });


function handelLocation(req, res) {

    const searchQuery = req.query.city;
    console.log(searchQuery);
    // let selected = searchQuery.city;
    // const locationsRawData = require('./data/location.json');
    // const location = new Location(locationsRawData[0], selected)

    const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${searchQuery}&format=json`;
    console.log('url', url);
    request.get(url)           
        .then(response => {
            const formattedArr = response.body.map((loc) => {
                return {
                    search_query: searchQuery,
                    formatted_query: loc.display_name,
                    latitude: loc.lat,
                    longitude: loc.lon
                };   
            });
            res.send(formattedArr[0]);
            // response.body, response.headers, response.status
        })
        .catch(err => {
            // err.message, err.response
        });

}
const weatherData = [];
function handelWeather(req, res) {


    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${process.env.WEATHER_API_KEY}`


    // const weatherRawData = require('./data/weather.json');
    // console.log('Iamhere');
    // res.send(weatherRawData.data.map((item) => {
    //     return {
    //         forecast: item.weather.description,
    //         time: item.valid_date,
    //     }
    // }));

    request.get(url)
        .then(response => {
            const formattedArr = response.body.data.map((day) => {
                return {
                    forecast: day.weather.description,
                    time: day.valid_date
                };
            });

            res.send(formattedArr.slice(0, 8));
            // response.body, response.headers, response.status
        })
        .catch(err => {
            // err.message, err.response
        });
}


function handelParks(req, res) {

    const key = process.env.PARKS_API_KEY;
    // const longitude = req.query.longitude;
    // const url = `https://us1.locationiq.com/v1/nearby.php?key=${process.env.PARKS_API_KEY}&lat=${latitude}&lon=${longitude}&tag=park&radius=IN_METERS&format=json`
   const url = `https://developer.nps.gov/api/v1/parks?api_key=${key}`

    request.get(url)
        .then(response => {
            const formattedArr = response.body.map((park) => {
                return {
                    name: park.name,
                    address: park.address,
                    fee: park.fee,
                    description: park.description,
                    url: park.url
                };
            });

            res.send(formattedArr.slice(0, 10));
            // response.body, response.headers, response.status
        })
        .catch(err => {
            // err.message, err.response
        });
}

function handelParks(req, res) {

    const key = process.env.PARKS_API_KEY;
    // const longitude = req.query.longitude;
    // const url = `https://us1.locationiq.com/v1/nearby.php?key=${process.env.PARKS_API_KEY}&lat=${latitude}&lon=${longitude}&tag=park&radius=IN_METERS&format=json`
   const url = `https://developer.nps.gov/api/v1/parks?api_key=${key}`

    request.get(url)
        .then(response => {
            const formattedArr = response.body.data.map((park) => {
                return {
                    name: park.fullName,
                    address: park.addresses[0].line1,
                    fee: park.entranceFees[0].cost,
                    description: park.description,
                    url: park.url
                };
            });

            res.send(formattedArr.slice(0, 10));
            // response.body, response.headers, response.status
        })
        .catch(err => {
            // err.message, err.response
        });
}
// function error (req, res){
//     res.status(500).send('sorry')
// }
// constructors

function Location(data, selected) {
    this.search_query = selected;
    this.formatted_query = data.display_name;
    this.latitude = data.lat;
    this.longitude = data.lon;
}

function weather(forecast, time) {
    this.forecast = forecast;
    this.time = time;
}
// app.use('*', error);
app.use('*', (req, res) => {
    res.send('all good nothing to see here!');
});

app.listen(PORT, () => console.log(`Listening to Port ${PORT}`));