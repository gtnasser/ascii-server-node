#ascii-server-node

Servidor simples de ASCII

Este projeto é bem divertido.

Inspirado em [ascii.live](https://ascii.live), vou criar um servidor em node.js que transmite animações ASCII em tempo real, para ser acessado através de um navegador. 

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
