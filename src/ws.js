/*
 *  ws.js
 *  
 *   WebSocket
 *   
 *   @author Jean-Lou Dupont
 *   
 *   @dependencies:  oo.js
 */

function WS(on_open_callback, on_msg_callback, on_close_callback, debug) {
	this.isConnected=false;
	this.connection=null;
	this.debug=debug || false;
	this.on_open=on_open_callback;
	this.on_msg=on_msg_callback;
	this.on_close=on_close_callback;
};

WS.method("isConnected", function(){
	return this.isConnected;
});

WS.method("connect", function(){
	var self=this;
	this.connection=new WebSocket('ws://localhost:1337/');
	
	this.connection.onopen= function() {
		self.isConnected=true;
		if (self.debug) {
			console.log("WS: connection open");
		};
		self.on_open();
	};
	
	this.connection.onmessage= function(msg) {
		self.on_msg(msg.data);
		if (self.debug) {
			console.log(msg.data);
		};		
	};
	
	this.connection.onclose= function(e) {
		self.on_close();
		if (self.debug) {
			console.log("WS: connection close");
		};		
	};
});
