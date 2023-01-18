const db = require(`../db/connection`);

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics;");
};

exports.fetchArticles = (topic, sort_by, order) => {
  if (
    !["asc", "desc"].includes(order) ||
    ![
      "title",
      "created_at",
      "votes",
      "article_id",
      "comment_count",
      "body",
      "author",
      "topic",
    ].includes(sort_by)
  ) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  } else {
    let filterTopic = "";
    let arrayTopic = [];
    if (topic) {
      filterTopic = ` WHERE topic = $1 `;
      arrayTopic.push(topic);
    }
    return db.query(
      `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT OUTER JOIN comments
    ON articles.article_id = comments.article_id ${filterTopic}
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order};`,
      arrayTopic
    );
  }
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

exports.updateVotes = (id, votes) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *;`,
      [id, +votes]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.fetchUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows }) => {
    return rows;
  });
};

exports.removeComment = (id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [id])
    .then(({ rows }) => {
      const comment = rows[0];
      if (!comment) {
        return Promise.reject({
          status: 404,
          msg: "Comment not found",
        });
      }
      return comment;
    });
};
