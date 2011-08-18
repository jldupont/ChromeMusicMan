/**
 * Content script for Grooveshark 
 * 
 *
 * @author Jean-Lou Dupont
 * 
 * id='playerDetails_nowPlaying'
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

function getDetails(){
	return document.getElementById('playerDetails_nowPlaying');
};

var details=getDetails();

/**
 * Keep listening for changes to the part of the DOM
 * where the current track information is displayed
 */
details.addEventListener('DOMSubtreeModified', function(evt){
	//console.log(evt);
	
	var details=getDetails();
	
	var songs=getElementsByClassName("song", "a", details);
	var song=songs[0] || {};
	var current_song=song.getAttribute && song.getAttribute('title');
	
	var artists=getElementsByClassName("artist", "a", details);
	var artist=artists[0] || {};
	var current_artist=artist.getAttribute && artist.getAttribute('title');

	var albums=getElementsByClassName("album", "a", details);
	var album=albums[0] || {};
	var current_album=album.getAttribute && album.getAttribute('title');
	
	if (current_song==undefined) return;
	if (current_artist==undefined) return;
	if (current_album==undefined) return;
	
	if ((last_song==current_song) && (last_album==current_album) && (last_artist==current_artist)) return;
	last_song=current_song;
	last_artist=current_artist;
	last_album=current_album;
	
	// report back to the extension
	sendMsg('current_track', 'gs', {
		'song': current_song,
		'artist': current_artist,
		'album': current_album
	});
});

var button_play_pause=document.getElementById("player_play_pause");
button_play_pause.addEventListener('DOMSubtreeModified', function(evt){
	var classe=evt.target.className.toLowerCase();
	var bits=classe.split(' ');
	var state='disabled';
	var inverted_state=bits[1] || "disabled";
	
	if (inverted_state=='pause') state='play';
	if (inverted_state=='play')  state='pause';
	//console.log("Play/Pause state: "+state);
	
	if (state!=last_state) {
		sendMsg('current_state', 'gs', {
			'state': state
		});
	}
	last_state=state;
});


function doPreviousSong() {
	simulateClick("player_previous");
};

function doNextSong() {
	simulateClick("player_next");
};

function doPlayPause() {
	simulateClick("player_play_pause");
};

/**
 * Receive commands from the extension
 */
chrome.extension.onRequest.addListener(
	function(msg, sender, sendResponse) {
		
		console.log("gs.onMessage: type:"+msg.type);
		var type=msg.type;
		
		if (type=='previous') {
			doPreviousSong();
		};
		if (type=='next') {
			doNextSong();
		};
		if (type=='play-pause') {
			doPlayPause();
		};			  
});

