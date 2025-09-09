const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Helpers
function hojeBR() {
  return new Date().toLocaleDateString("pt-BR");
}

// Rotas
app.get("/", (req, res) => {
  res.render("index");
});

// ---------- Chamados ----------
app.get("/chamados", (req, res) => {
  db.all("SELECT * FROM chamados ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).send("Erro ao listar chamados");
    res.render("chamados", { chamados: rows });
  });
});

app.get("/chamados/novo", (req, res) => {
  res.render("chamado_form");
});

app.post("/chamados", (req, res) => {
  const { titulo, descricao, solicitante, telefone } = req.body;
  const dataAbertura = hojeBR();
  const stmt = db.prepare("INSERT INTO chamados (titulo, descricao, solicitante, telefone, dataAbertura) VALUES (?, ?, ?, ?, ?)");
  stmt.run([titulo, descricao, solicitante, telefone, dataAbertura], (err) => {
    if (err) return res.status(500).send("Erro ao abrir chamado");
    res.redirect("/chamados");
  });
});

app.post("/chamados/delete/:id", (req, res) => {
  db.run("DELETE FROM chamados WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Erro ao excluir chamado");
    res.redirect("/chamados");
  });
});

// ---------- Estoque ----------
app.get("/estoque", (req, res) => {
  const { q } = req.query;
  let sql = "SELECT * FROM estoque";
  const params = [];
  if (q) {
    sql += " WHERE nome LIKE ?";
    params.push(`%${q}%`);
  }
  sql += " ORDER BY id DESC";
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).send("Erro ao listar estoque");
    res.render("estoque", { itens: rows, q: q || "" });
  });
});

app.post("/estoque/add", (req, res) => {
  const { nome, descricao, quantidade } = req.body;
  const qtd = parseInt(quantidade || "0", 10);
  const dataEntrada = hojeBR();
  const status = qtd > 0 ? "Disponível" : "Indisponível";
  const stmt = db.prepare("INSERT INTO estoque (nome, descricao, quantidade, dataEntrada, status) VALUES (?, ?, ?, ?, ?)");
  stmt.run([nome, descricao, qtd, dataEntrada, status], (err) => {
    if (err) return res.status(500).send("Erro ao adicionar item");
    res.redirect("/estoque");
  });
});

app.post("/estoque/update/:id", (req, res) => {
  const qtd = parseInt(req.body.quantidade || "0", 10);
  const status = qtd > 0 ? "Disponível" : "Indisponível";
  db.run("UPDATE estoque SET quantidade = ?, status = ? WHERE id = ?", [qtd, status, req.params.id], (err) => {
    if (err) return res.status(500).send("Erro ao atualizar item");
    res.redirect("/estoque");
  });
});

app.post("/estoque/delete/:id", (req, res) => {
  db.run("DELETE FROM estoque WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Erro ao excluir item");
    res.redirect("/estoque");
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
