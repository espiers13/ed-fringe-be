const db = require("../index.js");
const format = require("pg-format");
const hashUsersData = require("./utils.js");

const seed = ({ usersData, scheduleData }) => {
  return db
    .query(`DROP TABLE IF EXISTS schedule;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`
            CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL);`);
    })
    .then(() => {
      return db.query(`
            CREATE TABLE schedule(
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            code VARCHAR(20));`);
    })
    .then(() => {
      return hashUsersData(usersData);
    })
    .then((hashedUsersData) => {
      const insertUsersString = format(
        "INSERT INTO users (name, username, email, password) VALUES %L RETURNING *;",
        hashedUsersData,
      );
      return db.query(insertUsersString);
    })
    .then(() => {
      const insertScheduleString = format(
        "INSERT INTO schedule (user_id, code) VALUES %L RETURNING *;",
        scheduleData.map(({ user_id, code }) => [user_id, code]),
      );
      return db.query(insertScheduleString);
    });
};

module.exports = seed;
