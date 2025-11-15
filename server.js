const fs = require('fs')
const path = require('path')

// Linhas por frame 
const LPF = process.env.LPF || 6

// Carrega frames ASCII
const asciiFile = path.join(process.cwd(), 'public', 'frames.ascii')
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


