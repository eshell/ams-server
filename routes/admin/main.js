var config = require('../../config/config'),
    route = require('express').Router(),
    Sequelize = require('sequelize'),
    mysql = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password),
    Moguls = mysql.import('../../models/mogul'),
    Errors = mysql.import('../../models/error-log'),
    Messages = mysql.import('../../models/system-message'),
    Todos = mysql.import('../../models/todo');

    // app.use(bodyParser.urlencoded());
    // app.use(bodyParser.json());


route.get('/init-messages',function(req,res){
    Messages.sync({force:true});
    res.send('OK');
});
route.get('/init-all', function(req,res){
    Moguls.sync({force: true});
    Todos.sync({force: true});
    Errors.sync({force:true});
    res.send('OK');
});
route.get('/populate-all',function(req,res){
    Messages.create({message:'v0.1 alpha'}).then(function(msg){
        res.send(msg);
    },function(err){
        res.send(err);
    });

    res.send('fill with data');
});


route.post('/init-moguls',function(req,res){
    Moguls.sync({force: true});
    res.send('OK');

});
route.get('/init-todos',function(req,res){
    Todos.sync({force: true});
    res.send('OK');

});
route.get('/init-errors',function(req,res){
    Errors.sync({force: true});
    res.send('OK');

});


module.exports = route;