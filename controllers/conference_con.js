const conference = require('../model').conference;
const organization = require('../model').organization;
const user_info = require("../model").user_info;
const HttpStatus = require('http-status');
const { ReE, ReS, to, isNull, isEmpty } = require('../service/util.service');
const { compareTime, conferenceId, removeArrItems, compareDate, validateParticipantDetail } = require("../service/utility");
const CONFIG = require('../config/confifData').CONFIG;
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const fields = ['name', 'type', 'start_date', 'end_date', 'start_time', 'end_time', 'no_of_partipants', 'partipants', 'primary_organizer', 'secondary_organizer'];

const exisitingUserValidation = async (user_id) => {

    let err, exisitingUser;

    [err, exisitingUser] = await to(user.findOne({ where: { _id: user_id } }));

    if (err) return { isUser: false, message: 'Something went wrong to find user', };
    if (isNull(exisitingUser)) return { isUser: false, message: 'User not found' };
    else return { isUser: true, message: 'User found!', user: exisitingUser };

}

module.exports.create = async (req, res) => {

    let body = req.body;
    let user = req.user;

    if (user.role !== CONFIG.user_type.admin) {
        return ReE(res, { message: 'Admin can only create conference!. call your official please' });
    }

    let invalidFields = fields.filter(x => isNull(body[x]));

    if (!isEmpty(invalidFields)) {
        return ReE(res, { message: `please enter required fields ${invalidFields}!` }, HttpStatus.BAD_REQUEST);
    }

    let err, new_conference, map = {};



    let primary_organizer = await exisitingUserValidation(body["primary_organizer"]);

    if (primary_organizer.isUser === false) {
        return ReE(res, { message: primary_organizer.message }, HttpStatus.BAD_REQUEST);
    }

    let secondary_organizer = await exisitingUserValidation(body['secondary_organizer']);

    if (secondary_organizer.isUser === false) {
        return ReE(res, { message: secondary_organizer.message }, HttpStatus.BAD_REQUEST);
    }

    let compare_date = compareDate(body["start_date"], body["end_date"]);

    let compare_time = compareTime(body["start_time"], body["end_time"]);

    if (!compare_date.success) {
        return ReE(res, { message: compare_date.message }, HttpStatus.BAD_REQUEST);
    }

    if (!compare_time.success) {
        return ReE(res, { message: compare_time.message }, HttpStatus.BAD_REQUEST);
    }

    //participantsDetails Validation
    body.partipants.forEach((element, index) => {


        if (element.name === "" || element.name === "undefined") {
            map.Success = false;
            map.Reason = 'name is required';
        }
        else if (element.name.length < 3) {
            map.Success = false;
            map.Reason = 'name minimum 3 character required';
        }
        else if (element.mobileNumber.length < 10) {
            map.Success = false;
            map.Reason = 'Please enter 10 digit mobile number';
        }
        else if (element.emailId === "" || element.emailId === "undefined") {
            map.Success = false;
            map.Reason = 'emailId is required';
        }

        else if (body.partipants.find((x, ind) => x.mobileNumber === element.mobileNumber && index !== ind)) {
            map.Success = false;
            map.Reason = 'participant mobileNumber is already exist';
        }
        else if (body.partipants.find((x, ind) => x.emailId === element.emailId && index !== ind)) {
            map.Success = false;
            map.Reason = 'participant emeilId is already exist';
        }


    })
    if (map.Success === false) {
        return ReE(res, { message: map.Reason }, HttpStatus.BAD_REQUEST)
    }
    let eventParticipantDetails = body.partipants.map((x) => { return { ...x, id: uuidv4() } })
    let conference_data = { conference_id: conferenceId(), chair_person: user._id, created_by: user._id, organization: user.organization_id, ...req.body, partipants: eventParticipantDetails };
    [err, new_conference] = await to(conference.create(conference_data));


    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(new_conference)) {
        return ReE(res, { message: 'Conference doesn\'t create. Try again!' }, HttpStatus.BAD_REQUEST);
    }

    return ReS(res, { message: 'Conference added', "conference": new_conference }, HttpStatus.OK);

}

module.exports.getAll = async (req, res) => {
    let err, exisitingConferences = [];

    [err, exisitingConferences] = await to(conference.findAll({ where: { active: true } }));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (exisitingConferences.length <= 0) {
        return ReE(res, { message: 'Conference data notfound!' }, HttpStatus.BAD_REQUEST);
    }

    return ReS(res, { message: 'Conference data fetched!', "conference": exisitingConferences }, HttpStatus.OK);
}

module.exports.get = async (req, res) => {
    let { conference_id } = req.params;

    let err, exisitingConference;

    [err, exisitingConference] = await to(conference.findOne({ where: { _id: conference_id } }));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!exisitingConference) {
        return ReE(res, { message: 'Conference data notfound!' }, HttpStatus.BAD_REQUEST);
    }

    return ReS(res, { message: 'Conference data fetched!', "conference": exisitingConference }, HttpStatus.OK);
}

module.exports.update = async (req, res) => {
    let body = req.body;
    let user = req.user;
    let { conference_id } = req.params;

    let err, exisitingConference, updateConference, existOrganization, existChairPerson, existPrimaryOrganizer, existSecondaryOrganizer;

    let remove_data = ['conference_id', 'organization'];
    let invalid = await remove_data.filter((x) => {
        if (!isNull(body[x])) {
            return true;
        }
        return false
    })
    if (invalid.length > 0) {
        return ReE(res, { message: `${invalid} cannot edit, please update something` }, HttpStatus.BAD_REQUEST);
    }
    if (user.role !== CONFIG.user_type.admin) {
        return ReE(res, { message: 'Admin can only update conference!. call your official please' });
    }

    let invalidFields = removeArrItems(fields, [7, 8]).filter(x => isNull(body[x]));

    if (!isEmpty(invalidFields)) {
        return ReE(res, { message: `please enter required fields ${invalidFields}!` }, HttpStatus.BAD_REQUEST);
    }

    [err, exisitingConference] = await to(conference.findOne({ where: { _id: conference_id, active: true } }));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!exisitingConference) {
        return ReE(res, { message: 'Conference doesn\'t found. Try again!' }, HttpStatus.BAD_REQUEST);
    }

    // Organization and organizers validation


    [err, existChairPerson] = await to(user_info.findOne({ where: { _id: body.chair_person } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existChairPerson)) {
        return ReE(res, { message: 'ChairPerson not found' }, HttpStatus.BAD_REQUEST);
    }

    [err, existPrimaryOrganizer] = await to(user_info.findOne({ where: { _id: body.primary_organizer } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existPrimaryOrganizer)) {
        return ReE(res, { message: 'Primaryorganizer not found' }, HttpStatus.BAD_REQUEST);
    }

    [err, existSecondaryOrganizer] = await to(user_info.findOne({ where: { _id: body.secondary_organizer } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existSecondaryOrganizer)) {
        return ReE(res, { message: 'Secondaryorganizer not found' }, HttpStatus.BAD_REQUEST);
    }


    let compare_date = compareDate(body["start_date"], body["end_date"]);

    let compare_time = compareTime(body["start_time"], body["end_time"]);

    if (!compare_date.success) {
        return ReE(res, { message: compare_date.message }, HttpStatus.BAD_REQUEST);
    }

    if (!compare_time.success) {
        return ReE(res, { message: compare_time.message }, HttpStatus.BAD_REQUEST);
    }
    if (body.partipants) {
        let participantValidator = [], i = 0;
        body.partipants.forEach(element => {
            participantValidator.push(validateParticipantDetail(element, i, body.partipants));
            i++;
        });
        let inValid = participantValidator.filter(x => x.Success == false);
        if (inValid.length) {
            return ReE(res, { message: `Verify participants details: ${inValid.map(r => r.Reason).join(",")}` }, HttpStatus.BAD_REQUEST)
        }
    }
    let arrayPush = []
    arrayPush.push({ ...exisitingConference })
    let validatParticipantArray = []


    for (let index = 0; index < exisitingConference.partipants.length; index++) {
        const existParticipantDetails = exisitingConference.partipants[index];

        for (let index = 0; index < body.partipants.length; index++) {
            const bodyParticipantDetails = body.partipants[index];

            let validatParticipantDetail = Object.keys(existParticipantDetails).filter(x => existParticipantDetails[x] !== bodyParticipantDetails[x] && existParticipantDetails.id === bodyParticipantDetails.id);

            if (validatParticipantDetail.length > 0) {
                validatParticipantArray.push(validatParticipantDetail)
            }
        }

    }
    for (let index = 0; index < arrayPush.length; index++) {
        const element = arrayPush[index];
        var existingEvenObjData = {}
        var existingbodyObjData = {}
        let elementEvenObjData = { ...element.dataValues, start_date: moment(element.dataValues.start_date).format('DD-MM-YYYY'), end_date: moment(element.dataValues.end_date).format('DD-MM-YYYY') }

        for (const [key, value] of Object.entries(elementEvenObjData)) {

            existingEvenObjData[key] = value
        }
        let bodyEvenObjData = { ...req.body, start_date: moment(req.body.start_date).format('DD-MM-YYYY'), end_date: moment(req.body.end_date).format('DD-MM-YYYY'), _id: req.params.conference_id }
        for (const [key, value] of Object.entries(bodyEvenObjData)) {
            existingbodyObjData[key] = value
        }

        const allowed = ['partipants', 'created_by', 'updated_by', 'active', 'conference_id', 'organization'];

        Object.keys(existingEvenObjData)
            .filter(key => allowed.includes(key))
            .forEach(key => delete existingEvenObjData[key]);

        Object.keys(existingbodyObjData)
            .filter(key => allowed.includes(key))
            .forEach(key => delete existingbodyObjData[key]);

        let validatParticipantDetail = Object.keys(existingEvenObjData).filter(x => existingEvenObjData[x] !== existingbodyObjData[x] && existingEvenObjData._id === req.params.conference_id);

        if (validatParticipantDetail.length > 0) {
            validatParticipantArray.push(validatParticipantDetail)
        }
    }

    if (validatParticipantArray.flat().length === 0) {
        return ReE(res, { message: 'update something' }, HttpStatus.BAD_REQUEST)
    }
    [err, updateConference] = await to(conference.update(body, { where: { _id: conference_id } }));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(updateConference)) {
        return ReE(res, { message: 'Conference Updated Failed!, Try again' });
    }

    return ReS(res, { message: 'Conference Update Successfully!' }, HttpStatus.OK);

}

module.exports.delete = async (req, res) => {
    let err, exisitingConference, updateConference, { conference_id } = req.params;
    let user = req.user;

    if (user.role !== CONFIG.user_type.admin) {
        return ReE(res, { message: 'Admin can only update conference!. call your official please' });
    }

    [err, exisitingConference] = await to(conference.findOne({ where: { _id: conference_id, active: true } }));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!exisitingConference) {
        return ReE(res, { message: 'Conference doesn\'t found. Try again!' }, HttpStatus.BAD_REQUEST);
    }

    [err, updateConference] = await to(conference.update({ active: false }, { where: { _id: conference_id } }));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(updateConference)) {
        return ReE(res, { message: 'Conference Delete Failed!, Try again' });
    }

    return ReS(res, { message: 'Conference Delete Successfully!' }, HttpStatus.OK);
}