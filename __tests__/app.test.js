const testData = require("../db/data/test-data");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const app = require("../app");

afterAll(() => db.end());
beforeEach(() => seed(testData));

describe("GET /api/topics", () => {
  it("endpoint responds with an array", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.topics)).toBe(true);
      });
  });
  it("endpoint responds with an array of objects with slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        body.topics.forEach((topic) => {
          expect(typeof topic.slug).toEqual("string");
          expect(typeof topic.description).toEqual("string");
        });
      });
  });
  it("endpoint responds with array contains the correct data", () => {
    return request(app)
      .get("/api/topics")
      .then(({ body }) => {
        const expectedResponse = [
          {
            description: "The man, the Mitch, the legend",
            slug: "mitch",
          },
          {
            description: "Not dogs",
            slug: "cats",
          },
          {
            description: "what books are made of",
            slug: "paper",
          },
        ];
        expect(body.topics).toEqual(expectedResponse);
        expect(body.topics.length).toBe(3);
      });
  });
});

describe("GET /api/blah", () => {
  it("responds with status 404 for route that does not exist", () => {
    return request(app)
      .get("/api/blah")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("URL not found");
      });
  });
});

describe("GET /api/articles", () => {
  it("responds with articles array", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeInstanceOf(Array);
      });
  });
  it("responds with all articles in database", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(12);
      });
  });
  it("responds with array containing article objects with correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const article = body.articles[1];
        expect(typeof article.author).toBe("string");
        expect(typeof article.title).toBe("string");
        expect(typeof article.article_id).toBe("number");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.votes).toBe("number");
        expect(typeof article.comment_count).toBe("number");
      });
  });
  it("responds with articles should be sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  it("responds with status 200 with article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body.article).toBe("object");
      });
  });
  it("responds with status 200 article object should have correct author, title, article_id, topic, created_at, article_img_url, comment_count and votes", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const expectedResponse = {
          article_id: 1,
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          topic: "mitch",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: "11",
        };
        expect(body.article).toEqual(expectedResponse);
      });
  });
  it("responds with 404 if no article found with requested id", () => {
    return request(app)
      .get("/api/articles/100000")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
  it("responds with status 400 for invalid non numeric id", () => {
    return request(app)
      .get("/api/articles/blah")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  it("responds with comments array, correct length and status 200", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toBeInstanceOf(Array);
        expect(body.comments.length).toBe(11);
      });
  });
  it("responds with status 200 and message for no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(0);
      });
  });
  it("responds with status 200 and array contains comment objects with correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        body.comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
        });
      });
  });
  it("responds with status 400 for invalid non numeric id", () => {
    return request(app)
      .get("/api/articles/blah/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  it("responds with status 404 if no article found with requested article_id", () => {
    return request(app)
      .get("/api/articles/5000/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  it("responds with status 201 and returns posted comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "butter_bridge", body: "New comment" })
      .expect(201)
      .then(({ body }) => {
        const expectedCommentResponse = body["comment added"];
        expect(typeof expectedCommentResponse.comment_id).toBe("number");
        expect(typeof expectedCommentResponse.votes).toBe("number");
        expect(typeof expectedCommentResponse.created_at).toBe("string");
        expect(typeof expectedCommentResponse.author).toBe("string");
        expect(expectedCommentResponse.body).toBe("New comment");
      });
  });
  it("responds with status 400 for invalid non numeric id", () => {
    return request(app)
      .post("/api/articles/blah/comments")
      .send({ username: "butter_bridge", body: "New comment" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  it("responds with status 400 for missing required field: username", () => {
    return request(app)
      .post("/api/articles/4/comments")
      .send({ body: "New comment" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  it("responds with status 400 for missing required field: body", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({ username: "butter_bridge" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  it("responds with status 400 for username not found", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({ username: "blah", body: "New comment" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  it("responds with status 400 for invalid username", () => {
    return request(app)
      .post("/api/articles/3/comments")
      .send({ username: 123, body: "New comment" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
});
