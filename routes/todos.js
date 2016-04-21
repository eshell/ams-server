var config = require('../config/config'),
    route = require('express').Router(),
    Sequelize = require('sequelize'),
    mysql = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password),
    _ = require('lodash'),
    Todos = mysql.import('../models/todos');


    route.get('/delete/:id',function(req,res){
        "use strict";
        Todos.destroy({where:{id:req.params.id}}).then(function(){
            res.sendStatus(200).send("OK");
        }).catch(function(error){
            res.status(400).send(error);
        });
    });
    
    route.post('/',function(req,res){
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
    route.get('/',function (req,res) {
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

module.exports = route;