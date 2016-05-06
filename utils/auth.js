var jwt = require('jsonwebtoken'),
    config = require('../config/config'),
    Sequelize = require('sequelize'),
    mysql = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password),
    Errors = mysql.import('../models/error-log');



function createJwt(user) {
    return jwt.sign(user, config.jwt.secret, { expiresIn: config.jwt.expiration });
}

function ensureAdmin(req,res,next){
    var user = 'admin';
    var pass = 'admin';
    
    if(req.body.user === user && req.body.pass === pass) next();
    Errors.create({ip:req.ip,file:'utils/auth.js',error:'Unauthorized'});
    res.sendStatus(403).end();
}

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
        Errors.create({ip:req.ip,file:'ams.js',error:'bearerHeader got undefined'});
        res.sendStatus(403).end();
    }
}

module.exports = {
    createJwt:createJwt,
    ensureAuthorized: ensureAuthorized,
    ensureAdmin: ensureAdmin
};
