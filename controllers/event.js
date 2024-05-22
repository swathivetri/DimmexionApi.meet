const HttpStatus = require('http-status');
const event = require('../model').event;
const users_info = require("../model").user_info;
const { to, ReE, ReS, isNull, isEmail } = require('../service/util.service');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { CONFIG } = require('../config/confifData');
const { Organizations } = require('aws-sdk');
const { conferenceId } = require('../service/utility');
const Organization = require('../model').organization;
const moment = require('moment');
exports.createEvent = async (req, res) => {

    const body = req.body;
    const user = req.user;
    console.log(user.organization_id ,"usefr serve")

    if (user.role !== CONFIG.user_type.admin) {
        return ReE(res, { message: 'You dont have access for this action' }, HttpStatus.BAD_REQUEST)
    }

    let err, existOrganizer, existPrimaryOrganizer, existSecondaryOrganizer, existOrganization, map = {}, createEvents = {};

    const validation = [ 'organizer', 'primary_organizer', 'secondary_organizer', 'name', 'type', 'start_date', 'end_date', 'start_time', 'end_time', 'no_of_participants', 'partipants',];
    let inVaild = await validation.filter(x => {
        if (isNull(body[x])) {
            return true;
        }
        return false
    });

    [err, existOrganization] = await to(Organization.findOne({ where: { _id: user.organization_id } }));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existOrganization)) {
        return ReE(res, { message: 'Organization not found' }, HttpStatus.BAD_REQUEST);
    }

    [err, existOrganizer] = await to(users_info.findOne({ where: { _id: body.organizer } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existOrganizer)) {
        return ReE(res, { message: 'Organizer not found' }, HttpStatus.BAD_REQUEST);
    }

    [err, existPrimaryOrganizer] = await to(users_info.findOne({ where: { _id: body.primary_organizer } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existPrimaryOrganizer)) {
        return ReE(res, { message: 'Primaryorganizer not found' }, HttpStatus.BAD_REQUEST);
    }

    [err, existSecondaryOrganizer] = await to(users_info.findOne({ where: { _id: body.secondary_organizer } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existSecondaryOrganizer)) {
        return ReE(res, { message: 'Secondaryorganizer not found' }, HttpStatus.BAD_REQUEST);
    }


    if (inVaild.length > 0) {
        return ReE(res, { message: `Please enter vaild details ${inVaild}` }, HttpStatus.BAD_REQUEST);
    }
    if (String(body.name) === "" || String(body.name) === "undefined") {
        return ReE(res, { message: "Event name is required" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.name).trim().length < 3) {
        return ReE(res, { message: "Please enter event name minimum 3 characters!." }, HttpStatus.BAD_REQUEST)
    }

    if (String(body.type) === "" || String(body.type) === "undefined") {
        return ReE(res, { message: "Please select Event Type" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.partipants) === "" || String(body.partipants) === "undefined") {
        return ReE(res, { message: "Please select partipants" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.start_date) === "" || String(body.start_date) === "undefined") {
        return ReE(res, { message: "Please select start Date" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.end_date) === "" || String(body.end_date) === "undefined") {
        return ReE(res, { message: "Please select end_date" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.start_time) === "" || String(body.start_time) === "undefined") {
        return ReE(res, { message: "Please select start_time" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.end_time) === "" || String(body.end_time) === "undefined") {
        return ReE(res, { message: "Please select end_time" }, HttpStatus.BAD_REQUEST)
    }
    if (isNaN(body.no_of_participants) === "" || isNaN(body.no_of_participants) === "undefined") {
        return ReE(res, { message: "Please select no_of_participants" }, HttpStatus.BAD_REQUEST)
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

    createEvents = {
        name: body.name,
        type: body.type,
        event_id: conferenceId(),
        partipants: body.partipants,
        organization: user.organization_id,
        start_date: body.start_date,
        end_date: body.end_date,
        start_time: body.start_time,
        end_time: body.end_time,
        no_of_participants: body.no_of_participants,
        partipants: eventParticipantDetails,
        organizer: body.organizer,
        primary_organizer: body.primary_organizer,
        secondary_organizer: body.secondary_organizer,
        created_by: user._id
    }

    let err1;
    [err1, eventUser1] = await to(event.create(createEvents));


    if (err1) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(eventUser1)) {
        return ReE(res, { message: "Event Creation Failed!" }, HttpStatus.BAD_REQUEST);
    }

    return ReS(res, { message: "Event Created Successfully!", eventDetails: eventUser1 }, HttpStatus.OK);

}
exports.updateEvent = async (req, res) => {
    const body = req.body
    const user = req.user;
    const id = req.params.id
    const { name, type, organization, start_date, end_date, start_time, end_time, no_of_participants, partipants, primary_organizer, secondary_organizer, event_id } = req.body
    let err, existingEventData, existOrganizer, existPrimaryOrganizer, existSecondaryOrganizer, existOrganization, map = {}, createEvents = {};

    const validation = ['organizer', 'primary_organizer', 'secondary_organizer', 'name', 'type', 'start_date', 'end_date', 'start_time', 'end_time', 'no_of_participants', 'partipants'];
    [err, existingEventData] = await to(event.findOne({ where: { _id: id } }))


    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existingEventData)) {
        return ReE(res, { message: "Events not found" }, HttpStatus.BAD_REQUEST)
    }
    let remove_data = ['active', 'event_id', 'organization'];
    let invalid = await remove_data.filter((x) => {
        if (!isNull(body[x])) {
            return true;
        }
        return false
    })
    if (invalid.length > 0) { 
        return ReE(res, { message: `${invalid} cannot edit, please update something` }, HttpStatus.BAD_REQUEST);
    }
    [err, existOrganizer] = await to(users_info.findOne({ where: { _id: body.organizer } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existOrganizer)) {
        return ReE(res, { message: 'Organizer not found' }, HttpStatus.BAD_REQUEST);
    }

    [err, existPrimaryOrganizer] = await to(users_info.findOne({ where: { _id: body.primary_organizer } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existPrimaryOrganizer)) {
        return ReE(res, { message: 'Primaryorganizer not found' }, HttpStatus.BAD_REQUEST);
    }

    [err, existSecondaryOrganizer] = await to(users_info.findOne({ where: { _id: body.secondary_organizer } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(existSecondaryOrganizer)) {
        return ReE(res, { message: 'Secondaryorganizer not found' }, HttpStatus.BAD_REQUEST);
    }
    
    let inVaild = await validation.filter(x => {
        if (isNull(body[x])) {
            return true;
        }
        return false
    });

    if (inVaild.length > 0) {
        return ReE(res, { message: `Please enter vaild details ${inVaild}` }, HttpStatus.BAD_REQUEST);
    }
    if (String(body.name) === "" || String(body.name) === "undefined") {
        return ReE(res, { message: "Event name is required" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.name).trim().length < 3) {
        return ReE(res, { message: "Please enter event name minimum 3 characters!." }, HttpStatus.BAD_REQUEST)
    }


    if (String(body.type) === "" || String(body.type) === "undefined") {
        return ReE(res, { message: "Please select Event Type" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.partipants) === "" || String(body.partipants) === "undefined") {
        return ReE(res, { message: "Please select partipants" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.start_date) === "" || String(body.start_date) === "undefined") {
        return ReE(res, { message: "Please select start Date" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.end_date) === "" || String(body.end_date) === "undefined") {
        return ReE(res, { message: "Please select end_date" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.start_time) === "" || String(body.start_time) === "undefined") {
        return ReE(res, { message: "Please select start_time" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.end_time) === "" || String(body.end_time) === "undefined") {
        return ReE(res, { message: "Please select end_time" }, HttpStatus.BAD_REQUEST)
    }
    if (isNaN(body.no_of_participants) === "" || isNaN(body.no_of_participants) === "undefined") {
        return ReE(res, { message: "Please select no_of_participants" }, HttpStatus.BAD_REQUEST)
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
    let arrayPush = []
    arrayPush.push({ ...existingEventData })
    let validatParticipantArray = []


    for (let index = 0; index < existingEventData.partipants.length; index++) {
        const existParticipantDetails = existingEventData.partipants[index];

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
        for (const [key, value] of Object.entries(element.dataValues)) {

            existingEvenObjData[key] = value
        }
        let existingbodyId = { ...req.body, _id: id }
        for (const [key, value] of Object.entries(existingbodyId)) {
            existingbodyObjData[key] = value
        }

        const allowed = ['partipants', 'created_by', 'updated_by', 'active', 'event_id', 'organization'];

        Object.keys(existingEvenObjData)
            .filter(key => allowed.includes(key))
            .forEach(key => delete existingEvenObjData[key]);

        Object.keys(existingbodyObjData)
            .filter(key => allowed.includes(key))
            .forEach(key => delete existingbodyObjData[key]);

        let validatParticipantDetail = Object.keys(existingEvenObjData).filter(x => existingEvenObjData[x] !== existingbodyObjData[x] && existingEvenObjData._id === id);
        if (validatParticipantDetail.length > 0) {
            validatParticipantArray.push(validatParticipantDetail)
        }
    }

    if (validatParticipantArray.flat().length === 0) {
        return ReE(res, { message: 'update something' }, HttpStatus.BAD_REQUEST)
    }


    const updatedEducationInfo = await event.update({
        name: name,
        type: type,
        partipants: partipants,
        organization: user.organization_id,
        start_date: start_date,
        end_date: end_date,
        start_time: start_time,
        end_time: end_time,
        no_of_participants: no_of_participants,
        participantsDetails: partipants,
        primary_organizer: primary_organizer,
        secondary_organizer: secondary_organizer,
        event_id: event_id,
        updated_by: user._id
    },
        { where: { _id: existingEventData._id } });

    if (err) {

        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!isNull(updatedEducationInfo)) {

        return ReS(res, { message: "Event updated successfully!", eventDetails: updatedEducationInfo }, HttpStatus.OK);
    }
}


exports.getAllEvent = async (req, res) => {

    let err, existingEventData;
    [err, existingEventData] = await to(event.findAll({ where: { active: true } }))

    if (err) {

        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (isNull(existingEventData)) {
        return ReE(res, { message: "No data found" }, HttpStatus.BAD_REQUEST)
    }


    return ReS(res, { data: existingEventData }, HttpStatus.OK)
}

exports.getOneEvent = async (req, res) => {
    const id = req.params.id
    let err, existingEventData;

    [err, existingEventData] = await to(event.findOne({ where: { _id: id, active: true } }))

    if (err) {

        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (isNull(existingEventData)) {
        return ReE(res, { message: "No data found" }, HttpStatus.BAD_REQUEST)
    }

    return ReS(res, { data: existingEventData }, HttpStatus.OK)
}

exports.deleteEvent = async (req, res) => {
    const id = req.params.id
    let err, existingEventData;


    [err, existingEventData] = await to(event.findOne({ where: { _id: id } }))

    if (!existingEventData) {
        return ReE(res, { message: "event id not found" }, HttpStatus.BAD_REQUEST)
    }
    existingEventData.active = false;
    const destroyEvent = await to(existingEventData.save());
    if (!destroyEvent) {
        return ReE(res, { message: "failed to delete event" }, HttpStatus.BAD_REQUEST)
    }
    if (err) {

        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return ReS(res, { message: "event deleted successfully" }, HttpStatus.OK)
}