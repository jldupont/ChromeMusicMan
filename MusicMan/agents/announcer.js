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
aAnnouncer.toAnnounce = function(source, msg) {
	
	msg.retries=max.retries || this.max_retries; 
	this.sources[source]=msg;
};

/*
 *  @process
 *  Announces over PubNub the current state of the given 'source'
 */
aAnnouncer.announce = function(){

	console.log("announce!");
	this.count++;
	
};


// PROCESSES
aAnnouncer.push_proc(aAnnouncer, aAnnouncer.announce);
