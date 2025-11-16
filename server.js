const fs = require('fs')
const path = require('path')
const express = require("express")

// repositorio local
const local = path.join(__dirname, 'public')

// Linhas por frame 
const LINES_PER_FRAME = process.env.LINES_PER_FRAME || 6
// Porta Web
const PORT = process.env.PORT || 3000

// Carrega frames ASCII
const asciiFile = path.join(local, 'frames.ascii')
const raw = fs.readFileSync(asciiFile, 'utf8')

// Quebra em linhas
const linhas = raw.split('\n')

// Agrupa linhas em frames
const frames = []
for (let i = 0; i < linhas.length; i += LINES_PER_FRAME) {
  frame = linhas.slice(i, i + LINES_PER_FRAME).join('\n')
  frames.push(frame)
  console.log(`#${i}\n${frame}`)
}
console.log(`Total de frames carregados: ${frames.length}`)

// Servidor Web
const app = express();

// publica pagina estatica
app.use(express.static(local))



app.get('/frames', (req, res) => {
  res.type('text/plain');
  res.send(frames[0]); // devolve só o primeiro frame
});



const server = app.listen(PORT, () => {
  console.log(`Servidor HTTP em http://localhost:${PORT}`)
});




// Vamos incluir um **websocket** e mapear os eventos início e fim da conexão
// para inicar/parar o envio continuo dos frames

const FRAMES_PER_SECOND = 1 // obs: FRAME_INTERVAL = 1000 / FPS

const { WebSocketServer } = require('ws')
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
console.log(`${i % frames.length}\n${frame}`)
    ws.send(JSON.stringify({ type: 'frame', data: frame }));
    i++;
  }, (1000 / FRAMES_PER_SECOND) );

  ws.on('close', () => {
    clearInterval(timer);
    console.log('Cliente desconectado.');
  });
});


/*
O servidor está enviando os frames ASCII via WebSocket em formato JSON.
O CURL faz uma requisição normal (GET), e não entende o protocolo Websocket, então mostra os pacotes exatamente como recebeu do servidor.
O navegador abre o index.html e o JavaScript dentro dele inicia uma conexão WebSocket e interpreta corretamente a mensagem JSON ({ type: 'frame', data: '...' }) tratando crretamente os dados recebidos.
*/
