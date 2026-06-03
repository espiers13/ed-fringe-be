const db = require("../db/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

exports.fetchUserByUsernamePassword = (username, password) => {
  return db
    .query(
      `SELECT username, name, email, id, password FROM users WHERE username = $1`,
      [username],
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 401,
          msg: "User not found",
        });
      }

      const user = rows[0];

      return bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return Promise.reject({
            status: 401,
            msg: "Invalid password",
          });
        }

        const token = jwt.sign(
          { user_id: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: "7d" },
        );

        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.createNewUser = (newUser) => {
  const { name, username, email, password } = newUser;

  return bcrypt.hash(password, saltRounds).then((hashedPassword) => {
    const queryStr = `INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4) RETURNING username, name, password, email, id;`;
    const values = [name, username, email, hashedPassword];

    return db
      .query(queryStr, values)
      .then(({ rows }) => {
        return rows[0];
      })
      .catch((err) => {
        if (err.code === "23505" && err.constraint === "users_username_key") {
          return Promise.reject({
            status: 409,
            msg: "Username already exists",
          });
        }
      });
  });
};

exports.removeUserData = (userData) => {
  return db
    .query(`DELETE FROM users WHERE id = $1 RETURNING *;`, [userData.id])
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchScheduleByUserId = (userId) => {
  return db
    .query("SELECT * FROM schedule WHERE user_id = $1", [userId])
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertSchedule = (user_id, code) => {
  return db
    .query(
      `INSERT INTO schedule (user_id, code) VALUES ($1, $2) RETURNING *;`,
      [user_id, code],
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.patchSchedule = (user_id, code) => {
  return db
    .query(`DELETE FROM schedule WHERE user_id = $1 AND code = $2;`, [
      user_id,
      code,
    ])
    .then(() => {
      return db.query(`SELECT * FROM schedule WHERE user_id = $1;`, [user_id]);
    })
    .then(({ rows }) => {
      return rows;
    });
};
