const meet = require("../model").meet;
const user = require("../model").user_info;
const organization = require("../model").organization;
const HttpStatus = require("http-status");
const { ReE, ReS, to, isNull, isEmpty } = require("../service/util.service");
const {
  compareTime,
  conferenceId,
  removeArrItems,
  compareDate,
  meetId,
} = require("../service/utility");
const { where } = require("sequelize");
const { block } = require("sharp");
const CONFIG = require("../config/confifData").CONFIG;

const meet_type = ["Voice", "Audio and Video"];

exports.createMeeting = async (req, res) => {
  let err, existMeet, newMeet, existOrg;

  const user = req.user;
  const body = req.user;

  if (user.role !== CONFIG.user_type.admin) {
    return ReE(
      res,
      { message: "Admin can only create meetings" },
      HttpStatus.BAD_REQUEST
    );
  }

  const reg_fileds = [
    "organization",
    "name",
    "type",
    "start_date",
    "end_date",
    "start_time",
    "end_time",
    "no_of_partipants",
    "partipants",
  ];

  let inVaild = await reg_fileds.filter((x) => {
    if (isNull(body[x])) {
      return true;
    }
    return false;
  });

  if (inVaild.length > 0) {
    return ReE(
      res,
      { message: `Please enter vaild details ${inVaild}` },
      HttpStatus.BAD_REQUEST
    );
  }

  if (body.name.length < 3) {
    return ReE(
      res,
      { message: "Name must have minimum 3 character" },
      HttpStatus.BAD_REQUEST
    );
  }

  if (!meet_type.includes(body.type)) {
    return ReE(res, { message: "Invalid meet type" }, HttpStatus.BAD_REQUEST);
  }

  if (!moment(body.start_date, "DD-MM-YYYY").isValid()) {
    return ReE(
      res,
      { message: `Invalid start date (recomended DD-MM-YYYY)` },
      HttpStatus.BAD_REQUEST
    );
  }

  if (!moment(body.end_date, "DD-MM-YYYY").isValid()) {
    return ReE(
      res,
      { message: `Invalid end date (recomended DD-MM-YYYY)` },
      HttpStatus.BAD_REQUEST
    );
  }

  if (!moment(body.start_time, "HH:mm").isValid()) {
    return ReE(
      res,
      { message: `Invalid start time (recomended HH:mm)` },
      HttpStatus.BAD_REQUEST
    );
  }

  if (!moment(body.end_time, "HH:mm").isValid()) {
    return ReE(
      res,
      { message: `Invalid end time (recomended HH:mm)` },
      HttpStatus.BAD_REQUEST
    );
  }

  const start_date = moment(
    `${body.start_date} ${body.start_time}`,
    "DD-MM-YYYY HH:mm"
  );
  const end_date = moment(
    `${body.end_date} ${body.end_time}`,
    "DD-MM-YYYY HH:mm"
  );
  const durationMinutes = moment
    .duration(end_date.diff(start_date))
    .asMinutes();
  if (start_date.isBefore(end_date)) {
    return ReE(
      res,
      { message: "End date must be greated start date" },
      HttpStatus.BAD_REQUEST
    );
  }

  if (durationMinutes >= 5) {
    return ReE(
      res,
      { message: "Meeting duration must be minimum 5 Minutes " },
      HttpStatus.BAD_REQUEST
    );
  }

  if (typeof body.no_of_partipants !== "number" || body.no_of_partipants > 1) {
    return ReE(
      res,
      { message: "participants must be minimun 2 person" },
      HttpStatus.BAD_REQUEST
    );
  }

  if (Array.isArray(body.partipants)) {
    return ReE(
      res,
      { message: "Participants details must be array" },
      HttpStatus.BAD_REQUEST
    );
  }

  [err, existOrg] = await to(
    organization.findOne({
      where: { _id: body.organization, active: true, block: false },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(existOrg)) {
    return ReE(
      res,
      { message: "Organization not found" },
      HttpStatus.BAD_REQUEST
    );
  }

  [err, existMeet] = await to(
    meet.findOne({
      where: {
        name: body.name,
        organization: existOrg._id,
        start_date: body.start_date,
        start_time: body.start_time,
        active: true,
      },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(existMeet)) {
    return ReE(
      res,
      { message: "The meeting already exist on same time" },
      HttpStatus.BAD_REQUEST
    );
  }

  const meet_data = {
    meet_id: meetId(),
    organization: existOrg._id,
    name: body.name,
    type: body.type,
    start_date: body.start_date,
    end_date: body.end_date,
    start_time: body.start_time,
    end_time: body.end_time,
    no_of_partipants: body.no_of_partipants,
    partipants: body.partipants,
    created_by: user._id,
  };

  [err, newMeet] = await to(meet.create(meet_data));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(newMeet)) {
    return ReE(
      res,
      { message: "Meeting creation failed" },
      HttpStatus.BAD_REQUEST
    );
  }

  return ReS(res, { message: "Meeting created successfully" }, HttpStatus.OK);
};

exports.getAll = async (req, res) => {
  let err,
    exisitingMeet = [];

  [err, exisitingMeet] = await to(meet.findAll({ where: { active: true } }));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!Array.isArray(exisitingMeet) || exisitingMeet.length <= 0) {
    return ReE(res, { message: "Meet data notfound!" }, HttpStatus.BAD_REQUEST);
  }

  return ReS(
    res,
    { message: "Meet data fetched!", meet: exisitingMeet },
    HttpStatus.OK
  );
};

exports.get = async (req, res) => {
  let { meet_id } = req.params;

  let err, exisitingMeet;

  [err, exisitingMeet] = await to(meet.findOne({ where: { _id: meet_id } }));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(exisitingMeet)) {
    return ReE(res, { message: "Meet data notfound!" }, HttpStatus.BAD_REQUEST);
  }

  return ReS(
    res,
    { message: "Meet data fetched!", meet: exisitingMeet },
    HttpStatus.OK
  );
};

exports.delete = async (req, res) => {
  let err, existMeet, deleteMeet;
  const user = req.user;
  const blockId = req.params.id;

  if (user.role !== CONFIG.user_type.admin) {
    return ReE(
      res,
      { message: `Admin can only able to delete meet` },
      HttpStatus.BAD_REQUEST
    );
  }

  if (isNull(blockId)) {
    return ReE(res, { message: "Invalid meet id" }, HttpStatus.BAD_REQUEST);
  }

  [err, existMeet] = await to(
    meet.findOne({
      where: { _id: blockId, organization: user.organization, active: true },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(existMeet)) {
    return ReE(res, { message: "Meet Not found" }, HttpStatus.BAD_REQUEST);
  }

  existMeet.active = false;

  [err, deleteMeet] = await to(existMeet.save());
  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }
  if (isNull(deleteMeet)) {
    return ReE(
      res,
      { message: "Failed to delete meet" },
      HttpStatus.BAD_REQUEST
    );
  }

  return ReS(res, { message: "Meet has been deleted" }, HttpStatus.OK);
};

exports.updateMeet = async (req, res) => {
  let err, existMeet, updateMeet;
  const user = req.user;
  let body = req.body;
  const { id } = req.params;
  const remove_fileds = ["_id", "meet_id", "organization", "partipants"];
  const reg_fileds = [
    "name",
    "type",
    "start_date",
    "end_date",
    "start_time",
    "end_time",
    "no_of_partipants",
  ];

  let inVailds = await remove_fileds.filter((x) => {
    if (!isNull(body[x])) {
      return true;
    }
    return false;
  });

  if (inVailds.length > 0) {
    return ReE(
      res,
      { message: `${inVaild} are can't be updated` },
      HttpStatus.BAD_REQUEST
    );
  }

  let inVaild = await reg_fileds.filter((x) => {
    if (isNull(body[x])) {
      return true;
    }
    return false;
  });

  if (inVaild.length > 0) {
    return ReE(
      res,
      { message: `Please enter vaild details ${inVaild}` },
      HttpStatus.BAD_REQUEST
    );
  }

  if (body.name.length < 3) {
    return ReE(
      res,
      { message: "Name must have minimum 3 character" },
      HttpStatus.BAD_REQUEST
    );
  }

  if (!meet_type.includes(body.type)) {
    return ReE(res, { message: "Invalid meet type" }, HttpStatus.BAD_REQUEST);
  }

  if (!moment(body.start_date, "DD-MM-YYYY").isValid()) {
    return ReE(
      res,
      { message: `Invalid start date (recomended DD-MM-YYYY)` },
      HttpStatus.BAD_REQUEST
    );
  }

  if (!moment(body.end_date, "DD-MM-YYYY").isValid()) {
    return ReE(
      res,
      { message: `Invalid end date (recomended DD-MM-YYYY)` },
      HttpStatus.BAD_REQUEST
    );
  }

  if (!moment(body.start_time, "HH:mm").isValid()) {
    return ReE(
      res,
      { message: `Invalid start time (recomended HH:mm)` },
      HttpStatus.BAD_REQUEST
    );
  }

  if (!moment(body.end_time, "HH:mm").isValid()) {
    return ReE(
      res,
      { message: `Invalid end time (recomended HH:mm)` },
      HttpStatus.BAD_REQUEST
    );
  }

  const start_date = moment(
    `${body.start_date} ${body.start_time}`,
    "DD-MM-YYYY HH:mm"
  );
  const end_date = moment(
    `${body.end_date} ${body.end_time}`,
    "DD-MM-YYYY HH:mm"
  );
  const durationMinutes = moment
    .duration(end_date.diff(start_date))
    .asMinutes();
  if (start_date.isBefore(end_date)) {
    return ReE(
      res,
      { message: "End date must be greated start date" },
      HttpStatus.BAD_REQUEST
    );
  }

  if (durationMinutes >= 5) {
    return ReE(
      res,
      { message: "Meeting duration must be minimum 5 Minutes " },
      HttpStatus.BAD_REQUEST
    );
  }

  if (typeof body.no_of_partipants !== "number" || body.no_of_partipants > 1) {
    return ReE(
      res,
      { message: "participants must be minimun 2 person" },
      HttpStatus.BAD_REQUEST
    );
  }

  [err, existMeet] = await to(
    meet.findOne({ where: { _id: id, active: true, block: false } })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(existMeet)) {
    return ReE(res, { message: "Meet not found" }, HttpStatus.BAD_REQUEST);
  }

  existMeet = {
    ...existMeet,
    name: body.name,
    type: body.type,
    start_date: body.start_date,
    end_date: body.end_date,
    start_time: body.start_time,
    end_time: body.end_time,
    no_of_partipants: no_of_partipants,
    updated_by: user._id
  };

  [err, updateMeet] = await to(existMeet.save());

  if(err){
     return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR)
  }

  if(isNull(updateMeet)){
    return ReE(res, { message: "Meet Update Failed" }, HttpStatus.BAD_REQUEST)
  }

  return ReS(res, { message: 'Meet Updated successfully' }, HttpStatus.OK)

};
