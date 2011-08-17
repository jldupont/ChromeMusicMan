/*
 * Message Switch
 * 
 * @dependencies:
 * 	- oo.js
 *  - util2.js  ('each')
 * 
 * @author Jean-Lou Dupont
 */

function MSwitch() {

	// all
	this.subscribers=[];
	
	// by mtype
	this.subscribe_map_interested={};
	this.subscribe_map_not_interested={};
	
	// agents by name
	this.agent_map={};
};

/*
 * All Agents subscribe but each need to
 *  reply to a 'publish' with their "interest" 
 *  in a message type
 *  
 *  agent=[name, scope, fn]
 */
mswitch.method("subscribe", function(agent){
	this.subscribers.push(agent);
});

mswitch.method("publish", function(msg){
	if (msg.type===undefined) {
		console.warn("mswitch.publish: type is undefined");
		return;
	};
	
	each(this.subscribers, function(agent, index){
		
	});
});

mswitch=new MSwitch();
