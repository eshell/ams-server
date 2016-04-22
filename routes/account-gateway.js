var config = require('../config/config'),
    route = require('express').Router(),
    Sequelize = require('sequelize'),
    mysql = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    md5 = require('md5'),
    Mogul = mysql.import('../models/mogul');

route.post('/login',function (req,res) {

    Mogul.findOne({where:{email:req.body.login,active:1}}).then(function(user){
        // found user
        bcrypt.compare(req.body.password, user.password, function(err,isMatch){
            if(err) console.log('error: '+err);
            if(isMatch){
                // password match
                var obj = {
                    id:user.id,
                    type:user.type
                };
                res.json({
                    success:true,
                    msg:"OK",
                    ams_token: createToken(obj)
                });

            }else{
                res.status(400).json({reason: 'Bad Username/Password'});
            }
        });
    }).catch(function(error){
        res.status(400).json({reason: 'Bad Username/Password'});
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
                    res.status(200).json({msg:'OK'});
                }).catch(function(err){
                    console.log(err);
                    res.send(err).status(400);
                });

            }else{
                console.log('code '+req.body.code+' doesnt exist');
                res.status(400).send('code doesnt exist');
            }
        }).catch(function(err){
            res.status(400).send(err);
        });
    }else{
        res.status(400).send('no code');
    }
});
route.post('/forgot-password-update',function(req,res){
    "use strict";
    var salt = bcrypt.genSaltSync(10);

    Mogul.update({
        code: null,
        password: bcrypt.hashSync(req.body.password, salt)
    },{
        where:{
            code: req.body.code,
            active:1
        }
    }).then(function(mogul){
        res.status(200).json({message:'Password updated.'});
    }).catch(function(err){
        console.log(err);
        res.send(err).status(400);
    });

});

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
                    res.status(200).json({message:'Reset code sent.'});
                }).catch(function(err){
                    console.log(err);
                    res.send(err).status(400);
                });

            }else{
                console.log(req.body.email+' hasn\'t been activated, or you have recently been sent reset instructions');
                res.status(400).send(req.body.email+' hasn\'t been activated, or you have recently been sent reset instructions');
            }
        }).catch(function(err){
            res.status(400).send(err);
        });
});

route.post('/register',function(req,res){
    "use strict";
    if(req.body.password === req.body.password2) {
        Mogul.count({where:{email:req.body.email}}).then(function(found){
            if(found){
                res.status(400).send('Email already exists!');

            }else{
                var now = new Date();
                var salt = bcrypt.genSaltSync(10);

                Mogul.build({
                    email: req.body.email,
                    password: bcrypt.hashSync(req.body.password, salt),
                    code: md5(req.body.password + "_" + req.body.email + now)
                }).save()
                .then(function () {
                    res.sendStatus(200);
                })
                .catch(function(err) {
                    res.status(400).send(err);
                });
            }
        }).catch(function(notFound){
            console.log('err'+notFound);
            res.status(400).send(notFound);

        });
    }else{
        res.status(400).send('Passwords do not match.');
    }
});



function createToken(user) {
    return jwt.sign(user, config.jwt.secret, { expiresIn: config.jwt.expiration });
}


module.exports = route;