/*
 * Announcer Agent
 * 
 * @desc Publishes information about currently playing
 * 		 track over on PubNub
 * 
 * @dependencies
 * 		- oo.js
 * 		- util2.js
 * 		- pubnub.js
 *      - mswitch.js
 * 
 * MESSAGES IN:
 * - current_track
 * - announce_result
 * 
 * MESSAGES OUT:
 * - announce_track
 * - pubnub_error
 * - pubnub_ok
 * 
 * @author Jean-Lou Dupont
 */

var Announcer=function (){
	this.debug=false;
	this.per_second=2;  //cycles per second
	this.max_backoff=8; //seconds
	this.max_retries=3;
	this.sources={};
	this.name="Announcer";
	this.uuid=null;
	this.canBeAnnounced={
		current_track: true
		,current_state: true
		,playback_control: true
	};
};


/********************************************************************
 * API
 */

/*
 * Replace or Insert
 */
Announcer.method("toAnnounce", function(source_name, msg) {
	//console.log("toAnnounce");
	//console.log(msg);
	
	// get existing 'retries' from current entry for 'source'
	// ... if it exists  OR insert a new one
	var src=this.sources[source_name] || {};
	
	var retries=src.retries || this.max_retries; 
	msg.retries=retries;
	
	var wait=src.wait || 0;
	msg.wait=wait;
	
	var inprogress=src.inprogress || false;
	msg.inprogress=inprogress;
	
	this.sources[source_name]=msg;
});


// ******************************************************************************
// ******************************************************************************


Announcer.method("mailbox", function(msg){
	//console.log("aAnnouncer.mailbox: "+msg.type);

	if (msg.fromRemote==true) {
		if (this.debug)
			console.log("Announcer.mailbox: msg '"+msg.type+"' was from remote... discarded");
		
		// mswitch will interpret this as "undecided about msg.type"
		return;
	};
	
	if (this.canBeAnnounced[msg.type]==true) {
		if (this.debug)
			console.log("Announcer.mailbox: can be announced '"+msg.type+"'");

		this.toAnnounce(msg.source, msg);
		return true;
	};
	
	// DO NOT CROSS OVER 
	
	if (msg.type=="uuid") {
		this.uuid=msg.uuid;
		return true;
	};
	
	// CAUTION:  ctx==source
	if (msg.type=="announce_result") {
		//console.log("Announcer: announce result: "+msg.status);
			
		var source=msg.ctx.source;
		if (msg.status=="success") {
			delete this.sources[source];
			//console.log("Announcer: success with '"+source+"'");
			//console.log(this.sources);
			mswitch.publish({ type: "pubnub_ok" });
		} else {
			this.sources[source].inprogress=false;
		}
		return true;
	};
	
	// by default, not interested
	return false;
});

/*
 *  @process
 *  Announces over PubNub the current state of the given 'source'
 */
Announcer.method("announce", function(){
	//console.log("Announcer.announce");
	//console.log(this.sources);
	
	var toDelete=[];

	// for the closures below...
	var self=this;
	
	each(this.sources, function(source_name, msg){
		
		if (msg.inprogress)
			return;
		
		//console.log("announce, source("+source_name+")");
		//console.log(msg);
		
		msg.retries--;
		if (msg.retries==0) {
			toDelete.push(source_name);
			mswitch.publish({type: "pubnub_error"});
		} else {
			if (msg.wait>0) {
				msg.wait--;
			}
			if (msg.wait==0) {
				self.doPubNubPublish(source_name, msg);
			}
		};
	});
	
	each(toDelete, function(source_name){
		//console.log("Deleting source("+source_name+")");
		delete self.sources[source_name];
	});
});

/*
 * PubNub.method("publish", function(msg, onsuccess, onerror)
 */
Announcer.method("doPubNubPublish", function(source_name, msg){
	//console.log("Announcer.doPubNubPublish");
	
	// cut loops!
	if (msg.source_uuid!=this.uuid) {
		if (this.debug)
			console.log("Announcer.doPubNubPublish: msg '"+msg.type+"' was from remote... discarded")		
		return;
	}
	
	var cmsg=copyObject(msg);
	
	msg.inprogress=true;
	
	// bridge to PubNub Agent
	cmsg.subtype=cmsg.type;
	cmsg.type="announce";
	
	mswitch.publish(cmsg);
});

aAnnouncer=new Announcer();

// PROCESSES
_.push_proc(aAnnouncer, aAnnouncer.announce);

// Hook-up to message switch
mswitch.subscribe(aAnnouncer);


