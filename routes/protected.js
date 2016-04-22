var config = require('../config/config'),
    route = require('express').Router(),
    jwt = require('jsonwebtoken');


    route.use(function(req,res,next){
        var token = req.body.token || req.query.token || req.headers['x-access-token'];
        if(token){
            jwt.verify(token, app.get('superSecret'),function(err,decoded){
                if(err){
                    console.log('error decoding: '+err);
                    res.json({success:false,msg:'Failed to auth token'});
                }else{
                    req.decoded = decoded;
                    next();
                }

            })
        }else{
            res.status(403).send({success:false,msg:'no token provided'});
        }
    });

    route.get('/',function(req,res){
        res.send('protectedd route');
    });

module.exports = route;