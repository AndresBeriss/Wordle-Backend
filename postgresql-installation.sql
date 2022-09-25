CREATE DATABASE wordle
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE TABLE IF NOT EXISTS words (
	word CHAR(5) CHECK ( LENGTH(word) = 5 ) NOT NULL PRIMARY KEY,
	used BOOLEAN NOT NULL,
	guesses INTEGER CHECK ( guesses >= 0 ) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
	user_id SERIAL NOT NULL PRIMARY KEY,
	name TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	played INTEGER CHECK ( played >= 0 ) NOT NULL,
	wins INTEGER CHECK ( wins >= 0 ) NOT NULL
);

CREATE TABLE IF NOT EXISTS words_attempts (
	word CHAR(5) NOT NULL,
	user_id INTEGER NOT NULL,
	attempts INTEGER CHECK ( attempts >= 0 ) NOT NULL,
	PRIMARY KEY (word, user_id),
	FOREIGN KEY (word) REFERENCES words(word),
	FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE EXTENSION pgcrypto;

CREATE ROLE wordle WITH LOGIN PASSWORD 'wordle';

GRANT ALL PRIVILEGES ON words, users, words_attempts TO wordle;
GRANT USAGE, SELECT ON SEQUENCE users_user_id_seq TO wordle; 