/*
 * Config.js
 * 
 * @author Jean-Lou Dupont 
 * 
 * 
 * Dependencies:
 * 	- util2.js
 * 
 */

function handle_keys_change(event) {

	//var pubkey=$("pubkey");
	//var subkey=$("subkey");
	//var seckey=$("seckey");
	
	console.log("Key(s) change!");
	set_apply_button_state(false);
};

function handle_apply_button_click(evt) {

};

function set_apply_button_state(state) {
	
	var button=$("buttonApply");
	button.disabled=state;
};


function body_loaded() {
	
	var button=$("buttonApply");
	button.addEventListener("click", handle_apply_button_click);
	
	var pubkey=$("pubkey");
	pubkey.addEventListener("change", handle_keys_change);
	
	var subkey=$("subkey");
	subkey.addEventListener("change", handle_keys_change);
	
	var seckey=$("seckey");
	seckey.addEventListener("change", handle_keys_change);
};

