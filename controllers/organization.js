const HttpStatus = require('http-status');
const validator = require('validator');
const { to, ReE, ReS, isNull } = require('../service/util.service');
const organization = require('../model').organization;
const { Op } = require('sequelize');
// const { invalid } = require('moment');



function isValidEmail(email) {
    return validator.isEmail(email);
}

function isValidPhoneNumber(phone) {
    const phonePattern = /^\d{10,15}$/;
    return phonePattern.test(phone);
}

function validateOrganizationFields(body, requiredFields) {
    const missingFields = requiredFields.filter(field => isNull(body[field]));
    if (missingFields.length > 0) {
        return `Missing required fields: ${missingFields.join(', ')}`;
    }

    if (!isValidEmail(body.email_id)) {
        return 'Invalid email format';
    }

    if (!isValidPhoneNumber(body.phone_no)) {
        return 'Invalid phone number format';
    }

    return null; 
}
module.exports.createOrganization = async (req, res) => {
    const body = req.body;

    const requiredFields = ['organization_name', 'branch_name', 'country', 'region', 'market_segment', 'phone_no', 'email_id', 'employee_count'];
    const missingFields = requiredFields.filter(field => isNull(body[field]));

    if (missingFields.length > 0) {
        return ReE(res, { message: `Missing required fields: ${missingFields.join(', ')}` }, HttpStatus.BAD_REQUEST);
    }
    const validationError = validateOrganizationFields(body, requiredFields);
    if (validationError) {
        return ReE(res, { message: validationError }, HttpStatus.BAD_REQUEST);
    }

    let err, existingOrganization;

    [err, existingOrganization] = await to(
        organization.findOne({
            where:{organization_name:body.organization_name},
        })
    );

    if(existingOrganization){
        return ReE(res, {message: 'An organization with this name already exists.'},HttpStatus.BAD_REQUEST);
    }

    [err, existingOrganization] = await to(
        organization.findOne({
            where: { email_id: body.email_id },
        })
    );

    if (err) {
        return ReE(res, { message: 'Error checking existing organization', error: err.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (existingOrganization) {
        return ReE(res, { message: 'An organization with this email ID already exists.' }, HttpStatus.BAD_REQUEST);
    }

    let existingOrgByPhone;
    [err, existingOrgByPhone] = await to(
        organization.findOne({
            where: { phone_no: body.phone_no },
        })
    );
    if (err) {
        return ReE(res, { message: 'Error checking existing organization by phone', error: err.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (existingOrgByPhone) {
        return ReE(res, { message: 'An organization with this phone number already exists.' }, HttpStatus.BAD_REQUEST);
    }

    if (body.organization_name.trim().length < 3) {
        return ReE(res, { message: "Please enter Organization name minimum 3 characters!." }, HttpStatus.BAD_REQUEST);
    }

    if (body.branch_name.trim().length < 3) {
        return ReE(res, { message: "Please enter Branch name minimum 3 characters!." }, HttpStatus.BAD_REQUEST);
    }

    const newOrganization = {
        organization_name:  body.organization_name,
        branch_name:  body.branch_name,
        country: body.country,
        region: body.region,
        market_segment: body.market_segment,
        phone_no:body.phone_no,
        email_id:  body.email_id,
        employee_count: body.employee_count,
        created_by: req.user._id,
        updated_by: req.user._id,  
        active: true,
        block: false
    };

    let createdOrganization;

    [err, createdOrganization] = await to(organization.create(newOrganization));
    if (err) {
        return ReE(res, { message: 'Error creating organization', error: err.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ReS(res, { message: 'Organization created successfully!', data: createdOrganization }, HttpStatus.OK);
};


module.exports.getOrganization = async (req, res) => {
    const orgId = req.params.org_id; 

    let err, org;

    [err, org] = await to(organization.findOne({ where: { _id: orgId, active: true } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(org)) {
        return ReE(res, { message: 'Organization not found' }, HttpStatus.BAD_REQUEST);
    }

    return ReS(res, { message: 'Organization found', data: org }, HttpStatus.OK);
};


module.exports.getAllOrganizations = async (req, res) => {
    let err, orgs;

    [err, orgs] = await to(organization.findAll({ where: { active: true } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if(isNull(orgs) && orgs.length === 0){
        return ReE(res, { message: 'Organization not found' }, HttpStatus.BAD_REQUEST);
    }

    return ReS(res, { message: 'All organizations', data: orgs }, HttpStatus.OK);
};


module.exports.updateOrganization = async (req, res) => {
    const orgId = req.params.id;
    const body = req.body;

    let err, org;

    [err, org] = await to(
        organization.findOne({
            where: { _id: orgId },
        })
    );
    if (err) {
        return ReE(res, { message: 'Error finding organization', error: err.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(org)) {
        return ReE(res, { message: 'Organization not found' }, HttpStatus.BAD_REQUEST);
    }

    const requiredFields = ['organization_name', 'branch_name', 'country', 'region', 'market_segment', 'phone_no', 'email_id', 'employee_count'];
    const missingFields = requiredFields.filter(field => isNull(body[field]));
    if (missingFields.length > 0) {
        return ReE(res, { message: `Missing required fields: ${missingFields.join(', ')}` }, HttpStatus.BAD_REQUEST);
    }

    if (!req.user.owner) {
        return ReE(res, { message: 'Only owners can update organization' }, HttpStatus.BAD_REQUEST);
    }

    const validationError = validateOrganizationFields(body, []);
    if (validationError) {
        return ReE(res, { message: validationError }, HttpStatus.BAD_REQUEST);
    }

    [err, existingOrgByName] = await to(
        organization.findOne({
            where: { organization_name: body.organization_name.trim(), _id: { [Op.ne]: orgId } },
        })
    );
    if (existingOrgByName) {
        return ReE(res, { message: 'An organization with this name already exists.' }, HttpStatus.BAD_REQUEST);
    }

    if (body.organization_name.trim().length < 3) {
        return ReE(res, { message: "Please enter Organization name minimum 3 characters!." }, HttpStatus.BAD_REQUEST);
    }

    if (body.branch_name.trim().length < 3) {
        return ReE(res, { message: "Please enter Branch name minimum 3 characters!." }, HttpStatus.BAD_REQUEST);
    }

    [err, existingOrgByEmail] = await to(
        organization.findOne({
            where: { email_id: body.email_id.trim(), _id: { [Op.ne]: orgId } },
        })
    );
    if (existingOrgByEmail) {
        return ReE(res, { message: 'An organization with this email ID already exists.' }, HttpStatus.BAD_REQUEST);
    }

    [err, existingOrgByPhone] = 
    await to(
        organization.findOne({
            where: { phone_no: body.phone_no, _id: { [Op.ne]: orgId } },
        })
    );

if (existingOrgByPhone) {
    return ReE(res, { message: 'An organization with this phone number already exists.' }, HttpStatus.BAD_REQUEST);
}

    const changesFields = Object.keys(body).filter(key => {
        const existingValue = org[key];
        const newValue = body[key];
        // console.log(existingValue, newValue, existingValue !== newValue);
        return existingValue !== newValue;
    });

    // console.log(changesFields);

    if (changesFields.length === 0) {
        return ReE(res, { message: 'No changes made to the organization' }, HttpStatus.BAD_REQUEST);
    }

    [err] = await to(org.update(body));
    if (err) {
        return ReE(res, { message: 'Error updating organization', error: err.message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ReS(res, { message: 'Organization updated successfully', data: org }, HttpStatus.OK);
};

module.exports.blockOrganization = async (req, res) => {
    const orgId = req.params.id;

    let err, org;

    [err, org] = await to(organization.findOne({ where: { _id: orgId } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(org)) {
        return ReE(res, { message: 'Organization not found' }, HttpStatus.BAD_REQUEST);
    }

    if (!req.user.owner) {
        return ReE(res, { message: 'Only owners can block organizations' }, HttpStatus.BAD_REQUEST);
    }

    [err] = await to(org.update({ block: true }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return ReS(res, { message: 'Organization blocked successfully' }, HttpStatus.OK);
};


module.exports.deleteOrganization = async (req, res) => {
    const orgId = req.params.id;

    let err, org;
    console.log("Deleting organization with ID:", orgId); 
    [err, org] = await to(organization.findOne({ where: { _id: orgId } }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isNull(org)) {
        return ReE(res, { message: 'Organization not found' }, HttpStatus.BAD_REQUEST);
    }

    if (!req.user.owner) {
        return ReE(res, { message: 'Only owners can delete organizations' }, HttpStatus.BAD_REQUEST);
    }

   
    [err] = await to(org.update({ active: false }));
    if (err) {
        return ReE(res, err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return ReS(res, { message: 'Organization deleted successfully' }, HttpStatus.OK);
};
