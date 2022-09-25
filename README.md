# Wordle backend

In this project the Wordle's backend has been developed.

## Description

This project is a dummy version of the Wordle's backend, where it's intented that any user that follows the required installion can use it.

## Installation

The project requires a Postgresql database installation. The required database installation can be found in postgresql-installation.sql.

In addition, you have to install the required modules:

```bash
npm install
```

## Execution

Since this is a Typescript project, first you have to build it:

```bash
npm run build
```

After the build was completed, you can start the server with:

```bash
npm run start
```

If you want to run the server in development mode, watching changes and building for Typescript automatically you can use:

```bash
npm run dev
```

# Unit tests

Some unit tests were created for the main services. If you want to run the unit test you can use:

```bash
npm run test:unit
```

## Notes

The .env, private.pem and public.pem files shouldn't have been added in the repository, but for testing purposes and to be able to run it easily, they were added. So, if you want to use this project in a production environment add those files in the .gitignore file and generate them separately and according to your data and configurations.

## Created by

Andrés Bedolla
