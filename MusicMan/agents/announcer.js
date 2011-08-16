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
	Agent.call(this);
	console.log("AnnouncerAgent created");
};

AnnouncerAgent.inherits(Agent);

aAnnouncer=new AnnouncerAgent();
aAnnouncer.init();
