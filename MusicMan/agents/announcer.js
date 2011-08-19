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
 * - pubnub_keys
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
	this.per_second=2;  //cycles per second
	this.max_backoff=8; //seconds
	this.max_retries=3;
	this.sources={};
	this.pubnub_keys={};
	this.name="Announcer";
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
	
	if (msg.type=="pubnub_keys") {
		this.pubnub_keys=msg.keys;
		return true;
	};
	
	if (msg.type=="current_track") {
		this.toAnnounce(msg.source, msg);
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
	
	msg.inprogress=true;
	mswitch.publish({
		type: "announce_track"
		,source: msg.source
		,ctx:    msg.source
		,artist: msg.artist
		,album:  msg.album
		,song:   msg.song
	});
});

aAnnouncer=new Announcer();

// PROCESSES
_.push_proc(aAnnouncer, aAnnouncer.announce);

// Hook-up to message switch
mswitch.subscribe(aAnnouncer);


