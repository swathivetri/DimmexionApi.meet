const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { TE, isNull, to } = require("../service/util.service");
const { CONFIG } = require("../config/confifData");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

module.exports = (sequelize, DataTypes) => {
  let users_info = sequelize.define(
    "user_info",
    {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      f_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      l_name: {
        type: DataTypes.STRING(100),
      },
      user_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      mobile_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        max: 15,
      },
      organization_id: {
        type: DataTypes.UUID,
      },
      role: {
        type: DataTypes.ENUM(Object.values(CONFIG.user_type)),
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      block: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      owner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_by: {
        type: DataTypes.UUID,
      },
      updated_by: {
        type: DataTypes.UUID,
      },
    },
    { timestamp: true, schema: config.schema }
  );

  users_info.beforeSave("create", async function (next) {
    if (isNull(this.password)) {
      return;
    }

    if (this.isModified("`password`") || this.isNew) {
      let err, salt, hash;
      [err, salt] = await to(bcrypt.genSalt(10));
      if (err) TE(err.message, true);

      [err, hash] = await to(bcrypt.hash(this.password, salt));
      if (err) TE(err.message, true);

      this.password = hash;
    } else {
      return next();
    }
  });

  users_info.prototype.comparePassword = async function (pw) {
    let err, pass;
    if (!this.password) TE("password not set");
    [err, pass] = await to(bcrypt.compare(pw, this.password));
    if (err) TE(err);

    if (!pass) return null;

    return this;
  };

  users_info.prototype.getJWT = function () {
    let expiration_time = parseInt(CONFIG.jwt_expiration);
    return (
      "Bearer " +
      jwt.sign(
        { _id: this._id, userName: this.user_name },
        CONFIG.jwt_encryption,
        { expiresIn: expiration_time }
      )
    );
  };

  users_info.prototype.toWeb = function () {
    let json = this.toJSON();
    json.id = this._id; //this is for the front end
    json.password = undefined;
    return json;
  };

  return users_info;
};


// _id,
// f_name,
// l_name,
// user_name,
// email_id,
// mobile_number,
// password,
// organization_id,
// role,
// active,
// block,
// verified,
// owner,
// created_by,
// updated_by