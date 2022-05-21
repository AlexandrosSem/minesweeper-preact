const express = require('express');
const api = require('./api');

const app = express();
const { PORT = 8081 } = process.env;

// API
app
    .use('/', api)
    .listen(PORT, () => console.log(`Server started on port ${PORT}!`));
