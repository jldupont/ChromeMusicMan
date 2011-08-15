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

function body_loaded() {
	
	var button=$("buttonApply");
	button.addEventListener("click", handle_apply_button_click);
	
	var table=$("keys");
	
	table.addEventListener("DOMSubtreeModified", handle_keys_change);
	
};

function handle_keys_change(event) {

	//var pubkey=$("pubkey");
	//var subkey=$("subkey");
	//var seckey=$("seckey");
	
	console.log("Key(s) change!");
};

function handle_apply_button_click(evt) {

};

function set_apply_button_state(state) {
	
	var button=$("buttonApply");
	button.disabled=state;
};