const express = require("express");
const app = express();
const cors = require("cors");
const {
  badPath,
  handleCustomErrors,
  handleServerErrors,
  handlePsqlErrors,
} = require("./errors/index");
const apiRouter = require("./router/apiRouter");
app.use(cors());
app.use(express.json());

const port = 9090;

app.use("/api", apiRouter);

//error handling
app.all("*", badPath);
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
