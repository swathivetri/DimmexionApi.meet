const passport = require('passport')

const needsAuth = passport.authenticate('user', { session: false });

const express = require('express');
const { createOwner, createAdmin, getAllUserByOwner } = require('../controllers/user');
const { createOrganization,getAllOrganizations,getOrganization,updateOrganization,blockOrganization,deleteOrganization } = require('../controllers/organization');
const router = express.Router();

// temp user

// router.post("/user/register", registerUser);
// router.post("/user/login", loginUser);
// router.get("/user/get/profile", needsAuth, getTempProfile);

//User
router.post("/user/owner/create", createOwner);
router.post("/user/admin/create", needsAuth, createAdmin);
router.get("/user/getAll/:user_type/:org", needsAuth, getAllUserByOwner);

//Organization
router.post("/organization/create", needsAuth, createOrganization);
router.get("/organization/get/All", needsAuth, getAllOrganizations);
router.get("/organization/get/:org_id", needsAuth, getOrganization);
router.put("/organization/update/:id", needsAuth, updateOrganization);
router.put('/organization/:id/block', needsAuth, blockOrganization);
router.delete("/organization/delete/:id", needsAuth, deleteOrganization);


module.exports = router;
