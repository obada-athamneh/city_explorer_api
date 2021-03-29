'use strict';

// Load Environment Variables from the .env file

// require('dotenv').config();n   
// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// routes
app.get('/location', handelLocation);
app.get('/weather', handelWeather);
// numbers.map(number => {
//     console.log(number);
// });


function handelLocation(req, res) {

    const searchQuery = req.query;
    console.log(searchQuery);
    let selected = searchQuery.city;
    const locationsRawData = require('./data/location.json');
    const location = new Location(locationsRawData[0], selected)
    res.send(location);
}
const weatherData = [];
function handelWeather(req, res) {
    const weatherRawData = require('./data/weather.json');
    let weatherArr = weatherRawData.data;
    console.log('---->')
    weatherArr.forEach(item => {
        let newWeather = new weather(item.weather.description,item.valid_date);
        weatherData.push(newWeather)
    });

    res.send(weatherData);

}
// function error (req, res){
//     res.status(500).send('sorry')
// }
// constructors

function Location(data , selected) {
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