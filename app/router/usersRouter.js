const usersRouter = require("express").Router();
const { getUsers } = require("../controllers");

usersRouter.get("/", getUsers);

module.exports = usersRouter;
