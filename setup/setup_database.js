const path = require("path");
const dotenv = require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const db = require(path.join(__dirname, "..", "backend", "database", "db.js"));

async function dropTable(table) {
	return new Promise(async resolve => {
		console.log("Dropping Database Table:[" + table + "]");
		await db.pool.query("DROP TABLE " + table).then( () => {
			resolve();
		}).catch( () => {
			resolve()
		});
	});
}

async function dbSetup() {
	return new Promise(async resolve => {
		await dropTable("bsractive");
		await dropTable("bsrpending");
		await dropTable("userlist");
		await dropTable("bsrsettings");

		console.log("Creating bsractive Table");
		await db.pool.query(`CREATE TABLE bsractive (
					req_id serial PRIMARY KEY, 
					oa NUMERIC, 
					ob NUMERIC, 
					od NUMERIC GENERATED ALWAYS AS (oa / ob) STORED, 
					bsr_code VARCHAR (10) NOT NULL,
					bsr_req VARCHAR (25),
					bsr_req_here BOOL,
					bsr_name VARCHAR (2048),
					bsr_ts TIMESTAMPTZ,
					bsr_length INTEGER,
					bsr_note VARCHAR (2048),
					sus_remap BOOL,
					sus_skip BOOL)`);

		console.log("Creating bsrpending Table");
		await db.pool.query(`CREATE TABLE bsrpending (
					req_id serial PRIMARY KEY,
					req_att BOOL NOT NULL,
					bsr_code VARCHAR (10) NOT NULL,
					bsr_req VARCHAR (25),
					bsr_ts TIMESTAMP NOT NULL,
					bsr_note VARCHAR (2048))`);

		console.log("Creating userlist Table");
		await db.pool.query(`CREATE TABLE userlist (
					id serial PRIMARY KEY,
					user_username VARCHAR (25) NOT NULL,
					user_type VARCHAR (30),
					user_joints TIMESTAMP NOT NULL,
					user_lastactivets TIMESTAMP,
					user_lurk BOOL)`);

		console.log("Creating bsrsettings Table");
		await db.pool.query(`CREATE TABLE bsrsettings (
					id serial PRIMARY KEY,
					setting_name VARCHAR (25) NOT NULL,
					setting_value VARCHAR (2048))`);

		console.log("Adding queue_state Setting to bsrsettings Table");
		await db.pool.query("INSERT INTO bsrsettings (setting_name,setting_value) VALUES('queue_state','closed')");

		console.log("Adding queue_sync Setting to bsrsettings Table");
		await db.pool.query("INSERT INTO bsrsettings (setting_name,setting_value) VALUES('queue_sync','true')");

		console.log("Adding bsractive INSERT Notification");
		await db.pool.query(`CREATE OR REPLACE FUNCTION notify_bsractive()
				     	RETURNS trigger 
					LANGUAGE plpgsql
				     AS $function$
				     BEGIN
				       PERFORM pg_notify('new_bsractive', row_to_json(NEW)::text );
				       RETURN NULL;
				     END;
				     $function$`);
		await db.pool.query(`CREATE TRIGGER updated_bsractive_trigger AFTER INSERT ON bsractive
				        FOR EACH ROW EXECUTE PROCEDURE notify_bsractive();`);
		resolve();
	});
}

dbSetup().then( () => {
	process.exit();
});
