import { Router, Request, Response } from "express";
import NodeCache from "node-cache";

import dbPool from "../database";

import Letter from "../models/Letter";
import Word from "../models/Word";

const router = Router();
const cache = new NodeCache({ stdTTL: 5 * 60, deleteOnExpire: true });

const createRandomWord = () => {
  dbPool.query(
    "SELECT word AS word FROM words WHERE used = false ORDER BY RANDOM() LIMIT 1;",
    (error, result) => {
      if (error) {
        throw error;
      }

      if (result.rows.length > 0) {
        const newRandomWord = result.rows[0].word as string;
        cache.set("currentWord", newRandomWord);

        dbPool.query(
          "UPDATE words SET used = true WHERE word = $1",
          [newRandomWord],
          (error) => {
            if (error) {
              throw error;
            }
          }
        );

        console.log("Random word -> ", cache.get("currentWord"));
      } else {
        console.error("There are no word available");
      }
    }
  );
};

const checkWord = async (
  userWord: string,
  currentWord: string,
  userId: number
): Promise<Letter[]> => {
  let letters: Letter[] = [];
  const checkedWord =
    (await dbPool.query("SELECT word FROM words WHERE word = $1", [userWord]))
      .rowCount > 0;

  if (checkedWord) {
    const currentWordLetters: string[] = currentWord.split("");
    const userWordLetters: string[] = userWord.split("");

    letters = userWordLetters.map((letter: string, i: number) => {
      let letterValue: number = 0;
      const letterIndex: number = currentWordLetters.indexOf(letter);

      if (letterIndex >= 0) {
        if (letter === currentWordLetters[i]) {
          letterValue = 1;
        } else {
          const countLetters: number = currentWordLetters.filter(
            (currentWordLetter) => currentWordLetter === letter
          ).length;
          const countLettersUser: number = userWordLetters.filter(
            (userLetter) => userLetter === letter
          ).length;

          if (countLetters >= countLettersUser) {
            letterValue = 2;
          } else {
            currentWordLetters[i] = "-";
          }
        }
      }

      return { letter: letter, value: letterValue };
    });

    if (letters.filter((letter) => letter.value === 1).length === 5) {
      userWins(currentWord, userId);
    } else {
      insertUserAttempt(currentWord, userId);
    }
  }

  return letters;
};

const checkUserAttemps = async (
  word: string,
  userId: number
): Promise<number> => {
  const userAttempsQueryResult = await dbPool.query(
    "SELECT attempts FROM words_attempts WHERE word = $1 AND user_id = $2",
    [word, userId]
  );
  let userAttemps = 0;

  if (userAttempsQueryResult.rowCount > 0) {
    userAttemps = Number(userAttempsQueryResult.rows[0].attempts);
  } else {
    dbPool.query(
      "INSERT INTO words_attempts (word, user_id, attempts) VALUES ($1, $2, $3)",
      [word, userId, userAttemps],
      (error) => {
        if (error) {
          throw error;
        }
      }
    );
  }

  return userAttemps;
};

const insertUserAttempt = (word: string, userId: number) => {
  dbPool.query(
    "UPDATE words_attempts SET attempts = attempts + 1 WHERE word = $1 AND user_id = $2",
    [word, userId],
    (error) => {
      if (error) {
        throw error;
      }
    }
  );
};

const insertUserPlayed = (userId: number) => {
  dbPool.query(
    "UPDATE users SET played = played + 1 WHERE user_id = $1",
    [userId],
    (error) => {
      if (error) {
        throw error;
      }
    }
  );
};

const userWins = (word: string, userId: number) => {
  dbPool.query(
    "UPDATE words_attempts SET attempts = 10 WHERE word = $1 AND user_id = $2",
    [word, userId],
    (error) => {
      if (error) {
        throw error;
      }
    }
  );

  dbPool.query(
    "UPDATE users SET wins = wins + 1, played = played + 1 WHERE user_id = $1",
    [userId],
    (error) => {
      if (error) {
        throw error;
      }
    }
  );

  dbPool.query(
    "UPDATE words SET guesses = guesses + 1 WHERE word = $1",
    [word],
    (error) => {
      if (error) {
        throw error;
      }
    }
  );
};

const getTopWords = async (size: number): Promise<Word[]> => {
  return (
    await dbPool.query(
      "SELECT word, guesses FROM words WHERE guesses > 0 ORDER BY guesses DESC LIMIT $1",
      [size]
    )
  ).rows as Word[];
};

router.get("/currentWord", async (req: Request, res: Response) => {
  try {
    const currentWord: string | undefined = cache.get("currentWord");
    res.status(200).json({ word: currentWord });
  } catch (error) {
    res.status(500).json({ error: "SERVER INTERNAL ERROR" });
    throw error;
  }
});

router.post("/checkWord", async (req: Request, res: Response) => {
  try {
    const userWord: string = req.body.userWord;
    const currentWord: string = cache.get("currentWord") as string;
    console.log("User input word -> ", userWord);

    const userAttemps = await checkUserAttemps(currentWord, 0);

    if (userAttemps < 5) {
      if (/^[a-zA-ZÁÉÍÓÚÑáéíóúñ]{5}$/.test(userWord)) {
        const wordChecked: Letter[] = await checkWord(
          userWord.toUpperCase(),
          currentWord,
          0
        );

        if (wordChecked.length === 5) {
          res.status(200).json(wordChecked);
        } else {
          res
            .status(400)
            .json({ error: "La palabra no existe en el diccionario" });
        }
      } else {
        res.status(400).json({
          error:
            "Bad request: La palabra debe ser de 5 caracteres y no debe contener caracteres especiales ni números.",
        });
      }
    } else {
      let message = "";

      if (userAttemps === 5) {
        insertUserPlayed(0);
        message = "Se han agotado los 5 intentos disponibles";
      } else if (userAttemps === 10) {
        message = "Ya has acertado la palabra actual";
      }

      res.status(200).json({ message: message });
    }
  } catch (error) {
    res.status(500).json({ error: "SERVER INTERNAL ERROR" });
    throw error;
  }
});

router.get("/getTopWords/:size", async (req: Request, res: Response) => {
  const size: number = Number(req.params.size);

  try {
    if (!Number.isNaN(size)) {
      const topWords: Word[] = await getTopWords(size);
      res.status(200).json(topWords);
    } else {
      res
        .status(400)
        .json({ error: "El parámetro de búsqueda debe ser un número" });
    }
  } catch (error) {
    res.status(500).json({ error: "SERVER INTERNAL ERROR" });
    throw error;
  }
});

export default router;
export { createRandomWord };
