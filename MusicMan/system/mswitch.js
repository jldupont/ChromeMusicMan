/*
 * Message Switch
 *
 * @desc  Each subscriber gets at least the first occurence of a message-type:
 * 			it is the responsibility of the subscriber to return its "interest"
 * 			for a particular 'message type'.
 * 
 * 		  Suscribers must implement the 'mailbox' method.
 * 
 * NOTE:  'no interest' map stored in the Agent
 * 
 * @dependencies:
 * 	- oo.js     ('.method')
 *  - util.js   ('each', 'dlog')
 * 
 * @author Jean-Lou Dupont
 */

(window.mswitch || function(){

	function _mswitch() {

		// all
		this.subscribers=[];
		
		this.debug=false;
		this.log_interests=false;
		
		// keep out of logging
		this.filters={
			"pubnub_ok":true
			,"uuid": true
			,"pubnub_keys": true
		};
	};

	/*
	 * All Agents subscribe but each need to
	 *  reply to a 'publish' with their "interest" 
	 *  in a message type i.e. reply 'true' if they are 
	 *  interested by a message-type they receive
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
			var map=agent.mswitch_subscribe_map_not_interested || {};
			
			// If there is an entry, the agent was interested previously
			if (map[msg.type]!==undefined) {
				return;
			};
			
			if (self.debug)
				if (self.filters[msg.type]!==true)				
					console.log("mswitch.publish '"+msg.type+"' to agent '"+agent.name+"'");
			
			var result=agent.mailbox.call(agent, msg);
			
			if (result!==true) {
				map[msg.type]=true; //truly not intested
				agent.mswitch_subscribe_map_not_interested=map;
				
				if (this.log_interests)
					dlog("mswitch: agent '"+agent.name+"' not interested in '"+msg.type+"'");
			}
		});//each
		
	});//publish

	mswitch=new _mswitch();
	
})();
