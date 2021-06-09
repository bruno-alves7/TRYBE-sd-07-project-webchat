const express = require('express');
require('dotenv').config();
const moment = require('moment');
const cors = require('cors');
const randtoken = require('rand-token');

const app = express();

const httpServe = require('http').createServer(app);
const io = require('socket.io')(httpServe, {
  cors: {
    origin: process.env.URL,
    methods: ['GET', 'POST'],
  }, 
});

const webChatModel = require('./models/webChatModel');

const onLine = [];
const updateOnLine = (changeNick) => {
  const { nickname, id } = changeNick;
  const result = onLine.map((arrey) => arrey.id).indexOf(id);
    onLine[result] = { id, userName: nickname };
};

io.on('connection', (socket) => {
  // console.log(`Socket conectado: ${socket.id}.`);

  socket.emit('localUser', socket.id);

  const userName = randtoken.generate(16);
  onLine.push({ id: socket.id, userName });
  io.emit('newUser', onLine);

  socket.on('changeNick', (changeNick) => {
    updateOnLine(changeNick);
    // const result = onLine.map((arrey) => arrey.id).indexOf(socket.id);
    // onLine[result] = { id: socket.id, userName: changeNick.nickname };
    io.emit('newUser', onLine);
});
  
  socket.on('message', async ({ nickname, chatMessage }) => {
      const timestamp = moment().format('DD-MM-yyyy HH:mm:ss');
      const message = `${chatMessage} ${nickname} ${timestamp}`;
      await webChatModel.create(chatMessage, nickname, timestamp);
      io.emit('message', message); 
});

    socket.on('disconnect', () => {
      // const result = onLine.map((arrey) => arrey.id).indexOf(socket.id);
      onLine.splice(onLine.map((arrey) => arrey.id).indexOf(socket.id), 1);
      io.emit('newUser', onLine); 
});
  });

  app.use(express.json());
  app.use(cors());
  app.use(express.static(`${__dirname}/public`));

  app.get('/messages', async (_req, res) => {
    try {
      const messages = await webChatModel.getAll();
      res.status(200).json(messages);
    } catch (error) {
      console.log(error);
    }
  });

  const { PORT } = process.env;
  
  httpServe.listen(PORT, () => console.log(`Rodando na porta ${PORT}`)); 