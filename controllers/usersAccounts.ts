import { Router, Request, Response } from "express";

import dbPool from "../database";
import { generateToken } from "../utils/jwt";

import UserAccount from "../models/UserAccount";
import User from "../models/User";

const router = Router();

const signUpUser = async (newUser: UserAccount): Promise<boolean> => {
  let signedUpSuccesfully = false;

  try {
    const signUp = await dbPool.query(
      "INSERT INTO users (name, password, played, wins) VALUES ($1, crypt($2, gen_salt('bf')), 0, 0)",
      [newUser.name, newUser.password]
    );

    if (signUp.rowCount === 1) {
      signedUpSuccesfully = true;
    }
  } catch (error) {
    console.error(error);
  }

  return signedUpSuccesfully;
};

const logInUser = async (userAccount: UserAccount): Promise<string> => {
  let token: string = "";

  try {
    const logIn = await dbPool.query(
      "SELECT user_id, name FROM users WHERE name = $1 AND password IS NOT NULL AND password = crypt($2, password)",
      [userAccount.name, userAccount.password]
    );

    if (logIn.rowCount === 1) {
      token = generateToken(logIn.rows[0] as User);
    }
  } catch (error) {
    console.error(error);
  }

  return token;
};

router.post("/signUp", async (req: Request, res: Response) => {
  const newUser: UserAccount = req.body;

  if (newUser.name && newUser.name !== null && newUser.name !== "") {
    if (
      newUser.password &&
      newUser.password !== null &&
      newUser.password !== ""
    ) {
      try {
        const signedUpSuccesfully: boolean = await signUpUser(newUser);

        if (signedUpSuccesfully) {
          res.status(100).json({ message: "Usuario creado exitosamente" });
        } else {
          res
            .status(500)
            .json({ error: "Ya existe un usuario con ese nombre" });
        }
      } catch (error) {
        res.status(500).json({ error: "SERVER INTERNAL ERROR" });
        throw error;
      }
    } else {
      res.status(400).json({ error: "Falta parámetro de contraseña" });
    }
  } else {
    res.status(400).json({ error: "Falta parámetro de nombre" });
  }
});

router.post("/logIn", async (req: Request, res: Response) => {
  const userAccount: UserAccount = req.body;

  if (
    userAccount.name &&
    userAccount.name !== null &&
    userAccount.name !== ""
  ) {
    if (
      userAccount.password &&
      userAccount.password !== null &&
      userAccount.password !== ""
    ) {
      try {
        const token: string = await logInUser(userAccount);

        if (token !== "") {
          res
            .status(200)
            .json({ message: "Inicio de sesión exitoso", token: token });
        } else {
          res.status(500).json({ error: "Nombre o contraseña incorrecta" });
        }
      } catch (error) {
        res.status(500).json({ error: "Server internal error" });
        throw error;
      }
    } else {
      res.status(400).json({ error: "Falta parámetro de contraseña" });
    }
  } else {
    res.status(400).json({ error: "Falta parámetro de nombre" });
  }
});

export { signUpUser, logInUser };
export default router;
