const fs = require('fs')
const path = require('path')
const express = require("express");

// repositorio local
const public = path.join(__dirname, 'public')

// Linhas por frame 
const LPF = process.env.LPF || 6
// Porta Web
const PORT = process.env.PORT || 3000;

// Carrega frames ASCII
const asciiFile = path.join(public, 'frames.ascii')
const raw = fs.readFileSync(asciiFile, 'utf8')

// Quebra em linhas
const linhas = raw.split('\n');

// Agrupa linhas em frames
const frames = [];
for (let i = 0; i < linhas.length; i += LPF) {
  frame = linhas.slice(i, i + LPF).join('\n')
  frames.push(frame)
  console.log(`#${i}\n${frame}`)
}
console.log(`Total de frames carregados: ${frames.length}`)

// Servidor Web
const app = express();

// publica pagina estatica
app.use(express.static(public));

const server = app.listen(PORT, () => {
  console.log(`Servidor HTTP em http://localhost:${PORT}`);
});


