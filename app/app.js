const express = require("express");
const app = express();
const apiRouter = require("./router/apiRouter");
app.use(express.json());

const port = 9090;

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ message: err.msg });
  } else {
    next(err);
  }
});

//error handling
app.all("*", (req, res, next) => {
  res.status(404).send({ msg: "URL not found", details: "try ....com/api" });
});

app.use((err, req, res, next) => {
  if (
    err.code === "23502" ||
    err.code === "22P02" ||
    err.code === "42601" ||
    err.code === "42703" ||
    err.code === "23503"
  ) {
    res.status(400).send({ message: "Bad Request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

module.exports = app;
