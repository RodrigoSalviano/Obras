const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const db = new sqlite3.Database(path.join(__dirname, "db.sqlite"));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    quantidade INTEGER NOT NULL DEFAULT 0,
    dataEntrada TEXT,
    status TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS chamados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    solicitante TEXT,
    telefone TEXT,
    dataAbertura TEXT
  )`);
});

module.exports = db;
