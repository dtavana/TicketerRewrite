const express = require('express');
const http = require('http');

init = () => {
    const app = express();
    const server = http.createServer(app);
    routes(app);
    return server;
}

routes = (app) => {
    return;
}

module.exports = init();