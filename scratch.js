var bcrypt = require('bcrypt');
var md5 = require('md5');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : '127.0.0.1',
        user     : 'root',
        password : 'shell',
        database : 'ams'
    }
});
app.use(express.json());
app.use(express.urlencoded());
var memberTypes = ['Artists','Venues','Advertisers','Event Promoters','Fans'];
app.use('/api/restricted',expressJwt({secret:secret}));
app.get('/api/restricted',function(req,res){
    "use strict";
    console.log('restricted route authorized');
    res.sendStatus(200);
});


app.get('/mysql-init',function(req,res){
    "use strict";
    var Events = mysql.define('events',{
        id:Sequelize.INTEGER.unsigned,
        ownerId:Sequelize.INTEGER.unsigned,
        title:Sequelize.STRING,
        description:Sequelize.STRING,
        date:Sequelize.DATE,
        address:Sequelize.STRING,
        city:Sequelize.STRING,

        lat:Sequelize.FLOAT(10,6),
        lng:Sequelize.FLOAT(10,6)
    });


});

app.get('/artistsGenerator.json',function(req,res){
    "use strict";
    var ret = [];
    var optional = ["mogulId","paypal","location.address","location.geo"]
    for(var i=1; i<3; i++){

        ret.push({
            "id":i,
            "mogulId":faker.random.number(),
            "type": 'Artist',
            "email":faker.internet.email(),
            "password":"password",
            "paypal": faker.internet.email(),
            "location":{
                "address":faker.address.streetAddress(),
                "city":faker.address.city(),
                "state":faker.address.stateAbbr(),
                "zip":faker.address.zipCode(),
                "geo":{
                    "lat":faker.address.latitude(),
                    "lng":faker.address.longitude()
                }
            },
            "categories":[1,2,3],
            "likes":faker.random.number(),
            "fans":faker.random.number(),
            "tracks":[
                {
                    "id":1,
                    "title":"track title",
                    "originalFileName":"originalFileName.mp3",
                    "src":"newFileName.mp3",
                    "path":"/some/path/some/server",
                    "url":"http://some/path/some/server"
                }
            ]

        });
    }

    res.json(ret);
});
app.get('/events.json',function(req,res){
    "use strict";
    res.json()
});
app.get('/eventsGenerator.json', function(req, res) {
    // var eventModel = {
    //     id:'',
    //     ownerId:'',
    //     title:'',
    //     address:'',
    //     city:'',
    //     state:'',
    //     zip:'',
    //     description:'',
    //     date:'',
    //     categories:'',
    //     who:''
    // };
    var ret = [];
    for(var i=0; i<50;i++){
        // var id=faker.random.number();
        ret.push({
            "id":faker.random.number(),
            "ownerId":faker.random.number(),
            "title":faker.random.word(),
            "location":{
                "address":faker.address.streetAddress(),
                "city":faker.address.city(),
                "state":faker.address.stateAbbr(),
                "zip":faker.address.zipCode(),
                "geo":{
                    "lat":faker.address.latitude(),
                    "lng":faker.address.longitude()
                }
            },
            description:faker.lorem.paragraph(),
            date:faker.date.future(),
            categories:[1,2,3],
            who:[1,2,3]
        });
    }
    res.json(ret);
});

app.get('/genres.json',function(req,res){
    "use strict";
});
app.get('/genresGenerator.json',function(req,res){
    "use strict";
    var ret = [
        "Alternative",
        "Blues",
        "Childrens",
        "Classical",
        "Comedy",
        "Country",
        "Electronic",
        "Folk",
        "Hip Hop",
        "Holiday",
        "Industrial",
        "Inspirational",
        "Jazz",
        "Karaoke",
        "Latin",
        "Opera",
        "Pop",
        "R&B",
        "Rap",
        "Reggae",
        "Rock",
        "Metal",
        "A Capella",
        "World"
    ];
    var ret2 = [];
    for(var i = 0; i < ret.length; i++){
        var t={};
        t[ret[i]] = [
            ret[i],
            faker.name.lastName(),
            faker.name.lastName(),
            faker.name.lastName()
        ];

        ret2.push(t);
    }


    res.json(ret2);
});


app.all('*',function(req,res){
    res.sendFile('index.html',{root:'./app'});
});
