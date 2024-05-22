const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const users_info = require('../model').user_info;
const { to, isNull } = require('../service/util.service');
const { CONFIG } = require('../config/confifData');

module.exports = function (passport) {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = CONFIG.jwt_encryption;
    passport.use('user', new JwtStrategy(opts, async function (jwt_payload, done) {
        let err, users;
        [err, users] = await to(users_info.findOne({ where: { _id: jwt_payload._id, active: true, block: false, verified: true } }));
        if (err) return done(err, false);
        if (!isNull(users)) {
            return done(null, users);
        } else {
            return done(null, false);
        }
    }));

    passport.use('userTemp',new JwtStrategy(opts, async function (jwt_payload, done) {
        let err, users;
        [err, users] = await to(users_info.findOne({ where: { _id: jwt_payload._id, status: true, block: false, verified: true } }));
        if (err) return done(err, false);
        if (users) {
            return done(null, users);
        } else {
            [err, users] = await to(temp_user.findOne({ where: { _id: jwt_payload._id, status: true, block: false, verified: true } }));
            if (users) {
                return done(null, users);
            } else {
                return done(null, false);
            }
        }
    }));
};