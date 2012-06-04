$(function () {
    "use strict";

 	  // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    var userid = $('#userid');
    var username = $('#username');
    var acctype = $('#acctype');
    var picture = $('#userpicture');

    //For user listing
    var userstatus =  $('#userstatus');
    var userlist =  $('#userlist');
    var totaluser =  $('#totaluser');


    // my ID assigned by the server
    var myID = false;
    // my name sent to the server
    var myName = false;

	// my account type sent to the server
    var myAccType = false;
	
	// if history is obtained before, no need to show it again.
	var historyshown = false;


	  var socket = io.connect();
//	  var socket = io.connect('http://ec2-72-44-39-177.compute-1.amazonaws.com:80/');
	  socket.on('connect', function () {
	    //socket.send('hi');
	    /*
	    if (myName === false) {
            input.val('');
			socket.send(userid.val() + '|' + username.val());
	        myName=username.val();
	        console.log("New User name is: " + myName);
        } else {
	        console.log("User name exist: " + myName);
        }
        */
        input.val('');
/*
		var tempmsgjson = { data: {
              author: username.val(),
              userid: userid.val(),
              acctype: acctype.val(),
              picture: picture.val()
            }
          }
*/

		var tempmsgjson = '{ "author": "' + username.val() + '" , "userid":  "' + userid.val() + '" , "acctype": "' + acctype.val()  + '" , "picture":  "' + picture.val() + '"  }';




		socket.send(tempmsgjson);
        myName=username.val();
        console.log("User name is: " + myName + '.  I am from ' + acctype.val());
	    
        //console.log("connection built from client");
        //input.removeAttr('disabled');
        //status.text('Choose name:');


		/**
	     * Send mesage when user presses Enter key
	     */
	    input.keydown(function(e) {
	        if (e.keyCode === 13) {
	            var msg = $(this).val();
	            if (!msg) {
	                return;
	            }
	            // send the message as an ordinary text
	            socket.send(msg);
	            $(this).val('');
	            // disable the input field to make the user wait until server
	            // sends back response
	            input.attr('disabled', 'disabled');

	            // we know that the first message sent from a user their name
	            //if (myName === false) {
	            //    myName = msg;
	            //}
	        }
	    });
	
		
		

      });

		socket.on('message', function (message) {
          // my msg
          //console.log("message received");
          //console.dir(message);
          // try to parse JSON message. Because we know that the server always returns
          // JSON this should work without any problem but we should make sure that
          // the massage is not chunked or otherwise damaged.
          try {
              //var json = JSON.parse(message.data);
              var json = message;
          } catch (e) {
              console.log('This doesn\'t look like a valid JSON: ', message.data);
              return;
          }

          // NOTE: if you're not sure about the JSON structure
          // check the server source code above
          if (json.type === 'user') { // first response from the server with user's color
             // console.log(json.data);

			  if (json.data.author === undefined ){
				
				//Show the new login user in the userstatus bar
				  //userstatus.text('anonymous user joined'); 
				  //console.log('User ' + json.data.author + ' (' + json.data.acctype + ') logged in');

	              //addUser(json.data.acctype, json.data.author,
	              //           json.data.userid, new Date(json.data.time), json.data.picture);

			  } else {
			  	socket.emit('userlogedin', json.data);
			
				  //Show the new login user in the userstatus bar
				  //userstatus.text('User ' + json.data.author + ' (' + json.data.acctype + ') logged in'); 
				  //console.log('User ' + json.data.author + ' (' + json.data.acctype + ') logged in');

	              //addUser(json.data.acctype, json.data.author,
	              //           json.data.userid, new Date(json.data.time), json.data.picture);

	              myID = json.data;
	              //status.text(myName + ': ').css('color', myColor);
	              input.removeAttr('disabled').focus();
              	
			  }
              // from now user can start sending messages
          } else if (json.type === 'history') { // entire message history
	          content.empty();

              for (var i=0; i < json.data.length; i++) {
                  addMessage(json.data[i].acctype, json.data[i].author, json.data[i].text,
                         json.data[i].userid, new Date(json.data[i].time), json.data[i].picture);
              }
              //historyshown = true;

		  } else if (json.type === 'userlist') { // entire message history
	          userlist.empty();
	
	          totaluser.text('There are ' + json.data.length + ' users currently in this chat room including you. Click here to see who they are.');

              for (var i=0; i < json.data.length; i++) {
                  addUser(json.data[i].acctype, json.data[i].author,
                         json.data[i].userid, new Date(json.data[i].time), json.data[i].picture);
              }
              //historyshown = true;

		  } else if (json.type === 'userjoined') { // entire message history
			  
	          if (json.data.author === 'undefined' ){

				//Show the new login user in the userstatus bar
				  userstatus.text('anonymous user joined'); 
				  //console.log('User ' + json.data.author + ' (' + json.data.acctype + ') logged in');

	              //addUser(json.data.acctype, json.data.author,
	              //           json.data.userid, new Date(json.data.time), json.data.picture);

			  } else {
			  	//socket.emit('userlogedin', json.data);

				  //Show the new login user in the userstatus bar
				  userstatus.text('User ' + json.data.author + ' (' + json.data.acctype + ') logged in'); 
				  //console.log('User ' + json.data.author + ' (' + json.data.acctype + ') logged in');

	              //addUser(json.data.acctype, json.data.author,
	              //           json.data.userid, new Date(json.data.time), json.data.picture);

	              //myID = json.data;
	              //status.text(myName + ': ').css('color', myColor);
	             // input.removeAttr('disabled').focus();

			  }
			
			  //Clear the status message after 2 seconds.
			
			
              //addUser(json.data.acctype, json.data.author,
              //       json.data.userid, new Date(json.data.time), json.data.picture);
              //historyshown = true;

          } else if (json.type === 'message') { // it's a single message
              input.removeAttr('disabled'); // let the user write another message
              addMessage(json.data.acctype, json.data.author, json.data.text,
                         json.data.userid, new Date(json.data.time), json.data.picture);
          } else {
              console.log('Hmm..., I\'ve never seen JSON like this: ', json);
          }
	
	
	    });
	
		socket.on('disconnect', function(myName) {
		  	
			console.log('disconnected');
			input.val('Server disconnected.');
			input.attr('disabled', 'disabled');
			userlist.empty();
			
		});
		
		/**
	     * Add message to the chat window
	     */
	    function addMessageold(author, message, acc_id, dt) {
		    /*
	        content.append('<p><span style="color:' + color + '">' + author + '</span> @ ' +
	             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
	             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
	             + ': ' + message + '</p>');
	        */

	        content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=' + acc_id + '" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="http://www.facebook.com/' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="http://graph.facebook.com/' + acc_id + '/picture?type=square" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" href="http://www.facebook.com/' + acc_id + '">' + author + '</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

				+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
			     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
			     + '</abbr></span></span></form></div></div></div></p>');
			
	    }
	
	    /**
	     * Add message to the chat window
	     */
	    /*
	    function addMessage(acc_type, author, message, acc_id, dt) {
			
	        if (acc_id === undefined || acc_id === 'undefined'){
		        acc_id = '';
			}
	
            if (acc_type ==='facebook') {
	          content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=' + acc_id + '" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="http://www.facebook.com/' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="http://graph.facebook.com/' + acc_id + '/picture?type=square" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" href="http://www.facebook.com/' + acc_id + '">' + author + ' (Facebook)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

				+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
			     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
			     + '</abbr></span></span></form></div></div></div></p>');
			} else if (acc_type === 'google') {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="http://plus.google.com/' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + acc_id + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:red">' + author + ' (Google)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			} else {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + acc_id + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:black">' + author + '</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			}
	    }
	    */
	
		/**
	     * Add message to the chat window
	     */
	    function addMessage(acc_type, author, message, acc_id, dt, user_img) {
		    /*
	        content.append('<p><span style="color:' + color + '">' + author + '</span> @ ' +
	             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
	             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
	             + ': ' + message + '</p>');
	        */
	
	        
	        if (acc_id === undefined || acc_id === 'undefined'){
		        acc_id = '';
			}
			
			if (acc_type === undefined || acc_type === 'undefined'){
		        acc_type = '';
			}
			
	
            if (acc_type ==='facebook') {
	          content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=' + acc_id + '" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="http://www.facebook.com/' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="http://graph.facebook.com/' + acc_id + '/picture?type=square" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" href="http://www.facebook.com/' + acc_id + '">' + author + ' (Facebook)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

				+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
			     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
			     + '</abbr></span></span></form></div></div></div></p>');
			} else if (acc_type === 'google') {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="http://plus.google.com/' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + user_img + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:red" href="http://plus.google.com/' + acc_id + '">' + author + ' (Google)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			} else if (acc_type === 'yahoo') {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="http://profile.yahoo.com/' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + user_img + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:purple" href="http://profile.yahoo.com/' + acc_id + '">' + author + ' (Yahoo)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			} else if (acc_type === 'linkedin') {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + user_img + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:black" href="' + acc_id + '">' + author + ' (Linked in)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			} else if (acc_type === 'twitter') {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="https://twitter.com/#!/' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + user_img + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:#0084B4" href="https://twitter.com/#!/' + acc_id + '">' + author + ' (Twitter)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			} else {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + acc_id + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:black">' + author + '</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'
				
					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			}
	    }


		/**
	     * Add user to the user list
	     */
	    function addUser(acc_type, author, acc_id, dt, user_img) {
		    /*
	        content.append('<p><span style="color:' + color + '">' + author + '</span> @ ' +
	             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
	             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
	             + ': ' + message + '</p>');
	        */
	
			if (acc_id === undefined || acc_id === 'undefined'){
		        acc_id = '';
			}
			
			if (acc_type === undefined || acc_type === 'undefined'){
		        acc_type = '';
			}
			
			if (user_img === undefined || user_img === 'undefined'){
		        user_img = '/images/nobody.png';
			}
			
			
	
			var userlink = false;
			var userdisplayname = false
			
			if (acc_type ==='facebook') {
	            userlink = 'https://www.facebook.com/' + acc_id;
	            userdisplayname = author + ' (' +  acc_type + ')';
			} else if (acc_type === 'google') {
				userlink = 'http://plus.google.com/' + acc_id;
	            userdisplayname = author + ' (' +  acc_type + ')';
			} else if (acc_type === 'yahoo') {
				userlink = 'http://profile.yahoo.com/' + acc_id;
	            userdisplayname = author + ' (' +  acc_type + ')';
			} else if (acc_type === 'linkedin') {
				userlink = acc_id;
	            userdisplayname = author + ' (' +  acc_type + ')';
			} else if (acc_type === 'twitter') {
				userlink = 'https://twitter.com/#!/' + acc_id;
	            userdisplayname = author + ' (' +  acc_type + ')';
			} else {
			    userlink = '';
	            userdisplayname = 'anonymous';
			}
	


			userlist.append('<div id="' + acc_type + acc_id + ' " class="friends"><a href="' + userlink + '" target="_top"><img style="width:20px" src="' + user_img + '">' + userdisplayname + '</a></div>');
	        
	
	
			/*
	        if (acc_id === undefined || acc_id === 'undefined'){
		        acc_id = '';
			}
			
			if (acc_type === undefined || acc_type === 'undefined'){
		        acc_type = '';
			}
			
	
            if (acc_type ==='facebook') {
	          userlist.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=' + acc_id + '" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="http://www.facebook.com/' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="http://graph.facebook.com/' + acc_id + '/picture?type=square" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" href="http://www.facebook.com/' + acc_id + '">' + author + ' (Facebook)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

				+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
			     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
			     + '</abbr></span></span></form></div></div></div></p>');
			} else if (acc_type === 'google') {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="http://plus.google.com/' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + user_img + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:red" href="http://plus.google.com/' + acc_id + '">' + author + ' (Google)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			} else if (acc_type === 'yahoo') {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="http://profile.yahoo.com/' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + user_img + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:purple" href="http://profile.yahoo.com/' + acc_id + '">' + author + ' (Yahoo)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			} else if (acc_type === 'linkedin') {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + user_img + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:black" href="' + acc_id + '">' + author + ' (Linked in)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			} else if (acc_type === 'twitter') {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="https://twitter.com/#!/' + acc_id + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + user_img + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:#0084B4" href="https://twitter.com/#!/' + acc_id + '">' + author + ' (Twitter)</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			} else {
				content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="' + acc_id + '" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" style="color:black">' + author + '</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'
				
					+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
				     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
				     + '</abbr></span></span></form></div></div></div></p>');
			}
			*/
	    }
	
	

});
