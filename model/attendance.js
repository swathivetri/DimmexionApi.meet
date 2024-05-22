const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

module.exports = (sequelize, DataTypes) => {
    let attendance = sequelize.define(
        "attendance", {
            _id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
            },
            session_key_id: {
                type: DataTypes.STRING(15),
                allowNull: false
            },
            session_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            session_type: {
                type: DataTypes.ENUM,
                values: ['Meet', 'Conference', 'Event', 'Launch'],
                allowNull: false,
            },
            track: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            participant_email: {
                type: DataTypes.STRING(255), 
                allowNull: false,
            },
            participant_name: {
                type: DataTypes.STRING(50), 
                allowNull: false,
            },
            participant_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            organization: {
                type: DataTypes.UUID,
                allowNull: false,
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
                allowNull: true
            },
        }, {
         
            timestamp: true, schema: config.schema 
        }
    );

    attendance.associate = function(models) {
        attendance.belongsTo(models.meet, {
            foreignKey: 'session_id',
            constraints: false,
            scope: {
                session_type: 'Meet'
            },
            as: 'meet'
        });

        attendance.belongsTo(models.conference, {
            foreignKey: 'session_id',
            constraints: false,
            scope: {
                session_type: 'Conference'
            },
            as: 'conference'
        });

        attendance.belongsTo(models.event, {
            foreignKey: 'session_id',
            constraints: false,
            scope: {
                session_type: 'Event'
            },
            as: 'event'
        });

        attendance.belongsTo(models.launch, {
            foreignKey: 'session_id',
            constraints: false,
            scope: {
                session_type: 'Launch'
            },
            as: 'launch'
        });

        attendance.belongsTo(models.organization, {
            foreignKey : 'organization',
            as : "Organization"
        });

        attendance.belongsTo(models.user_info,{
            foreignKey : 'created_by',
            as : "createdBy"
        });

        attendance.belongsTo(models.user_info,{
            foreignKey : 'updated_by',
            as : "updatedBy"
        })
    };

    return attendance;
};
