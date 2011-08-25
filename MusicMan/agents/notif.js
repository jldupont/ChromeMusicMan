/*
 * Notif.js
 * 
 * Desktop Notification Agent
 * 
 * @author Jean-Lou Dupont
 * 
 * @dependencies
 * - oo.js
 * 
 */

(window._notif || function(){

	function NotifAgent() {
		this.notif=null;
		this.DURATION=6;
		this.count=0;
	};
	
	NotifAgent.method("mailbox", function(msg){
	
		if (msg.type=="current_track") {
			this.display(msg);
			return true;
		};

		return false;
	});
		
	NotifAgent.method("display", function(msg){
		
		if (this.notif)
			return;
		
		this.notif = webkitNotifications.createNotification(
				  'res/icon48.jpg',
				  'MusicMan - Current Track',
				  msg.artist+" '"+msg.song+"' ("+msg.album+")"
				);
		this.notif.show();
	});
	
	NotifAgent.method("_gc", function(msg){
		if (this.notif==null)
			return;
		
		this.count++;
		if (this.count>this.DURATION) {
			this.count=0;
			this.notif.cancel();
			this.notif=null;
		};
	});
	
	_notif=new NotifAgent();
	_.push_proc(_notif, _notif._gc);
	mswitch.subscribe(_notif);
	
})();

