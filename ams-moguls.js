var express = require('express');
var ams = express.Router();
var app = express();
var faker = require('faker');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var md5 = require('md5');
var port=3000;

var Sequelize = require('sequelize');
var sql = new Sequelize('ams', 'root', 'shell');

app.set('trust proxy');
app.use(bodyParser.json());

var Mogul = sql.import(__dirname+'/models/mogul');

ams.get('/sql-init', function(req,res){
    "use strict";
    Mogul.sync({force: true});


    res.send('OK');
});

ams.post('/moguls/verify',function(req,res){
    "use strict";

    if(!!req.body.vcode){
        Mogul.update({
            active: 1,
            code: null
        },{
            where:{
                code: req.body.vcode,
                active: 0
            }
        }).then(function(mogul){
            console.log(mogul);
            res.send(mogul);
        }).catch(function(err){
            console.log(err);
            res.send(err).status(400);
        });
    }else{
        console.log('no vcode');
        res.sendStatus(400);
    }
});


ams.post('/moguls/register',function(req,res){
    "use strict";
    if(req.body.password === req.body.password2) {
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
            .catch(function (error) {
                res.status(400).send(error);
            });
    }else{
        res.status(400).send('Passwords do not match.');
    }
});


ams.get('/states.json',function(req,res){
    "use strict";
    var ret = [{"id":"AL","name":"Alabama"},{"id":"AK","name":"Alaska"},{"id":"AZ","name":"Arizona"},{"id":"AR","name":"Arkansas"},{"id":"CA","name":"California"},{"id":"CO","name":"Colorado"},{"id":"CT","name":"Connecticut"},{"id":"DE","name":"Delaware"},{"id":"FL","name":"Florida"},{"id":"GA","name":"Georgia"},{"id":"HI","name":"Hawaii"},{"id":"ID","name":"Idaho"},{"id":"IL","name":"Illinois"},{"id":"IN","name":"Indiana"},{"id":"IA","name":"Iowa"},{"id":"KS","name":"Kansas"},{"id":"KY","name":"Kentucky"},{"id":"LA","name":"Louisiana"},{"id":"ME","name":"Maine"},{"id":"MD","name":"Maryland"},{"id":"MA","name":"Massachusetts"},{"id":"MI","name":"Michigan"},{"id":"MN","name":"Minnesota"},{"id":"MS","name":"Mississippi"},{"id":"MO","name":"Missouri"},{"id":"MT","name":"Montana"},{"id":"NE","name":"Nebraska"},{"id":"NV","name":"Nevada"},{"id":"NH","name":"New Hampshire"},{"id":"NJ","name":"New Jersey"},{"id":"NM","name":"New Mexico"},{"id":"NY","name":"New York"},{"id":"NC","name":"North Carolina"},{"id":"ND","name":"North Dakota"},{"id":"OH","name":"Ohio"},{"id":"OK","name":"Oklahoma"},{"id":"OR","name":"Oregon"},{"id":"PA","name":"Pennsylvania"},{"id":"RI","name":"Rhode Island"},{"id":"SC","name":"South Carolina"},{"id":"SD","name":"South Dakota"},{"id":"TN","name":"Tennessee"},{"id":"TX","name":"Texas"},{"id":"UT","name":"Utah"},{"id":"VT","name":"Vermont"},{"id":"VA","name":"Virginia"},{"id":"WA","name":"Washington"},{"id":"WV","name":"West Virginia"},{"id":"WI","name":"Wisconsin"},{"id":"WY","name":"Wyoming"}];

    res.json(ret);
});

app.use('/api', ams);

app.listen(port, function () {
    console.log('AMS API Server listening on port '+port);
});
