const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const sequelize = require("sequelize");
const cors = require("cors");
const app = express();
const passport = require("passport");
require("./middleware/passport")(passport);
// const router = require("./routes/user.js");

const path = require("path");

app.use(cors());

// app.use(passport.initialize());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/Images", express.static(path.join(__dirname, "Images")));

app.get("/", (req, res) =>
  res.send({ message: "Server Working on this address" })
);

//v1
const v1 = require("./routes/v1");
app.use("/api1", v1);

//v2
const v2 = require("./routes/v2");
app.use("/api2", v2);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server is running on port", process.env.PORT || 5000);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
