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

var canEdit=false;

function get_input_value(id) {
	return pubkey=$(id).value;
};

function handle_keys_change(event) {

	console.log("Key(s) change!");
	set_apply_button_disable_state(false);
};

function handle_apply_button_click(evt) {

	set_apply_button_disable_state(true);
	saveConfig();
	
	
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
	
	if (!canEdit) {
		button.disabled=true;
		return;
	}
	
	button.disabled=state;
};

function handle_enabled_click(evt) {
	
	localStorage["pubnub_enable"]=evt.target.checked || false;
	
	if (evt.target.checked) {
		canEdit=true;
		//set_apply_button_disable_state(false);
	} else {
		canEdit=false;
		//set_apply_button_disable_state(true);
	}
};

/**
 * Hook-up all the listeners
 * 
 * @return
 */
function body_loaded() {
	
	$("enabled").addEventListener("click", handle_enabled_click);
	$("buttonApply").addEventListener("click", handle_apply_button_click);
	$("pubkey").addEventListener("change", handle_keys_change);
	$("subkey").addEventListener("change", handle_keys_change);
	$("seckey").addEventListener("change", handle_keys_change);
	
	displayUpdate();
	
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

function displayUpdate() {
	setText("pubkey", localStorage["pubkey"]);
	setText("subkey", localStorage["subkey"]);
	setText("seckey", localStorage["seckey"]);
	var enabled=$("enabled").checked || false; 
};

function saveConfig() {
	localStorage["pubkey"]=getText("pubkey");
	localStorage["subkey"]=getText("subkey");
	localStorage["seckey"]=getText("seckey");
	localStorage["pubnub_enable"]=$("enabled").checked || false;
};

// ======================================================================================

function getText(id) {
	return $(id).value;
};

function setText(id, text) {
	var e=$(id);
	e.value=text;
};

