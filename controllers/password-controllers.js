const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");
const mg = require("../utils/mailer");

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  db.query("SELECT * FROM users WHERE email = $1", [email])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return res
          .status(200)
          .json({ msg: "If that email exists, a reset link has been sent." });
      }

      const user = rows[0];
      const resetToken = jwt.sign(
        { user_id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      return mg.messages
        .create(process.env.MAILGUN_DOMAIN, {
          from: `Fringe Planner <mailgun@${process.env.MAILGUN_DOMAIN}>`,
          to: [email],
          subject: "Reset your Fringe Planner password",
          html: `
          <p>Hi ${user.name},</p>
          <p>Click the link below to reset your password. It expires in 1 hour.</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>If you didn't request this, you can ignore this email.</p>
        `,
        })
        .then(() => {
          res
            .status(200)
            .json({ msg: "If that email exists, a reset link has been sent." });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ msg: "Something went wrong." });
    });
};

exports.resetPassword = (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    bcrypt
      .hash(newPassword, 10)
      .then((hashedPassword) => {
        return db.query(
          "UPDATE users SET password = $1 WHERE id = $2 RETURNING id",
          [hashedPassword, decoded.user_id],
        );
      })
      .then(({ rows }) => {
        if (rows.length === 0) {
          return res.status(404).json({ msg: "User not found." });
        }
        res.status(200).json({ msg: "Password updated successfully." });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ msg: "Something went wrong." });
      });
  } catch (err) {
    res.status(400).json({ msg: "Reset link is invalid or has expired." });
  }
};
