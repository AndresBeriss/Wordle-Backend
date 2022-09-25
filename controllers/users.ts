import { Router, Request, Response } from "express";

import dbPool from "../database";

import User from "../models/User";
import { authorize } from "./auth";

const router = Router();

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

router
  .route("/getUserData/:userName")
  .get(authorize(["getUserData"]), async (req: Request, res: Response) => {
    const userName: string = req.params.userName;

    try {
      if (userName && userName !== null && userName !== "") {
        const userData: User = await getUserData(userName);
        res.status(200).json(userData);
      } else {
        res.status(400).json({ error: "El nombre del usuario es inválido" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server internal error" });
      throw error;
    }
  });

router
  .route("/getTopTenUsers")
  .get(authorize(["getTopTenUsers"]), async (req: Request, res: Response) => {
    try {
      const topTenUsers: User[] = await getTopTenUsers();

      res.status(200).json(topTenUsers);
    } catch (error) {
      res.status(500).json({ error: "Server internal error" });
      throw error;
    }
  });

export default router;
