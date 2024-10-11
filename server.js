const http = require("http");
const mysql = require("mysql");
const url = require("url");
require('dotenv').config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

const db = mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPass, // Change this to your MySQL password
    // Do not specify the database here
});
  
// Create the database and the table if they don't exist
db.connect((err) => {
if (err) throw err;
console.log("Connected to MySQL");

    // Create the database if it doesn't exist
    db.query("CREATE DATABASE IF NOT EXISTS patients_db", (err, result) => {
        if (err) throw err;
        console.log("Database created or already exists");

        // Switch to the new database
        db.changeUser({ database: "patients_db" }, (err) => {
        if (err) throw err;

        // Create table if it doesn't exist
        const createTableQuery = `
                    CREATE TABLE IF NOT EXISTS patient (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255),
                        dob DATE
                    ) ENGINE=InnoDB;
                `;
        db.query(createTableQuery, (err, result) => {
            if (err) throw err;
            console.log("Table created or already exists");
        });
        });
    });
});

// Start HTTP server
http
  .createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    if (req.method === "POST" && path === "/insert") {
      // Insert dummy patient data into the table
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        const data = JSON.parse(body);
        const query = `INSERT INTO patient (name, dob) VALUES (?, ?)`;
        db.query(query, [data.name, data.dob], (err, result) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error inserting data.");
            return;
          }
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(`Inserted row with ID: ${result.insertId}`);
        });
      });
    } else if (req.method === "POST" && path === "/query") {
      // Handle POST query requests (only INSERT queries)
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        const data = JSON.parse(body);
        const query = data.sql;
        if (query.toLowerCase().startsWith("insert")) {
          db.query(query, (err, result) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Error executing query.");
              return;
            }
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Query executed successfully.");
          });
        } else {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Only INSERT queries are allowed.");
        }
      });
    } else if (req.method === "GET" && path === "/query") {
      // Handle GET query requests (only SELECT queries)
      const query = parsedUrl.query.sql;
      if (query.toLowerCase().startsWith("select")) {
        db.query(query, (err, result) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error executing query.");
            return;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        });
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Only SELECT queries are allowed.");
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found.");
    }
  })
  .listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
