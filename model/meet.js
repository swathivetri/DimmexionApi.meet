const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

module.exports = (sequelize, DataTypes) => {
  let meet = sequelize.define(
    "meet",
    {
      _id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      meet_id: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      organization: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      start_date: {
        allowNull: false,
        type: DataTypes.STRING(50),
      },
      end_date: {
        allowNull: false,
        type: DataTypes.STRING(50),
      },
      start_time: {
        allowNull: false,
        type: DataTypes.STRING(50),
      },
      end_time: {
        allowNull: false,
        type: DataTypes.STRING(50),
      },
      no_of_partipants: {
        allowNull: false,
        type: DataTypes.NUMERIC(),
      },
      partipants: {
        allowNull: false,
        type: DataTypes.JSON(),
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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

  meet.associate = function (models) {
    meet.hasMany(models.conference, {
      foreignKey: "_id",
    });
    meet.belongsTo(models.organization, {
      foreignKey: "organization",
      as: "Organization",
    });
    meet.belongsTo(models.user_info, {
      foreignKey: "created_by",
      as: "createdBy",
    });
    meet.belongsTo(models.user_info, {
      foreignKey: "updated_by",
      as: "updatedBy",
    });
  };

  return meet;
};
