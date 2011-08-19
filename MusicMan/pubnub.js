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
 * - uuid
 * 
 * 
 * PubNub HTTP I/F:
 * 
 * https://pubsub.pubnub.com/publish/$pubkey/$subkey/$signature/$channel/$callback/$message
 * 
 *  --> Returns [1,S] upon success
 *  --> Returns [0, $error_msg]  upon error
 * 
 * $signature can be '0'
 * 
 * https://pubsub.pubnub.com/subscribe/$subkey/$channel/$callback/$timetoken
 * 
 */

(window._pubnub || function(){

	var PUBNUB_WS="https://pubsub.pubnub.com";

	function PubNub() {
		this.channel="music";
		this.keys={};
		this.name="PubNub";
		this.uuid=null;
		this.last_server_timestamp=null;
		this.ts_threshold=5; //seconds
		this.subscribe_delay=2; //wait cycles
		this.subscribe_current_delay=0;
	};

	PubNub.method("success", function(ctx, response){
		mswitch.publish({
			type:    "announce_result"
			,ctx:    ctx
			,status: "success"
			,data:   response
		});		
	}); 	
	PubNub.method("error", function(ctx, response){
		console.log("pubnub.error");
		console.log(ctx);
		mswitch.publish({
			type:    "announce_result"
			,ctx:    ctx
			,status: "error"
			,data:   response
		});		
	}); 	
	
	PubNub.method("publish", function(msg){
		
		// we need to add a timestamp to all
		// outgoing messages in order to perform
		// garbage collection
		msg.ts=getUTCTimestamp();
		
		url=[
		     PUBNUB_WS
		     ,'publish'
		     ,this.keys["pubkey"]
		     ,this.keys["subkey"]
		     ,0
		     ,encode_url(this.channel)
		     ,0
		     ,encode_url(JSON.stringify(msg))
		     ];
		
		var self=this;
		xdr(msg, url,
			
			//on success, from an HTTP request 
			// point of view at least... Need to analyze
			// PubNub protocol level too
			function(ctx, response){
			
				try {
					var rep=JSON.parse(response);
					if (rep[0]==1)
						self.success(ctx, response);
					else
						self.error(ctx, response);
				}catch(e){
					self.error(ctx, response);
				}
			}, //HTTP level success handler
			function(ctx, response){
				//on error
				self.error(ctx, response);
			}//HTTP level error handler
		);//xdr
		
	});

	PubNub.method("subscribe", function(){
		
		if (this.subscribe_current_delay!=this.subscribe_delay) {
			this.subscribe_current_delay++;
			return;
		}
		this.subscribe_current_delay=0;
		
		var localTS=getUTCTimestamp();
		
		url=[
		     PUBNUB_WS
		     ,'subscribe'
		     ,this.keys["subkey"]
		     ,encode_url(this.channel)
		     ,0
		     ,localTS
		     ];
		
		var self=this;
		xdr(null, url,
			//on success
			// [[records...], server_timestamp]
			function(ctx, response){
				try {
					var respj=JSON.parse(response);
					var liste=respj[0];
					var server_ts=respj[1];
					var ts_check=(server_ts==self.last_server_timestamp);
					//console.log("server_ts("+server_ts+") last_server_ts("+self.last_server_timestamp+")");
					self.last_server_timestamp=server_ts;
					
					if (ts_check){
						if (self.debug) {
							console.log("pubnub: no new messages");
						};
						return;
					}
					each(liste, function(item){
						if (item.source_uudi===undefined) {
							//console.warn("pubnub: message without a 'uuid': "+item);
							return;
						}
						if (item.source_uudi==self.uuid) {
							if (self.debug) {
								console.log("pubnub: message from self discarded");
							}
							return;							
						}
						if (item.ts==undefined) {
							if (self.debug) {
								console.log("pubnub: message without timestamp: "+item);
							}
							return;							
						}
						var ts_delta=item.ts-localTS;
						if (ts_delta>self.ts_threshold) {
							if (debug){
								console.log("pubnub: discard old message: "+item);
							}
							return;							
						}
						// after all these checks, we can accept the message
						mswitch.publish(item);
					});//each liste
					
				}catch(e){
					self.error(ctx, response);
				}
			},
			//on error
			function(ctx, response){
				self.error(ctx, response);
			}
		);
	});

	PubNub.method("mailbox", function(msg){
		
		/*
		 * msg.ctx    : context
		 * msg.source : which player
		 * msg.artist
		 * msg.album
		 * msg.song
		 * 
		 * {"type":"current_track",
		 * 		"source_uuid":"F1168B4BCFDB4DF097948826580788A1",
		 * 		"source":"gs",
		 * 		"artist":"OceanLab",
		 * 		"album":"Sirens of the Sea",
		 * 		"song":"I Am What I Am"
		 * }
		 * XXX
		 */
		if (msg.type=="announce_track") {
			this.publish({
				type:    "current_track"
				,source_uuid: this.uuid
				,source: msg.source
				,artist: msg.artist
				,album:  msg.album
				,song:   msg.song
			});
			return true;
		};
		
		if (msg.type=="pubnub_keys") {
			this.keys=msg.keys;
			return true; // we are interested
		};
		
		if (msg.type=="uuid") {
			this.uuid=msg.uuid;
			return true;
		};
		
		// default is "not interested"
		return false;
	});
	
	// =============================================================================
	// HELPERS

	_pubnub=new PubNub(); //private
	_.push_proc(_pubnub, _pubnub.subscribe);
	mswitch.subscribe(_pubnub);
	
})();




