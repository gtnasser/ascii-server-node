const fs = require('fs')
const path = require('path')
const express = require("express")
const { WebSocketServer } = require('ws')

// Repositório local
const local = path.join(__dirname, 'public')

// Parâmetros de exibição 
const LINES_PER_FRAME = parseInt(process.env.LINES_PER_FRAME) || 6
const FRAMES_PER_SECOND = parseInt(process.env.FRAMES_PER_SECOND) || 2 // obs: FRAME_INTERVAL = 1000 / FPS
const FILENAME = process.env.FILENAME || 'frames.ascii'

console.log(`LINES_PER_FRAME = ${LINES_PER_FRAME}`)
console.log(`FRAMES_PER_SECOND = ${FRAMES_PER_SECOND}`)
console.log(`FILENAME = ${FILENAME}`)

// Porta Web
const PORT = process.env.PORT || 3000

// Carrega frames ASCII
const asciiFile = path.join(local, FILENAME)
const raw = fs.readFileSync(asciiFile, 'utf8')

// Quebra em linhas
const linhas = raw.split('\n')
console.log(`linhas:${linhas.length}`);

// Agrupa linhas em frames
const frames = []
for (let i = 0; i < linhas.length; i += LINES_PER_FRAME) {
  frame = linhas.slice(i, i + LINES_PER_FRAME).join('\n')
  console.log(`${i}, ${i + LINES_PER_FRAME}, ${frame.length}`);
  frames.push(frame)
//  console.log(`${i}\n${frame}`);
}
console.log(`linhas:${linhas.length}, frames:${frames.length}`);


// Servidor Web
const app = express();

// Rota principal diferenciando navegador/curl
app.get('/', (req, res) => {
  const ua = req.headers['user-agent'] || '';
  console.log(`ua: ${ua}`);
  if (ua.includes('curl')) {
    res.type('text/plain');
    res.send("Use /stream para ver animação em tempo real via curl.\n");
  } else {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  }
});

// Rota SSE para streaming contínuo
app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  console.log('Navegador conectado.');

  let i = 0;
  const timer = setInterval(() => {
    const frame = frames[i % frames.length];
    res.write(`${frame}\n`);
    i++;
  }, (1000 / FRAMES_PER_SECOND) );

  req.on('close', () => {
    clearInterval(timer);
    console.log('Navegador desconectado.');
  });
});

// Executa o servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`Servidor HTTP em http://localhost:${PORT}`)
});

// WebSocket e eventos início/fim da conexão
const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
  console.log('Cliente conectado.');
  ws.send(JSON.stringify({ type: 'meta', fps: FRAMES_PER_SECOND, totalFrames: frames.length }));

  let i = 0;
  const timer = setInterval(() => {
    if (ws.readyState !== ws.OPEN) {
      clearInterval(timer);
      return;
    }
    const frame = frames[i % frames.length];
    ws.send(JSON.stringify({ type: 'frame', data: frame }));
    i++;
  }, (1000 / FRAMES_PER_SECOND) );

  ws.on('close', () => {
    clearInterval(timer);
    console.log('Cliente desconectado.');
  });
});


