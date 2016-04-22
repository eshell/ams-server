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
    },
    email:{
        gmail:{
            service:'Gmail',
            auth:{
                user:'ericshell2010@gmail.com',
                pass:'tyuvbxcq21'
            }
        },
        registration:{
            subject:'Account Activation',
            html:'<h3>Welcome to ams!</h3>' +
            '<p>Please copy/paste link below in your browser or click to activate your account.</p>',
            link:'http://moguls.ams.dev/verify/'
        },
        passwordReset:{
            subject:'Password Reset',
            html:'<h3>Welcome to ams!</h3>' +
            '<p>Please copy/paste link below in your browser or click to reset your password.</p>',
            link:'http://moguls.ams.dev/forgot-password/'
        }


    }
};