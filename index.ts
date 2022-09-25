import express, { Express } from "express";
import dotenv from "dotenv";
import helmet from "helmet";

import createDictionary from "./controllers/dictionary";
import UsersAccountsRouter from "./controllers/usersAccounts";
import WordsRouter, { createRandomWord } from "./controllers/words";
import UsersRouter from "./controllers/users";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(helmet());

app.use("/userAccount", UsersAccountsRouter);
app.use("/words", WordsRouter);
app.use("/users", UsersRouter);

app.listen(port, () => {
  console.log(`server -> Server is listening in port ${port}`);
  createDictionary()
    .then(() => {
      createRandomWord();
      setInterval(createRandomWord, 5 * 60 * 1000); //minutes * seconds * milliseconds
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
});
