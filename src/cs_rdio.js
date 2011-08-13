/**
 * Content script for Rdio.com 
 * 
 *
 * @author Jean-Lou Dupont
 * 
 * 
 * API:
 *   Messaging from extension: msg.mtype= [previous | next | play-pause]
 *   Messaging to   extension: msg.type=[current_track|current_state]
 * 
 **/
var last_song=null;
var last_artist=null;
var last_album=null;
var last_state=null;

function getNodeValue(node) {
	var nodeEl=document.getElementById(node);
	//console.log(nodeEl);
	var nodeA=nodeEl.getElementsByTagName("a")[0];
	//console.log(nodeA);
	return nodeA.firstChild && nodeA.firstChild.data;	
};

function getDetails(){
	var details=getElementsByClassName("player_now_playing_info")[0];
	return details;
};

var details=getDetails();

/**
 * Keep listening for changes to the part of the DOM
 * where the current track information is displayed
 */
details.addEventListener('DOMSubtreeModified', function(evt){
	//console.log(evt);
	
	var current_song=getNodeValue("playerNowPlayingTitle");	
	var current_artist=getNodeValue("playerNowPlayingArtist");
	var current_album=getNodeValue("playerNowPlayingAlbum");
	
	if (current_song==undefined) return;
	if (current_artist==undefined) return;
	if (current_album==undefined) return;

	if (current_song==null) return;
	if (current_artist==null) return;
	if (current_album==null) return;
	
	console.log(current_song+", "+current_artist+", "+current_album);
	
	if ((last_song==current_song) && (last_album==current_album) && (last_artist==current_artist)) return;
	last_song=current_song;
	last_artist=current_artist;
	last_album=current_album;
	
	// report back to the extension
	sendMsg('current_track', 'rdio', {
		'song': current_song,
		'artist': current_artist,
		'album': current_album
	});
});


function doPreviousSong() {
	simulateClick("previousButton");
};

function doNextSong() {
	simulateClick("nextButton");
};

function doPlayPause() {
	simulateClick("playButton");
};

/**
 * Receive commands from the extension
 */
chrome.extension.onRequest.addListener(
	function(msg, sender, sendResponse) {
		
		console.log("gs.onMessage: mtype:"+msg.mtype);
		var mtype=msg.mtype;
		
		if (mtype=='previous') {
			doPreviousSong();
		};
		if (mtype=='next') {
			doNextSong();
		};
		if (mtype=='play-pause') {
			doPlayPause();
		};			  
});

