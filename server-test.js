const express = require('express');
const app = express();

let server = require('http').createServer(app);

let cors = require('cors'); 
app.use(cors());  


let port = process.env.PORT || 3000;

let io = require('socket.io')(server,
{
  transports: ['websocket'],
  allowUpgrades: true,
}); 


// --------------------------------------------------------------------
// Redis Adapter - used with Socket.io to handle multple servers
// --------------------------------------------------------------------
// let redisAdapter = require('socket.io-redis');

// io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));


// server-side
io.on("connect", (socket) => 
{
  console.log(`connect ${socket.id}`);

  socket.join("room1");

  io.to("room1").emit('hello', 1, '2', {
    hello: 'you'
  });

  // ----------------------------------------------------------------
  // ----------------------------------------------------------------
  socket.on('disconnect', (reason) => {
    console.log('socket server side disconnect : ', reason);
  });  


});


// --------------------------------------------------------------------
// Start the HTTP Server 
// --------------------------------------------------------------------
server.listen(port, () =>  
{
    console.log(`Listening on port ${ port }`);
});