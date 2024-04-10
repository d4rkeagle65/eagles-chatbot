const { Pool } = require("pg");
const path = require("path");
const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const pgdb = process.env.DATABASE;
const pguser = process.env.PGUSER;
const pgpass = process.env.PGPASS;

const pool = new Pool({
	user: pguser,
	database: pgdb,
	password: pgpass,
	port: 5432,
	host: 'localhost',
	max: 20,
});

module.exports = { 
	pool: pool
};
