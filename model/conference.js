const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

module.exports = (sequelize, DataTypes) => {
let conference = sequelize.define('conference', {
    _id : {
        allowNull : false,
        primaryKey : true,
        type : DataTypes.UUID,
        defaultValue : DataTypes.UUIDV4
    },
    conference_id : {
        type : DataTypes.STRING(15),
        allowNull : false
    },
    organization:{
        type: DataTypes.UUID,
        allowNull: false,
    },
    name : {
        type : DataTypes.STRING(50),
        allowNull : false
    },
    type : {
        type : DataTypes.STRING(50),
        allowNull : false
    },
    start_date : {
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    end_date : {
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    start_time : {
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    end_time : {
        allowNull: false,
        type: DataTypes.STRING(50)
    },
    no_of_partipants : {
        allowNull: false,
        type : DataTypes.NUMERIC()
    },
    partipants: {
        type: DataTypes.JSON(),
        allowNull: false,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    chair_person : {
        type: DataTypes.UUID,
        allowNull: false,
    },
    primary_organizer : {
        type: DataTypes.UUID,
        allowNull: false,
    },
    secondary_organizer : {
        type: DataTypes.UUID,
        allowNull: false,
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.UUID,
      },
}, { timestamp: true, schema: config.schema });

conference.associate = function (models){
    conference.hasMany(models.conference, {
        foreignKey : '_id'
    });
    conference.belongsTo(models.user_info, {
        foreignKey : 'chair_person',
        as : "chairPerson"
    });
    conference.belongsTo(models.organization, {
        foreignKey : 'organization',
        as : "Organization"
    });
    conference.belongsTo(models.user_info, {
        foreignKey : 'primary_organizer',
        as : "primaryOrganizer"
    });
    conference.belongsTo(models.user_info, {
        foreignKey : 'secondary_organizer',
        as : "secondaryOrganizer"
    });
    conference.belongsTo(models.user_info, {
        foreignKey : 'created_by',
        as : "createdBy"
    });
    conference.belongsTo(models.user_info, {
        foreignKey : 'updated_by',
        as : "updatedBy"
    });
}

return conference;
};