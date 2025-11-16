# ascii-server-node

Servidor simples de ASCII

Este projeto é bem divertido.

Inspirado em [ascii.live](https://ascii.live), vamos criar um servidor em node.js que transmite animações ASCII em tempo real, para ser acessado através de um navegador. 

Características:
- API em node.js, utilizando express
- ler um arquivo txt local
- usar WebSocket para enviar os frames continuamente
- permitir ajustar FPS e comprimento (linhas) do frame
- acessar por cliente simples HTML/javascript, exibir dentro de um <pre>


## STEP-BY-STEP CODING

Assumindo que o [node.js](https://nodejs.org) já está instalado, vamos criar o projeto npm:

```shell
npm init -y
```

Importar as bilbiotecas [express](https://www.npmjs.com/package/express) e [ws](https://www.npmjs.com/package/ws)

```shell
npm i express ws
npm list
```

Esperado:
```shell
ascii-server-node@1.0.0 C:\Users\gtnas\Downloads\ascii-server
├── express@5.1.0
└── ws@8.18.3
```

Criar uma pasta ```public``` e copiar para ela o arquivo ascii a ser publicado, bem como a pagina ```inex.html``` para visualizá-la.

criar um arquivo ```frames.ascii``` com os frames de teste:
```
+--------------+
|              |
|  FRAME #01   |
|   ( ^_^)     |
|              |
+--------------+
+--------------+
|              |
|  FRAME #02   |
|   ( -_-)     |
|              |
+--------------+
+--------------+
|              |
|  FRAME #03   |
|   ( o_o)     |
|              |
+--------------+
+--------------+
|              |
|  FRAME #04   |
|   ( +_+)     |
|              |
+--------------+
```

Criar o aquivo ```server.js```, primeiro mostrando o conteudo do arquivo frames.ascii no console.

```js
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

```

Para testar... Tem que mostrar na saída padrão cada frame numerado e o total de frames carregados. 
```shell
node server.js
```

Pausa para salvar o que fizemos até agora. Vamos criar um repositório, adicionar o **.gitignore** e criar o primeiro **commit**:
```shell
curl https://raw.githubusercontent.com/github/gitignore/refs/heads/main/Node.gitignore > .gitignore
git init
git add .
git commit -m "feat read ascii file"
``` 

Criar a pagina simples na pasta **public**, testando como será a visualização do texto ASCII.
index.html
```htm
<!doctype html>
<html lang="pt-BR">
    <head>
        <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ASCII Live Client</title>
  <style>
      html, body {
          background: #000; 
      color: #0f0; 
      margin: 0; height: 100%;
      font-family: "Courier New", Courier, monospace;
      font-size: 12px;
    }
    #hud {
        background: #000; 
      color: #ff0; 
    }
  </style>
</head>
<body>
    <div id="hud"></div>
  <div id="wrap"><pre id="screen"></pre></div>
  <script>
      const hud = document.getElementById('hud');
    const screen = document.getElementById('screen');
    // testando saida dos textos
    hud.innerHTML = "HUD OUTPUT HERE"
    screen.innerHTML = "ASCII OUTPUT HERE"
  </script>
</body>
</html>
```

Vamos colocar a API no ar, criando um servidor web com o **express** na porta 3000, e servindo o arquivo **index.html**. 
Adicionar em server.js:
```js
const express = require("express");

// Porta Web
const PORT = process.env.PORT || 3000;

// Servidor Web
const app = express();

// publica pagina estatica
app.use(express.static(public));

const server = app.listen(PORT, () => {
  console.log(`Servidor HTTP em http://localhost:${PORT}`);
});
```

Para testar, executar o servidor e abrir o navegador em (http://localhost:3000) e visualizar a página do cliente:

![Página cliente](public\client1.png)


Agora vamos incluir um **websocket** e mapear os eventos início e fim da conexão para iniciar/parar o envio continuo dos frames.
Adicionar em server.js:
```js
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
    ws.send(JSON.stringify({ type: 'frame', data: frame }));
    i++;
  }, (1000 / FRAMES_PER_SECOND) );

  ws.on('close', () => {
    clearInterval(timer);
    console.log('Cliente desconectado.');
  });
});
```

Vamos testar o **websocket** usando o ```CURL``` de 2 maneiras. 

A primeira é simular uma chamada HTTP/GET igual um navegador faria, ```curl http://localhost:3000```, o retorno será o fonte da página html. Isso já era esperado

A segunda é chamar o websocket através do protocolo ```ws://```. Como o CURL não interpreta o protocolo do **websocket**, ele irá retornar exatamente o conteúdo recebido, neste caso o retorno é um JSON contendo os frames e que que está sendo enviado continuamente. 
```shell
curl ws://localhost:3000/frames

{"type":"meta","fps":1,"totalFrames":4}{"type":"frame","data":"+--------------+\r\n|              |\r\n|  FRAME #01   |\r\n|   ( ^_^)     |\r\n|              |\r\n+--------------+\r"}{"type":"frame","data":"+--------------+\r\n|              |\r\n|  FRAME #02   |\r\n|   ( -_-)     |\r\n|              |\r\n+--------------+\r"}{"type":"frame","data":"+--------------+\r\n|              |\r\n|  FRAME #03   |\r\n|   ( o_o)     |\r\n|              |\r\n+--------------+\r"}{"type":"frame","data":"+--------------+\r\n|              |\r\n|  FRAME #04   |\r\n|   ( +_+)     |\r\n|              |\r\n+--------------+\r"}{"type":"frame","data":"+--------------+\r\n|              |\r\n|  FRAME #01   |\r\n|   ( ^_^)     |\r\n|              |\r\n+--------------+\r"}^C
```





