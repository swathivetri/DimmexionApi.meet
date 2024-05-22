
const upassport = require('passport');

const needsAuth = upassport.authenticate('user', { session: false });

const express = require('express');
const {createLaunch, updateLaunch, getLaunch, getAllLaunch, deleteLaunch} = require("../controllers/launch");
const { login, profile, createUser, getAllUser, blockUser, deleteUser } = require('../controllers/user');
const conference_controller = require("../controllers/conference_con");
const { createEvent, getAllEvent, getOneEvent, deleteEvent, updateEvent } = require('../controllers/event');
const { createAttendance, getAllAttendance, getAttendance, updateAttendance, deleteAttendance } = require('../controllers/attendance');
const router = express.Router();

//users api's

router.post("/user/login", login);
router.get("/user/profile", needsAuth, profile);
router.post("/user/create", needsAuth, createUser);
router.get("/user/getAll/:user_type", needsAuth, getAllUser);
router.put("/user/block/:id", needsAuth, blockUser);
router.put("/user/delete/:id", needsAuth, deleteUser);

//event
router.post("/event/create",needsAuth, createEvent);
router.get("/event/getAll", getAllEvent);
router.get("/event/getOneEvent/:id",needsAuth, getOneEvent);
router.put("/event/updateEvent/:id",needsAuth, updateEvent);
router.delete("/event/deleteEvent/:id",needsAuth, deleteEvent);

// Conference api's

router.post("/conference/add", needsAuth, conference_controller.create);
router.get("/conference/get/all", needsAuth, conference_controller.getAll);
router.get("/conference/get/:conference_id", needsAuth, conference_controller.get);
router.put("/conference/update/:conference_id", needsAuth, conference_controller.update);
router.delete("/conference/delete/:conference_id", needsAuth, conference_controller.delete);

router.post("/launch/create",needsAuth, createLaunch);
router.put("/launch/update/:id",needsAuth, updateLaunch);
router.get("/launch/get-one/:id",needsAuth, getLaunch);
router.get("/launch/get-all",needsAuth, getAllLaunch);
router.post("/launch/delete/:id",needsAuth, deleteLaunch );


//attendance api's

router.post("/attendance/create", needsAuth, createAttendance);
router.get("/attendance/get/All", needsAuth, getAllAttendance);
router.get("/attendance/get/:att_id", needsAuth, getAttendance);
router.put("/attendance/update/:id", needsAuth, updateAttendance);
router.delete("/attendance/delete/:id", needsAuth, deleteAttendance);


// router.post("/user/register", register);
// router.put("/user/admin/asign/role", assignRoletoAdmin);
// router.put("/user/role/assign/admin/user", needsAuth, assignRoleAdmintoUser);
// router.post("/user/login", login);
// router.get("/user/get/all", needsAuth, getAllUser);
// router.get("/user/get/profile", needsAuth, getProfile);
// router.get("/user/get/status", needsAuth, getAllUserByStatus);
// router.get("/user/get/:userId", needsAuth, getUserById);
// router.put("/user/update/status", needsAuth, updateUserStatus);
// router.put("/user/update/admin", needsAuth, updateUserByAdmin);
// router.put("/user/update", needsAuth, updateUser);
// router.post("/user/add/admin", needsAuth, addUserByAdmin);
// router.post("/user/payment/check", paymentAutoLogin);



module.exports = router;