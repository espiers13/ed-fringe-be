const db = require("../db/index");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index.js");
const request = require("supertest");
const app = require("../app.js");
require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => {
  return db.end();
});

describe("POST /api/login - Authenticate user", () => {
  test("Status 200: returns user data when correct username and password are given", () => {
    return request(app)
      .post("/api/login")
      .send({ username: "test", password: "test1234" })
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          id: 1,
          name: "Emily Spiers",
          username: "test",
          email: "test@test.com",
        });
        expect(body).toHaveProperty("token");
      });
  });

  test("Status 401: Invalid password", () => {
    const credentials = {
      username: "test",
      password: "notthepassword",
    };
    return request(app)
      .post("/api/login")
      .send(credentials)
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toEqual("Invalid password");
      });
  });

  test.only("Status 401: User doesn't exist", () => {
    const credentials = {
      username: "notauser",
      password: "notthepassword",
    };
    return request(app)
      .post("/api/login")
      .send(credentials)
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toEqual("User not found");
      });
  });
});

describe("POST /api/signup - Create new user", () => {
  test("Status 201: Accepts a newUser object and returns user", () => {
    const newUser = {
      name: "Name Name",
      username: "username",
      email: "test@email.com",
      password: "thisisapassword",
    };
    return request(app)
      .post("/api/signup")
      .send(newUser)
      .expect(201)
      .then(({ body }) => {
        expect(body).toHaveProperty("name");
        expect(body).toHaveProperty("username");
        expect(body).toHaveProperty("email");
        expect(body.id).toBe(3);
      });
  });
});

describe("DELETE /api/user/delete - Delete user by credentials", () => {
  test("Status 204: Deletes user when username and password match, returns an empty object", () => {
    const credentials = { username: "test", password: "test1234" };
    return request(app)
      .post(`/api/user/delete`)
      .send(credentials)
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("Status 401: Returns appropriate error code and message when incorrect password is sent through", () => {
    const credentials = { username: "test", password: "notthepassword" };
    return request(app)
      .post(`/api/user/delete`)
      .send(credentials)
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid password");
      });
  });
});

describe("GET /api/schedule/:user_id - Get schedule by user_id", () => {
  test("Status 200: Returns an array containing scheduled event codes when passed a user_id", () => {
    return request(app)
      .post("/api/login")
      .send({ username: "test", password: "test1234" })
      .then(({ body }) => {
        const token = body.token;
        return request(app)
          .get(`/api/schedule/1`)
          .set("Authorization", `Bearer ${token}`)
          .expect(200);
      })
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        body.forEach((event) => {
          expect(event).toHaveProperty("code");
        });
      });
  });
});

describe("POST /api/schedule/:user_id - Post event code to schedule when given user_id and event code", () => {
  test("Status 201: Returns scheduled item and adds it to user schedule by user_id", () => {
    return request(app)
      .post("/api/login")
      .send({ username: "test", password: "test1234" })
      .then(({ body }) => {
        const token = body.token;
        return request(app)
          .post(`/api/schedule/1`)
          .set("Authorization", `Bearer ${token}`)
          .send({ code: "DEMO:2026ALFIEMO" })
          .expect(201);
      })
      .then(({ body }) => {
        expect(body).toMatchObject({
          user_id: 1,
          code: "DEMO:2026ALFIEMO",
          id: 4,
        });
      });
  });
});

describe("PATCH /api/schedule/:user_id - Remove event from schedue when given user_id and event code", () => {
  test("Status 200: Returns array of scheduled events with given code removed", () => {
    return request(app)
      .post("/api/login")
      .send({ username: "test", password: "test1234" })
      .then(({ body }) => {
        const token = body.token;
        return request(app)
          .patch("/api/schedule/1")
          .set("Authorization", `Bearer ${token}`)
          .send({ code: "DEMO:2026AFTERSH" })
          .expect(200);
      })
      .then(({ body }) => {
        const found = body.some((item) => item.code === "DEMO:2026AFTERSH");
        expect(found).toBe(false);
      });
  });
});
