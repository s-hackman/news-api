const apiRouter = require("express").Router();

const { getEndpoints } = require("../controllers/index.js");
const {
  topicsRouter,
  commentsRouter,
  usersRouter,
  articlesRouter,
} = require("./indexRoutes.js");

apiRouter.get("/", getEndpoints);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;
