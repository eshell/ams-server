var express = require('express'),
    config = require('./config/config'),
    http = require('http'),
    app = express(),
    bodyParser = require('body-parser'),
    ensureAuthorized = require('./utils/auth').ensureAuthorized,
    ensureAdmin = require('./utils/auth').ensureAdmin;

app.set('trust proxy');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.use('/api', require('./routes/main'));
app.use('/api/moguls/actions', ensureAuthorized, require('./routes/moguls/actions'));
app.use('/api/moguls/auth', require('./routes/moguls/auth'));
app.use('/api/admin', ensureAdmin, require('./routes/admin/main'));

http.createServer(app).listen(config.port, function () {
    console.log('AMS API Server listening on port '+config.port);
});
