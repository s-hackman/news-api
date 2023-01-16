const { fetchTopics } = require("../models/index");

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
