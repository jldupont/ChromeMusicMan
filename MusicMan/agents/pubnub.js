/*
 * 
 * @author Jean-Lou Dupont
 * 
 * Dependencies:
 * - oo.js
 * - util.js   (safeGet)
 * - mswitch.js
 * 
 * MESSAGES IN:
 * - announce_track
 * - configData
 * - uuid
 * - current_*
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
		this.debug_details=false;
		this.debug=false;
		this.channel="music";
		this.configData={};
		this.name="PubNub";
		this.uuid=null;
		
		// keep track of incoming messages
		// in order to perform garbage collection
		this.subscribers={};
		
		// need to use localStorage or else lots of replay...
		//this.last_server_timestamp=null;
		this.ts_threshold=3; //seconds
		this.subscribe_delay=2; //wait cycles
		this.subscribe_current_delay=0;
	};

	PubNub.method("success", function(ctx, response){
		mswitch.publish({
			type:    "announce_result"
			,ctx:    ctx
			,status: "success"
			,data:   response
		}, this);		
	}); 	
	PubNub.method("error", function(ctx, response){
		//console.log("pubnub.error");
		//console.log(ctx);
		mswitch.publish({
			type:    "announce_result"
			,ctx:    ctx
			,status: "error"
			,data:   response
		}, this);		
	}); 	

	PubNub.method("isEnabled", function(ctx, response){
		var enabled=safeGet(this.configData, "pubnub_enabled");
		return enabled!==true && enabled!=="true";
	});
	
	PubNub.method("publish", function(msg){
		
		if (this.isEnabled()) {
			console.log("pubnub: not enabled");
			return;
		}
		
		// we need to add a timestamp to all
		// outgoing messages in order to perform
		// garbage collection
		msg.ts=getUTCTimestamp();
		
		// and a SEQ#
		msg.source_seq=getUniqueTimestamp();
		
		url=[
		     PUBNUB_WS
		     ,'publish'
		     ,safeGet(this.configData, "pubnub_keys", "pubkey")
		     ,safeGet(this.configData, "pubnub_keys", "subkey")
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
					console.error("pubnub.publish ERROR: "+response);
					console.error(e);
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
		
		if (this.isEnabled()) {
			olog(this, "pubnub: not enabled");
			return;
		}
		
		if (this.subscribe_current_delay!=this.subscribe_delay) {
			this.subscribe_current_delay++;
			return;
		}
		this.subscribe_current_delay=0;
			
		var localTS=getUTCTimestamp();	
		
		url=[
		     PUBNUB_WS
		     ,'subscribe'
		     ,safeGet(this.configData, "pubnub_keys", "subkey")
		     ,encode_url(this.channel)
		     ,0
		     ,localTS
		     ];
		
		var self=this;
		var pubnub_sources=getObjectFromLocalStorage("pubnub_sources");
		
		xdr(null, url,
				
			// subscribe: ***on success***
			// [[records...], server_timestamp]
			function(ctx, response){
				try {
					var respj=JSON.parse(response);
					
					var server_ts=respj[1]+"";
					var last_server_ts=localStorage["pubnub_last_server_timestamp"];
					var ts_check=(server_ts==last_server_ts);
					//console.log("server_ts("+server_ts+") last_server_ts("+last_server_ts+"): "+ts_check);
					//console.log(response);
					
					localStorage["pubnub_last_server_timestamp"]=respj[1]+"";
					
					mswitch.publish({type:"pubnub_ok"}, self);
					
					if (ts_check){
						//olog(self, "pubnub: no new messages");
						return;
					}
					//console.log(liste);
					
					function sortMsgBySeq(a,b) {
						if (a.source_seq && b.source_seq)
							if (a.source_seq < b.source_seq)
								return -1;
							else {
								if (a.source_seq>b.source_seq)
									return 1;
								return 0;
							}
						return 0; // doesn't matter
					};
					var liste=respj[0];
					liste.sort(sortMsgBySeq);
					
					//console.log(liste);
					
					each(liste, function(item){
						
						//console.log(item);
						
						if (item.source_seq===undefined) {
							olog(self, "pubnub.subscribe: message without SEQ# discarded from: "+item.source_uuid, true);
							return;
						};
						if (item.source_uuid===undefined) {
							olog(self, "pubnub.subscribe: message without a 'uuid'", true);
							return;
						}
						if (item.source_uuid==self.uuid) {
							olog(self, "pubnub.subscribe: message from self discarded", true);
							return;							
						}
						if (item.ts==undefined) {
							olog(self, "pubnub.subscribe: message without timestamp", true);
							return;							
						}
						
											
						//var ts_delta=item.ts-localTS;
						//if (ts_delta>self.ts_threshold) {
						//	olog(self, "pubnub.subscribe: discard old message, localTS: "+localTS, true);
						//	return;							
						//}
						// finally, check the SEQ# against our tracking
						var last_seq=pubnub_sources[item.source_uuid] || -1;
						
						//console.log("pubnub.subscribe: source seq("+item.source_seq+"), last seq("+last_seq+")");
						
						if (item.source_seq > 10000) { // need to weed-out old scheme 
							if (item.source_seq<=last_seq) {
								olog(self, "pubnub.subscribe: message with old SEQ("+item.source_seq+") from:"+item.source_uuid, true);
								saveObjectToLocalStorage("pubnub_sources", pubnub_sources);
								return;
							};
						} else {
							// weed-out...
							olog(self, "pubnub.subscribe: weeding-out...");
							return;
						};
						
						pubnub_sources[item.source_uuid]=item.source_seq;
						saveObjectToLocalStorage("pubnub_sources", pubnub_sources);
						                 
						// after all these checks, we can accept the message
						// * mark it as originating from a remote extension
						item.fromRemote=true;
						item.fromLocal=false;
						
						olog(self, "pubnub.subscribe: ACCEPTED SEQ("+item.source_seq+") from("+item.source_uuid+"): "+item.type, false);
						
						mswitch.publish(item, self);
					});//each liste
					
				}catch(e){
					console.error("pubnub.subscribe ERROR: "+response);
					console.error(e);
					self.error(ctx, response);
				}
			},
			//*** on error***
			function(ctx, response){
				self.error(ctx, response);
			}
		);//XDR
		
		//console.log("pubnub.subscribe: END");
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
		if (msg.type=="announce") {
			var cmsg=copyObject(msg);
			
			cmsg.source_uuid=this.uuid;
			cmsg.type=cmsg.subtype;
			
			this.publish(cmsg);
			return true;
		};
		
		if (msg.type=="configData") {
			this.configData=msg;
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
	
	//_pubnub.debug=true;
	
	_.push_proc(_pubnub, _pubnub.subscribe);
	mswitch.subscribe(_pubnub);
	
	
})();




