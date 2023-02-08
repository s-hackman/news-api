exports.badPath = (req, res, next) => {
  res.status(404).send({ msg: "URL not found", details: "try .com/api" });
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ message: err.msg });
  } else {
    next(err);
  }
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (
    err.code === "23502" ||
    err.code === "22P02" ||
    err.code === "42601" ||
    err.code === "42703" ||
    err.code === "23503"
  ) {
    res.status(400).send({ message: "Bad Request" });
  } else if (err.code === "23505") {
    res.status(400).send({ message: "Topic already Exists" });
  } else {
    next(err);
  }
};

exports.handleServerErrors = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: "Internal Server Error" });
};
