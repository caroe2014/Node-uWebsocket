/* Non-SSL is simply App() */

// npm install uNetworking/uWebSockets.js#v16.2.0
const uWS = require('uWebSockets.js');
// uWebSockets.js is binary by default
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
const querystring = require('querystring');

// Used to determin which instance of Redis to connect to
let env = 'prod'; // dev || prod
let port = process.env.PORT || 9001;   // set our port
// console.log('Server port : ', port);

// --------------------------------------------------------------------
// uWebsockets.js https://github.com/uNetworking/uWebSockets.js
// 
// documentation - https://unetworking.github.io/uWebSockets.js/generated/
// 

// TODO: Implement WSS - need security key files
// TODO: Figure out the backpressure / drain
// TODO: Look into rate limit
//  - https://github.com/uNetworking/uWebSockets.js/issues/335
//
// TODO: Async needed ??  async (ws, message, isBinary) =>
// TODO: UUID needed ?? search repo for examples
// TODO: Get number of connected sockets across all servers
// TODO: Get number of connected sockets in room
// TODO: Redis get number of subscribers??
//  - https://github.com/uNetworking/uWebSockets/issues/1035
//
// TODO: onclose - unsubscribe the socket

// Replacing Express with uWebsockets
// https://dev.to/mattkrick/replacing-express-with-uwebsockets-48ph
// --------------------------------------------------------------------


// --------------------------------------------------------------------
// Redis Adapter - used with Socket.io to handle multple servers
// https://github.com/uNetworking/uWebSockets/issues/954
//
// How to install redis locally also other commands to start
// https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298
// Start Redis Server 
//  -> $ brew services start redis
// Stop Redis Server
//  -> $ brew services stop redis
// Test if Redis Server is running 
//  -> $ redis-cli ping
// Test pub/sub $ PUBLISH 26-0 '{"action":"saved-match-scores-basic-device", "data": "test data"}'
// --------------------------------------------------------------------
const redis = require("redis");
let REDIS_SERVER = null;
if(env == 'dev')
{
    // Configuration: adapt to your environment
    REDIS_SERVER = "redis://localhost:6379";
}
else
{
    REDIS_SERVER = {
                        key: 'IMotePCeKTP1Rq404ipHUIQK1vfhgq3N3NcyxXOEsK4=',
                        password: 'IMotePCeKTP1Rq404ipHUIQK1vfhgq3N3NcyxXOEsK4=', 
                        host: 'acl.redis.cache.windows.net', 
                        port: 6379,
                        requestsTimeout: 10000
                    }
}




// Create Subscriber and Publisher
let subscriber = redis.createClient(REDIS_SERVER);
// let subscriber = redis.createClient();
let publisher = subscriber.duplicate();


subscriber.on('error', (err) => 
{
  console.log('Redis subscriber error', err);
});


// --------------------------------------------------------------------
// Create the Redis Subscriber that will listen for All Reids 
// Publisher events and then send that out to the correct
// local instance server publish channel
// --------------------------------------------------------------------
subscriber.on("message", function(channel, message) 
{
    console.log('redis channel : ', channel);
    // console.log("Tablets Sent Message " + message + " was read.");
    let messageObj = JSON.parse(message);

    /*
    // app.publish(json.room, JSON.stringify({'action': 'updated-score', data: { scrore: 26 }}));
    // Send publish to sockets on server instance
    // client socket.onmessage on the client is triggered
    */
    app.publish(channel, JSON.stringify({'action': `${ messageObj.action }`, data: messageObj.data }));
});



/* Number between thumb and index finger */
// const backpressure = 1024;

/* Used for statistics */
// let messages = 0;
// let messageNumber = 0;



// --------------------------------------------------------------------
/*
    Websocket flow

    ****** ROOMS *******

    Admin Device Room is adminID-0 (26-0)
    -> Used for Courtside Tablets / Phones / etc
    -> Admin Device Page   

    Admin Device Room is adminID-1 (26-1)
    -> Used for Admin ScoreZone

    Admin Event Room is adminID-eventID (28-1850)
    -> LeaderBoard for Swap and Rounders 
    -> TODO: - add leaderboard for Single and Double bracket


    *********************





    // Websocket Events
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
    // 7. RoomID is created from AdminID and EventID 26-0 or 26-1850

*/
// --------------------------------------------------------------------







// {
//   key_file_name: 'misc/key.pem',
//   cert_file_name: 'misc/cert.pem',
//   passphrase: '1234'
// }

// an "app" is much like Express.js apps with URL routes,
// here we handle WebSocket traffic on the wildcard "/*" route

const app = uWS.SSLApp(
{
  key_file_name: 'misc/key.pem',
  cert_file_name: 'misc/cert.pem',
  passphrase: '1234'
}    
).ws('/*',
{ 
    idleTimeout: 0, //20,
    backpressure: 1024,

    // handle messages from client
    // Since v18.0.0 req is no longer passed to the "open" handler. You can access it in the "upgrade" handler instead.
    // upgrade: (res, req, context) =>
    // {
    //     console.log('');
    //     console.log(' ----------------------- Open req : ', req.getQuery());
    //     console.log('');
    //     let queryObj = querystring.parse(req.getQuery());
    //     // console.log('parse query string : ', queryObj.adminid);
        
    //     /* This immediately calls open handler, you must not use res after this call */
    //     res.upgrade({
    //         url: req.getUrl(),
    //         client: {
    //                     adminID: queryObj.adminid,
    //                     roomID: queryObj.roomid,
    //                     eventID: queryObj.eventid,
    //                     adminRoomID: `${ queryObj.adminid }-${ queryObj.eventid }`,
    //                     tempEventID: queryObj.tempEventID,
    //                     tempMatchID: queryObj.tempMatchID,
    //                     deviceRoomNumber: queryObj.eventID, 
    //                     deviceCourtNumber: queryObj.deviceCourtNumber
    //                 }
    //     },
    //     /* Spell these correctly */
    //     req.getHeader('sec-websocket-key'),
    //     req.getHeader('sec-websocket-protocol'),
    //     req.getHeader('sec-websocket-extensions'),
    //     context);        
    // },

    open: (socket) => 
    {
        // console.log('A WebSocket connected with URL: ' + socket.url);
        console.log('Client Connection Open', socket); 


        // TODO: possibly send message that the device is connecte to room
        // ----------------------------------------------------------------
        // Let the Admin know that his device connected
        // Only the socket with Event ID == 0 are the Admin Devices
        // ----------------------------------------------------------------
        // if(socket.client.eventID == 0)
        // {
        //     /*
        //         When the client connects have them subscribe to the redis pub/sub
        //         Admin Device Room is adminID-0 (26-0)
        //     */  
        //     // Create the Initial Subscription for Redis - 
        //     subscriber.subscribe(`${ socket.client.adminID }-${ socket.client.eventID }`);  

        //     // Auto subscribe to the sockets pub/sub for uWebsockets (uses pub/sub internally)        
        //     socket.subscribe(`${ socket.client.adminID }-${ socket.client.eventID }`);  
        // }
        // else if(socket.client.eventID == 1)
        // {
        //     // Admin Device Room is adminID-1 (26-1)
        //     //  -> Used for Admin ScoreZone     

        //     // Create the Initial Subscription for Redis - 
        //     subscriber.subscribe(`${ socket.client.adminID }-${ socket.client.eventID }`);  

        //     // Auto subscribe to the sockets pub/sub for uWebsockets (uses pub/sub internally)        
        //     socket.subscribe(`${ socket.client.adminID }-${ socket.client.eventID }`);                     
        // }
        // else if(socket.client.tempEventID != 0 || socket.eventID != 1)
        // {
        //     // ----------------------------------------------------------------
        //     // Let the Bracket Management Tab his device Connected
        //     // Only the socket with Event ID == 0 are the Admin Devices
        //     // ----------------------------------------------------------------       
        //     /*
        //         When the client connects have them subscribe to the redis pub/sub
        //         Admin Device Room is adminID-1850 (26-1850)
        //     */
        //     subscriber.subscribe(`${ socket.client.adminID }-${ socket.client.eventID }`);       

        //     // Auto subscribe to the sockets pub/sub for uWebsockets (uses pub/sub internally)        
        //     socket.subscribe(`${ socket.client.adminID }-${ socket.client.eventID }`);                       
        // }        
 
    
    },


    /*
        This message section will be called from the tablets when they send to the server example (button click)
        client calls function - joinRoom - socket.send({action: 'join', room: 'admin-26', data: {}});
        save scores / save game / etc 
        message uses case statement to filter actions 
        actions then call publisher.publish() data is sent to all redis instances
    */
    message: (socket, message, isBinary) => 
    {
        // console.log('Server Side Socket obj : ', socket); 
        // console.log('Server Side message : ', JSON.parse(Buffer.from(message))); 
        // console.log('asdfasfs', String.fromCharCode.apply(null, message));
        let json = JSON.parse(decoder.write(Buffer.from(message)));
        // console.log(JSON.parse(decoder.write(Buffer.from(message))));
        // parse JSON and perform the action
        switch (json.action) 
        {
            case 'leave': 
            {
                // unsubscribe from the said drawing room
                socket.unsubscribe(json.room);
                break;
            }                
            case 'test-send':
            {
               // socket.send("This is a message, let's call it " + messageNumber);
                publisher.publish(`${socket.client.adminID}-0`, JSON.stringify({'action': 'test-send', data: 'test-send statement'}));               
               break;
            }    
            case 'ping':
            {
                // console.log('ping from client');
                socket.ping();
                break;
            }           
            case 'update-score-basic': 
            {
                // ----------------------------------------------------------
                // Listen when Scores have been updated
                // This should be the Match Info - with Scores
                // ----------------------------------------------------------                
                // console.log('update-score-basic Server Side message : ', json);
                console.log('update-score-basic Server Side message : ');  

                // Let ScoreZones know that scores are updated
                publisher.publish(`${socket.client.adminID}-1`, JSON.stringify( json ));          

                // Let LeaderBoard know that scores are updated
                publisher.publish(`${socket.client.adminID}-${ json.data.leagueID }`, JSON.stringify( json ));
                publisher.publish(`${socket.client.adminID}-${ json.data.eventID }`, JSON.stringify( json ));                           

                // draw something in drawing room
                // app.publish(json.room, json.message);
                break;
            }          
            case 'update-score-round': 
            {
                // ----------------------------------------------------------
                // Listen when Scores have been updated From Round / ESPN Mode
                // Includes InningParms with inning breakdown
                // ----------------------------------------------------------

                console.log('update-score-round Server Side message : ', json);  

                // Notifiy the Client Sockets
                json.event = 'update-score-basic';

                // Let ScoreZones know that scores are updated
                publisher.publish(`${socket.client.adminID}-1`, JSON.stringify( json ));                 

                // Let the LeaderBoard know that score are updated
                publisher.publish(`${socket.client.adminID}-${ json.data.leagueID }`, JSON.stringify( json ));  
                publisher.publish(`${socket.client.adminID}-${ json.data.eventID }`, JSON.stringify( json )); 

                break;
            }               
            case 'saved-match-scores-basic-device': 
            {
                // ----------------------------------------------------------
                // Listen when Match Scores Have been Successfully Saved
                // This should be the Match Info - with Scores
                // The Admin Portal know to refresh the schedule list
                // and assign the next set of matches
                // ----------------------------------------------------------                
                console.log('saved-match-scores-basic-device : ', json);  

                publisher.publish(`${socket.client.adminID}-0`, JSON.stringify( json )); 

                // Let ScoreZone know that scores are updated
                publisher.publish(`${socket.client.adminID}-1`, JSON.stringify( json ));                 

                // Let LeaderBoard know that scores are updated
                publisher.publish(`${socket.client.adminID}-${ json.data.leagueID }`, JSON.stringify( json )); 
                publisher.publish(`${socket.client.adminID}-${ json.data.eventID }`, JSON.stringify( json )); 
                break;
            }    
            case 'saved-match-scores-basic-admin': 
            {
                // ----------------------------------------------------------
                // Listen when Match Scores Have been Successfully Saved
                // This should be the Match Info - with Scores
                // The Admin Portal know to refresh the schedule list
                // and assign the next set of matches
                // ----------------------------------------------------------           
                console.log('saved-match-scores-basic-admin : ', json);  

                publisher.publish(`${socket.client.adminID}-0`, JSON.stringify( json )); 

                // Let ScoreZone know that scores are updated
                publisher.publish(`${socket.client.adminID}-1`, JSON.stringify( json ));                 

                // Let LeaderBoard know that scores are updated
                publisher.publish(`${socket.client.adminID}-${ json.data.leagueID }`, JSON.stringify( json )); 
                publisher.publish(`${socket.client.adminID}-${ json.data.eventID }`, JSON.stringify( json )); 
                break;
            }   
            case 'match-assigned-to-court': 
            {
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
                console.log('match-assigned-to-court : ', json);  


                // ----------------------------------------------------------------
                // Used by the ScoreZone connections Room ID = 1
                // Emit to All ScoreZone sockets in the Admins ScoreZone Room 26-1
                // socket.nsp.emit("onMatchAssignToCourt", data);
                // ----------------------------------------------------------------
                // Let ScoreZone know that scores are updated
                publisher.publish(`${socket.client.adminID}-1`, JSON.stringify( json )); 

                // ----------------------------------------------------------------
                // Emit to the LeaderBoard for the Event - used by Swap and Rounders
                // ----------------------------------------------------------------
                publisher.publish(`${socket.client.adminID}-${ json.data.leagueID }`, JSON.stringify( json )); 
                publisher.publish(`${socket.client.adminID}-${ json.data.eventID }`, JSON.stringify( json )); 

                // ----------------------------------------------------------------
                // - Set the action for the tablets to listen to only
                // ----------------------------------------------------------------
                json.action = 'court-number-assigned-to-device';

                publisher.publish(`${socket.client.adminID}-0`, JSON.stringify( json )); 

                break;
            }       
            case 'event-info-assigned-to-socket': 
            {
                // ----------------------------------------------------------
                // The Socket on the Client has added tempEventID and tempMatchID
                // Update the socket on the server
                // No need to do anything else this info will be used when a 
                // Device (Socket) disconnects and connects to let Admin Manage Bracket page know
                // ----------------------------------------------------------       
                console.log('event-info-assigned-to-socket : ', json);  

                publisher.publish(`${socket.client.adminID}-0`, JSON.stringify( json )); 
                // draw something in drawing room
                // app.publish(json.room, json.message);
                break;
            }          
            case 'navigated-to-score-tracker': 
            {
                // ----------------------------------------------------------
                // Listen when App has properly navigated to the ScoreTracker
                // either BASIC or ROUND
                // ---------------------------------------------------------- 
                console.log('navigated-to-score-tracker : ', json);  

                publisher.publish(`${socket.client.adminID}-0`, JSON.stringify( json )); 
                // draw something in drawing room
                // app.publish(json.room, json.message);
                break;
            }                                                  
        }
    },
    drain: (ws) => 
    {
        console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
    },
    close: (socket, code, message) => 
    {
        // Once you get the close event, you can no longer use the WebSocket whatsoever (it is dead).
        console.log('WebSocket closed', socket);
        console.log('WebSocket code', code);
        // console.log('WebSocket message', JSON.parse(decoder.write(Buffer.from(message))));
        // console.log('WebSocket message', message);
    } 
}).any('/*', (res, req) => {
  res.end('Nothing to see here!');
});

// ----------------------------------------------------
// http://localhost:9001/test
// ----------------------------------------------------
app.get('/test', (res, req) => 
{
  /* Static match */
  res.end('This is test very static');
});

// ----------------------------------------------------
// http://localhost:9001/home
// ----------------------------------------------------
app.get('/home', (res, req) => 
{
  /* Static match */
  // res.write('index.html');
});


// finally listen using the app on port 9001
app.listen(port, (listenSocket) => {
  if (listenSocket) {
    console.log(`Listening to port : ${ port } - env : ${ env }`);
  }
});
