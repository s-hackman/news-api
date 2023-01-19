const {
  fetchTopics,
  fetchArticles,
  fetchArticleById,
  fetchComments,
  addComment,
  updateVotes,
  fetchUsers,
  removeComment,
  fetchUserByUsername,
} = require("../models/index");

const endpoints = require("../../endpoints.json");

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
  const topic = req.query.topic;
  const sort_by = req.query.sort_by || "created_at";
  const order = req.query.order || "desc";

  fetchArticles(topic, sort_by, order)
    .then(({ rows }) => {
      let message = "Here are the Articles";
      if (rows.length === 0) {
        res.status(200).send({ message: "Articles not found", articles: [] });
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
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getComments = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([fetchComments(article_id), fetchArticleById(article_id)])
    .then(([{ rows }, result2]) => {
      rows.article_id = +article_id;
      res.status(200).send({ comments: rows });
    })
    .catch(next);
};

exports.postComments = (req, res, next) => {
  const { article_id } = req.params;
  const author = req.body.username;
  const body = req.body.body;

  Promise.all([
    addComment(article_id, author, body),
    fetchArticleById(article_id),
  ])
    .then(([newComment, result2]) => {
      res.status(201).send({ "comment added": newComment });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const inc_votes = req.body.inc_votes;
  Promise.all([
    updateVotes(article_id, inc_votes),
    fetchArticleById(article_id),
  ])
    .then(([article, result2]) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.getEndpoints = (req, res) => {
  res.status(200).send({ endpoints });
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  fetchUserByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch(next);
};
