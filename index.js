const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
 
const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "fogado",
})
 
app.get("/", (req, res) => {
    res.send("Fut a backend!");
});
 
app.get('/szobak', (req, res) => {
    const sql = "SELECT sznev, agy, potagy FROM szobak";
    db.query(sql, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Adatbázis hiba történt!' });
        }
        res.status(200).json(results);
    });
});
 
app.get('/foglalasok', (req, res) => {
    const sql = `SELECT szobak.sznev, COUNT(foglalasok.vendeg) vendegek, SUM(DATEDIFF(foglalasok.tav, foglalasok.erk)) vendegejszakak
                 FROM szobak
                 LEFT JOIN foglalasok ON szobak.szazon = foglalasok.szoba
                 GROUP BY szobak.sznev
                 ORDER BY vendegejszakak ASC, vendegek ASC`;
 
    db.query(sql, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Adatbázis hiba történt!' });
        }
        res.status(200).json(results);
    });
});
 
app.get('/foglaltsag/:szazon', (req, res) => {
    const { szazon } = req.params;
    const sql = `SELECT vendegek.vnev, foglalasok.erk, foglalasok.tav
                 FROM foglalasok
                 JOIN vendegek ON foglalasok.vendeg = vendegek.vsorsz
                 WHERE foglalasok.szoba = ?
                 ORDER BY vendegek.vnev ASC`;
 
    db.query(sql, [szazon], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Adatbázis hiba történt!' });
        }
        res.status(200).json(results);
    });
});
 
app.listen(3001, () => {
    console.log("Szerver fut a 3001-es porton");
});