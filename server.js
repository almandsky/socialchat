var async   = require('async');
var express = require('express');
var util    = require('util');

// create an express webserver
var app = express.createServer(
  express.logger(),
  express.static(__dirname + '/public'),
  express.bodyParser(),
  express.cookieParser(),
  // set this to a secret value to encrypt session cookies
  express.session({ secret: process.env.SESSION_SECRET || 'secret123' }),
  require('faceplate').middleware({
    app_id: process.env.FACEBOOK_APP_ID || '371656099548187',
    secret: process.env.FACEBOOK_SECRET || '625e6e12db08440489bc5a671ecfc3ec',
    scope:  'user_likes,user_photos,user_photo_video_tags'
  })
);


app.configure(function(){
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + '/public'));
});

//Add socket.io
var io = require('socket.io').listen(app)


// listen to the PORT given to us in the environment
var port = process.env['app_port'] || process.env.PORT || 4080;

app.listen(port, function() {
  console.log("Listening on " + port);
});

app.dynamicHelpers({
'host': function(req, res) {
    return req.headers['host'];
  },
'scheme': function(req, res) {
	if (req.headers['x-forwarded-proto'] === undefined){
		return 'http'
	} else {
    	return req.headers['x-forwarded-proto'] || 'http'
	}
  },
'url_no_scheme': function(req, res) {
    return function(path) {
      return '://' + app.dynamicViewHelpers.host(req, res) + path;
    }
  },
});

/*
app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  },
  'host': function(req, res) {
    return req.headers['host'];
  },
  'scheme': function(req, res) {
    req.headers['x-forwarded-proto'] || 'http'
  },
  'url': function(req, res) {
    return function(path) {
      return app.dynamicViewHelpers.scheme(req, res) + app.dynamicViewHelpers.url_no_scheme(path);
    }
  },
  'url_no_scheme': function(req, res) {
    return function(path) {
      return '://' + app.dynamicViewHelpers.host(req, res) + path;
    }
  },
});
*/


function render_page(req, res) {
  req.facebook.app(function(app) {
    req.facebook.me(function(user) {
      res.render('index2.ejs', {
        layout:    false,
        req:       req,
        app:       app,
        user:      user
      });
    });
  });
}

function handle_facebook_request(req, res) {

  // if the user is logged in
  if (req.facebook.token) {

    async.parallel([
      function(cb) {
        // query 4 friends and send them to the socket for this socket id
        req.facebook.get('/me/friends', { limit: 4 }, function(friends) {
          req.friends = friends;
          cb();
        });
      },
      function(cb) {
        // query 16 photos and send them to the socket for this socket id
        req.facebook.get('/me/photos', { limit: 16 }, function(photos) {
          req.photos = photos;
          cb();
        });
      },
      function(cb) {
        // query 4 likes and send them to the socket for this socket id
        req.facebook.get('/me/likes', { limit: 4 }, function(likes) {
          req.likes = likes;
          cb();
        });
      },
      function(cb) {
        // use fql to get a list of my friends that are using this app
        req.facebook.fql('SELECT uid, name, is_app_user, pic_square FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1', function(result) {
          req.friends_using_app = result;
          cb();
        });
      }
    ], function() {
      render_page(req, res);
    });

  } else {
    render_page(req, res);
  }
}

app.get('/', handle_facebook_request);
app.post('/', handle_facebook_request);


//Add the socket.io codes

/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );

/**
 * HTTP server
 */

//Sky: use the socket.io server, no need to create the http server by myself.
/*
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});
*/



/**
 * WebSocket server
 */
//Sky: use the socket.io server, no need to create the http server by myself.
/*
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. To be honest I don't understand why.
    httpServer: server
});
*/


// This callback function is called every time someone
// tries to connect to the WebSocket server

/*
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});
*/



/**
 * Sky: This is the DB created in Nodejitsu to store the chat history
 */
console.log((new Date()) + ' Preparing for DB Conection');
var databaseUrl = "mongodb://nodejitsu:a5ca3279a71b623cafcb04bfe509f0cf@staff.mongohq.com:10025/nodejitsudb34997110727"; 
var collections = ["chathistory"]
var db = require("mongojs").connect(databaseUrl, collections);

console.log((new Date()) + ' DB Conected.  Fetching data');

db.chathistory.find(function(err, chathistory) {
  if( err || !chathistory) console.log((new Date()) + "No chat history found");
  else chathistory.forEach( function(loadhistory) {
    //console.log(loadhistory);
    if (loadhistory.text.indexOf('|') < 0){
        history.push(loadhistory);
    }
  } );
  console.log((new Date()) + ' All chat history data loaded');
});

console.log((new Date()) + ' After data fetching function');


/*
db.users.save({email: "srirangan@gmail.com", password: "iLoveMongo", sex: "male"}, function(err, saved) {
  if( err || !saved ) console.log("User not saved");
  else console.log("User saved");
});


db.users.update({email: "srirangan@gmail.com"}, {$set: {password: "iReallyLoveMongo"}}, function(err, updated) {
  if( err || !updated ) console.log("User not updated");
  else console.log("User updated");
});
*/



io.sockets.on('connection', function (socket) {
  console.log((new Date()) + ' Connection accepted.');
  var userName = false;
  var userColor = false;
  var userType = false;
  // send back chat history

  // Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );
  
  if (history.length > 0) {
	  
      //connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
      console.log((new Date()) + ' bradcast the history');
      socket.json.send({ type: 'history', data: history });
  }
  

/*
  socket.on('history', function (message) {
	
	  if (history.length > 0) {
	      //connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
	      console.log((new Date()) + ' bradcast the history');
	      socket.json.send({ type: 'history', data: history });
	  }
	
  });
*/
  socket.on('message', function (message) { 
	  //console.log((new Date()) + ' message received');
	  //console.dir(message);
	  
      //if (message.type === 'utf8') { // accept only text
          if (userName === false || userName === undefined) { // first message sent by user is their name
              // remember user name
              var tempobj = htmlEntities(message);
              var tempnum = tempobj.indexOf('|');

              //Get the user id and name
              if (tempnum){
	                //get the user type
	                userType = tempobj.substr(0,tempnum);
	                var tempstr = tempobj.substr(tempnum+1,tempobj.length);
	                
	                // get the user ID
	                tempnum = tempstr.indexOf('|');
	                userColor = tempstr.substr(0,tempnum);
					userName = tempstr.substr(tempnum+1,tempstr.length);
	                
	
	
	
              } else {
	                userName = htmlEntities(message);
	                userColor = colors.shift();
	                userType = 'facebook';
              }

              

              // get random color and send it back to the user
              //userColor = colors.shift();
              //connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
              socket.json.send({ type:'color', data: userColor });
              console.log((new Date()) + ' User is known as: ' + userName
                          + ' with id ' + userColor );

          } else { // log and broadcast the message
              console.log((new Date()) + ' Received Message from '
                          + userName + ': ' + message);
              
              // we want to keep history of all sent messages
              var obj = {
                  time: (new Date()).getTime(),
                  text: htmlEntities(message),
                  author: userName,
                  color: userColor,
                  acctype: userType
              };
              
		 	  // Only send back the message without the '|'
              if (message.indexOf('|') < 0){

                history.push(obj);
	            history = history.slice(-100);
	
		      	db.chathistory.save(obj, function(err, saved) {
					  if( err || !saved ) console.log((new Date()) + "Chat History not saved");
					  else {
						 console.log((new Date()) + "Chat History saved");
					  }
			      });
	          } else {
				
				console.log((new Date()) + "ERROR: there is invalid message found.");
				console.dir(obj);
			  }

              // broadcast message to all connected clients
              //var json = JSON.stringify({ type:'message', data: obj });
              /*
              for (var i=0; i < clients.length; i++) {
                  clients[i].sendUTF(json);
              }
              */
              //socket.broadcast.json.send(json);
              socket.json.send({ type:'message', data: obj });
              socket.broadcast.json.send({ type:'message', data: obj });
          }
      //}
	
  });
  socket.on('disconnect', function (connection) { 
      if (userName !== false && userColor !== false) {
          console.log((new Date()) + " Peer "
              + connection + " disconnected.");
          // remove user from the list of connected clients
          //clients.splice(index, 1);
          // push back user's color to be reused by another user
          //colors.push(userColor);
      }

  });
});
