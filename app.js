const express = require("express");
const app = express();
const cors = require("cors");
const { authenticateToken } = require("./middleware/auth");

const {
  getUserByCredentials,
  postNewUser,
  deleteUserByCredentials,
  getScheduleByUserId,
  postToSchedule,
  removeFromSchedule,
  patchUserPassword,
} = require("./controllers/user-controllers");

const {
  forgotPassword,
  resetPassword,
} = require("./controllers/passwordController");

// MIDDLEWARE

app.use(cors());
app.use(express.json());

// LOGIN REQUEST

app.post("/api/login", getUserByCredentials);

// NEW USER REQUEST

app.post("/api/signup", postNewUser);

// DELETE USER REQUEST

app.post("/api/user/delete", deleteUserByCredentials);

// PATCH PASSWORD REQUEST

app.patch("/api/user/password", patchUserPassword);

// GET SCHEDULE BY USER_ID

app.get("/api/schedule/:user_id", authenticateToken, getScheduleByUserId);

// ADD EVENT TO SCHEDULE

app.post("/api/schedule/:user_id", authenticateToken, postToSchedule);

// REMOVE EVENT FROM SCHEDULE

app.patch("/api/schedule/:user_id", authenticateToken, removeFromSchedule);

// FORGOT PASSWORD REQUEST

app.post("/api/forgot-password", forgotPassword);

// RESET PASSWORD REQUEST

app.post("/api/reset-password", resetPassword);

// ERRORS

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
