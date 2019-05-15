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
    const locationQuery = request.query.data;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationQuery}&key=${process.env.GEOCODE_API_KEY}`;

    superagent.get(url)
        .then(apiResponse => {
            const location = new Location(locationQuery, apiResponse.body);
            response.send(location);
        })
        .catch(error => {
            console.error(error);
            response.send("something went wrong");
        });
}

function Location(locationQuery, locationInfo) {
    console.log(locationInfo);
    this.search_query = locationQuery;
    this.formatted_query = locationInfo.results[0].formatted_address;
    this.latitude = locationInfo.results[0].geometry.location.lat;
    this.longitude = locationInfo.results[0].geometry.location.lng;
}

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
    this.time = new Date(day.time * 1000).toDateString().slice(0, 15);
}
