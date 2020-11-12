const express = require('express');
const app = express();


// -------------------------------------------------------
// https://stackoverflow.com/questions/27492101/what-is-happening-when-requirehttp-server-is-evaluated-with-an-express-app
// -------------------------------------------------------
let server = require('http').createServer(app); // By passing our Express app as the first argument to the HTTP server, we told Node that we wanted to use 

// =======================
// Enable CORS
// =======================
// No 'Access-Control-Allow-Origin' header is present on the requested resource
// Used when accessing API's on a PORT different than the API server / backend 
let cors = require('cors'); 
// ----------------------------------------
// Should be used In Production 
// ----------------------------------------
app.use(cors());  



let port = process.env.PORT || 3000;   // set our port

const numCPUs = require('os').cpus().length;

app.get('/test', function(req, res) 
{
  res.json(
  { 
      message: 'hooray! welcome to our api! on port ' + port,
      env: process.env['TEST_APP_SETTING'],
  });   
});


// ---------------------------------------------------------
// http://localhost:3000/check-cpus-count
// https://acl-api-server.azurewebsites.net/check-cpus-count
// ---------------------------------------------------------
app.get('/check-cpus-count', (req, res) => 
{
  console.log('Number of CPUs : ', numCPUs);
  console.log('Process ENV : ', process.env);
  res.status(200).json(
    { 
      status: 'OK',
      numberOfCPUs: numCPUs,
      env: process.env.NODE_ENV,
      port: process.env.PORT,
      processID: process.pid,
      nodeVersion: process.version
    })
}); 


app.get('/', (req, res) => {
  res.send('Hello World!')
});




// --------------------------------------------------------------------
// Socket.io WEBSOCKETS - SECTION
// Server - socket.io@3.0.0-rc3
// Client - socket.io-client@3.0.0-rc3
/*
    1. Create the Socket Server -> io

    2. Add the redis adapater to the io server

    3. Client (sockets) Connects to a Defined Namespace
      // New for Version 3
      io.of("/admin").use((socket, next) => {
        // triggered
      });

    4. Client (sockets) join a room -> socket.join



  How Client Sockets Join the Room
  Join Room in the Default Namespace ('/') adminID and eventID
  
  Admin Device Room is adminID-0 (26-0)
   -> Used for Courtside Tablets / Phones / etc
   -> Admin Device Page
  
  Admin Device Room is adminID-1 (26-1)
   -> Used for Admin ScoreZone
  
  Admin Event Room is adminID-eventID (28-1850)
   -> LeaderBoard for Swap and Rounders 
   -> TODO - add leaderboard for Single and Double bracket

  // -------------------------------------------------------
  // Socket.io Events
  //
  // 1. Connecting From the App / Admin Portal for Swiss, Swap, Single, Double Elimination for
  // schedule Breakdown page - TV MODE
  //
  // tblleagues (fldLiveRoundStats) 
  //
  // 2. Connection From the App ScoreTrackerBasic to Update scores
  //  -> The ScoreTrackerBasic passes the eventID and adminID 
  // to make sure the correct rooom is joined
  // 
  // 3. Admin Portal to listen for Assinged Court IDs and send that to the ROOM 0 
  // where are the Admin Devices are stored
  //
  // 4. Admin Portal - manage bracket tab to listen for Matches Saved from the Tablets
  //  to update the Admin Schedule and assign matches to available courts
  //
  // 5. Admin Portal - Manage Device Page - see all the devices in the ROOM 0 (26-0)
  //
  // 6. ScoreZone Page - Collects All of the Admins Devices Across all Live Events
  //
  // 7. RoomID is created from AdminID and EventID
  // -------------------------------------------------------


  1. Whats the best way to get the number of or list of sockets (clients) in a room?

    io.allSockets() => get all socket ids (works with multiple servers) (well, once the Redis adapter is updated)

    // Is a Set
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
    io.in("room1").allSockets() => get all socket ids in the room
    (it was named io.clients() in Socket.IO v2)

  2. Whats the best way to get a list of all the current rooms?

    There is currently no API for that, apart from digging into the adapter: io.of("/").adapter.rooms (here)

    Besides, the Redis adapter has an allRooms method, but it was not reflected in the public API.


*/
// --------------------------------------------------------------------
let io = require('socket.io')(server,
{
  transports: ['websocket'],
  allowUpgrades: true,
  pingInterval: 25000, // default - 25000
  pingTimeout: 60000, // default - 60000
  // cors: {
  //   origin: "*",
  //   methods: ["GET","PUT","POST","DELETE"],
  //   // allowedHeaders: ["Authorization"],
  //   // credentials: true
  // }
}); // Initialize a new instance of socket.io by passing the http (the HTTP server) object.   


// --------------------------------------------------------------------
// Redis Adapter - used with Socket.io to handle multple servers
// https://github.com/socketio/socket.io-redis
// How to install redis locally also other commands to start
// https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298
// Start Redis Server 
//  -> $ brew services start redis
// Stop Redis Server
//  -> $ brew services stop redis
// Test if Redis Server is running 
//  -> $ redis-cli ping
// --------------------------------------------------------------------
// let redisAdapter = require('socket.io-redis');

// io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

// io.adapter(redisAdapter(
//   { 
//     key: 'IMotePCeKTP1Rq404ipHUIQK1vfhgq3N3NcyxXOEsK4=',
//     password: 'IMotePCeKTP1Rq404ipHUIQK1vfhgq3N3NcyxXOEsK4=', 
//     host: 'acl.redis.cache.windows.net', 
//     port: 6379,
//     requestsTimeout: 10000
    
//   })
// );

// ----------------------------------------------------------------
// Socket.IO 
// Connect to Admin Namespace
// https://github.com/socketio/socket.io/releases
// https://github.com/socketio/socket.io/blob/master/CHANGELOG.md
// //server side 
// io.on('connect', socket => { // not triggered anymore })
// ----------------------------------------------------------------

// server-side
io.on("connect", (socket) => 
{

  // triggered
  console.log(`Socket ${socket.id} Connected to Admin ID ${socket.handshake.query.adminID}`);

  socket.join("room1");

  io.to("room1").emit('hello', 1, '2', {
    hello: 'you'
  });  

  // Get All Socket.ids in a room
  io.in("room1").allSockets().then((value) => {
    console.log('All Sockets () Count : ', value.size);
    console.log('All Sockets () List : ', value);
    // expected output: "Success!"
  })
  // const newNamespace = socket.nsp; // newNamespace.name === '/dynamic-101'

  // console.log('Server log a user connected to Dynamic NameSpace');
  // console.log('Socket', socket);
  // console.log('Socket Query Info', socket.handshake.query);

  // ----------------------------------------------------------------
  // Add Unique Device Info to Each Socket
  // Only used for DISPLAY Purposes ONLY
  // Used on the Admin Device Page
  // ----------------------------------------------------------------
  addDeviceInfoToSocket(socket, socket.handshake.query);

  // Send Socket Info Back to Connecting Socket
  // Sending to individual socketid (private message)
  // Sending to sender-client only - Send message to itself
  socket.emit('socket-connected', 
                                { 
                                  socketID: socket.conn.id,                                     
                                  connected: socket.connected,
                                  adminID: socket.handshake.query.adminID,
                                  playerID: socket.handshake.query.playerID,
                                  eventID: socket.handshake.query.eventID,
                                  deviceCourtNumber: socket.handshake.query.deviceCourtNumber,
                                  deviceName: socket.handshake.query.deviceName,
                                  deviceRoomDisplayName: socket.handshake.query.deviceRoomDisplayName,
                                  connectionSource: socket.handshake.query.connectionSource,
                                  deviceRoomNumber: socket.eventID,
                                  adminRoomID: `${socket.handshake.query.adminID}-${socket.handshake.query.eventID}`,

                                  tempEventID: socket.handshake.query.tempEventID,
                                  tempMatchID: socket.handshake.query.tempMatchID,
                                  // namespace: newNamespace.name,    
                                });   


    // ----------------------------------------------------------------
    // Let the Admin know that his device connected
    // Only the socket with Event ID == 0 are the Admin Devices
    // ----------------------------------------------------------------
    if(socket.eventID == 0)
    {
      // console.log('Let the Admin know that Admin Device has Connected');
      io.in(`${ socket.adminID }-${ socket.eventID }`).emit('adminDeviceConnected', { 
                                            socketID: socket.conn.id, 
                                            connected: socket.connected,
                                            // namespace: newNamespace.name, 
                                            adminID: socket.adminID,
                                            playerID: socket.playerID,
                                            eventID: socket.eventID,
                                            deviceCourtNumber: socket.deviceCourtNumber,
                                            deviceName: socket.deviceName,
                                            deviceRoomDisplayName: socket.deviceRoomDisplayName,
                                            deviceRoomNumber: socket.eventID,
                                            connectionSource: socket.connectionSource,
                                            adminRoomID: `${socket.adminID}-${socket.eventID}`,
                                            tempEventID: socket.tempEventID,
                                            tempMatchID: socket.tempMatchID,                                               
                                          });        
    } 

    // ----------------------------------------------------------------
    // Let the Bracket Management Tab his device Connected
    // Only the socket with Event ID == 0 are the Admin Devices
    // ----------------------------------------------------------------
    if(socket.tempEventID != 0)
    {
      console.log('Let the Bracket Management Tab know that the device has Connected');
      io.in(`${ socket.adminID }-${ socket.tempEventID }`).emit('adminDeviceConnected', { 
                                            socketID: socket.conn.id, 
                                            connected: socket.connected, 
                                            adminID: socket.adminID,
                                            playerID: socket.playerID,
                                            eventID: socket.eventID,
                                            deviceCourtNumber: socket.deviceCourtNumber,
                                            deviceName: socket.deviceName,
                                            deviceRoomDisplayName: socket.deviceRoomDisplayName,
                                            connectionSource: socket.connectionSource,
                                            adminRoomID: `${socket.adminID}-${socket.eventID}`,

                                            tempEventID: socket.tempEventID,
                                            tempMatchID: socket.tempMatchID,                                                 
                                          });        
    }                                         

  // ----------------------------------------------------------------
  // Join Room in the Default Namespace ('/') adminID and eventID
  //
  // Admin Device Room is adminID-0 (26-0)
  //  -> Used for Courtside Tablets / Phones / etc
  //  -> Admin Device Page
  // 
  // Admin Device Room is adminID-1 (26-1)
  //  -> Used for Admin ScoreZone
  //
  // Admin Event Room is adminID-eventID (28-1850)
  //  -> LeaderBoard for Swap and Rounders 
  //  -> TODO - add leaderboard for Single and Double bracket
  // ----------------------------------------------------------------
  
  let adminRoomID = `${socket.handshake.query.adminID}-${socket.handshake.query.eventID}`;

  // Socket will join Admins rooom
  socket.join(adminRoomID);

  // console.log(Object.keys(socket.adapter.rooms));
  console.log('socket rooms : ', socket.rooms); // Set { <socket.id>, "room1" }

  // No Long used - didnt really do anything
  // socket.join(adminRoomID, () =>
  // {
  //   // Device has joined Room
  //   console.log('Device has Joined Room ID : ', adminRoomID);

  //   console.log('  ** Socket With Device Info - processsID ** ', socket.processsID);

  //   // TODO - if its connecting to Admin Device Room - 0
  //   // Then let the Admin know so the Admin Device Page can be updated
  //   let adminDeviceRoomCheck = adminRoomID.slice(-2);
  //   if(adminDeviceRoomCheck == '-0')
  //   {
  //     console.log('Socket has connected to Admin Device Room - let the admin know');
  //   }
  // });


  // --------------------------------------------------
  // --------------------------------------------------
  // All the Socket Event Listeners
  // --------------------------------------------------
  // --------------------------------------------------

  // ----------------------------------------------------------
  // Listen when Scores have been updated
  // This should be the Match Info - with Scores
  // ----------------------------------------------------------
  socket.on('updateScoreBasic', (match) => {
    // console.log('Receiving Match Score Data from Client from Score Tracker Basic', match);

    // socket.emit("updateScoreBasic", match.data);

    // Let ScoreZones know that scores are updated
    io.to(`${ match.data.adminID }-1`).emit("updateScoreBasic", match.data);

    // Let the LeaderBoard know that score are updated
    io.to(`${ match.data.adminID }-${ match.data.leagueID }`).emit("updateScoreBasic", match.data);       
  }); 



  // ----------------------------------------------------------
  // Listen when Scores have been updated From Round / ESPN Mode
  // Includes InningParms with inning breakdown
  // ----------------------------------------------------------
  socket.on('updateScoreRound', (match) => 
  {
    // console.log('Receiving Score Data from Client ScoreTracker with Inning Parms', match);

    // Let ScoreZones know that scores are updated
    io.to(`${ match.data.adminID }-1`).emit("updateScoreBasic", match.data);

    // Let the LeaderBoard know that score are updated
    io.to(`${ match.data.adminID }-${ match.data.leagueID }`).emit("updateScoreBasic", match.data); 


    // ---------- Dynamic Chart Data ---------------------------------
    // let the Charts page with is triggered from ScoreZone Used by Charts for Dynamic Content
    // Now instead of each scoreZone trying to go out and get the data - the socket gets it from the API 
    // and sends to all sockets in the Admin scoreZone
    if(false)
    {
      adminPortalObj.generateEventMatchDetails(match.data.leagueID, match.data.matchID, match.data.gameID, false, (data) => {
        io.to(`${ match.data.adminID }-1`).emit("updateScoreRound", data);
      });
    }

  }); 



  // ----------------------------------------------------------
  // Listen when Match Scores Have been Successfully Saved
  // This should be the Match Info - with Scores
  // The Admin Portal know to refresh the schedule list
  // and assign the next set of matches
  // ----------------------------------------------------------
  socket.on('savedMatchScoresBasicDevice', (match, callback) => 
  {
    // console.log('***** Receiving Successfully Saved Match Overall Score from Client from Score Tracker Basic', match);
    callback({status: 'OK', message: 'Score Successfully Saved'});

    // socket.emit("savedMatchScoresBasicFromDevice", match.data);
    io.to(`${ match.data.eventInfo.adminID }-${ match.data.eventID }`).emit("savedMatchScoresBasicFromDevice", match.data);

    // let the Score Zone connection know - adminID-scorezoneID (26-1)
    io.to(`${ match.data.eventInfo.adminID }-1`).emit("savedMatchScoresBasicFromDevice", match.data);
  });



  // ----------------------------------------------------------
  // Listen when Match Scores Have been Successfully Saved
  // This should be the Match Info - with Scores
  // The Admin Portal know to refresh the schedule list
  // and assign the next set of matches
  // ----------------------------------------------------------
  socket.on('savedMatchScoresBasicAdmin', (match, callback) => 
  {
    // console.log('***** Receiving Successfully Saved Match Overall Score from Admin Portal from Score Tracker Basic', match);
    callback({status: 'OK', message: 'Score Successfully Saved'});

    // socket.emit("savedMatchScoresBasicFromAdmin", match.data);
    io.to(`${ match.data.adminID }-0`).emit("savedMatchScoresBasicFromAdmin", match.data);
  });    


  // ----------------------------------------------------------
  // Listen for Court Assignment - once a court has been assigned
  // Find the correct Device with the matching court number in the 
  // tabletDeviceList[]
  // 
  // Now all admin device are in Room 0
  // "adminRoomID": "26-0"

  // Now all ScoreZone connections are in Room 1
  // "ScoreZone RoomID": "26-1"    
  // ----------------------------------------------------------
  socket.on('matchAssignedToCourt', (data, callback) => 
  {
    // console.log('Data for MatchAssignedToCourt : ', data);
    // console.log('Admin ID MatchAssignedToCourt : ', data.data.adminID);
    // console.log('Admin ID MatchAssignedToCourt COURT ID : ', data.data.courtID);


    // io.of('/admin-device-mgmt').to(roomID).emit('chat-message', 'message');
    // "adminRoomID": "26-0"
    // Only Devices that have been assigned to the ROOM ID - 0 will get this
    // io.of(socket.nsp.name).to(`${ data.data.adminID }-0`).emit('onCourtNumberAssigned', data);
    io.to(`${ data.data.adminID }-0`).emit('onCourtNumberAssigned', data);

    // ----------------------------------------------------------------
    // Used by the ScoreZone connections Room ID = 1
    // Emit to All ScoreZone sockets in the Admins ScoreZone Room 26-1
    // socket.nsp.emit("onMatchAssignToCourt", data);
    // ----------------------------------------------------------------
    io.to(`${ data.data.adminID }-1`).emit('onMatchAssignToCourt', data);

    // ----------------------------------------------------------------
    // Emit to the LeaderBoard for the Event - used by Swap and Rounders
    // ----------------------------------------------------------------
    io.to(`${ data.data.adminID }-${ data.data.leagueID }`).emit('onMatchAssignToCourt', data);

    callback(data);
    // console.log('Done Sending ON CourtNumberAssigned ');
  }); 


  // ----------------------------------------------------------
  // The Socket on the Client has added tempEventID and tempMatchID
  // Update the socket on the server
  // No need to do anything else this info will be used when a 
  // Device (Socket) disconnects and connects to let Admin Manage Bracket page know
  // ----------------------------------------------------------
  socket.on('eventInfoAssignedToSocket', (socketParm) => 
  {

    // Set the Server Side Socket Temp EventID and Temp MatchID
    console.log('Socket Parm -> ', socketParm);
    // console.log('Socket -> ', socket);
    socket.tempEventID = socketParm.tempEventID;
    socket.tempMatchID = socketParm.tempMatchID;

  });



  // ----------------------------------------------------------
  // Listen when App has properly navigated to the ScoreTracker
  // either BASIC or ROUND
  // ----------------------------------------------------------
  socket.on('navigatedToScoreTracker', (data, callback) => 
  {
    // console.log('App has navigated to SCORETRACKER : ', data);

    // console.log('***** Receiving Successfully Saved Match Overall Score from Admin Portal from Score Tracker Basic', match);
    // callback({status: 'OK', message: 'Score Successfully Saved'});

    // Let the Admin Portal Know that the Device Made it to ScoreTracker Correctly
    io.to(`${ data.data.adminID }-${ data.data.leagueID }`).emit("navigatedToScoreTracker", data.data);
  });    




  // ----------------------------------------------------------
  // Get list of All Clients across all rooms
  // ----------------------------------------------------------
  socket.on('getNumberAllOfClients', (data, cb) => 
  {
    console.log('Data passed in from Client : ', data);

    // Returns the list of client IDs connected to rooms across all nodes
    io.of('/').adapter.clients((err, clients) => {
      console.log(clients); // an array containing all connected socket ids

      for(let clientID of clients)
      {
        let socket = io.of('/').sockets[clientID];
        // console.log('Socket Obj : ', socket.adminID);
      }

      cb(clients);
    });
  }); 



  // ----------------------------------------------------------
  // Get list of All Clients in a Single room
  // ----------------------------------------------------------
  socket.on('getNumberOfClientsInRoom', (data, cb) => 
  {
    console.log('Data passed in from Client in ROOM : ', data);

    // Returns the list of client IDs connected to rooms across all nodes
    io.of(`/`).adapter.clients([`${ data.adminID }-0`], (err, clients) => {
      console.log(`Device room -> ${ data.adminID}-0`, clients); // an array containing all connected socket ids

      cb(clients);
    });


    // console.log(socket);
  });    


  // ----------------------------------------------------------
  // Get list of All Rooms
  // ----------------------------------------------------------
  socket.on('getListOfAllRooms', (data, cb) => 
  {
    console.log('Data passed in from Client in All Rooms : ', data);

    console.log('Rooms : ', io.sockets.adapter.rooms);

    // Returns the list of All Rooms across all nodes
    io.of('/').adapter.allRooms((err, rooms) => {
      console.log('All Rooms : ', rooms); // an array containing all rooms (accross every node)
    });


    // console.log(socket);
  });     


  // -------------------------------------------
  // List of All Rooms in Namespace
  // -------------------------------------------
  socket.on('getListOfNameSpaces', (data, cb) => 
  {
    // console.log('Getting List of Namespaces', io);

    let listOfNamespaces = Object.keys(io.nsps);

    console.log('Getting List of Namespaces', listOfNamespaces);

    for(let i = 0; i < listOfNamespaces.length; i++)
    {

      // console.log(io);

      if(listOfNamespaces[i].includes('admin-'))
      {
        // let sockets = Object.
        console.log('Found Admin Namespace');
        console.log(listOfNamespaces[i].substring(7));
      }
    }

    cb({listOfNamespaces: listOfNamespaces});

  });      



  // -------------------------------------------
  // Remote Join Room 
  // -------------------------------------------
  socket.on('remoteJoin', (data, cb) => 
  {
    console.log(data);
    let temp = data.localSocketID.substring(10);

    console.log(temp);

    io.of('/').adapter.remoteJoin(`${ data.localSocketID }`, '26-0', (err) => {
      if (err) 
      { 
        /* unknown id */ 
        console.log('Error on Remote Join', err);
      }
      // success

      cb('Joined Remote Room');
    });

  }); 


  // -------------------------------------------
  // Test Message From Client
  // Send Message to Every Client in the '/' namespace
  // sending to all connected clients
  // -------------------------------------------
  socket.on('sendTestMessage', (data) => {
    console.log(data);
    io.emit('receiveTestMessage', { hello: 'world' });
  });


  // -------------------------------------------
  // Test Message From Client To Room Only
  // -------------------------------------------
  socket.on('sendTestMessageToRoomOnly', (data) => {
    console.log(data);
    // sending to all clients in '26-0' room, including sender
    io.in(`${ data.adminID }-${ data.roomID }`).emit('receiveTestMessageToRoomOnly', { roomData: `Room Only Data ${ data.adminID }-${ data.roomID }` });      
  });


  // -------------------------------------------
  // customRequest to get each cluster to send back
  // socket.io object from each room
  // -------------------------------------------
  socket.on('customRequest', (data, cb) => {

    console.log('Custom Request Data from Client : ', data);

    // then
    io.of('/').adapter.customRequest(data, (err, replies) =>
    {
      /*
      console.log('');
      console.log('==========================================');
      console.log(replies); // an array ['hello john', ...] with one element per node
      console.log('==========================================');       
      console.log(''); 
      */

      let flattenedArray = [];
      for (let i = 0; i < replies.length; i++) {
        let current = replies[i];
        //Correcting the conditional
        //for (let j = 0; j < initialArray.length - 1; j++)
        for (let j = 0; j < current.length; j++)
          flattenedArray.push(current[j]);
      }        
      // console.log(replies.flat());
      console.log(flattenedArray);
      console.log('');
      
      // -----------------------------
      // Send the Admin Device List Back
      // -----------------------------
      cb(flattenedArray);
    });
  });



  // ------------------------------------------------
  // Socket Disconnected
  // ------------------------------------------------
  socket.on('disconnect', (reason) =>
  {
    console.log('User disconnected - Server SIDE');
    console.log(`Disconnect reason: ${ reason }`);
    // console.log("Disconnected Socket = ", socket);
    console.log("Disconnected Socket = ",
                                          { 
                                            socketID: socket.conn.id, 
                                            connected: socket.connected,
                                            // namespace: newNamespace.name, 
                                            adminID: socket.adminID,
                                            playerID: socket.playerID,
                                            eventID: socket.eventID,
                                            deviceCourtNumber: socket.deviceCourtNumber,
                                            deviceName: socket.deviceName,
                                            deviceRoomDisplayName: socket.deviceRoomDisplayName,
                                            connectionSource: socket.connectionSource,
                                            adminRoomID: `${socket.adminID}-${socket.eventID}`,

                                            tempEventID: socket.tempEventID,
                                            tempMatchID: socket.tempMatchID,                                                 
                                          });

                                           
    // io.in(`${ socket.adminID }-${ socket.eventID }`).emit('adminDeviceDisconnected', { roomData: `Room Only Data ${ socket.adminID }-${ socket.eventID }` }); 
    // ----------------------------------------------------------------
    // Let the Admin know that his device disconnected
    // Only the socket with Event ID == 0 are the Admin Devices
    // ----------------------------------------------------------------
    if(socket.eventID == 0)
    {
      console.log('Let the Admin know that Admin Device has disconnected');
      io.in(`${ socket.adminID }-0`).emit('adminDeviceDisconnected', { 
                                            socketID: socket.conn.id, 
                                            connected: socket.connected,
                                            adminID: socket.adminID,
                                            playerID: socket.playerID,
                                            eventID: socket.eventID,
                                            deviceCourtNumber: socket.deviceCourtNumber,
                                            deviceName: socket.deviceName,
                                            deviceRoomDisplayName: socket.deviceRoomDisplayName,
                                            connectionSource: socket.connectionSource,
                                            adminRoomID: `${socket.adminID}-${socket.eventID}`,

                                            tempEventID: socket.tempEventID,
                                            tempMatchID: socket.tempMatchID,                                                 
                                          });        
    }

    // ----------------------------------------------------------------
    // Let the Bracket Management Tab his device disconnected
    // Only the socket with Event ID == 0 are the Admin Devices
    // ----------------------------------------------------------------
    if(socket.tempEventID != 0)
    {
      console.log('Let the Bracket Management Tab know that the device has disconnected');
      io.in(`${ socket.adminID }-${ socket.tempEventID }`).emit('adminDeviceDisconnected', { 
                                            socketID: socket.conn.id, 
                                            connected: socket.connected, 
                                            adminID: socket.adminID,
                                            playerID: socket.playerID,
                                            eventID: socket.eventID,
                                            deviceCourtNumber: socket.deviceCourtNumber,
                                            deviceName: socket.deviceName,
                                            deviceRoomDisplayName: socket.deviceRoomDisplayName,
                                            connectionSource: socket.connectionSource,
                                            adminRoomID: `${socket.adminID}-${socket.eventID}`,

                                            tempEventID: socket.tempEventID,
                                            tempMatchID: socket.tempMatchID,                                                 
                                          });        
    }    
  
    


    // Let the Admin Page know the number of people that are connected
    // TODO: Need to get ROOMID somehow
    // getNumberOfClientsInRoom(socket.deviceRoomNumber);    
  });
  

  // ------------------------------------------------
  // Disconnect Triggered From the Admin Portal
  // Admin Device Setup Page - Disconnect Button
  // Remote Disconnect
  // ------------------------------------------------
  socket.on('admin-remote-disconnect-device', (data) =>
  {
    // Function to Disconnect the Device from Server
    // console.log('message: ', data);

    // Get the Device ID (socketID)
    // io.of('/').connected[data.socketID].disconnect();

    io.of('/').adapter.remoteDisconnect(`${ data.socketID }`, true, (err) => 
    {
      if (err) 
      { 
        /* unknown id */ 
        console.log('Error On Remote Disconnect : ', err)
      }
      else
      {
        // success
        io.in(`${ socket.adminID }-${ socket.eventID }`).emit('adminDeviceDisconnected', { 
                                              socketID: socket.conn.id, 
                                              connected: socket.connected,
                                              // namespace: newNamespace.name, 
                                              adminID: socket.adminID,
                                              playerID: socket.playerID,
                                              eventID: socket.eventID,
                                              deviceCourtNumber: socket.deviceCourtNumber,
                                              deviceName: socket.deviceName,
                                              deviceRoomDisplayName: socket.deviceRoomDisplayName,
                                              connectionSource: socket.connectionSource,
                                              adminRoomID: `${socket.adminID}-${socket.eventID}`,

                                              tempEventID: socket.tempEventID,
                                              tempMatchID: socket.tempMatchID,                                                 
                                            });    
      }
      
    });    

    // Disconnection Complete - let the Admin know
    // adminNSP.emit('admin-disconnect-device-completed', data); -- OLD WAY 
    // io.of('/').to(roomID).emit('admin-disconnect-device-completed', data);
    

  });   


  // ----------------------------------------------------------------
  // TODO: log server side errors
  // ----------------------------------------------------------------
  socket.on('error', (error) => {
    // https://socket.io/docs/server-api/#Event-%E2%80%98error%E2%80%99
    console.log('socket server side error : ', error);
  });

  // ----------------------------------------------------------------
  // TODO: log server side disconnect reasons
  // ----------------------------------------------------------------
  socket.on('disconnect', (reason) => {
    // https://socket.io/docs/server-api/#Event-%E2%80%98disconnect%E2%80%99
    console.log('socket server side disconnect : ', reason);
  });  


  // send directly to the client
  // socket.emit("room1", {});

  // or await socket.join("room1"); for custom adapters

  // socket.on('hey', data => 
  // {
  //   console.log('hey', data);
  //   io.in("room1").emit("hello", {});
  //   io.to("room1").emit("hello", {});
  //   // socket.emit("hello", {});
  // });

});


// ----------------------------------------------------------------
// Add Device Info to each socket
// ----------------------------------------------------------------
function addDeviceInfoToSocket(socket, query)
{
  socket.socketID = socket.conn.id;
  socket.socketConnected = socket.connected;
  socket.deviceCourtNumber = query.deviceCourtNumber;
  socket.connectionSource = query.connectionSource;
  socket.adminID = query.adminID;
  socket.processsID = process.pid;
  socket.deviceName = query.deviceName;
  socket.eventID = socket.handshake.query.eventID;
  // socket.deviceRoomDisplayName = query.deviceRoomDisplayName,
  socket.deviceRoomNumber = query.deviceRoomNumber;

  // Temp Event ID and Temp Match ID
  socket.tempEventID = query.tempEventID;
  socket.tempMatchID = query.tempMatchID;

  return; 

}




// --------------------------------------------------------------------
// Start the HTTP Server 
// --------------------------------------------------------------------
server.listen(port, () =>  
{
    console.log(`Listening on port ${ port }`);
});

console.log(`Worker ${ process.pid } started updated`);