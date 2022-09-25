import { sign, Secret, SignOptions, verify, VerifyOptions } from "jsonwebtoken";
import * as fs from "fs";

import User from "../models/User";
import TokenPayload from "../models/TokenPayload";

const generateToken = (user: User) => {
  const payload: TokenPayload = {
    userId: user.userId,
    name: user.name,
    accessTypes: [
      "currentWord",
      "checkWord",
      "getTopWords",
      "getUserData",
      "getTopTenUsers",
    ],
  };

  const privateKey: Secret = {
    key: fs.readFileSync("private.pem"),
    passphrase: "wordle",
  };

  const signOptions: SignOptions = {
    algorithm: "RS256",
    expiresIn: "1h",
  };

  return sign(payload, privateKey, signOptions);
};

const validateToken = async (token: string): Promise<TokenPayload> => {
  const publicKey = fs.readFileSync("public.pem");
  const verifyOptions: VerifyOptions = {
    algorithms: ["RS256"],
  };

  return new Promise((resolve, reject) => {
    verify(token, publicKey, verifyOptions, (error, decoded) => {
      if (error) {
        return reject(error);
      }

      resolve(decoded as TokenPayload);
    });
  });
};

export { generateToken, validateToken };
