$(function () {
    "use strict";

 	  // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    var userid = $('#userid');
    var username = $('#username');

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;
	
	
	
	  var socket = io.connect();
	  socket.on('connect', function () {
	    //socket.send('hi');
	    if (myName === false) {
            input.val('');
			socket.send(userid.val() + '|' + username.val());
	        myName=username.val();
	        console.log("New User name is: " + myName);
        } else {
	        console.log("User name exist: " + myName);
        }
	    
        //console.log("connection built from client");
        //input.removeAttr('disabled');
        //status.text('Choose name:');


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
        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
            status.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').focus();
            // from now user can start sending messages
        } else if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text,
                           json.data[i].color, new Date(json.data[i].time));
            }
        } else if (json.type === 'message') { // it's a single message
            input.removeAttr('disabled'); // let the user write another message
            addMessage(json.data.author, json.data.text,
                       json.data.color, new Date(json.data.time));
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
	
	
	    });
	
	
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
	            if (myName === false) {
	                myName = msg;
	            }
	        }
	    });
	
	
		/**
	     * Add message to the chat window
	     */
	    function addMessage(author, message, color, dt) {
		    /*
	        content.append('<p><span style="color:' + color + '">' + author + '</span> @ ' +
	             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
	             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
	             + ': ' + message + '</p>');
	        */

	        content.append('<p><div class="UIImageBlock clearfix"><a data-hovercard="/ajax/hovercard/hovercard.php?id=' + color + '" data-ft="{&quot;type&quot;:60,&quot;tn&quot;:&quot;\u003C&quot;}" aria-hidden="true" tabindex="-1" href="http://www.facebook.com/' + color + '" class="actorPhoto UIImageBlock_Image UIImageBlock_MED_Image"><img style="width:32px;height:32px" alt="" src="https://graph.facebook.com/' + color + '/picture?type=square" class="uiProfilePhoto profilePic uiProfilePhotoLarge img"></a><div class="storyInnerContent UIImageBlock_Content UIImageBlock_MED_Content"><div class="mainWrapper"><h6 data-ft="{&quot;tn&quot;:&quot;:&quot;}" class="uiStreamMessage uiStreamHeadline"><div data-ft="{&quot;type&quot;:2,&quot;tn&quot;:&quot;:&quot;}" class="actorDescription actorName"><a data-ft="{&quot;tn&quot;:&quot;;&quot;}" href="http://www.facebook.com/' + color + '">' + author + '</a></div></h6><h6 data-ft="{&quot;type&quot;:1,&quot;tn&quot;:&quot;K&quot;}" class="uiStreamMessage"> <span data-ft="{&quot;type&quot;:3}" class="messageBody">' + message + '</span></h6><form id="usccqv_1" onsubmit="return Event.__inlineSubmit(this,event)" action="/ajax/ufi/modify.php" method="post" class="commentable_item collapsed_comments autoexpand_mode" rel="async"><input type="hidden" value="€,´,€,´,水,Д,Є" name="charset_test"><input type="hidden" autocomplete="off" value="AQADxKYw" name="fb_dtsg"><span class="uiStreamFooter"><span data-ft="{&quot;tn&quot;:&quot;=&quot;,&quot;type&quot;:20}" class="UIActionLinks UIActionLinks_bottom"></span><span data-ft="{&quot;type&quot;:26,&quot;tn&quot;:&quot;N&quot;}" class="uiStreamSource"><abbr class="timestamp livetimestamp" data-utime="" title="">'

				+ (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
			     + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
			     + '</abbr></span></span></form></div></div></div></p>');
			
	    }

      });

});
