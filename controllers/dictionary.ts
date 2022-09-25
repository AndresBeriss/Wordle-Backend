/***
 * Script for generate Dictonary of words provided in https://gitlab.com/d2945/words/-/raw/main/words.txt
 */
import https from "https";
import fs from "fs";
import readline from "readline";

import dbPool from "../database";

const createDictionary = async () => {
  return new Promise((resolve, reject) => {
    dbPool.query(
      "SELECT COUNT(word) AS wordscount FROM words",
      (error, result) => {
        if (error) {
          reject("Error while checking dictionary in database");
          throw error;
        }

        const wordsCount = Number(result.rows[0].wordscount);

        if (wordsCount <= 0) {
          if (!fs.existsSync("dictionary.txt")) {
            console.log("Creating dictionary file...");

            https.get(
              "https://gitlab.com/d2945/words/-/raw/main/words.txt",
              (res) => {
                res
                  .pipe(fs.createWriteStream("dictionary.txt"))
                  .on("finish", insertDictionaryIntoDB);
              }
            );
          } else {
            insertDictionaryIntoDB();
          }
        }

        resolve(true);
      }
    );
  });
};

const insertDictionaryIntoDB = () => {
  console.log("Inserting words into database...");

  const readlineFile = readline.createInterface({
    input: fs.createReadStream("dictionary.txt"),
  });

  readlineFile.on("line", (word: string) => {
    word = word.trim();

    if (/^[a-záéíóúñ]{5}$/.test(word)) {
      try {
        dbPool.query(
          "INSERT INTO words (word, used, guesses) VALUES ($1, $2, $3)",
          [word.toUpperCase(), false, 0]
        );
      } catch (error) {
        console.error(error);
      }
    }
  });
};

export default createDictionary;
