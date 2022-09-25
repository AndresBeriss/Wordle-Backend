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

describe("Words tests", () => {
  it("GET /words/currentWord should return the current random word", async () => {
    const res = await request(server)
      .get("/words/currentWord")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty("word");
  });

  it("POST /words/checkWord should check word according to the current random word", async () => {
    const currentWord: string = (
      await request(server)
        .get("/words/currentWord")
        .set("Authorization", `Bearer ${token}`)
    ).body.word;

    const firstRes = await request(server)
      .post("/words/checkWord")
      .set("Authorization", `Bearer ${token}`)
      .send({ userWord: currentWord })
      .expect(200);

    if (firstRes.body.length) {
      expect(
        currentWord.split("").map((letter: string) => {
          return { letter: letter, value: 1 };
        })
      ).toEqual(firstRes.body);
    }

    const secondRes = await request(server)
      .post("/words/checkWord")
      .set("Authorization", `Bearer ${token}`)
      .send({ userWord: "NADAR" })
      .expect(200);

    if (secondRes.body.length) {
      expect(secondRes.body.length).toEqual(5);
      expect(secondRes.body[0]).toHaveProperty("letter");
      expect(secondRes.body[0]).toHaveProperty("value");
    } else {
      expect([
        "Se han agotado los 5 intentos disponibles",
        "Ya has acertado la palabra actual",
      ]).toContain(secondRes.body.message);
    }
  });

  it("POST /words/getTopWords/:size should get top of words according to size", async () => {
    const res = await request(server)
      .get("/words/getTopWords/10")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);

    if (res.body.length && res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("word");
      expect(res.body[0]).toHaveProperty("guesses");
    }
  });
});
