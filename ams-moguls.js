var express = require('express');
var http = require('http');
var ams = express.Router();
var protectedRoutes = express.Router();

var app = express();
var faker = require('faker');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var md5 = require('md5');
var port=3000;
var _ = require('lodash');

var Sequelize = require('sequelize');
var sql = new Sequelize('ams', 'root', 'shell');

var morgan = require('morgan');
var jwt = require('jsonwebtoken');
app.set('superSecret','somesecretvalue');
app.use(morgan('dev'));

app.set('trust proxy');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

function createToken(user) {
    return jwt.sign(user, app.get('superSecret'), { expiresIn: 60*2 });
}
// var jwtCheck = jwt.verify({
//     secret: app.get('superSecret')
// });


var Mogul = sql.import(__dirname+'/models/mogul');
var Todos = sql.import(__dirname+'/models/todos');

protectedRoutes.use(function(req,res,next){
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
// protectedRoutes.use(jwtCheck);

protectedRoutes.all('/test',function(req,res){
    res.send('authorized');
});
ams.post('/login',function (req,res) {

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
                // bad password
                console.log('bad password')
                res.json({success:false, msg:'Bad Username/Password',ams_token:null});
            }
        });
    }).catch(function(error){
        res.json({success:false, msg: 'Bad Username/Password',ams_token:null});
    });

});

ams.get('/todos/delete/:id',function(req,res){
    "use strict";
    Todos.destroy({where:{id:req.params.id}}).then(function(){
        res.sendStatus(200).send("OK");
    }).catch(function(error){
        res.status(400).send(error);
    });
});

ams.post('/todos/new',function(req,res){
    "use strict";

    if(!_.isEmpty(req.body.todo)){

        console.log(req.body.todo);
        Todos.build({
            type:req.body.todo.type,
            project: req.body.todo.project,
            priority: req.body.todo.priority,
            todo: req.body.todo.todo
        }).save()
            .then(function () {
                res.sendStatus(200);
            })
            .catch(function (error) {
                res.status(400).send(error);
            });
    }else{
        console.log('empty');
        res.status(400).send("empty");
    }
});

/* GET TODOS
@ params
- project
- priority
- type
 */
ams.get('/todos',function (req,res) {
    "use strict";
    if(req.query){
        var query={};
        if(req.query.project) query.project = req.query.project;
        if(req.query.priority) query.priority = req.query.priority;
        if(req.query.type) query.type = req.query.type;

        Todos.findAndCountAll(query).then(function(result){
            res.json(result);
        }).catch(function(error){
            res.status(400).send(error);
        });

    }else{
        
        Todos.findAndCountAll().then(function(result){
            res.json(result);
        }).catch(function(error){
            res.status(400).send(error);
        });
    }

});
ams.get('/sql-init', function(req,res){
    "use strict";
    Mogul.sync({force: true});
    Todos.sync({force:true});

    res.send('OK');
});


ams.post('/moguls/verify',function(req,res){
    "use strict";

    // test
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
app.use('/api/protected',protectedRoutes);

http.createServer(app).listen(port, function (err) {
    console.log('AMS API Server listening on port '+port);
});
