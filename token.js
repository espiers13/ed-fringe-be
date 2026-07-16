require("dotenv").config({ path: ".env.production" });
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { email: "nataliepatuzzo@gmail.com" },
  process.env.JWT_SECRET,
  {
    expiresIn: "1h",
  },
);

console.log(`https://myfringeplanner.co.uk/reset-password?token=${token}`);
