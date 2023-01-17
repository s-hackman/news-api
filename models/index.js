const db = require(`../db/connection`);

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics;");
};

exports.fetchArticles = () => {
  return db.query(
    `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT OUTER JOIN comments
  ON articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;`
  );
};

exports.fetchArticleById = (id) => {
  return db
    .query(
      `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.body, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT OUTER JOIN comments
  ON articles.article_id = comments.article_id WHERE articles.article_id = $1
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;`,
      [id]
    )
    .then(({ rows }) => {
      const article = rows[0];
      if (!article) {
        return Promise.reject({
          status: 404,
          msg: "Article not found",
        });
      }
      return article;
    });
};

exports.fetchComments = (id) => {
  return db.query(
    `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
    [id]
  );
};

exports.addComment = (id, author, body) => {
  return db
    .query(
      `INSERT INTO comments (author, body, article_id)
  VALUES ($1,$2,$3) RETURNING *;`,
      [author, body, id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
