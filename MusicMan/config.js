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

function get_input_value(id) {
	return pubkey=$(id).value;
};

function handle_keys_change(event) {

	console.log("Key(s) change!");
	set_apply_button_disable_state(false);
};

function handle_apply_button_click(evt) {

	//var pubkey=get_input_value("pubkey");
	//var subkey=get_input_value("subkey");
	//var seckey=get_input_value("seckey");

	set_apply_button_disable_state(true);
	
	var form_data=getFormData("pubnub");
	form_data["mtype"]="pubnub_keys";

	chrome.extension.sendRequest(
		form_data
	, function(response) {
		  console.log(response);
		});	
};

function set_apply_button_disable_state(state) {
	
	var button=$("buttonApply");
	button.disabled=state;
};

/**
 * Hook-up all the listeners
 * 
 * @return
 */
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

