/**
 * Content script for Grooveshark 
 * 
 *
 * @author Jean-Lou Dupont
 * 
 * id='playerDetails_nowPlaying'
 * 
 **/
var port=chrome.extension.connect();
var last_song=null;
var last_artist=null;
var last_album=null;

function getDetails(){
	return document.getElementById('playerDetails_nowPlaying');
};

var details=getDetails();

/**
 * Keep listening for changes to the part of the DOM
 * where the current track information is displayed
 */
details.addEventListener('DOMSubtreeModified', function(evt){
	console.log(evt);
	
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

function doPreviousSong() {
	simulateClick("player_previous");
};

function doNextSong() {
	simulateClick("next");
};

function doPlayPause() {
	simulateClick("player_play_pause");
};

/**
 * Receive commands from the extension
 */
port.onMessage.addListener(function(msg){
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

