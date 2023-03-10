const testData = require("../db/data/test-data");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const app = require("../app/app");

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
      .get("/api/articles?limit=500")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(12);
      });
  });
  it("responds with articles in database with limit of 3", () => {
    return request(app)
      .get("/api/articles?limit=3")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(3);
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

describe("PATCH /api/articles/:article_id", () => {
  it("responds with status 200 and the article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 0 })
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        expect(article.author).toEqual("butter_bridge");
        expect(article.title).toEqual("Living in the shadow of a great man");
        expect(body.article.article_id).toEqual(1);
        expect(article.body).toEqual("I find this existence challenging");
        expect(article.topic).toEqual("mitch");
        expect(article.votes).toEqual(100);
      });
  });
  it("respond with 200 status code and updates the articles vote and increases it", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({ inc_votes: 100 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toEqual(100);
      });
  });
  it("respond with 200 status code and updates the articles vote and decreases it", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -5 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toEqual(95);
      });
  });
  it("respond with 400 status code and responds with bad request for non numeric inc_votes", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "blah" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  it("responds with 404 status code for non existent article", () => {
    return request(app)
      .patch("/api/articles/5000")
      .send({ inc_votes: 100 })
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
  it("responds with status 400 for bad request: body doesnt have inc_votes property", () => {
    return request(app)
      .patch("/api/articles/5000")
      .send({ blah: 100 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  it("responds with status 400 for invalid non numeric id", () => {
    return request(app)
      .patch("/api/articles/blah")
      .send({ inc_votes: 10 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
});

describe("GET /api/users", () => {
  it("responds with status 200 and an array with correct length", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toBeInstanceOf(Array);
        expect(body.users.length).toBe(4);
      });
  });
  it("responds with status 200 and array with user objects contatining correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        body.users.forEach((user) => {
          expect(user).toBeInstanceOf(Object);
          expect(typeof user.name).toBe("string");
          expect(typeof user.username).toBe("string");
          expect(typeof user.avatar_url).toBe("string");
        });
      });
  });
  it("responds with status 200 and stored all users data", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const expectedUserResponse = [
          {
            username: "butter_bridge",
            name: "jonny",
            avatar_url:
              "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          },
          {
            username: "icellusedkars",
            name: "sam",
            avatar_url:
              "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
          },
          {
            username: "rogersop",
            name: "paul",
            avatar_url:
              "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
          },
          {
            username: "lurker",
            name: "do_nothing",
            avatar_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          },
        ];
        expect(body.users).toEqual(expectedUserResponse);
      });
  });
});

describe("GET /api/articles queries", () => {
  describe("GET /api/articles sort_by query and order", () => {
    it("responds with status 200 and sort_by = title and order by specified = ascending", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("article_id");
        });
    });
    it("responds with status 200 and sort_by = title and order by specified = descending", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("article_id", {
            descending: true,
          });
        });
    });
    it("responds with status 200 and sort_by should default to date", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at");
        });
    });
    it("responds with status 200 and sort_by query of created_at and defaults to descending", () => {
      return request(app)
        .get("/api/articles?sort_by=created_at")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    it("responds with status 200 and sort_by = title and defaults to descending", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("title", { descending: true });
        });
    });
    it("responds with status 200 and sort_by = article_id and defaults to descending", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("article_id", {
            descending: true,
          });
        });
    });
    it("responds with status 200 and sort_by = votes and defaults to descending", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("votes", { descending: true });
        });
    });
    it("responds with status 200 and sort_by = comment_count and defaults to descending", () => {
      return request(app)
        .get("/api/articles?sort_by=comment_count")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("comment_count", {
            descending: true,
          });
        });
    });
    it("responds with status 200 and sort_by = topic and defaults to descending", () => {
      return request(app)
        .get("/api/articles?sort_by=topic")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("topic", { descending: true });
        });
    });
    it("responds with status 200 and sort_by = author and defaults to descending", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("author", { descending: true });
        });
    });
    it("responds with status 400 if sort_by query is invalid", () => {
      return request(app)
        .get("/api/articles?sort_by=blah")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Invalid sort query");
        });
    });
    it("responds with status 400 if order query is invalid", () => {
      return request(app)
        .get("/api/articles?order=blah")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Invalid sort query");
        });
    });
  });
  describe("GET /api/articles filters by topics query", () => {
    it("responds with status 200 and filter results by topic mitch and limit set to 100", () => {
      return request(app)
        .get("/api/articles?topic=mitch&limit=100")
        .expect(200)
        .then(({ body }) => {
          body.articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
          expect(body.articles.length).toBe(11);
        });
    });
    it("responds with status 200 and filter results by topic cats", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body }) => {
          body.articles.forEach((article) => {
            expect(article.topic).toBe("cats");
          });
          expect(body.articles.length).toBe(1);
        });
    });
    it("responds with status 200 for topic with no articles", () => {
      return request(app)
        .get("/api/articles?topic=blah")
        .expect(200)
        .then(({ body }) => {
          expect(body.message).toBe("Articles not found");
          expect(body.articles.length).toBe(0);
        });
    });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  it("respond with status 204 and no content", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  it("responds with status 400 for invalid non numeric id", () => {
    return request(app)
      .delete("/api/comments/blah")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  it("responds with status 404 for valid but non existent id", () => {
    return request(app)
      .delete("/api/comments/5000")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Comment not found");
      });
  });
});

describe("GET /api", () => {
  it("respond with status 200 and all possible endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { endpoints } = body;
        expect(Object.keys(endpoints)).toEqual(
          expect.arrayContaining([
            "GET /api",
            "GET /api/topics",
            "GET /api/articles",
            "POST /api/articles/:article_id/comments",
            "GET /api/users",
            "GET /api/articles/:article_id",
            "PATCH /api/articles/article_id",
            "GET /api/articles/:article_id/comments",
            "DELETE /api/comments/:comment_id",
          ])
        );
      });
  });
  it("respond with status 200 and also provides description of each endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { endpoints } = body;
        for (endpoint in endpoints) {
          const endpointInfo = endpoints[endpoint];
          expect(endpointInfo).toHaveProperty("description");
          expect(typeof endpointInfo.description).toBe("string");
        }
      });
  });
});

describe("GET /api/users/:username", () => {
  it("responds with status 200 and users data with the id", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body }) => {
        const expectedUserResponse = {
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        };
        expect(body.user).toMatchObject(expectedUserResponse);
      });
  });
  it("responds with 404 if no user found with requested username", () => {
    return request(app)
      .get("/api/users/blah")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("User not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  it("responds with status 200 and comment object with correct properties", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 10 })
      .expect(200)
      .then(({ body }) => {
        const comment = body.comment;
        expect(typeof comment.comment_id).toBe("number");
        expect(typeof comment.article_id).toBe("number");
        expect(typeof comment.votes).toBe("number");
        expect(typeof comment.created_at).toBe("string");
        expect(typeof comment.author).toBe("string");
        expect(typeof comment.body).toBe("string");
      });
  });
  it("responds with status 200 and the comment", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 20 })
      .expect(200)
      .then(({ body }) => {
        const comment = body.comment;
        expect(comment.comment_id).toEqual(1);
        expect(comment.article_id).toEqual(9);
        expect(comment.votes).toEqual(36);
        expect(comment.author).toEqual("butter_bridge");
        expect(comment.body).toEqual(
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
        );
      });
  });
  it("respond with 200 status code and updates the comment vote and increases it", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: 100 })
      .expect(200)
      .then(({ body }) => {
        expect(body.comment.votes).toEqual(114);
      });
  });
  it("respond with 200 status code and updates the comment vote and decreases it", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -5 })
      .expect(200)
      .then(({ body }) => {
        expect(body.comment.votes).toEqual(11);
      });
  });
  it("respond with 400 status code and responds with bad request for non numeric inc_votes", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "blah" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  it("responds with 404 status code for non existent comment", () => {
    return request(app)
      .patch("/api/comments/5000")
      .send({ inc_votes: 100 })
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Comment not found");
      });
  });
  it("responds with status 400 for bad request: body doesnt have inc_votes property", () => {
    return request(app)
      .patch("/api/comments/2")
      .send({ blah: 100 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  it("responds with status 400 for invalid non numeric id", () => {
    return request(app)
      .patch("/api/comments/blah")
      .send({ inc_votes: 10 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
});

describe("POST /api/articles", () => {
  it("responds with status 201 and returns posted article", () => {
    return request(app)
      .post("/api/articles")
      .send({
        title: "test_article",
        body: "blah blah blah",
        topic: "mitch",
        author: "butter_bridge",
      })
      .expect(201)
      .then(({ body }) => {
        const article = body.article;
        expect(typeof article.article_id).toBe("number");
        expect(typeof article.votes).toBe("number");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.comment_count).toBe("number");
        expect(typeof article.body).toBe("string");
        expect(article.article_id).toBe(13);
        expect(article.body).toBe("blah blah blah");
        expect(article.comment_count).toBe(0);
        expect(article.votes).toBe(0);
      });
  });
  it("responds with status 400 for missing required field: title", () => {
    return request(app)
      .post("/api/articles")
      .send({ body: "blah blah blah", topic: "mitch", author: "butter_bridge" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  it("responds with status 400 for missing required field: body", () => {
    return request(app)
      .post("/api/articles")
      .send({ title: "test_article", topic: "mitch", author: "butter_bridge" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
});

describe("POST /api/topics", () => {
  it("responds with a status of 201 with a message of confirmation", () => {
    return request(app)
      .post("/api/topics")
      .send({ slug: "blah", description: "blah blah blah" })
      .expect(201)
      .then(({ body }) => {
        const topic = body.topic;
        expect(topic.slug).toBe("blah");
        expect(topic.description).toBe("blah blah blah");
      });
  });
  it("responds with a status of 201 with a message of confirmation when no description given", () => {
    return request(app)
      .post("/api/topics")
      .send({ slug: "blah" })
      .expect(201)
      .then(({ body }) => {
        const topic = body.topic;
        expect(topic.slug).toBe("blah");
        expect(topic.description).toBe(null);
      });
  });
  it("responds with a status of 400 when the sent a wrong body format", () => {
    return request(app)
      .post("/api/topics")
      .send({ body: "blah" })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
});

describe("DELETE /api/articles/:article_id", () => {
  it("responds with a status of 204 when deleted", () => {
    return request(app).delete("/api/articles/1").expect(204);
  });
  it("responds with a status of 404 when id not found with a message ", () => {
    return request(app)
      .delete("/api/articles/500")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article not found");
      });
  });
  it("responds with a status of 400 for invalid non numeric id", () => {
    return request(app)
      .delete("/api/articles/blah")
      .expect(400)
      .then(({ body }) => {
        expect(body).toEqual({ message: "Bad Request" });
      });
  });
});
