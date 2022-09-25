import { Router, Request, Response } from "express";

import dbPool from "../database";
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

const logInUser = async (userAccount: UserAccount): Promise<User> => {
  let userLoggedIn: User = { userId: -1, name: "" };

  try {
    const logIn = await dbPool.query(
      "SELECT user_id, name FROM users WHERE name = $1 AND password IS NOT NULL AND password = crypt($2, password)",
      [userAccount.name, userAccount.password]
    );

    if (logIn.rowCount === 1) {
      userLoggedIn = logIn.rows[0] as User;
    }
  } catch (error) {
    console.error(error);
  }

  return userLoggedIn;
};

const getUserData = async (userName: string): Promise<User> => {
  return (
    await dbPool.query(
      "SELECT user_id, name, played, wins FROM users WHERE name = $1",
      [userName]
    )
  ).rows[0] as User;
};

const getTopTenUsers = async (): Promise<User[]> => {
  return (
    await dbPool.query(
      "SELECT user_id, name, wins FROM users ORDER BY wins DESC LIMIT 10"
    )
  ).rows as User[];
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
        const userLoggedIn: User = await logInUser(userAccount);

        if (userLoggedIn.userId !== -1 && userLoggedIn.name !== "") {
          res.status(200).json({ message: "Inicio de sesión exitoso" });
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

router.get("/getUserData/:userName", async (req: Request, res: Response) => {
  const userName: string = req.params.userName;

  try {
    if (userName && userName !== null && userName !== "") {
      const userData: User = await getUserData(userName);
      res.status(200).json(userData);
    } else {
      res.status(400).json({ error: "El nombre del usuario es inválido" });
    }
  } catch (error) {
    res.status(500).json({ error: "SERVER INTERNAL ERROR" });
    throw error;
  }
});

router.get("/getTopTenUsers", async (req: Request, res: Response) => {
  try {
    const topTenUsers: User[] = await getTopTenUsers();

    res.status(200).json(topTenUsers);
  } catch (error) {
    res.status(500).json({ error: "SERVER INTERNAL ERROR" });
    throw error;
  }
});

export default router;
