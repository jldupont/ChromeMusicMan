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
 * @author Jean-Lou Dupont
 */

var Announcer=function (){
	this.pn=new PubNub();
	this.per_second=2;  //cycles per second
	this.max_backoff=8; //seconds
	this.max_retries=3;
	this.sources={};
	this.pubnub_keys={};
};


/********************************************************************
 * API
 */

/*
 * Replace or Insert
 */
Announcer.method("toAnnounce", function(source_name, msg) {
	
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
	console.log("aAnnouncer.mailbox: "+msg.type);
	
	if (msg.type=="pubnub_keys") {
		this.pubnub_keys=msg.keys;
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
	//console.log(".announce");
	//console.log(this.sources);
	
	var toDelete=[];

	// for the closures below...
	var self=this;
	
	each(this.sources, function(source_name, msg){
		
		if (msg.inprogress)
			return;
		
		console.log("announce, source("+source_name+"): msg: "+msg);
		
		msg.retries--;
		if (msg.retries==0) {
			toDelete.push(source_name);
		} else {
			if (msg.wait>0) {
				msg.wait--;
			}
			if (msg.wait==0) {
				this.doPubNubPublish(source_name, msg);
			}
		};
	});
	
	each(toDelete, function(source_name){
		console.log("Deleting source("+source_name+")");
		delete self.sources[source_name];
	});
});

/*
 * PubNub.method("publish", function(msg, onsuccess, onerror)
 */
Announcer.method("doPubNubPublish", function(source_name, msg){
	msg.inprogress=true;
	
});

aAnnouncer=new Announcer();

// PROCESSES
_.push_proc(aAnnouncer, aAnnouncer.announce);

// Hook-up to message switch
mswitch.subscribe(aAnnouncer);


