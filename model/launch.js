const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
module.exports = (sequelize, DataTypes) => {
    let Launch = sequelize.define('launch', {
        _id : {
            allowNull : false,
            primaryKey : true,
            type : DataTypes.UUID,
            defaultValue : DataTypes.UUIDV4
        },
        launch_id: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        name : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        description: {
            type: DataTypes.STRING(255)
        },
        type : {
            type : DataTypes.STRING(50),
            allowNull : false
        },
        start_date : {
            allowNull: false,
            type: DataTypes.DATE
        },
        end_date : {
            allowNull: false,
            type: DataTypes.DATE
        },
        start_time : {
            allowNull: false,
            type: DataTypes.TIME
        },
        end_time : {
            allowNull: false,
            type: DataTypes.TIME
        },
        no_of_participants : {
            allowNull: false,
            type : DataTypes.NUMERIC()
        },
        participants: {
            type : DataTypes.JSON()
        },
        is_active: {
            type: DataTypes.BOOLEAN
        },
        is_block: {
            type: DataTypes.BOOLEAN
        },
        organization: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        organizer: { 
            type: DataTypes.UUID 
        },
        primary_organizer: { 
            type: DataTypes.UUID 
        },
        secondary_organizer: { 
            type: DataTypes.UUID 
        },
       
        created_by: {
            type: DataTypes.UUID,
        },
        updated_by: {
            type: DataTypes.UUID,
        },
    }, { timestamp: true, schema: config.schema });
    Launch.associate = function (models){
        Launch.hasMany(models.launch, {
            foreignKey : '_id'
        });
        Launch.belongsTo(models.organization, {
            foreignKey : 'organization',
            as : "Organization"
        });
        Launch.belongsTo(models.user_info, {
            foreignKey : 'organizer',
            as : "Organizer"
        });
        Launch.belongsTo(models.user_info, {
            foreignKey : 'primary_organizer',
            as : "primaryOrganizer"
        });
        Launch.belongsTo(models.user_info, {
            foreignKey : 'secondary_organizer',
            as : "secondaryOrganizer"
        });
        Launch.belongsTo(models.user_info, {
            foreignKey : 'created_by',
            as : "createdBy"
        });
        Launch.belongsTo(models.user_info, {
            foreignKey : 'updated_by',
            as : "updatedBy"
        });
    }
    return Launch;
};