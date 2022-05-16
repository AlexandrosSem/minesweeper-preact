const express = require('express');
const configureAPI = require('./configure');

const app = express();
const { PORT = 8081 } = process.env;

// API
configureAPI(app);
app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
