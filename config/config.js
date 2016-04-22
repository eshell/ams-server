/**
 * Created by eric on 4/20/16.
 */
module.exports = {
    port: 3000,
    jwt:{
        secret:'awesomemusicsite!',
        expiration: 60*60 //in seconds
    },
    mysql:{
        user:'root',
        password:'shell',
        database:'ams'
    }
};