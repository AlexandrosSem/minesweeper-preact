const api = require('./api');
const urlPrefix = '/'; // /api;

module.exports = app => void app.use(urlPrefix, api);
