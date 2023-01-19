## Background

This project is a Node.js Express application using a RESTful API to serve data from a PSQL database.

A hosted version of this project can be found [here](https://shisho-news-api.onrender.com/api)

## Getting Started

### Prerequisites

This project requires [npm](https://www.npmjs.com/get-npm) (v19.1.0 or newer), [PostgreSQL](https://www.postgresql.org/) (v12.12 or newer) to run. Install if necessary.

## Step 1 - Setting up your own repository

Clone this repo:

```bash
git clone https://github.com/${username}/news-api.git

cd news-api
```

Run the following command in your terminal to install the project's dependencies:

```bash
npm install
```

## Step 2 - Setting up your env files

You will need to create two .env files for your project: `.env.test` and `.env.development`.

Into each, add `PGDATABASE=<database_name_here>`, with the correct database name for that environment (see `/db/setup.sql` for the database names).

Double check that these `.env files` are .gitignored.

## Step 3 - Setting up your database

Run in the terminal to initialise the databases and seed the development database.

```bash
npm run setup-dbs

npm run seed
```

Now the server can be ran locally. To do this, use the following command:

```bash
npm start
```

The server is now listening for requests on port 9090 (can be changed in listen.js).

## Routes

A list of available endpoints with descriptions can be seen in the endpoints.json file. Alternatively, once the server is listening this file can be seen by making a GET request to '/api'

---
