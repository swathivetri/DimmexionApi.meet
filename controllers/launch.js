const HttpStatus = require('http-status');
const { validateParticipantDetail, validateOrganizerDetail, conferenceId } = require("../service/utility");
const launch = require('../model').launch;
const { to, ReE, ReS, isNull } = require('../service/util.service');
const organization = require('../model').organization;
const users_info = require('../model').user_info;
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
exports.createLaunch = async (req, res) => {
    const body = req.body;
    const user = req.user;

    let err, existOrganizer, existPrimaryOrganizer, existSecondaryOrganizer, existOrganization;
    const validation = ['name', 'type', 'start_date', 'end_date', 'start_time', 'end_time', 'description', 'no_of_participants', 'participants', 'primary_organizer', 'secondary_organizer', 'organizer'];

    let inVaild = validation.filter(x => {
        if (isNull(body[x])) {
            return true;
        }
        return false
    });

    if (inVaild.length > 0) {
        return ReE(res, { message: `Please enter vaild details ${inVaild}` }, HttpStatus.BAD_REQUEST);
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

    if (String(body.name) === "" || String(body.name) === "undefined") {
        return ReE(res, { message: "name is required" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.name).trim().length < 3) {
        return ReE(res, { message: "Please enter launch name minimum 3 characters!." }, HttpStatus.BAD_REQUEST)
    }

    if (String(body.type) === "" || String(body.type) === "undefined") {
        return ReE(res, { message: "Please select type" }, HttpStatus.BAD_REQUEST)
    }
    if (String(body.start_date) === "" || String(body.start_date) === "undefined") {
        return ReE(res, { message: "Please select start_date" }, HttpStatus.BAD_REQUEST)
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
    let i = 0, participantValidator = [], inValid = [];
    body.participants.forEach(element => {
        participantValidator.push(validateParticipantDetail(element, i, body.participants));
        i++;
    });
    inValid = participantValidator.filter(x => x.Success == false);
    if (inValid.length) {
        return ReE(res, { message: ` Invalid participants details: ${inValid.map(e => e.Reason).join(" ,")}` }, HttpStatus.BAD_REQUEST)
    }

    let launchParticipantDetails = body.participants.map((x) => { return { ...x, id: uuidv4() } })
    const data = {
        name: body.name,
        description: body.description,
        type: body.type,
        start_date: body.start_date,
        end_date: body.end_date,
        start_time: body.start_time,
        end_time: body.end_time,
        no_of_participants: body.no_of_participants,
        participants: launchParticipantDetails,
        organizer: body.organizer,
        organization: body.organization,
        primary_organizer: body.primary_organizer,
        secondary_organizer: body.secondary_organizer,
        launch_id: conferenceId(),
        is_active: true,
        is_block: false,
        created_by: user._id,

    };

    [err, createdLauch] = await to(launch.create(data));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!isNull(createdLauch)) {
        return ReS(res, { message: "Created successfully!", launch: createdLauch }, HttpStatus.OK);
    }

}
exports.updateLaunch = async (req, res) => {
    const requestData = req.body;

    const user = req.params


    let err, existOrganizer, existPrimaryOrganizer, existSecondaryOrganizer, existOrganization;
    const validation = ['id'];

    let inVaild = validation.filter(x => {
        if (isNull(user[x])) {
            return true;
        }
        return false
    });

    if (inVaild.length > 0) {
        return ReE(res, { message: `Please enter vaild details ${inVaild}` }, HttpStatus.BAD_REQUEST);
    }

    const { ...body } = requestData;
    const existingFields = ['name', 'type', 'start_date', 'description', 'end_date', 'start_time', 'end_time', 'no_of_participants', 'participants', 'primary_organizer', 'secondary_organizer', 'organizer'];

    let remove_data = [ 'launch_id', 'organization'];
    let invalid = await remove_data.filter((x) => {
        if (!isNull(body[x])) {
            return true;
        }
        return false
    })
    if (invalid.length > 0) {
        return ReE(res, { message: `${invalid} cannot edit, please update something` }, HttpStatus.BAD_REQUEST);
    }
    let inVaildFields = Object.keys(body).filter(x => {
        if (!existingFields.includes(x)) {
            return true;
        }
        return false
    });

    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter vaild details. Fields invalid: ${inVaildFields}` }, HttpStatus.BAD_REQUEST);
    }

    [err, launchDetail] = await to(launch.findOne({ where: { _id: user.id } }));


    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(launchDetail)) {
        return ReE(res, { message: `Cannot find launch details ${_id}` }, HttpStatus.BAD_REQUEST);
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
    if (body.name && String(body.name).trim().length < 3) {
        return ReE(res, { message: "Please enter launch name minimum 3 characters!." }, HttpStatus.BAD_REQUEST)
    }
    if (body.participants) {
        let participantValidator = [], i = 0;
        body.participants.forEach(element => {
            participantValidator.push(validateParticipantDetail(element, i, body.participants));
            i++;
        });
        let inValid = participantValidator.filter(x => x.Success == false);
        if (inValid.length) {
            return ReE(res, { message: `Verify participants details: ${inValid.map(r => r.Reason).join(",")}` }, HttpStatus.BAD_REQUEST)
        }
    }
    let arrayPush = []
    arrayPush.push({ ...launchDetail })
    let validatParticipantArray = []


    for (let index = 0; index < launchDetail.participants.length; index++) {
        const existParticipantDetails = launchDetail.participants[index];

        for (let index = 0; index < body.participants.length; index++) {
            const bodyParticipantDetails = body.participants[index];

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
        let bodyEvenObjData = { ...req.body, start_date: moment(req.body.start_date).format('DD-MM-YYYY'), end_date: moment(req.body.end_date).format('DD-MM-YYYY'), _id: user.id }
        for (const [key, value] of Object.entries(bodyEvenObjData)) {
            existingbodyObjData[key] = value
        }

        const allowed = ['participants', 'created_by', 'updated_by', 'is_active', 'is_block', 'organization', 'launch_id'];

        Object.keys(existingEvenObjData)
            .filter(key => allowed.includes(key))
            .forEach(key => delete existingEvenObjData[key]);

        Object.keys(existingbodyObjData)
            .filter(key => allowed.includes(key))
            .forEach(key => delete existingbodyObjData[key]);

        let validatParticipantDetail = Object.keys(existingEvenObjData).filter(x => existingEvenObjData[x] !== existingbodyObjData[x] && existingEvenObjData._id === user.id);

        if (validatParticipantDetail.length > 0) {
            validatParticipantArray.push(validatParticipantDetail)
        }
    }

    if (validatParticipantArray.flat().length === 0) {
        return ReE(res, { message: 'update something' }, HttpStatus.BAD_REQUEST)
    }

    [err, updatedLauch] = await to(launch.update(body, { where: { _id: user.id } }));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!isNull(updatedLauch) && updatedLauch[0] == 1) {
        [err, launchDetail] = await to(launch.findOne({ where: { _id: user.id } }));
        return ReS(res, { message: "Updated successfully!", launch: launchDetail }, HttpStatus.OK);
    }
    return ReE(res, { message: "Launch not updated successfully" }, HttpStatus.INTERNAL_SERVER_ERROR);

}
exports.getLaunch = async (req, res) => {
    const launchId = req.params.id;
    [err, launchDetail] = await to(launch.findOne({ where: { _id: launchId } }));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!isNull(launchDetail)) {
        return ReS(res, { message: "Fetched launch successfully!", launch: launchDetail }, HttpStatus.OK);
    }

    return ReE(res, { message: "Failed to fetch Launch" }, HttpStatus.BAD_REQUEST);
}
exports.getAllLaunch = async (req, res) => {
    let existingLaunchData;
    let err;
    existingLaunchData = await launch.findAll({
        where: {
            is_active: true,
            is_block: false
        }
    })
    if (!existingLaunchData) {
        return ReE(res, { message: "No data found" }, HttpStatus.BAD_REQUEST)
    }
    if (err) {

        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return ReS(res, { data: existingLaunchData }, HttpStatus.OK)
}
exports.deleteLaunch = async (req, res) => {
    const launchId = req.params.id;
    let err, launchDetail;
    [err, launchDetail] = await to(launch.findOne({ where: { _id: launchId } }));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(launchDetail)) {
        return ReS(res, { message: "Launch Id not found", launch: launchDetail }, HttpStatus.OK);
    }

    [err, launchDelete] = await to(launch.update({ is_active: false, is_block: true }, { where: { _id: launchId } }));

    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!isNull(launchDelete)) {
        return ReS(res, { message: "Deleted launch successfully!", launch: launchDelete }, HttpStatus.OK);
    }
    return ReE(res, { message: "Failed to delete Launch" }, HttpStatus.BAD_REQUEST);
}
