const moment = require('moment')
var Mailgun = require('mailgun-js')
const { CONFIG } = require('../config/confifData');
const { to } = require('./util.service');
// var mailgun = new Mailgun(
//     {
//         apiKey: CONFIG.mg_key,
//         domain: CONFIG.mg_domain
//     })


module.exports.sendEmail = async (destination, options) => {

    const mailer = require('nodemailer');

    const smtpProtocol = mailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: CONFIG.mail,
            pass: CONFIG.pass
        }
    });

    var mailoption = {
        from: CONFIG.mail,
        to: destination,
        subject: options.subject,
        html: options.body
    }

    if (options.cc) {
        mailoption.cc = options.cc
    }

    if (options.bcc) {
        mailoption.bcc = options.bcc
    }

    let err,response;

    [err, response] = await to(smtpProtocol.sendMail(mailoption));

    if (err) {
        console.log(err);
        return { success: false }

    }
    if (response) {
        console.log('Message Sent' + response.messageId);
        return { ...response, success: response.messageId ? true : false };
    }

    smtpProtocol.close();
}
