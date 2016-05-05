var config = require('../../config/config'),
    route = require('express').Router(),
    Sequelize = require('sequelize'),
    mysql = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password),
    bcrypt = require('bcrypt'),
    md5 = require('md5'),
// nodemailer = require('nodemailer'),
    Errors = mysql.import('../../models/error-log'),
    email = require('../../utils/email'),
    Mogul = mysql.import('../../models/mogul');

// var transporter = nodemailer.createTransport({
//     service: config.email.gmail.service,
//     auth: {
//         user: config.email.gmail.auth.user,
//         pass: config.email.gmail.auth.pass
//     }
// });

route.get('/test',function(req,res){
   res.sendStatus(200);
});
route.post('/test',function(req,res){
    res.sendStatus(200);
});

route.post('/do-register',function(req,res){
    "use strict";
    Mogul.count({where:{email:req.body.email}}).then(function(found){
        if(found){
            Errors.create({ip:req.ip,file:'account-gateway.js:164',error:'email('+req.body.email+') already exists!'});
            res.status(400).send('Email already exists!');

        }else{
            var password=Math.random().toString(36).slice(-8);
            var now = new Date();
            var salt = bcrypt.genSaltSync(10);
            var code = md5(password + "_" + req.body.email + now);

            Mogul.build({
                email: req.body.email,
                password: bcrypt.hashSync(password, salt),
                code: code
            }).save()
                .then(function () {
                    email.sendEmailCode(req,res,'doRegistration',code,password);
                })
                .catch(function(err) {
                    Errors.create({ip:req.ip,file:'account-gateway.js:180',error:err});
                    res.sendStatus(400);
                });
        }
    }).catch(function(notFound){
        Errors.create({ip:req.ip,file:'account-gateway.js:186',error:notFound+'|notfound?'});
        res.sendStatus(400);

    });
});



module.exports = route;