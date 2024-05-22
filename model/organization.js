const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

module.exports = (sequelize, DataTypes) => {
  let organization = sequelize.define(
    "organization",
    {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      organization_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      branch_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      region: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      market_segment: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      email_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      employee_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.UUID,
      },
    },
    { timestamp: true, schema: config.schema }
  );

  organization.associate = function (models) {
    organization.hasMany(models.organization, {
      foreignKey: "_id",
    });
    organization.belongsTo(models.user_info, {
      foreignKey: "created_by",
    });
    organization.belongsTo(models.user_info, {
      foreignKey: "updated_by",
    });
  };

  return organization;
};
