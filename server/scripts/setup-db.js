const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("../tracks.db", (err) => {
    if(err){
        return console.error(err.message);
    }

    console.log("Connected to SQLite DB!");

    db.exec("CREATE TABLE IF NOT EXISTS tracks (id VARCHAR(255), name VARCHAR(255))");
    console.log("Created table tracks!");
});
