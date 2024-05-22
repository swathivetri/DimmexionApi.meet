const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

module.exports = (sequelize, DataTypes) => {
    let event = sequelize.define(
        "event", {
        _id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        event_id: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        organization: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM,
            values: ['Webnair', 'Voice', 'Audio and Video'],
        },
        start_date: {
            type: DataTypes.STRING,
            allowNull: false
        },
        end_date: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_time: {
            type: DataTypes.STRING,
            allowNull: false
        },
        end_time: {
            type: DataTypes.STRING,
            allowNull: false
        },
        no_of_participants: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        partipants: {
            type: DataTypes.ARRAY(DataTypes.JSON),
            allowNull: false,
        },
        organizer : {
            type: DataTypes.UUID,
            allowNull: false,
        },
        primary_organizer: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        secondary_organizer: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.UUID,
            allowNull: true
        }
    },
        { timestamp: true, schema: config.schema }
    )

    event.associate = function (models){
        event.hasMany(models.event, {
            foreignKey : '_id'
        });
        event.belongsTo(models.organization, {
            foreignKey : 'organization',
            as : "Organization"
        });
        event.belongsTo(models.user_info, {
            foreignKey : 'organizer',
            as : "Organizer"
        });
        event.belongsTo(models.user_info, {
            foreignKey : 'primary_organizer',
            as : "primaryOrganizer"
        });
        event.belongsTo(models.user_info, {
            foreignKey : 'secondary_organizer',
            as : "secondaryOrganizer"
        });
        event.belongsTo(models.user_info, {
            foreignKey : 'created_by',
            as : "createdBy"
        });
        event.belongsTo(models.user_info, {
            foreignKey : 'updated_by',
            as : "updatedBy"
        });
    }

    return event;
}