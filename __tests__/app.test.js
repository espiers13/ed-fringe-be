const db = require("../db/index");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index.js");
const request = require("supertest");
const app = require("../app.js");
require("jest-sorted");

jest.mock("../utils/mailer", () => ({
  messages: {
    create: jest.fn().mockResolvedValue({ id: "test-id", message: "Queued" }),
  },
}));

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

  test("Status 401: User doesn't exist", () => {
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
        expect(body.user).toHaveProperty("name");
        expect(body.user).toHaveProperty("username");
        expect(body.user).toHaveProperty("email");
        expect(body.user.id).toBe(3);
        expect(body).toHaveProperty("token");
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

describe("PATCH /api/user/password - Change user password", () => {
  test("Status 200: Returns updated user when correct credentials and new password are given", () => {
    return request(app)
      .patch("/api/user/password")
      .send({
        username: "test",
        currentPassword: "test1234",
        newPassword: "newpassword123",
      })
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: "test",
          name: "Emily Spiers",
          email: "test@test.com",
        });
      });
  });

  test("Status 401: Returns error when current password is incorrect", () => {
    return request(app)
      .patch("/api/user/password")
      .send({
        username: "test",
        currentPassword: "wrongpassword",
        newPassword: "newpassword123",
      })
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid password");
      });
  });

  test("Status 401: Returns error when user does not exist", () => {
    return request(app)
      .patch("/api/user/password")
      .send({
        username: "notauser",
        currentPassword: "test1234",
        newPassword: "newpassword123",
      })
      .expect(401)
      .then(({ body }) => {
        expect(body.msg).toBe("User not found");
      });
  });
});

describe.only("POST /api/forgot-password", () => {
  test("Status 200: returns success message when email exists", () => {
    return request(app)
      .post("/api/forgot-password")
      .send({ email: "test@test.com" })
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "If that email exists, a reset link has been sent.",
        );
      });
  });

  test("Status 200: returns same message even when email doesn't exist", () => {
    return request(app)
      .post("/api/forgot-password")
      .send({ email: "notreal@test.com" })
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "If that email exists, a reset link has been sent.",
        );
      });
  });
});

describe.only("POST /api/reset-password", () => {
  test("Status 200: successfully resets password with valid token", () => {
    const jwt = require("jsonwebtoken");
    const validToken = jwt.sign({ user_id: 1 }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return request(app)
      .post("/api/reset-password")
      .send({ token: validToken, newPassword: "newpassword123" })
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe("Password updated successfully.");
      });
  });

  test("Status 400: returns error with invalid token", () => {
    return request(app)
      .post("/api/reset-password")
      .send({ token: "notavalidtoken", newPassword: "newpassword123" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Reset link is invalid or has expired.");
      });
  });

  test("Status 400: returns error with expired token", () => {
    const jwt = require("jsonwebtoken");
    const expiredToken = jwt.sign({ user_id: 1 }, process.env.JWT_SECRET, {
      expiresIn: "0s",
    });

    return request(app)
      .post("/api/reset-password")
      .send({ token: expiredToken, newPassword: "newpassword123" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Reset link is invalid or has expired.");
      });
  });
});
