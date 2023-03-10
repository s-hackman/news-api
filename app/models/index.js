const db = require(`../../db/connection`);

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics;");
};

exports.fetchArticles = (topic, sort_by, order, limit, p) => {
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
    let whereClause = "";
    let arraySQL = [limit, (p - 1) * limit];
    if (topic) {
      whereClause = ` WHERE topic = $3 `;
      arraySQL.push(topic);
    }
    return db.query(
      `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count
      FROM articles
      LEFT OUTER JOIN comments
      ON articles.article_id = comments.article_id ${whereClause}
      GROUP BY articles.article_id
      ORDER BY ${sort_by} ${order}
      LIMIT $1 OFFSET $2;`,
      arraySQL
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

exports.fetchUserByUsername = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1;", [username])
    .then(({ rows }) => {
      const user = rows[0];
      if (!user) {
        return Promise.reject({
          status: 404,
          msg: "User not found",
        });
      }
      return user;
    });
};

exports.updateCommentVotes = (id, votes) => {
  return db
    .query(
      `UPDATE comments SET votes = votes + $2 WHERE comment_id = $1 RETURNING *;`,
      [id, votes]
    )
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

exports.addArticle = (author, title, body, topic, article_img_url) => {
  if (!article_img_url) {
    return db.query(
      `INSERT INTO articles (author, title, body, topic)
      VALUES ($1, $2, $3, $4) RETURNING *;`,
      [author, title, body, topic]
    );
  } else {
    return db.query(
      `INSERT INTO articles (author, title, body, topic, article_img_url)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [author, title, body, topic, article_img_url]
    );
  }
};

exports.addTopic = (slug, description) => {
  return db
    .query(
      `INSERT INTO topics (slug, description)
  VALUES ($1, $2) RETURNING *;`,
      [slug, description]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeArticle = (id) => {
  return db
    .query(`DELETE FROM articles WHERE article_id = $1 RETURNING *;`, [id])
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
