const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleById,
  getComments,
  postComments,
  patchArticle,
} = require("../controllers");

articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.get("/:article_id/comments", getComments);
articlesRouter.patch("/:article_id", patchArticle);
articlesRouter.post("/:article_id/comments", postComments);

module.exports = articlesRouter;
