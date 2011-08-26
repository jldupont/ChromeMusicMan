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

		this.seq=0;
		// all
		this.subscribers=[];
		
		this.debug=false;
		this.debug_details=false;
		this.log_interests=false;

		this.reported_undecided={};
		this.decoders={};
		
		// keep out of logging
		this.filters={
			"pubnub_ok":true
			,"uuid": true
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

	_mswitch.method("publish", function(msg, source){
		
		if (source===undefined) {
			console.error("mswitch.publish: source not specified");
			return;
		};
		
		if (msg.type===undefined) {
			console.warn("mswitch.publish: type is undefined");
			return;
		};
		
		this.seq++;
		this.dump(msg);
		
		var self=this; // for the closures below
		
		each(self.subscribers, function(agent, _index){
		
			if (agent==source) {
				if (self.debug_details) {
					//console.log("mswitch.publish: discarding message to self...");
				};
				return;
			};
			
			// check if the agent is *not* interested
			var map=agent.mswitch_subscribe_map_not_interested || {};
			
			// If there is an entry, the agent was interested previously
			if (map[msg.type]!==undefined) {
				return;
			};
			
			if (self.debug_details)
				if (self.filters[msg.type]!==true)
					if (source)
						console.log("mswitch.publish("+self.seq+") '"+msg.type+"' to agent '"+agent.name+"' from: "+source.name);
					else
						console.log("mswitch.publish("+self.seq+") '"+msg.type+"' to agent '"+agent.name+"'");
			
			var result=agent.mailbox.call(agent, msg);
			
			if (result===true) {
				var map=agent.mswitch_subscribe_interested || {};
				map[msg.type]=true;
				agent.mswitch_subscribe_interested=map;
				return;
			};
			
			if (result===undefined) {
				var key=agent.name+msg.type;
				var decided=self.reported_undecided[key];
				self.reported_undecided[key]=true;
				if (!decided) {
					console.log("mswitch.publish '"+msg.type+"': Agent '"+agent.name+"' is undecided...");
				}
				return;
			};
			
			if (result===false) {
				map[msg.type]=true; //truly not intested
				agent.mswitch_subscribe_map_not_interested=map;
				
				if (this.log_interests)
					dlog("mswitch: agent '"+agent.name+"' not interested in '"+msg.type+"'");
			}
		});//each
		
	});//publish

	/*
	 * For debug purposes
	 */
	_mswitch.method("decoder", function(type, decoder_function){
		this.decoders[type]=decoder_function;
	});
	
	_mswitch.method("dump", function(msg){
		if (!this.debug)
			return;
		
		if (this.filters[msg.type]==true)
			return;
		
		var decoder=this.decoders[msg.type];

		var decoded="???";
		if (decoder)
			decoded=decoder(msg);
		
		this._dump(msg, decoded);
	});
	
	_mswitch.method("_dump", function(msg, decoded){
		console.log("mswitch.publish: '"+msg.type+"' fromRemote("+msg.fromRemote+") fromLocal("+msg.fromLocal+"): "+decoded);
	});
	
	
	mswitch=new _mswitch();
	
})();
