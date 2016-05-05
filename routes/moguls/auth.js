var config = require('../../config/config'),
    route = require('express').Router(),
    Sequelize = require('sequelize'),
    mysql = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password),
    bcrypt = require('bcrypt'),
    md5 = require('md5'),
    email = require('../../utils/email'),
    Errors = mysql.import('../../models/error-log'),
    jwtAuth = require('../../utils/auth'),
    Mogul = mysql.import('../../models/mogul');


/**
 * Moguls login
 */
route.post('/login',function (req,res) {

    Mogul.findOne({
        where:{
            email:req.body.login,
            active:1
        }
    }).then(function(user){

            bcrypt.compare(req.body.password, user.password, function(err,isMatch){
                if(err) Errors.create({ip:req.ip,file:'account-gateway.js:26',error:err});

                if(isMatch){
                    // password match
                    var obj = {
                        id:user.id,
                        type:user.type
                    };
                    res.send(jwtAuth.createJwt(obj));

                }else{

                    Errors.create({ip:req.ip,file:'account-gateway.js:42',error:'Bad Username/Password'});
                    res.status(400).send('Bad Username/Password');

                }
            });


    }).catch(function(error){
        Errors.create({ip:req.ip,file:'account-gateway.js:42',error:'Bad Username/Password'});
        res.status(400).send('Bad Username/Password');
    });

});

/**
 * Mogul Password Change - manual
 * TODO: implement
 */
// route.post('/password-change',function(req,res){
//     "use strict";
//     Mogul.count({where:{active:1, code: req.body.code}}).then(function(count){
//         if(count){
//             var salt = bcrypt.genSaltSync(10);
//
//             Mogul.update({
//                 code: null,
//                 password: bcrypt.hashSync(req.body.password, salt)
//             },{
//                 where:{
//                     code: req.body.code,
//                     active:1
//                 }
//             }).then(function(){
//                 res.sendStatus(200);
//             }).catch(function(err){
//                 Errors.create({ip:req.ip,file:'account-gateway.js:92',error:err});
//                 res.sendStatus(400);
//             });
//
//         }else{
//             Errors.create({ip:req.ip,file:'account-gateway.js:97',error:'invalid token: '+req.body.code});
//             res.sendStatus(400);
//         }
//     }).catch(function(err){
//         Errors.create({ip:req.ip,file:'account-gateway.js:101',error:err});
//         res.sendStatus(400);
//     });
// });

/**
 * Password Reset / Forgot Password
 * Create and send them a new password automatically if user is active
 */
route.post('/password-reset',function(req,res){
    "use strict";
    Mogul.findOne({
        where:{
            email:req.body.email,
            active:1
        }}
    ).then(function(mogul){
        // Found user
        if(typeof mogul.id !== 'undefined'){
            var password=Math.random().toString(36).slice(-8);
            var salt = bcrypt.genSaltSync(10);

            mogul.password = bcrypt.hashSync(password, salt);

            mogul.save().then(function(){
                email.sendEmailCode(req,res,'Mogul Password Reset','' +
                    '<h3>Mogul Password Reset</h3>' +
                    '<p>Your new password is: ' + password + '</p>' +
                    '<p>Go to moguls.ams.dev and log in!</p>'
                );
            }).catch(function(err){
                Errors.create({ip:req.ip,file:'account-gateway.js:145',error:err});
                res.sendStatus(400);
            });

        }else{
            Errors.create({ip:req.ip,file:'account-gateway.js:150',error:req.body.email+' hasn\'t been activated, or you have recently been sent reset instructions'});
            res.status(400).send(req.body.email+' hasn\'t been activated, or you have recently been sent reset instructions');
        }
    }).catch(function(err){
        Errors.create({ip:req.ip,file:'account-gateway.js:154',error:err});
        res.sendStatus(400);
    });
});

/**
 * Mogul Registration
 * Sign up with email, create their password, done!
 */
route.post('/register',function(req,res){
    "use strict";
    Mogul.count({where:{email:req.body.email}}).then(function(found){
        if(found){
            Errors.create({ip:req.ip,file:'account-gateway.js:164',error:'email('+req.body.email+') already exists!'});
            res.status(400).send('Email already exists!');

        }else{
            var password=Math.random().toString(36).slice(-8);
            var salt = bcrypt.genSaltSync(10);
            Mogul.build({
                email: req.body.email,
                password: bcrypt.hashSync(password, salt),
                active: 1
            }).save()
                .then(function () {
                    email.sendEmailCode(req,res,'Mogul Account Activation','' +
                        '<h3>Welcome to moguls.ams.dev!</h3>' +
                        '<p>Your password is: ' + password + '</p>' +
                        '<p>Go to moguls.ams.dev and log in!</p>'
                    );
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
    // TODO: Check if email is registered with paypal
    // TODO: create account for them if not?
});



module.exports = route;