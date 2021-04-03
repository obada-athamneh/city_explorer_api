'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const request = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// routes
app.get('/location', handelLocation);
app.get('/weather', handelWeather);
app.get('/parks', handelParks);
app.get('/movies', handelMovies);
app.get('/yelp', handleYelp);

let moviesArr = [];
function movies (title, overview, average_votes, total_votes, image_url, popularity, released_on){
    this.title = title;
    this.overview = overview;
    this.average_votes = average_votes;
    this.total_votes = total_votes;
    this.image_url = image_url;
    this.popularity = popularity;
    this.released_on = released_on;
    moviesArr.push(this);
}

function handelMovies(req, res){
    let key = process.env.MOVIE_API_KEY;
    let url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${key}`
    request.get(url).then(response => {
        const mov = response.body.results;
        mov.map( a => {
            let img = `https://image.tmdb.org/t/p/w500${a.poster_path}`;
            new movies(a.title, a.overview, a.vote_average, a.vote_count, img, a.popularity, a.release_date);
            // console.log(moviesArr);
            
        })
        res.send(moviesArr);
    } )
}

let yelpArray = [];
function Yelp(a,b,c,d,e){
    this.name = a;
    this.image_url = b;
    this.price = c;
    this.rating = d;
    this.url = e;
    yelpArray.push(this)
}
let id1 = 0;
function handleYelp(req, res) {
    
    // console.log('booooody',req.query)
    let yelp = process.env.YELP_API_KEY;

    let url = `https://api.yelp.com/v3/businesses/search?term=restaurants&location=${req.query.city}&limit=25`;
    request.get(url).set('Authorization', `Bearer ${yelp}`)
    .then(res => {
        let yelpData = res.body.businesses;
        yelpArray = [];
          yelpData.forEach(element => {
              
              let f = element.name;
              let g = element.image_url;
              let h = element.price;
              let i = element.rating;
              let j = element.url;
              let newYelp = new Yelp(f,g,h,i,j);
            });
            return yelpArray;
        
        }).then((x)=> {
           
            let id2 = id1 + 5;
            const resul = yelpArray.slice(id1, id2);
            id1 +=5;
            res.send(resul);
        }).catch( error => {
            console.log('ERROR', error);
            res.status(500).send('So sorry, something went wrong.');
          });
        
}



function handelLocation(req, res) {
    const searchQuery = req.query.city;
    let sql = 'SELECT * FROM location WHERE search_query = $1';
    let citArr = [searchQuery];
client.query(sql, citArr).then(result => {
    // console.log(result.rowCount);
    if (result.rowCount){
        // console.log(result.rows);
        res.send(result.rows[0])
    }else{
    
    const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${searchQuery}&format=json`;
    // console.log('url', url);
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
            let mysql = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4) RETURNING *';
            let values = [searchQuery, formattedArr[0].formatted_query, formattedArr[0].latitude, formattedArr[0].longitude];
            client.query(mysql, values).then(results => {
                // console.log(results.rows);
            })
            res.send(formattedArr[0]);
            // response.body, response.headers, response.status
        })
        .catch(err => {
            // err.message, err.response
        });
        
}})
}
const weatherData = [];
function handelWeather(req, res) {


    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${process.env.WEATHER_API_KEY}`


    

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
    console.log('gggg');
    // const key = process.env.PARKS_API_KEY;
//    const url = `https://developer.nps.gov/api/v1/parks?api_key=${key}&q=${req.query.search_query}&limit=10`;
let query = req.query.search_query;

   let url = `https://developer.nps.gov/api/v1/parks?q=${query}&api_key=${process.env.PARKS_API_KEY}`;
   
    // console.log(req.query);
    request.get(url)
        .then(response => {
            // console.log(response)
            const parksArr =[];
             response.body.data.foreach((element) => {
                let newUrl = element.url;
                let fullName = element.fullName;
                let newDes = element.description;
                let Fee = element.entranceFees[0].cost;
                let newAddress = element.addresses[0].line1 + ' ' + element.addresses[0].city;
                let parkObject = {
                   
                    name: fullName,
                    address: newAddress,
                    fee: Fee,
                    description: newDes,
                    url:newUrl,
                };
                parksArr.push(parkObject);
            });
            // console.log(parksArr);
            res.send(parksArr);
            // response.body, response.headers, response.status
        })
        .catch(err => {
            // err.message, err.response
        });
}



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

client.connect().then( () => {
    app.listen(PORT, () => {
      console.log("Connected to database:", client.connectionParameters.database) 
      console.log('Server up on', PORT);
    });
  })