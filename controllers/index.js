const {
  fetchTopics,
  fetchArticles,
  fetchArticleById,
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
        res.status(404).send({ message: "article not found" });
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
    res.status(400).send({ msg: "invalid id" });
  } else {
    fetchArticleById(article_id)
      .then(({ rows }) => {
        if (rows.length === 0) {
          res.status(404).send({ message: "article not found" });
        } else {
          const article = rows[0];
          res.status(200).send({ article });
        }
      })
      .catch(next);
  }
};
