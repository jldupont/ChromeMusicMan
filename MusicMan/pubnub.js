/*
 * 
 * @author Jean-Lou Dupont
 * 
 * Dependencies:
 * - oo.js
 * - util2.js
 * - mswitch.js
 * 
 * MESSAGES IN:
 * - announce_track
 * - pubnub_keys
 * 
 * 
 * PubNub HTTP I/F:
 * 
 * https://pubsub.pubnub.com/publish/$pubkey/$subkey/$signature/$channel/$callback/$message
 * 
 * $signature can be '0'
 * 
 * https://pubsub.pubnub.com/subscribe/$subkey/$channel/$callback/$timetoken
 * 
 */

(window._pubnub || function(){

	var PUBNUB_WS="https://pubsub.pubnub.com/";

	function PubNub() {
		this.channel="music";
		this.keys={};
	};

	PubNub.method("onsuccess", function(ctx, response){
		
	}); 

	PubNub.method("onerror", function(ctx, response){
		
	}); 
	
	PubNub.method("publish", function(msg){		
		url=[
		     PUBNUB_WS
		     ,'publish'
		     ,this.keys["pubkey"]
		     ,this.keys["subkey"]
		     ,0
		     ,encode_url(this.channel)
		     ,0
		     ,encode_url(msg)
		     ];
		
		var self=this;
		xdr(null, uri,
				
			//on success
			function(ctx, response){
				mswitch.publish({
					type:    "announce_result"
					,status: "success"
					,data:   response
				});
			},
			//on error
			function(ctx, response){
				mswitch.publish({
					type:	"announce_result"
					,state: "error"
					,data:  response
				});
			}
		);//xdr
		
	});

	PubNub.method("subscribe", function(){
		
	});

	PubNub.method("mailbox", function(msg){
		
		if (msg.type=="pubnub_keys") {
			this.keys=msg.keys;
			return true; // we are interested
		};
		
		/*
		 * msg.ctx    : context
		 * msg.source : which player
		 * msg.artist
		 * msg.album
		 * msg.song
		 * 
		 */
		if (msg.type=="announce_track") {
			
			return true;
		};
	});
	
	// =============================================================================
	// HELPERS

	_pubnub=new PubNub(); //private
	mswitch.subscribe(_pubnub);
	
})();




