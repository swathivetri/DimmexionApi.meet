const HttpStatus = require('http-status');
const { to, ReE, ReS, isNull } = require('../service/util.service');
const attendance = require("../model").attendance;
const Event = require('../model').event;
const Meet = require("../model").meet;
const Launch = require("../model").launch;
const Conference = require("../model").conference;
const Organization = require('../model').organization;


exports.createAttendance = async (req, res) => {
    const body = req.body;
    const requiredFields = ['session_id', 'session_type', 'track', 'participant_email', 'participant_name', 'organization'];
    const missingFields = requiredFields.filter(field => isNull(body[field]));

    if (missingFields.length > 0) {
        return ReE(res, { message: `Missing required fields: ${missingFields.join(', ')}` }, HttpStatus.BAD_REQUEST);
    }

    let err, existOrganization, existEvent, existMeet, existLaunch, existConference;

    [err, existOrganization] = await to(Organization.findOne({ where: { _id: body.organization } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!existOrganization) {
        return ReE(res, { message: 'Organization not found' }, HttpStatus.BAD_REQUEST);
    }

    const { session_type, session_id} = body;

    if (session_type === 'Event') {
        [err, existEvent] = await to(Event.findOne({ where: { _id: session_id } }));
        if (err) {
            return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!existEvent) {
            return ReE(res, { message: 'Event not found' }, HttpStatus.BAD_REQUEST);
        }
      var session_key_id = existEvent.event_id;
    }

    if (session_type === 'Meet') {
        [err, existMeet] = await to(Meet.findOne({ where: { _id: session_id } }));
        if (err) {
            return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!existMeet) {
            return ReE(res, { message: 'Meet not found' }, HttpStatus.BAD_REQUEST);
        }
         session_key_id = existMeet.meet_id;
    }

    if (session_type === 'Launch') {
        [err, existLaunch] = await to(Launch.findOne({ where: { _id: session_id} }));
        if (err) {
            return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!existLaunch) {
            return ReE(res, { message: 'Launch not found' }, HttpStatus.BAD_REQUEST);
        }
         session_key_id = existLaunch.launch_id;
    }

    if (session_type === 'Conference') {
        [err, existConference] = await to(Conference.findOne({ where: { _id: session_id } }));
        if (err) {
            return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!existConference) {
            return ReE(res, { message: 'Conference not found' }, HttpStatus.BAD_REQUEST);
        }
         session_key_id = existEvent.conference_id;
    }

    try {

        const newAttendance = await attendance.create({
            session_type: body.session_type,
            session_id: body.session_id,
            session_key_id: session_key_id,
            track: body.track,
            participant_email: body.participant_email,
            participant_name: body.participant_name,
            organization: body.organization,
            created_by: req.user._id, 
            updated_by: req.user._id
        });

        return ReS(res, { message: 'Attendance record created successfully', attendance: newAttendance }, HttpStatus.OK);
    } catch (error) {
        return ReE(res, error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
};

module.exports.getAllAttendance = async (req, res) => {

    let err, att;

    [err, att] = await to(attendance.findAll({where:{ active: true }}));
    if(err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if(isNull(att) && att.length === 0) {
        return ReE(res, { message:"Attendance not found" }, HttpStatus.BAD_REQUEST );
    }
    return ReS(res, { message:"All Attendance found", data: att }, HttpStatus.OK );
}

module.exports.getAttendance = async (req, res) => {
    const attId = req.params.att_id;

    let err, att;
    [err, att] = await to(attendance.findOne({where:{_id: attId, active: true }}));
    if(err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if(isNull(att)) {
        return ReE(res, { message:"Attendance not found" }, HttpStatus.BAD_REQUEST );
    }
    return ReS(res, { message:" Attendance found", data: att }, HttpStatus.OK );
}

module.exports.updateAttendance = async(req, res) =>{
    const attId = req.params.id;
    const body = req.body;

    let err, att;

    [err, att] = await to(attendance.findOne({where:{ _id: attId }}));

    if(err) {
        return ReE(res, { message:"Error finding Attendance", error: err.message }, HttpStatus.INTERNAL_SERVER_ERROR );
    }

    if(isNull(att)) {
        return ReE(res, { message:"Attendance not found"}, HttpStatus.BAD_REQUEST );
    }

    const requiredFields =  ['session_id', 'session_type', 'track', 'participant_email', 'participant_name', 'organization'];
    const missingFields = requiredFields.filter(field => isNull(body[field]));
    if (missingFields.length > 0) {
        return ReE(res, { message: `Missing required fields: ${missingFields.join(', ')}` }, HttpStatus.BAD_REQUEST);
    }

    const changesFields = Object.keys(body).filter(key => {
        const existingValue = att[key];
        const newValue = body[key];
        if (key === 'track') {
            return JSON.stringify(existingValue) !== JSON.stringify(newValue);
        }
        //   console.log(existingValue, newValue, existingValue !== newValue);
        return existingValue !== newValue;
    });
//    console.log(changesFields);
    if (changesFields.length === 0) {
        return ReE(res, { message: 'No changes made to the attendance' }, HttpStatus.BAD_REQUEST);
    }

    [err] = await to(att.update(body));
    if(err) {
        return ReE(res, { message: 'Error updating attendance', error: err.message }, HttpStatus.INTERNAL_SERVER_ERROR );
    }
    return ReS(res, { message: 'Attendance updated successfully', data: att }, HttpStatus.OK );
}

module.exports.deleteAttendance = async(req, res) => {
    const attId = req.params.id;


    let err,att;
    [err, att] = await to(attendance.findOne({ where:{ _id: attId }}));
    if(err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR );
    }
    if(isNull(att)) {
        return ReE(res, { message: 'Attendance not found' }, HttpStatus.BAD_REQUEST );
    }

    [err] = await to(att.update({ active:false }));
    if(err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR );
    }
    return ReS(res, {message: 'Attendance deleted successfully' }, HttpStatus.OK );
}