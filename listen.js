const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server listening on http://0.0.0.0:${PORT}...`);
  }
});
