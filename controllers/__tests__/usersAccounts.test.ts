import request from "supertest";
import { Express } from "express";

import Server from "../../index";

let server: Express;

beforeAll(async () => {
  server = Server;
});

describe("User accounts tests", () => {
  it("POST /userAccount/signUp should create a new user", async () => {
    const res = await request(server)
      .post("/userAccount/signUp")
      .send({
        name: "USER TEST",
        password: "passwordtest",
      })
      .expect(201);

    expect(res.body.message).toEqual("Usuario creado exitosamente");
  });

  it("POST /userAccount/logIn should log in the user", async () => {
    const res = await request(server)
      .post("/userAccount/login")
      .send({
        name: "USER TEST",
        password: "passwordtest",
      })
      .expect(200);

    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("token");
    expect(res.body.message).toEqual("Inicio de sesión exitoso");
  });
});
