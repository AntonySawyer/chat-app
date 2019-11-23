const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/public/index.html`));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(`${__dirname}/public/login.html`));
});

const server = app.listen('3000', () => console.log('Server is running...'));

const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('New user connected');
  socket.username = 'Anonymous';
  socket.on('change_username', (data) => {
    socket.username = data.username;
  });

  socket.on('new_message', (data) => {
    io.sockets.emit('add_mess', {
      message: data.message,
      username: socket.username,
    });
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', {
      username: socket.username,
    });
  });
});
