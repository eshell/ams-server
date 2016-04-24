var config = require('../config/config'),
    route = require('express').Router(),
    Sequelize = require('sequelize'),
    mysql = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password),
    error_logDb = new Sequelize('error_log', config.mysql.user, config.mysql.password),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    md5 = require('md5'),
    nodemailer = require('nodemailer'),
    Errors = error_logDb.import('../models/error-log'),
    Mogul = mysql.import('../models/mogul');

var transporter = nodemailer.createTransport({
    service: config.email.gmail.service,
    auth: {
        user: config.email.gmail.auth.user,
        pass: config.email.gmail.auth.pass
    }
});

route.post('/login',function (req,res) {

    Mogul.findOne({where:{email:req.body.login,active:1,code:null}}).then(function(user){

        Mogul.findOne({where:{email:req.body.login,active:1,code:{$not:null}}}).then(function(user2) {
            if(user2){
                Errors.create({ip:req.ip,file:'account-gateway.js:27',error:'You must reset your password!'});
                res.status(400).send('You must reset your password!');

            }else{
                bcrypt.compare(req.body.password, user.password, function(err,isMatch){
                    if(err) Errors.create({ip:req.ip,file:'account-gateway.js:26',error:err});

                    if(isMatch){
                        // password match
                        var obj = {
                            id:user.id,
                            type:user.type
                        };
                        res.send(createToken(obj));

                    }else{
                        Errors.create({ip:req.ip,file:'account-gateway.js:42',error:'Bad Username/Password'});
                        res.status(400).send('Bad Username/Password');

                    }
                });

            }

        }).catch(function(error){
            Errors.create({ip:req.ip,file:'account-gateway.js:52',error:error});
            res.sendStatus(400);

        });


    }).catch(function(error){
        Errors.create({ip:req.ip,file:'account-gateway.js:42',error:'Bad Username/Password'});
        res.status(400).send('Bad Username/Password');
    });

});
route.post('/verify',function(req,res){
    "use strict";
    if(!!req.body.code){

        Mogul.count({where:{code:req.body.code}}).then(function(count){
            if(count){
                Mogul.update({active: 1,code: null},{
                    where:{code: req.body.code,active: 0}
                }).then(function(mogul){
                    res.sendStatus(200);
                }).catch(function(err){
                    Errors.create({ip:req.ip,file:'account-gateway.js:58',error:err});
                    res.sendStatus(400);
                });

            }else{
                Errors.create({ip:req.ip,file:'account-gateway.js:63',error:'Invalid token: '+req.body.code});
                res.sendStatus(400);
            }
        }).catch(function(err){
            Errors.create({ip:req.ip,file:'account-gateway.js:67',error:err});
            res.sendStatus(400);
        });
    }else{
        Errors.create({ip:req.ip,file:'account-gateway.js:71',error:'no code'});
        res.sendStatus(400);
    }
});
route.post('/forgot-password-update',function(req,res){
    "use strict";
    Mogul.count({where:{active:1, code: req.body.code}}).then(function(count){
        if(count){
            var salt = bcrypt.genSaltSync(10);

            Mogul.update({
                code: null,
                password: bcrypt.hashSync(req.body.password, salt)
            },{
                where:{
                    code: req.body.code,
                    active:1
                }
            }).then(function(){
                res.sendStatus(200);
            }).catch(function(err){
                Errors.create({ip:req.ip,file:'account-gateway.js:92',error:err});
                res.sendStatus(400);
            });

        }else{
            Errors.create({ip:req.ip,file:'account-gateway.js:97',error:'invalid token: '+req.body.code});
            res.sendStatus(400);
        }
    }).catch(function(err){
        Errors.create({ip:req.ip,file:'account-gateway.js:101',error:err});
        res.sendStatus(400);
    });





});
function sendEmailCode(req,res,type,code){
    var mailOptions = {
        from: 'Eric Shell <'+config.email.gmail.auth.user+'>',
        to: req.body.email,
        subject: config.email[type].subject,
        html: config.email[type].html + '<a href="'+config.email[type].link+code+'">'+config.email[type].link+code+'</a>'
    };
    transporter.sendMail(mailOptions, function(error){
        if(error){
            Errors.create({ip:req.ip,file:'account-gateway.js:119',error:'email error - '+error});
            res.sendStatus(400);
        }else{
            res.sendStatus(200);
        }
    });
}
route.post('/forgot-password-reset',function(req,res){
    "use strict";
    Mogul.count({where:{email:req.body.email, active:1, code: null}}).then(function(count){
        if(count){
            var now = new Date();
            var code = md5(req.body.email+now);

            Mogul.update({
                code: code
            },{
                where:{
                    email:req.body.email,
                    active:1,
                    code: null
                }
            }).then(function(mogul){
                sendEmailCode(req,res,'passwordReset',code);
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

route.post('/register',function(req,res){
    "use strict";
    if(req.body.password === req.body.password2) {
        Mogul.count({where:{email:req.body.email}}).then(function(found){
            if(found){
                Errors.create({ip:req.ip,file:'account-gateway.js:164',error:'email('+req.body.email+') already exists!'});
                res.status(400).send('Email already exists!');

            }else{
                var now = new Date();
                var salt = bcrypt.genSaltSync(10);
                var code = md5(req.body.password + "_" + req.body.email + now);
                Mogul.build({
                    email: req.body.email,
                    password: bcrypt.hashSync(req.body.password, salt),
                    code: code
                }).save()
                    .then(function () {
                        sendEmailCode(req,res,'registration',code);
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
    }else{
        Errors.create({ip:req.ip,file:'account-gateway.js:191',error:'passwords do not match'});
        res.status(400).send('Passwords do not match.');
    }
});



function createToken(user) {
    return jwt.sign(user, config.jwt.secret, { expiresIn: config.jwt.expiration });
}


module.exports = route;