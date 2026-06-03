const {
  fetchUserByUsernamePassword,
  createNewUser,
  removeUserData,
  fetchScheduleByUserId,
  insertSchedule,
  patchSchedule,
} = require("../models/user-models");

exports.getUserByCredentials = (req, res, next) => {
  const { username, password } = req.body;

  fetchUserByUsernamePassword(username, password)
    .then((userData) => {
      res.status(200).send(userData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postNewUser = (req, res, next) => {
  const newUser = req.body;
  createNewUser(newUser)
    .then((userData) => {
      res.status(201).send(userData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteUserByCredentials = (req, res, next) => {
  const { username, password } = req.body;

  fetchUserByUsernamePassword(username, password)
    .then((userData) => {
      removeUserData(userData).then(() => {
        res.sendStatus(204);
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getScheduleByUserId = (req, res, next) => {
  const { user_id } = req.params;
  fetchScheduleByUserId(user_id)
    .then((scheduleData) => {
      res.status(200).send(scheduleData);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postToSchedule = (req, res, next) => {
  const { user_id } = req.params;
  const { code } = req.body;

  insertSchedule(user_id, code)
    .then((scheduleItem) => {
      res.status(201).send(scheduleItem);
    })
    .catch((err) => {
      next(err);
    });
};

exports.removeFromSchedule = (req, res, next) => {
  const { user_id } = req.params;
  const { code } = req.body;

  patchSchedule(user_id, code)
    .then((schedule) => {
      console.log(schedule);
      res.status(200).send(schedule);
    })
    .catch((err) => {
      next(err);
    });
};
