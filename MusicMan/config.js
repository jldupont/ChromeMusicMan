/*
 * Config.js
 * 
 * @author Jean-Lou Dupont 
 * 
 * MESSAGES OUT:
 *  - "pubnub_keys"
 *  - "status?"
 * 
 * MESSAGES IN:
 *  - "status"
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

	set_apply_button_disable_state(true);
	saveKeys();
	
	
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
	
	displayKeys();
	
	setInterval(doTasks, 1000);
};

function doTasks() {
	updateStatus();
};


function updateStatus() {
chrome.extension.sendRequest(
		{mtype: "status?"}
	, function(response) {
		$("status").textContent=response.data;
		  //console.log("Status: "+response.data);
		});		
};

function displayKeys() {
	setText("pubkey", localStorage["pubkey"]);
	setText("subkey", localStorage["subkey"]);
	setText("seckey", localStorage["seckey"]);
};

function getText(id) {
	return $(id).value;
};

function setText(id, text) {
	var e=$(id);
	e.value=text;
};

function saveKeys() {
	localStorage["pubkey"]=getText("pubkey");
	localStorage["subkey"]=getText("subkey");
	localStorage["seckey"]=getText("seckey");
};

