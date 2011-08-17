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
 */
config={};

config.pn_inputs=["pubkey", "subkey", "seckey"];

config.keysChanged=false;

function handle_keys_change(event) {

	config.keysChanged=true;
	updatePnForm();
};

function handle_apply_button_click(evt) {

	set_apply_button_disable_state(true);
	saveConfig();
	config.keysChanged=false;
	
	var form_data=getFormData("pubnub");
	form_data["mtype"]="pubnub_keys";

	chrome.extension.sendRequest(
		form_data
	, function(response) {
		  console.log(response);
		});	
};

/*
 * "Apply" Button
 */
function updatePnForm() {
	if (canEditPubNub()) {
		set_apply_button_disable_state(!config.keysChanged);
		set_pn_form_disable_state(false);
	} else {
		set_apply_button_disable_state(true);
		set_pn_form_disable_state(true);
	}
};

function set_pn_form_disable_state(state) {
	each(config.pn_inputs, function(input) {
		if (state)
			$(input).setAttribute("disabled");
		else
			$(input).removeAttribute("disabled");		
	});
};

function set_apply_button_disable_state(state) {
	
	var button=$("buttonApply");
	if (state)
		button.setAttribute("disabled");
	else
		button.removeAttribute("disabled");
};

function handle_enabled_click(evt) {
	
	localStorage["pubnub_enabled"]=evt.target.checked || false;	
	updatePnForm();
};

/**
 * Hook-up all the listeners
 * 
 * @return
 */
function body_loaded() {
	
	$("pn_enabled").addEventListener("click", handle_enabled_click);
	$("buttonApply").addEventListener("click", handle_apply_button_click);
	
	each(config.pn_inputs, function(input) {
		$(input).addEventListener("change", handle_keys_change);
	});
	
	initDisplay();
	
	setInterval(doTasks, 500);
};

function doTasks() {
	updateStatus();
};

/*
 * Request a "status" update from the extension
 */
function updateStatus() {
	chrome.extension.sendRequest(
			{mtype: "status?"}
		, function(response) {
			$("ws_status").textContent=response.ws_status;
			$("pn_status").textContent=response.pn_status
			});		
};

function saveConfig() {
	localStorage["pubkey"]=getText("pubkey");
	localStorage["subkey"]=getText("subkey");
	localStorage["seckey"]=getText("seckey");
	localStorage["pubnub_enabled"]=$("pn_enabled").checked || false;
};

//======================================================================================

function canEditPubNub() {
	return $("pn_enabled").checked || false;
};


//======================================================================================

function initDisplay() {
	initKeys();
	initCheckboxes();
	updatePnForm();
	updateStatus();
};

function initKeys() {
	setText("pubkey", localStorage["pubkey"]);
	setText("subkey", localStorage["subkey"]);
	setText("seckey", localStorage["seckey"]);
};

function initCheckboxes() {
	var pn_enabled=localStorage["pubnub_enabled"]==="true" || false;
	$("pn_enabled").checked=pn_enabled;
};

// ======================================================================================

function getText(id) {
	return $(id).value;
};

function setText(id, text) {
	var e=$(id);
	e.value=text;
};

function get_input_value(id) {
	return pubkey=$(id).value;
};

