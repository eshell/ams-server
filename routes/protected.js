var config = require('../config/config'),
    route = require('express').Router(),
    jwt = require('jsonwebtoken');


    // route.use(function(req,res,next){
    //     var token = req.body.token || req.query.token || req.headers['Authorization'];
    //     if(token){
    //         jwt.verify(token, config.jwt.secret,function(err,decoded){
    //             if(err){
    //                 console.log('error decoding: '+err);
    //                 res.status(400).send('Failed to auth token');
    //             }else{
    //                 req.decoded = decoded;
    //                 next();
    //             }
    //
    //         })
    //     }else{
    //         res.status(400).send('protected:20-Invalid token.');
    //     }
    // });

    route.get('/',function(req,res){
        res.send('protectedd route');
    });


module.exports = route;