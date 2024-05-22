const HttpStatus = require("http-status");
const users_info = require("../model").user_info;
const bcrypt = require("bcryptjs");
const organization = require("../model").organization;
const {
  to,
  ReE,
  ReS,
  isNull,
  isEmail,
  isPhone,
} = require("../service/util.service");
const { Op, where } = require("sequelize");
const { CONFIG } = require("../config/confifData");
const { getRandomExcept, generatePass } = require("../service/utility");
const { block } = require("sharp");

exports.createOwner = async (req, res) => {
  const body = req.body;
  const validation = ["f_name", "email_id", "mobile_number"];

  let inVaild = await validation.filter((x) => {
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

  if (String(body.f_name).trim().length < 3) {
    return ReE(
      res,
      { message: "Please enter first name with more the 3 characters!." },
      HttpStatus.BAD_REQUEST
    );
  }

  if (
    String(body.l_name).trim().length > 0 &&
    String(body.l_name).trim().length > 18
  ) {
    return ReE(
      res,
      { message: "Please enter first name with maximum 18 characters!." },
      HttpStatus.BAD_REQUEST
    );
  }

  if (!(await isEmail(body.email_id))) {
    return ReE(
      res,
      { message: "Please enter vaild email id!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let err, checkEmail, checkOrganizationEmail;

  [err, checkEmail] = await to(
    users_info.findOne({
      where: {
        email_id: body.email_id,
        active: true,
        [Op.or]: [{ block: false }, { block: true }],
      },
    })
  );

  [err, checkOrganizationEmail] = await to(
    organization.findOne({
      where: {
        email_id: body.email_id,
        active: true,
        [Op.or]: [{ block: false }, { block: true }],
      },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(checkEmail) || !isNull(checkOrganizationEmail)) {
    return ReE(
      res,
      { message: "Email id already taken!." },
      HttpStatus.BAD_REQUEST
    );
  }

  if (
    isNaN(body.mobile_number) ||
    String(body.mobile_number).length !== 10 ||
    !isPhone(body.mobile_number)
  ) {
    return ReE(
      res,
      { message: "Please enter vaild mobile number!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkMobile, checkOrganizationMobile;

  [err, checkMobile] = await to(
    users_info.findOne({
      where: {
        mobile_number: body.mobile_number,
        active: true,
        [Op.or]: [{ block: false }, { block: true }],
      },
    })
  );

  [err, checkOrganizationMobile] = await to(
    organization.findOne({
      where: {
        phone_no: body.mobile_number,
        active: true,
        [Op.or]: [{ block: false }, { block: true }],
      },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(checkMobile) || !isNull(checkOrganizationMobile)) {
    return ReE(
      res,
      { message: "Mobile number already taken!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkUserName, userName;

  const userNameStarts = `${String(body.f_name)
    .charAt(0)
    .toUpperCase()}${String(body.f_name).substring(1, 3)}`;

  [err, checkUserName] = await to(
    users_info.findAll({
      where: {
        [Op.and]: {
          user_name: { [Op.iLike]: `${userNameStarts}%` },
          [Op.or]: [
            { active: true, block: false },
            { active: true, block: true },
          ],
        },
      },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(checkUserName) && Array.isArray(checkUserName)) {
    let exclude = checkUserName.map((x) =>
      parseInt(String(x).replace(userNameStarts, ""))
    );
    userName = `${userNameStarts}${getRandomExcept(100, 999, exclude)}`;
  } else {
    userName = `${userNameStarts}${getRandomExcept(100, 999, [])}`;
  }

  let createUser,
    password,
    genPass = "codiis@123"; //generatePass(8);

  [err, password] = await to(bcrypt.hash(genPass, bcrypt.genSaltSync(10)));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(password)) {
    return ReE(
      res,
      { message: "Something went wrong to genrate password!." },
      HttpStatus.BAD_REQUEST
    );
  }

  const newUser = {
    f_name: body.f_name,
    l_name: body.l_name,
    user_name: userName,
    email_id: body.email_id,
    mobile_number: body.mobile_number,
    password: password,
    owner: true,
    created_by: null,
    updated_by: null,
  };

  [err, createUser] = await to(users_info.create(newUser));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(createUser)) {
    return ReS(
      res,
      { message: "Register Successfully!", user: createUser.toWeb() },
      HttpStatus.OK
    );
  }
};

exports.login = async (req, res) => {
  const body = req.body;

  let err;

  let validation = ["username", "password"];

  let inVaild = await validation.filter((x) => {
    if (isNull(body[x])) {
      return true;
    }
    return false;
  });

  if (inVaild.length > 0) {
    return ReE(
      res,
      { message: `Please enter ${inVaild} !.` },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkUser;

  [err, checkUser] = await to(
    users_info.findOne({
      where: {
        active: true,
        block: false,
        [Op.or]: [
          { user_name: body.username },
          { email_id: body.username },
          { mobile_number: body.username },
        ],
      },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(checkUser)) {
    return ReE(
      res,
      { message: "Please enter vaild user name!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkPassword;

  [err, checkPassword] = await to(checkUser.comparePassword(body.password));

  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }

  if (!checkPassword) {
    return ReE(
      res,
      { message: "Please check your user name and password!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkOrganization;

  if (checkUser.owner != true && checkUser.organization_id) {
    [err, checkOrganization] = await to(
      organization.findOne({
        where: { _id: checkUser.organization_id, active: true },
      })
    );

    if (err) {
      return ReE(res, err, HttpStatus.BAD_REQUEST);
    }

    if (isNull(checkOrganization)) {
      return ReE(
        res,
        { message: "your organization was not found!." },
        HttpStatus.BAD_REQUEST
      );
    }

    if (checkOrganization.block) {
      return ReE(
        res,
        { message: "your organization was blocked!." },
        HttpStatus.BAD_REQUEST
      );
    }
  } else {
    checkOrganization = true;
  }

  if (checkPassword && checkOrganization) {
    if (!checkUser.verified) {
      let verifyUser;
      // return ReE(
      //   res,
      //   { message: "Please verified your account!." },
      //   HttpStatus.BAD_REQUEST
      // );
      checkUser.verified = true;
      [err, verifyUser] = await to(checkUser.save());
      if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      if (isNull(verifyUser)) {
        return ReE(
          res,
          { message: "User verification failed" },
          HttpStatus.BAD_REQUEST
        );
      }
      return ReS(
        res,
        {
          message: `Welcome ${checkUser.user_name}`,
          token: checkUser.getJWT(),
          user: checkUser.toWeb(),
          reset: true,
        },
        HttpStatus.OK
      );
    }
    return ReS(
      res,
      {
        message: `Welcome ${checkUser.user_name}`,
        token: checkUser.getJWT(),
        user: checkUser.toWeb(),
      },
      HttpStatus.OK
    );
  }
};

exports.profile = async (req, res) => {
  const user = req.user;
  if (!isNull(user)) {
    return ReS(
      res,
      { message: "User Profile Fetched", user: user },
      HttpStatus.OK
    );
  } else {
    return ReS(
      res,
      { message: "User Profile not found" },
      HttpStatus.BAD_REQUEST
    );
  }
};

exports.createAdmin = async (req, res) => {
  const user = req.user;
  const body = req.body;

  if (!user.owner) {
    return ReE(
      res,
      { message: "Only owner can update organization" },
      HttpStatus.BAD_REQUEST
    );
  }

  const validation = ["f_name", "email_id", "mobile_number", "organization_id"];

  let inVaild = await validation.filter((x) => {
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

  if (String(body.f_name).trim().length < 3) {
    return ReE(
      res,
      { message: "Please enter first name with more the 3 characters!." },
      HttpStatus.BAD_REQUEST
    );
  }

  if (
    String(body.l_name).trim().length > 0 &&
    String(body.l_name).trim().length > 18
  ) {
    return ReE(
      res,
      { message: "Please enter first name with maximum 18 characters!." },
      HttpStatus.BAD_REQUEST
    );
  }

  if (!(await isEmail(body.email_id))) {
    return ReE(
      res,
      { message: "Please enter vaild email id!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkEmail, checkOrganizationEmail;

  [err, checkEmail] = await to(
    users_info.findOne({
      where: {
        email_id: body.email_id,
        [Op.or]: [
          { active: true, block: false },
          { active: true, block: true },
        ],
      },
    })
  );

  [err, checkOrganizationEmail] = await to(
    organization.findOne({
      where: {
        email_id: body.email_id,
        active: true,
        [Op.or]: [{ block: false }, { block: true }],
      },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(checkEmail) || !isNull(checkOrganizationEmail)) {
    return ReE(
      res,
      { message: "Email id already taken!." },
      HttpStatus.BAD_REQUEST
    );
  }

  if (
    isNaN(body.mobile_number) ||
    String(body.mobile_number).length !== 10 ||
    !isPhone(body.mobile_number)
  ) {
    return ReE(
      res,
      { message: "Please enter vaild mobile number!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkMobile, checkOrganizationMobile;

  [err, checkMobile] = await to(
    users_info.findOne({
      where: {
        mobile_number: body.mobile_number,
        active: true,
        [Op.or]: [{ block: false }, { block: true }],
      },
    })
  );

  [err, checkOrganizationMobile] = await to(
    organization.findOne({
      where: {
        phone_no: body.mobile_number,
        active: true,
        [Op.or]: [{ block: false }, { block: true }],
      },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(checkMobile) || !isNull(checkOrganizationMobile)) {
    return ReE(
      res,
      { message: "Mobile number already taken!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkUserName, userName;

  const userNameStarts = `${String(body.f_name)
    .charAt(0)
    .toUpperCase()}${String(body.f_name).substring(1, 3)}`;

  [err, checkUserName] = await to(
    users_info.findAll({
      where: {
        [Op.and]: {
          user_name: { [Op.iLike]: `${userNameStarts}%` },
          [Op.or]: [
            { active: true, block: false },
            { active: true, block: true },
          ],
        },
      },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(checkUserName) && Array.isArray(checkUserName)) {
    let exclude = checkUserName.map((x) =>
      parseInt(String(x).replace(userNameStarts, ""))
    );
    userName = `${userNameStarts}${getRandomExcept(100, 999, exclude)}`;
  } else {
    userName = `${userNameStarts}${getRandomExcept(100, 999, [])}`;
  }

  let createUser;

  let password,
    genPass = "codiis@123"; //generatePass(8);

  [err, password] = await to(bcrypt.hash(genPass, bcrypt.genSaltSync(10)));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(password)) {
    return ReE(
      res,
      { message: "Something went wrong to genrate password!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkOrganization;

  [err, checkOrganization] = await to(
    organization.findOne({
      where: { _id: body.organization_id, active: true },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }

  if (isNull(checkOrganization)) {
    return ReE(
      res,
      { message: "your organization was not found!." },
      HttpStatus.BAD_REQUEST
    );
  }

  if (checkOrganization.block) {
    return ReE(
      res,
      { message: "your organization was blocked!." },
      HttpStatus.BAD_REQUEST
    );
  }

  const newUser = {
    f_name: body.f_name,
    l_name: body.l_name,
    user_name: userName,
    email_id: body.email_id,
    mobile_number: body.mobile_number,
    password: password,
    organization_id: checkOrganization._id,
    role: CONFIG.user_type.admin,
    created_by: user._id,
  };

  [err, createUser] = await to(users_info.create(newUser));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(createUser)) {
    return ReS(
      res,
      { message: "Admin Register Successfully!", user: createUser.toWeb() },
      HttpStatus.OK
    );
  }
};

exports.createUser = async (req, res) => {
  let err;
  const user = req.user;
  const body = req.body;

  if (user.role !== CONFIG.user_type.admin) {
    return ReE(
      res,
      { message: "Only admins can update organization" },
      HttpStatus.BAD_REQUEST
    );
  }

  const validation = ["f_name", "email_id", "mobile_number"];

  let inVaild = await validation.filter((x) => {
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

  if (String(body.f_name).trim().length < 3) {
    return ReE(
      res,
      { message: "Please enter first name with more the 3 characters!." },
      HttpStatus.BAD_REQUEST
    );
  }

  if (!(await isEmail(body.email_id))) {
    return ReE(
      res,
      { message: "Please enter vaild email id!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkEmail, checkOrganizationEmail;

  [err, checkEmail] = await to(
    users_info.findOne({
      where: {
        email_id: body.email_id,
        [Op.or]: [
          { active: true, block: false },
          { active: true, block: true },
        ],
      },
    })
  );

  [err, checkOrganizationEmail] = await to(
    organization.findOne({
      where: {
        email_id: body.email_id,
        active: true,
        [Op.or]: [{ block: false }, { block: true }],
      },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(checkEmail) || !isNull(checkOrganizationEmail)) {
    return ReE(
      res,
      { message: "Email id already taken!." },
      HttpStatus.BAD_REQUEST
    );
  }

  if (
    isNaN(body.mobile_number) ||
    String(body.mobile_number).length !== 10 ||
    !isPhone(body.mobile_number)
  ) {
    return ReE(
      res,
      { message: "Please enter vaild mobile number!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkMobile, checkOrganizationMobile;

  [err, checkMobile] = await to(
    users_info.findOne({
      where: {
        mobile_number: body.mobile_number,
        [Op.or]: [
          { active: true, block: false },
          { active: true, block: true },
        ],
      },
    })
  );

  [err, checkOrganizationMobile] = await to(
    organization.findOne({
      where: {
        phone_no: body.mobile_number,
        active: true,
        [Op.or]: [{ block: false }, { block: true }],
      },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(checkMobile) || !isNull(checkOrganizationMobile)) {
    return ReE(
      res,
      { message: "Mobile number already taken!." },
      HttpStatus.BAD_REQUEST
    );
  }

  let checkUserName, userName;

  const userNameStarts = `${String(body.f_name)
    .charAt(0)
    .toUpperCase()}${String(body.f_name).substring(1, 3)}`;

  [err, checkUserName] = await to(
    users_info.findAll({
      where: {
        [Op.and]: {
          user_name: { [Op.iLike]: `${userNameStarts}%` },
          [Op.or]: [
            { active: true, block: false },
            { active: true, block: true },
          ],
        },
      },
    })
  );

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(checkUserName) && Array.isArray(checkUserName)) {
    let exclude = checkUserName.map((x) =>
      parseInt(String(x).replace(userNameStarts, ""))
    );
    userName = `${userNameStarts}${getRandomExcept(100, 999, exclude)}`;
  } else {
    userName = `${userNameStarts}${getRandomExcept(100, 999, [])}`;
  }

  let createUser,
    password,
    genPass = "codiis@123"; //generatePass(8);

  [err, password] = await to(bcrypt.hash(genPass, bcrypt.genSaltSync(10)));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(password)) {
    return ReE(
      res,
      { message: "Something went wrong to genrate password!." },
      HttpStatus.BAD_REQUEST
    );
  }

  const newUser = {
    f_name: body.f_name,
    l_name: body.l_name,
    user_name: userName,
    email_id: body.email_id,
    mobile_number: body.mobile_number,
    password: password,
    organization_id: user.organization_id,
    role: CONFIG.user_type.user,
    created_by: user._id,
  };

  [err, createUser] = await to(users_info.create(newUser));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (!isNull(createUser)) {
    return ReS(
      res,
      { message: "User Register Successfully!", user: createUser.toWeb() },
      HttpStatus.OK
    );
  }
};

exports.getAllUserByOwner = async (req, res) => {
  const user = req.user;
  const user_type = req.params.user_type;
  const queryData = req.query;
  const org = req.params.org;
  let err, query, checkOrganization, users;

  query = {
    active: true,
    block: false,
  };

  if (queryData.user === "blocked") {
    query.block = true;
  } else if (queryData.user === "all") {
    delete queryData.block;
  }

  if (
    !Object.keys(CONFIG.user_type).includes(user_type) &&
    user_type !== "all" &&
    user_type !== "owner"
  ) {
    return ReE(res, { message: "Invalid user type" }, HttpStatus.BAD_REQUEST);
  }
  if (!user.owner) {
    return ReE(
      res,
      { message: `You can't access this data` },
      HttpStatus.BAD_REQUEST
    );
  }

  if (user_type === "owner") {
    query.owner = true;
  } else if (user_type !== "all") {
    if (isNull(org) || org !== "all") {
      return ReE(
        res,
        { message: "Invalid Organization id" },
        HttpStatus.BAD_REQUEST
      );
    }

    if (org !== "all") {
      let orgQuery = { _id: org };

      [err, checkOrganization] = await to(
        organization.findOne({ where: orgQuery })
      );

      if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (isNull(checkOrganization)) {
        return ReE(
          res,
          { message: "Organizagtion not found" },
          HttpStatus.BAD_REQUEST
        );
      }

      query.organization_id = checkOrganization._id;
    }
    query.role = CONFIG.user_type[user_type];
  }

  [err, users] = await to(users_info.findAll({ where: query }));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(users) || !Array.isArray(users) || users.length === 0) {
    return ReE(res, { message: "User not found" }, HttpStatus.BAD_REQUEST);
  }

  return ReS(res, { message: "User fetched", users: users }, HttpStatus.OK);
};

exports.getAllUser = async (req, res) => {
  const user = req.user;
  const user_type = req.params.user_type;
  const queryData = req.query;
  let err, query, checkOrganization, users;

  query = {
    active: true,
    block: false,
  };

  if (queryData.user === "blocked") {
    query.block = true;
  } else if (queryData.user === "all") {
    delete queryData.block;
  }

  if (user.role !== CONFIG.user_type.admin) {
    return ReE(
      res,
      { message: `You can't access this data` },
      HttpStatus.BAD_REQUEST
    );
  }

  query.organization_id = user.organization_id;

  if (
    !Object.keys(CONFIG.user_type).includes(user_type) &&
    user_type !== "all"
  ) {
    return ReE(res, { message: "Invalid user type" }, HttpStatus.BAD_REQUEST);
  }

  if (user_type !== "all") {
    query.role = CONFIG.user_type[user_type];
  }

  [err, users] = await to(users_info.findAll({ where: query }));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(users) || !Array.isArray(users) || users.length === 0) {
    return ReE(res, { message: "User not found" }, HttpStatus.BAD_REQUEST);
  }

  return ReS(res, { message: "User fetched", users: users }, HttpStatus.OK);
};

exports.blockUser = async (req, res) => {
  let err,
    users,
    blockUser,
    query = {};
  const user = req.user;
  const blockId = req.params.id;

  if (isNull(blockId)) {
    return ReE(res, { message: "Invalid user id" }, HttpStatus.BAD_REQUEST);
  }

  if (user.role === CONFIG.user_type.admin) {
    query = { id: blockId, organization_id: user.role, active: true };
  }

  if (user.owner) {
    query = { id: blockId, active: true };
  }

  [err, users] = await to(users_info.findOne({ where: query }));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(users)) {
    return ReE(res, { message: "User Not found" }, HttpStatus.BAD_REQUEST);
  }

  if (users.block) {
    return ReE(
      res,
      { message: "User has been already blocked" },
      HttpStatus.BAD_REQUEST
    );
  }

  users.block = true;

  [err, blockUser] = await to(users.save());
  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }
  if (isNull(blockUser)) {
    return ReE(res, { message: "Failed" }, HttpStatus.BAD_REQUEST);
  }

  return ReS(res, { message: "User has been blocked" }, HttpStatus.OK);
};

exports.deleteUser = async (req, res) => {
  let err, users, blockUser, query = {};
  const user = req.user;
  const blockId = req.params.id;

  if (isNull(blockId)) {
    return ReE(res, { message: "Invalid user id" }, HttpStatus.BAD_REQUEST);
  }

  if (user.role === CONFIG.user_type.admin) {
    query = { id: blockId, organization_id: user.role, active: true };
  }

  if (user.owner) {
    query = { id: blockId, active: true };
  }

  [err, users] = await to(users_info.findOne({ where: query }));

  if (err) {
    return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  if (isNull(users)) {
    return ReE(res, { message: "User Not found" }, HttpStatus.BAD_REQUEST);
  }

  if (!users.active) {
    return ReE(
      res,
      { message: "User has been already deleted" },
      HttpStatus.BAD_REQUEST
    );
  }

  users.active = false;

  [err, blockUser] = await to(users.save());
  if (err) {
    return ReE(res, err, HttpStatus.BAD_REQUEST);
  }
  if (isNull(blockUser)) {
    return ReE(res, { message: "Failed" }, HttpStatus.BAD_REQUEST);
  }

  return ReS(res, { message: "User has been deleted" }, HttpStatus.OK);
};
