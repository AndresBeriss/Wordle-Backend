import request from "supertest";
import { Express } from "express";

import Server from "../../index";

let server: Express;
let token: string;

beforeAll(async () => {
  server = Server;
  token = (
    await request(server).post("/userAccount/login").send({
      name: "USER TEST",
      password: "passwordtest",
    })
  ).body.token;
});

describe("Users tests", () => {
  it("GET /users/getUserData/:userName should return the data of that user", async () => {
    const res = await request(server)
      .get("/users/getUserData/USER TEST")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    if (res.body.message) {
      expect(res.body.message).toEqual("No existe un usuario con ese nombre");
    } else {
      expect(res.body).toHaveProperty("name");
      expect(res.body).toHaveProperty("played");
      expect(res.body).toHaveProperty("wins");
    }
  });

  it("GET /users/getTopTenUsers should return a list with the top ten users", async () => {
    const res = await request(server)
      .get("/users/getTopTenUsers")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);

    if (res.body.length && res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("userId");
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0]).toHaveProperty("wins");
    }
  });
});
