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

function AnnouncerAgent() {
	this.Agent=new Agent();
	this.count=0;
};

AnnouncerAgent.method("announce", function(){
	if (this.count>10)
		return;
	console.log("announce!");
	this.count++;
});

aAnnouncer=new AnnouncerAgent();
aAnnouncer.Agent.push_task(aAnnouncer, aAnnouncer.announce);
