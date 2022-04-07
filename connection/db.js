const { Pool } = require("pg"); //import postgre
const { password } = require("pg/lib/defaults");

const isProduction = process.env.NODE_ENV === "production";

let dbPool;

if (isProduction) {
  dbPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  dbPool = new Pool({
    database: "dbproject",
    port: 5432,
    user: "postgres",
    password: "root",
  });
}
module.exports = dbPool;

// const dbPool = new Pool ({

//     database: "dbproject",
//     port:5432,
//     user:"postgres",
//     password:"root"
// })

// module.exports = dbPool
