'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

app.listen(PORT, () => console.log(`App is listening on ${PORT}`));

app.get('/location', searchToLatLong);

function searchToLatLong(request, response) {
    // construct a url
    // make an hhtp call to that url
    const query = request.query.data;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

    return superagent.get(url).then(result => {
        response.send(new Location(query, result.body))
    }).catch(error => {
        response.status(500).send("something went wrong")
    })
}

function searchToLatLongMock(query) {
    const geoData = require('./data/geo.json');
    const location = new Location(query, geoData)
    return location;
}

function Location(query, geoData) {
    this.search_query = query;
    this.formatted_query = geoData.results[0].formatted_address;
    this.latitude = geoData.results[0].geometry.location.lat;
    this.longitude = geoData.results[0].geometry.location.lng;
}


// const dailyWeather = [];

app.get('/weather', getWeather);

function getWeather(request, response) {
    const weatherData = require('./data/darksky.json');
    try {
        const dailyWeather = weatherData.daily.data.map(day => new Weather(day));

        response.send(dailyWeather);
    }
    catch (error) {
        console.log(error);
        response.status(500).send('Status: 500. Sorry, something went wrong');
    }
}


function Weather(day) {
    this.forecast = day.summary;
    this.time = new Date(day.time*1000).toDateString();
}

