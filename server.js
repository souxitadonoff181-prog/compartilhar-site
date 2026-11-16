const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));
const salas = {};

io.on('connection', (socket) => {
    socket.on('criar-sala', () => {
        const codigo = Math.floor(1000 + Math.random() * 9000).toString();
        salas[codigo] = socket.id;
        socket.join(codigo);
        socket.emit('sala-criada', codigo);
    });
    socket.on('entrar-sala', (codigo) => {
        if (salas[codigo]) {
            socket.join(codigo);
            io.to(salas[codigo]).emit('novo-espectador', socket.id);
            socket.emit('conectado');
        } else {
            socket.emit('erro', 'Codigo invalido.');
        }
    });
    socket.on('sinal', (data) => {
        socket.to(data.sala).emit('sinal', data.sinal);
    });
    socket.on('disconnect', () => {
        for (let codigo in salas) { if (salas[codigo] === socket.id) delete salas[codigo]; }
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
