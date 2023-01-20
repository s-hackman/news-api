const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleById,
  getComments,
  postComments,
  patchArticle,
  postArticle,
  deleteArticle,
} = require("../controllers");

articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.get("/:article_id/comments", getComments);
articlesRouter.patch("/:article_id", patchArticle);
articlesRouter.post("/:article_id/comments", postComments);
articlesRouter.post("/", postArticle);
articlesRouter.delete("/:article_id", deleteArticle);

module.exports = articlesRouter;
