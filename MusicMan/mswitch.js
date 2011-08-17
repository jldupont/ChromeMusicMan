/*
 * Message Switch
 * 
 * @dependencies:
 * 	- oo.js
 *  - util2.js  ('each')
 * 
 * @author Jean-Lou Dupont
 */

(window.mswitch || function(){

	function _mswitch() {

		// all
		this.subscribers=[];
		
		// by mtype
		this.subscribe_map_not_interested={};
	};

	/*
	 * All Agents subscribe but each need to
	 *  reply to a 'publish' with their "interest" 
	 *  in a message type
	 *  
	 *  agent={name, scope, fn}
	 */
	_mswitch.method("subscribe", function(agent){
		this.subscribers.push(agent);
	});

	_mswitch.method("publish", function(msg){
		if (msg.type===undefined) {
			console.warn("mswitch.publish: type is undefined");
			return;
		};
		
		var self=this; // for the closures below
		
		each(self.subscribers, function(agent, _index){
			
			// check if the agent is *not* interested
			var map=self.subscribe_map_not_interested[msg.type] || {};
			if (map[msg.type]!==undefined) {
				return;
			};
			
			if (self.debug)
				console.log("mswitch.publish '"+msg.type+"'");
			
			var result=agent.mailbox.call(agent, msg);
			
			if (result===false) {
				map[msg.type]=true; //truly not intested
				self.subscribe_map_not_interested[msg.type]=map;
				console.log("mswitch: agent '"+agent.name+"' not interested in '"+msg.type+"'");
			}
		});//each
		
	});//publish

	mswitch=new _mswitch();	
})();
