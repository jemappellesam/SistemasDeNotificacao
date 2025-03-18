const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

// Configuração do caminho da pasta views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware para processar dados de formulários
app.use(express.urlencoded({ extended: true }));

// Array para armazenar as tarefas (simulando um banco de dados)
let tasks = [];

// Rota para a tela administrativa
app.get('/admin', (req, res) => {
    res.render('admin'); // Renderiza a tela administrativa sem passar tarefas
});

// Rota para submeter uma tarefa (POST)
app.post('/submit-task', (req, res) => {
    const newTask = req.body.task; // Captura a tarefa do formulário
    tasks.push(newTask); // Adiciona a tarefa ao array

    // Dispara um evento real com Socket.IO
    io.emit('new-task', { task: newTask, message: 'Nova tarefa cadastrada!' });

    // Redireciona de volta para a tela administrativa
    res.redirect('/admin');
});

// Rota para a tela do usuário
app.get('/user', (req, res) => {
    res.render('user', { tasks }); // Passa as tarefas para a view
});

// Configuração do Socket.IO
io.on('connection', (socket) => {
    console.log('Um usuário conectou:', socket.id);

    // Envia as tarefas existentes para o usuário ao conectar
    socket.emit('initial-tasks', tasks);

    // Escuta eventos de desconexão
    socket.on('disconnect', () => {
        console.log('Um usuário desconectou:', socket.id);
    });
});

// Inicia o servidor
server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});