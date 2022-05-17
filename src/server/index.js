const express = require('express');
const api = require('./api');

const app = express();
const { PORT = 8081 } = process.env;
const urlPrefix = '/'; // /api;

// API
app
    .use(urlPrefix, api)
    .listen(PORT, () => console.log(`Server started on port ${PORT}!`));
