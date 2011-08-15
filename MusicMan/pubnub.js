/*
 * 
 * @author Jean-Lou Dupont
 * 
 * Dependencies:
 * - oo.js
 * - util2.js
 * 
 * 
 * PubNub HTTP I/F:
 * 
 * https://pubsub.pubnub.com/publish/$pubkey/$subkey/$signature/$channel/$callback/$message
 * 
 * $signature can be '0'
 * 
 * https://pubsub.pubnub.com/subscribe/$subkey/$channel/$callback/$timetoken
 * 
 */

var PUBNUB_WS="https://pubsub.pubnub.com/";

function PubNub(pubkey, subkey, seckey, channel) {
	this.channel=channel;
	this.pubkey=pubkey;
	this.subkey=subkey;
	this.seckey=seckey;
};

PubNub.method("publish", function(msg, onsuccess, onerror){
	
	url=[
	     PUBNUB_WS
	     ,'publish'
	     ,this.pubkey
	     ,this.subkey
	     ,0
	     ,encode(this.channel)
	     ,0
	     ,encode(msg)
	     ];
	
	xdr(null, uri, onsuccess, onerror);
});

PubNub.method("subscribe", function(){
	
});



// =============================================================================
// HELPERS


/**
 * ENCODE
 * ======
 * var encoded_path = encode('path');
 */
function encode(path) {
    return map( (encodeURIComponent(path)).split(''), function(chr) {
        return "-_.!~*'()".indexOf(chr) < 0 ? chr :
               "%"+chr.charCodeAt(0).toString(16).toUpperCase()
    } ).join('');
};
