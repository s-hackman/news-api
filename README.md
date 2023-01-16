**You can clone this repository by:**

## Getting Started

## Step 1 - Setting up your own repository

Clone this repo:

```bash
git clone https://github.com/northcoders/be-nc-news

cd be-nc-news
```

`cd` into the directory then run `npm install`.

## Step 2 - Setting up your env files

You will need to create two .env files for your project: `.env.test` and `.env.development`.

Into each, add `PGDATABASE=<database_name_here>`, with the correct database name for that environment (see `/db/setup.sql` for the database names).

Double check that these `.env files` are .gitignored.

Run in the terminal to initialise the databases and seed the development database.

```bash
npm run setup-dbs

npm run seed
```
