var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var everyauth = require('everyauth');
var conf = require('./conf');

//For socket.io
var async   = require('async');

var port = process.env['app_port'] || process.env.PORT || 80;

//start of everyauth

everyauth.debug = true;

var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

var usersByVimeoId = {};
var usersByJustintvId = {};
var usersBy37signalsId = {};
var usersByTumblrName = {};
var usersByDropboxId = {};
var usersByFbId = {};
var usersByTwitId = {};
var usersByGhId = {};
var usersByInstagramId = {};
var usersByFoursquareId = {};
var usersByGowallaId = {};
var usersByLinkedinId = {};
var usersByGoogleId = {};
var usersByAngelListId = {};
var usersByYahooId = {};
var usersByGoogleHybridId = {};
var usersByReadabilityId = {};
var usersByBoxId = {};
var usersByOpenId = {};
var usersByDwollaId = {};
var usersByVkId = {};
var usersBySkyrockId = {};
var usersByEvernoteId = {};
var usersByAzureAcs = {};
var usersByTripIt = {};
var usersBy500pxId = {};
var usersBySoundCloudId = {};
var usersByMailchimpId = {};
var usersMailruId = {};
var usersByMendeleyId = {};
var usersByLogin = {
  'brian@example.com': addUser({ login: 'brian@example.com', password: 'password'})
};

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

everyauth.azureacs
  .identityProviderUrl('https://acssample1.accesscontrol.windows.net/v2/wsfederation/')
  .entryPath('/auth/azureacs')
  .callbackPath('/auth/azureacs/callback')
  .signingKey('d0julb9JNbCB8J2ACHzxU33SSiqbylQveQtuwOEvz24=')
  .realm('urn:nodeacslocal')
  .homeRealm('')
  .tokenFormat('swt')
  .findOrCreateUser( function (session, acsUser) {
     return usersByAzureAcs[acsUser.id] || (usersByAzureAcs[acsUser.id] = addUser('azureAcs', acsUser));
  })
  .redirectPath('/');

everyauth
  .openid
    .myHostname('http://local.host:3000')
    .findOrCreateUser( function (session, userMetadata) {
      return usersByOpenId[userMetadata.claimedIdentifier] ||
        (usersByOpenId[userMetadata.claimedIdentifier] = addUser('openid', userMetadata));
    })
    .redirectPath('/');


everyauth
  .facebook
    .appId(conf.fb.appId)
    .appSecret(conf.fb.appSecret)
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
      return usersByFbId[fbUserMetadata.id] ||
        (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
    })
    .redirectPath('/');

everyauth
  .twitter
    .consumerKey(conf.twit.consumerKey)
    .consumerSecret(conf.twit.consumerSecret)
    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
      return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
    })
    .redirectPath('/');

everyauth
  .password
    .loginWith('email')
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login.jade')
//    .loginLocals({
//      title: 'Login'
//    })
//    .loginLocals(function (req, res) {
//      return {
//        title: 'Login'
//      }
//    })
    .loginLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Async login'
        });
      }, 200);
    })
    .authenticate( function (login, password) {
      var errors = [];
      if (!login) errors.push('Missing login');
      if (!password) errors.push('Missing password');
      if (errors.length) return errors;
      var user = usersByLogin[login];
      if (!user) return ['Login failed'];
      if (user.password !== password) return ['Login failed'];
      return user;
    })

    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('register.jade')
//    .registerLocals({
//      title: 'Register'
//    })
//    .registerLocals(function (req, res) {
//      return {
//        title: 'Sync Register'
//      }
//    })
    .registerLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Async Register'
        });
      }, 200);
    })
    .validateRegistration( function (newUserAttrs, errors) {
      var login = newUserAttrs.login;
      if (usersByLogin[login]) errors.push('Login already taken');
      return errors;
    })
    .registerUser( function (newUserAttrs) {
      var login = newUserAttrs[this.loginKey()];
      return usersByLogin[login] = addUser(newUserAttrs);
    })

    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/');

everyauth.github
  .appId(conf.github.appId)
  .appSecret(conf.github.appSecret)
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, ghUser) {
      return usersByGhId[ghUser.id] || (usersByGhId[ghUser.id] = addUser('github', ghUser));
  })
  .redirectPath('/');

everyauth.instagram
  .appId(conf.instagram.clientId)
  .appSecret(conf.instagram.clientSecret)
  .scope('basic')
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, hipster) {
      return usersByInstagramId[hipster.id] || (usersByInstagramId[hipster.id] = addUser('instagram', hipster));
  })
  .redirectPath('/');

everyauth.foursquare
  .appId(conf.foursquare.clientId)
  .appSecret(conf.foursquare.clientSecret)
  .findOrCreateUser( function (sess, accessTok, accessTokExtra, addict) {
      return usersByFoursquareId[addict.id] || (usersByFoursquareId[addict.id] = addUser('foursquare', addict));
  })
  .redirectPath('/');

everyauth.gowalla
  .appId(conf.gowalla.apiKey)
  .appSecret(conf.gowalla.apiSecret)
  .moduleErrback( function(err) {
    console.log("moduleErrback for Gowalla", err);
  })
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, loser) {
    return usersByGowallaId[loser.url] || (usersByGowallaId[loser.url] = addUser('gowalla', loser));
  })
  .redirectPath('/');

everyauth.linkedin
  .consumerKey(conf.linkedin.apiKey)
  .consumerSecret(conf.linkedin.apiSecret)
  .findOrCreateUser( function (sess, accessToken, accessSecret, linkedinUser) {
    return usersByLinkedinId[linkedinUser.id] || (usersByLinkedinId[linkedinUser.id] = addUser('linkedin', linkedinUser));
  })
  .redirectPath('/');

everyauth.google
  .appId(conf.google.clientId)
  .appSecret(conf.google.clientSecret)
  .scope('https://www.googleapis.com/auth/userinfo.profile https://www.google.com/m8/feeds/')
  .findOrCreateUser( function (sess, accessToken, extra, googleUser) {
    googleUser.refreshToken = extra.refresh_token;
    googleUser.expiresIn = extra.expires_in;
    return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
  })
  .redirectPath('/');

everyauth.angellist
  .appId(conf.angellist.clientId)
  .appSecret(conf.angellist.clientSecret)
  .findOrCreateUser( function (sess, accessToken, extra, angellistUser) {
    angellistUser.refreshToken = extra.refresh_token;
    angellistUser.expiresIn = extra.expires_in;
    return usersByAngelListId[angellistUser.id] || (usersByAngelListId[angellistUser.id] = addUser('angellist', angellistUser));
  })
  .redirectPath('/');

everyauth.yahoo
  .consumerKey(conf.yahoo.consumerKey)
  .consumerSecret(conf.yahoo.consumerSecret)
  .findOrCreateUser( function (sess, accessToken, accessSecret, yahooUser) {
    return usersByYahooId[yahooUser.id] || (usersByYahooId[yahooUser.id] = addUser('yahoo', yahooUser));
  })
  .redirectPath('/');

everyauth.googlehybrid
  .myHostname('http://local.host:3000')
  .consumerKey(conf.googlehybrid.consumerKey)
  .consumerSecret(conf.googlehybrid.consumerSecret)
  .scope(['http://docs.google.com/feeds/','http://spreadsheets.google.com/feeds/'])
  .findOrCreateUser( function(session, userAttributes) {
    return usersByGoogleHybridId[userAttributes.claimedIdentifier] || (usersByGoogleHybridId[userAttributes.claimedIdentifier] = addUser('googlehybrid', userAttributes));
  })
  .redirectPath('/');

everyauth.readability
  .consumerKey(conf.readability.consumerKey)
  .consumerSecret(conf.readability.consumerSecret)
  .findOrCreateUser( function (sess, accessToken, accessSecret, reader) {
      return usersByReadabilityId[reader.username] || (usersByReadabilityId[reader.username] = addUser('readability', reader));
  })
  .redirectPath('/');

everyauth
  .dropbox
    .consumerKey(conf.dropbox.consumerKey)
    .consumerSecret(conf.dropbox.consumerSecret)
    .findOrCreateUser( function (sess, accessToken, accessSecret, dropboxUserMetadata) {
      return usersByDropboxId[dropboxUserMetadata.uid] ||
        (usersByDropboxId[dropboxUserMetadata.uid] = addUser('dropbox', dropboxUserMetadata));
    })
    .redirectPath('/')

everyauth.vimeo
	.consumerKey(conf.vimeo.consumerKey)
	.consumerSecret(conf.vimeo.consumerSecret)
	.findOrCreateUser( function (sess, accessToken, accessSecret, vimeoUser) {
		return usersByVimeoId[vimeoUser.id] ||
			(usersByVimeoId[vimeoUser.id] = vimeoUser);
	})
	.redirectPath('/')

everyauth.justintv
  .consumerKey(conf.justintv.consumerKey)
  .consumerSecret(conf.justintv.consumerSecret)
  .findOrCreateUser( function (sess, accessToken, accessSecret, justintvUser) {
    return usersByJustintvId[justintvUser.id] ||
      (usersByJustintvId[justintvUser.id] = addUser('justintv', justintvUser));
  })
  .redirectPath('/')

everyauth['37signals']
  .appId(conf['_37signals'].clientId)
  .appSecret(conf['_37signals'].clientSecret)
  .findOrCreateUser( function (sess, accessToken, accessSecret, _37signalsUser) {
    return usersBy37signalsId[_37signalsUser.id] ||
      (usersBy37signalsId[_37signalsUser.identity.id] = addUser('37signals', _37signalsUser));
  })
  .redirectPath('/')

everyauth.tumblr
  .consumerKey(conf.tumblr.consumerKey)
  .consumerSecret(conf.tumblr.consumerSecret)
  .findOrCreateUser( function (sess, accessToken, accessSecret, tumblrUser) {
    return usersByTumblrName[tumblrUser.name] ||
      (usersByTumblrName[tumblrUser.name] = addUser('tumblr', tumblrUser));
  })
  .redirectPath('/');

everyauth.box
  .apiKey(conf.box.apiKey)
  .findOrCreateUser( function (sess, authToken, boxUser) {
    return usersByBoxId[boxUser.user_id] ||
      (usersByDropboxId[boxUser.user_id] = addUser('box', boxUser));
  })
  .redirectPath('/');

everyauth.dwolla
  .appId(conf.dwolla.clientId)
  .appSecret(conf.dwolla.clientSecret)
  .scope('accountinfofull')
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, dwollaUser) {
    return usersByDwollaId[dwollaUser.id] || (usersByDwollaId[dwollaUser.id] = addUser('dwolla', dwollaUser));
  })
  .redirectPath('/');

everyauth.vkontakte
  .appId(conf.vkontakte.appId)
  .appSecret(conf.vkontakte.appSecret)
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, vkUserMetadata) {
    return usersByVkId[vkUserMetadata.uid] ||
      (usersByVkId[vkUserMetadata.uid] = addUser('vkontakte', vkUserMetadata));
  })
  .redirectPath('/');
/*
everyauth.mailru
  .appId(conf.mailru.appId)
  .appSecret(conf.mailru.appSecret)
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, mlUserMetadata) {
    return usersMailruId[mlUserMetadata.uid] ||
      (usersMailruId[mlUserMetadata.uid] = addUser('mailru', mlUserMetadata));
  })
  .redirectPath('/');
*/
everyauth.skyrock
  .consumerKey(conf.skyrock.consumerKey)
  .consumerSecret(conf.skyrock.consumerSecret)
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, skyrockUser) {
    return usersBySkyrockId[skyrockUser.id_user] || (usersBySkyrockId[skyrockUser.id_user] = addUser('skyrock', skyrockUser));
  })
  .redirectPath('/');

everyauth.evernote
  .oauthHost(conf.evernote.oauthHost)
  .consumerKey(conf.evernote.consumerKey)
  .consumerSecret(conf.evernote.consumerSecret)
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, enUserMetadata) {
    return usersByEvernoteId[enUserMetadata.userId] || (usersByEvernoteId[enUserMetadata.userId] = addUser('evernote', enUserMetadata));
  })
  .redirectPath('/');

everyauth.tripit
  .consumerKey(conf.tripit.consumerKey)
  .consumerSecret(conf.tripit.consumerSecret)
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, tripitProfile) {
    var userId = tripitProfile['@attributes'].ref;
    return usersByTripIt[userId] || (usersByTripIt[userId] = addUser('tripit', tripitProfile));
  })
  .redirectPath('/');

everyauth['500px']
  .consumerKey(conf._500px.consumerKey)
  .consumerSecret(conf._500px.consumerSecret)
  .findOrCreateUser(function(sess, accessToken, accessSecret, user) {
    return usersBy500pxId[user.id] || (usersBy500pxId[user.id] = addUser('500px', user));
  })
  .redirectPath('/');

/*
everyauth.mendeley
  .consumerKey(conf.mendeley.consumerKey)
  .consumerSecret(conf.mendeley.consumerSecret)
  .findOrCreateUser(function(sess, accessToken, accessSecret, user) {
    return usersByMendeleyId[user.main.profile_id] || (usersByMendeleyId[user.main.profile_id] = addUser('mendeley', user));
  })
  .redirectPath('/');

everyauth
  .soundcloud
    .appId(conf.soundcloud.appId)
    .appSecret(conf.soundcloud.appSecret)
    .findOrCreateUser( function (sess, accessToken, accessTokenExtra, soundcloudUser) {
      return usersBySoundCloudId[soundcloudUser.id] || (usersBySoundCloudId[soundcloudUser.id] = addUser('soundcloud', soundcloudUser));
    })
    .redirectPath('/');

everyauth
  .mixi
    .appId(conf.mixi.consumerKey)
    .appSecret(conf.mixi.consumerSecret)
    .scope(conf.mixi.scope)
    .display('pc')
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, mixiUserMetadata) {
      return usersByFbId[mixiUserMetadata.id] ||
        (usersByFbId[mixiUserMetadata.id] = addUser('mixi', mixiUserMetadata));
    })
    .redirectPath('/');

everyauth
  .mailchimp
    .appId(conf.mailchimp.appId)
    .appSecret(conf.mailchimp.appSecret)
    .myHostname(process.env.HOSTNAME || "http://127.0.0.1:3000")//MC requires 127.0.0.1 for dev
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, mailchimpUser){
      return usersByMailchimpId[mailchimpUser.id] ||
        (usersByMailchimpId[mailchimpUser.user_id] = addUser('mailchimp', mailchimpUser));
    })
    .redirectPath("/");
*/


//End of everyauth

var app = express.createServer(
	  express.bodyParser()
	, express.static(__dirname + "/public")
	, express.favicon()
	, express.cookieParser()
	, express.session({ secret: 'htuayreve'})
	, everyauth.middleware()
	);



// configure Express

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
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



app.get('/', function(req, res){
//  console.log("app object is: =====================================================");
//  console.dir(app);	
//  console.log("req object is: =====================================================");
//  console.dir(req);
  console.log("req.user object is: =====================================================");
  console.dir(req.user);

  res.render('index3', { 
	layout:    false,
    req:       req,
    app:       app,
    user: req.user 
  });
});




app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


//Add socket.io
var io = require('socket.io').listen(app)



app.listen(port, function() {
  console.log("Listening on " + port);
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}



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
 * Sky: This is the DB created in Nodejitsu to store the chat history
 */
console.log((new Date()) + ' Preparing for DB Conection');
var databaseUrl = "mongodb://nodejitsu:a5ca3279a71b623cafcb04bfe509f0cf@staff.mongohq.com:10025/nodejitsudb34997110727"; 
var collections = ["chathistory2"]
var db = require("mongojs").connect(databaseUrl, collections);

console.log((new Date()) + ' DB Conected.  Fetching data');

db.chathistory2.find(function(err, chathistory2) {
  if( err || !chathistory2) console.log((new Date()) + "No chat history found");
  else chathistory2.forEach( function(loadhistory) {
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
  var userID = false;
  var userType = false;
  var userPhoto = false;
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
	  //console.dir(JSON.parse(message));
  	//  console.dir(message.data);

       

          if (userName === false || userName === undefined) { // first message sent by user is their name
              // remember user name
              var tempobj = JSON.parse(message);
              //console.dir(tempobj);

              if (tempobj){


				userType = tempobj.acctype;
				userID = tempobj.userid;
				userName = tempobj.author;
				userPhoto = tempobj.picture;
              
			  }
              //console.log("user name is: " + userName);

              // get random color and send it back to the user
              //userColor = colors.shift();
              //connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
              socket.json.send({ type:'user', data: userID });
              console.log((new Date()) + ' User is known as: ' + userName
                          + ' with id ' + userID );

          } else { // log and broadcast the message
              console.log((new Date()) + ' Received Message from '
                          + userName + ': ' + message);
              
              // we want to keep history of all sent messages
              var obj = {
                  time: (new Date()).getTime(),
                  text: htmlEntities(message),
                  author: userName,
                  userid: userID,
                  acctype: userType,
                  picture: userPhoto
              };
              
		 	  // Only send back the message without the '|'
              if (message.indexOf('|') < 0){

                history.push(obj);
	            history = history.slice(-100);
	
	/*
		      	db.chathistory2.save(obj, function(err, saved) {
					  if( err || !saved ) console.log((new Date()) + "Chat History not saved");
					  else {
						 console.log((new Date()) + "Chat History saved");
					  }
			      });
	*/		
			
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
      if (userName !== false && userID !== false) {
          console.log((new Date()) + " Peer "
              + connection + " disconnected.");
          // remove user from the list of connected clients
          //clients.splice(index, 1);
          // push back user's color to be reused by another user
          //colors.push(userColor);
      }

      // Reset the user data
	  userName = false;
	  userID = false;
	  userType = false;
	  userPhoto = false;

  });
});
