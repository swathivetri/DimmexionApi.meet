require('dotenv').config();

let CONFIG = {};

CONFIG.port = process.env.PORT || '2000';
CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || 'jwt_please_change';
CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || '28800';
CONFIG.codes = ['superAdmin', "admin", "staff", "student"];
CONFIG.user_type = {
    superAdmin: "@U01",
    admin: "@U02",
    user: "@U03"
}
CONFIG.mg_key = process.env.MG_KEY;
CONFIG.mg_domain = process.env.MG_DOMAIN;
CONFIG.formStatus = ['PENDING', 'APPROVED', 'BLOCKED'];
CONFIG.annual_revenue_min_amount = 100000;
CONFIG.plan = { minimumPrice: 100000, minimumMember: 10, duration_type: ['DAY', 'MONTH', 'YEAR'] };
CONFIG.company = ['SLEF', 'PRODUCT'];
CONFIG.status = ['Active', 'Block'];
CONFIG.approve = ['Approve', 'Block'];
CONFIG.dicimanagament = { type: ['A/V Suite', 'Dailer'], participants_type: ['All', 'Particular'] };
CONFIG.payment = { status: ['PROGRESS', 'SUCCESS', 'FAILED', 'CANCELLED'], key: process.env.PAYMENT_KEY, sec: process.env.PAYMENT_SECRET, description: [`Buy the license plan`,`Buy the DICI ticket`], secret_key: process.env.SECRET_KEY || 'C0o4iis@123'}
CONFIG.url = process.env.URL || 'https://dicom.oneappplus.in';
CONFIG.mail=process.env.MAILID || 'helpdesk.dicom@gmail.com'
CONFIG.pass= process.env.PASS || 'smblugdaxgjovgdz'
module.exports.CONFIG = CONFIG