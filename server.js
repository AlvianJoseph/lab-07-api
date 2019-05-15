'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

function handleError(err, res) {
    console.error(err);
    if (res) res.status(500).send('Sorry, something went wrong');
  }

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
        .catch(error => handleError(error, response));
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
    const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.latitude}`;

    superagent.get(url)
        .then(apiResponse => {
            const dailyWeather = apiResponse.body.daily.data.map(day => new Weather(day));
            response.send(dailyWeather);
        })
        .catch(error => {
            console.error(error);
            response.send("something went wrong");
        });

}

function Weather(day) {
    this.forecast = day.summary;
    this.time = new Date(day.time * 1000).toDateString().slice(0, 15);
}

app.get('/events', getEvents);

function getEvents(request, response) {
    const url = `https://www.eventbrite.com/oauth/authorize?response_type=token&client_id=${EVENTBRITE_API_KEY}&redirect_uri=YOUR_URL`;

    superagent.get(url)
    .then(apiResponse => {

    })

    .catch(error => handleError(error, response));

}

function Event(eventData) {
    this.link = eventData.ticket_classes.resource_url;
    this.name = eventData.ticket_classes.name;
    this.event_date = eventData.something;
    this.summary = eventData.something;
}
