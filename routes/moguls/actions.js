var config = require('../../config/config'),
    route = require('express').Router(),
    Sequelize = require('sequelize'),
    mysql = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password),
    bcrypt = require('bcrypt'),
    md5 = require('md5'),
    Errors = mysql.import('../../models/error-log'),
    email = require('../../utils/email'),
    Mogul = mysql.import('../../models/mogul');

/**
 * Mogul Password Change - manual
 * @param id
 * @param password
 * @param oldPassword
 */

route.post('/password-change',function(req,res){
    "use strict";
    if(typeof req.body.password === 'undefined' || !req.body.password){
        res.status(400).send('Invalid Password');
    }else {
        Mogul.findOne({
            where: {
                id: req.body.id
            }
        }).then(function (user) {
            if (user) {
                bcrypt.compare(req.body.oldPassword, user.password, function (err, isMatch) {
                    if (err) Errors.create({ip: req.ip, file: 'account-gateway.js:26', error: err});

                    if (isMatch) {
                        var salt = bcrypt.genSaltSync(10);
                        user.password = bcrypt.hashSync(req.body.password, salt);
                        user.save().then(function () {
                            res.status(200).send('Password Updated! Please log in.');
                        });

                    } else {

                        Errors.create({ip: req.ip, file: 'account-gateway.js:42', error: 'invalid password'});
                        res.status(403).send('Invalid Password');

                    }
                });

            } else {
                Errors.create({ip: req.ip, file: 'account-gateway.js:97', error: 'invalid password'});
                res.sendStatus(403);
            }
        }).catch(function (err) {
            Errors.create({ip: req.ip, file: 'account-gateway.js:101', error: err});
            res.status(403).send(err);
        });
    }
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