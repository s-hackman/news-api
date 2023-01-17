const express = require("express");
const app = express();
app.use(express.json());

const port = 9090;

const {
  getTopics,
  getArticles,
  getArticleById,
  getComments,
  postComments,
  patchArticle,
  getUsers,
  deleteComment,
} = require("./controllers");

app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getComments);
app.post("/api/articles/:article_id/comments", postComments);
app.patch("/api/articles/:article_id", patchArticle);
app.get("/api/users", getUsers);
app.delete("/api/comments/:comment_id", deleteComment);

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
