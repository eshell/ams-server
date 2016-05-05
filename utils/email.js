var config = require('../config/config'),
    nodemailer = require('nodemailer');


module.exports = {
    'sendEmailCode':sendEmailCode,
    'transporter':transporter
};



var transporter = nodemailer.createTransport({
    service: config.email.gmail.service,
    auth: {
        user: config.email.gmail.auth.user,
        pass: config.email.gmail.auth.pass
    }
});

function sendEmailCode(req,res,subject,html){
    var mailOptions = {
        from: 'Eric Shell <'+config.email.gmail.auth.user+'>',
        to: req.body.email,
        subject: subject,
        html: html
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



