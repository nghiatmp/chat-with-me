const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require("path");

const controlCacheTime = 1000 * 60 * 60 * 24 * 365;
app.use(express.static(path.join(__dirname, "/static"), {
  maxAge: controlCacheTime
}));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

io.on('connection', (socket) => {
  console.log('a user connection');
  const roomId = getRoomClient();

  socket.join(roomId);
  
  const room = getRoomInfo();

  if (room[roomId] < 2) {
    io.in(roomId).emit('status-room', 'Đang chờ người ấy ....');
  } else {
    io.in(roomId).emit('status-room', 'Cốc cốc !! Có người vào phòng !!')
  }
  //send message
  socket.on('send-message', (message) => {
    //send message to all client
    socket.to(roomId).emit('receive-message', message);
  });

  //send image

  
  socket.on('message-image', (imageBase64) => {
    //send message to all client
    socket.to(roomId).emit('receive-message-image', imageBase64);
  });

  //disconnect
  socket.on('disconnect', () => {
    socket.to(roomId).emit('status-room', 'Pai Pai, Mình đi đây');
    console.log('a user disconnect connection');
  });
});

const getRoomClient = () => {
  let index = 0;
  const roomExist = getRoomInfo();
  while(true) {
    if(!roomExist[index] || roomExist[index] < 2) {
      return index;
    }
    index ++;
  };
}

const getRoomInfo = () => {
  const roomExist = {};
    io.sockets.adapter.rooms.forEach((key,item) => {
      roomExist[item] = key.size;
  })
  return roomExist;
}

server.listen(3001, () => {
  console.log('listen on *:3001');
});