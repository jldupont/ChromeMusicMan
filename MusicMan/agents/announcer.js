/*
 * Announcer Agent
 * 
 * @desc Publishes information about currently playing
 * 		 track over on PubNub
 * 
 * @dependencies
 * 		- oo.js
 * 		- util2.js
 * 
 * @author Jean-Lou Dupont
 */

aAnnouncer=new Agent("Announcer");

aAnnouncer.max_backoff=8;
aAnnouncer.max_retries=3;
aAnnouncer.sources={};

/*
 * API
 */
aAnnouncer.toAnnounce = function(source_name, msg) {
	
	// get existing 'retries' from current entry for 'source'
	// ... if it exists
	var src=this.sources[source_name] || {};
	var retries=src.retries || this.max_retries; 
	
	msg.retries=retries;
	
	this.sources[source_name]=msg;
};

/*
 *  @process
 *  Announces over PubNub the current state of the given 'source'
 */
aAnnouncer.announce = function(){
	//console.log(".announce");
	console.log(this.sources);
	var toDelete=[];
	
	var self=this;
	
	each(this.sources, function(source_name, msg){
		console.log("announce, source("+source_name+"): msg: "+msg);
		self.sources[source_name].retries--;
		if (self.sources[source_name].retries==0)
			toDelete.push(source_name);
	});
	each(toDelete, function(source_name){
		console.log("Deleting source("+source_name+")");
		delete self.sources[source_name];
	});
};


// PROCESSES
aAnnouncer.push_proc(aAnnouncer, aAnnouncer.announce);
