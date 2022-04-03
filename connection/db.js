const {Pool} = require("pg") //import postgre
const { password } = require("pg/lib/defaults")

const dbPool = new Pool ({

    database: "dbproject",
    port:5432,
    user:"postgres",
    password:"root"
})

module.exports = dbPool 