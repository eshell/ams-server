var express = require('express'),
    config = require('./config/config'),
    http = require('http'),
    app = express(),
    jwt = require('jsonwebtoken'),
    bodyParser = require('body-parser');
    // faker = require('faker'),
    // md5 = require('md5'),
    // _ = require('lodash'),
    // morgan = require('morgan'),

app.set('trust proxy');

// app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.use('/api', require('./routes/main'));
app.use('/api/auth', require('./routes/account-gateway'));
app.use('/api/protected',ensureAuthorized, require('./routes/protected'));

function ensureAuthorized(req, res, next) {

    var bearerToken;
    var bearerHeader = req.headers["authorization"];

    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];

        jwt.verify(bearerToken, config.jwt.secret,function(err,decoded){
            if(err) res.sendStatus(403);
            req.token = bearerToken;
            req.decoded = decoded;
        });
        next();
    } else {
        res.sendStatus(403).end();
    }
}


http.createServer(app).listen(config.port, function (err) {
    console.log('AMS API Server listening on port '+config.port);
});