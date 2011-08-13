/**
 * Content script for Grooveshark 
 * 
 *
 * @author Jean-Lou Dupont
 * 
 * id='playerDetails_nowPlaying'
 * 
 **/

function getDetails(){
	return document.getElementById('playerDetails_nowPlaying');
};

var details=getDetails();

details.addEventListener('DOMSubtreeModified', function(evt){
	console.log(evt);
	
	var details=getDetails();
	
	var songs=getElementsByClassName("song", "a", details);
	var current_song=songs[0].getAttribute('title');
	
	var artists=getElementsByClassName("artist", "a", details);
	var current_artist=artists[0].getAttribute('title');

	var albums=getElementsByClassName("album", "a", details);
	var current_album=artists[0].getAttribute('title');
	
	sendMsg('current_track', 'gs', {
		'song': current_song,
		'artist': current_artist,
		'album': current_album
	});
});
