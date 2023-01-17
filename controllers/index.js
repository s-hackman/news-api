const {
  fetchTopics,
  fetchArticles,
  fetchArticleById,
  fetchComments,
  addComment,
} = require("../models/index");

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then(({ rows }) => {
      let message = "No topics found";
      if (rows.length > 0) {
        message = "Here are the topics";
      }
      res.status(200).send({ message, topics: rows });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  fetchArticles()
    .then(({ rows }) => {
      let message = "here are the articles";
      if (rows.length === 0) {
        res.status(404).send({ message: "Article not found" });
      } else {
        let articles = rows;
        articles.forEach((article) => {
          article.comment_count = +article.comment_count;
        });
        res.status(200).send({ message, articles });
      }
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  if (!/^\d+$/.test(article_id)) {
    res.status(400).send({ message: "Invalid ID" });
  } else {
    fetchArticleById(article_id)
      .then((article) => {
        res.status(200).send({ article });
      })
      .catch(next);
  }
};

exports.getComments = (req, res, next) => {
  const { article_id } = req.params;
  if (!/^\d+$/.test(article_id)) {
    res.status(400).send({ message: "Invalid ID" });
  } else {
    Promise.all([fetchComments(article_id), fetchArticleById(article_id)])
      .then(([{ rows }, result2]) => {
        if (rows.length === 0) {
          res.status(200).send({ message: "No comments", comments: [] });
        } else {
          rows.article_id = +article_id;
          res.status(200).send({ comments: rows });
        }
      })
      .catch(next);
  }
};

exports.postComments = (req, res, next) => {
  const { article_id } = req.params;
  const author = req.body.username;
  const body = req.body.body;
  if (!/^\d+$/.test(article_id)) {
    res.status(400).send({ message: "Invalid ID" });
  } else {
    Promise.all([
      addComment(article_id, author, body),
      fetchArticleById(article_id),
    ])
      .then(([newComment, result2]) => {
        res.status(201).send({ "comment added": newComment });
      })
      .catch(next);
  }
};
