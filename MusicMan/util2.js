/**
 * 
 * @author Jean-Lou Dupont
 */

//=============================================================================
// XHR

var XHR_READY_STATE_OPENED=1;
var XHR_READY_STATE_DONE=4;

function xdr(ctx, url, onsuccess, onerror){
	var uri=url.join("/")
	var xhr = new XMLHttpRequest();
	
	xhr.open("GET", uri, true);
	
	xhr.onreadystatechange = function() {
		  if (xhr.readyState == XHR_READY_STATE_DONE) {
			  if (xhr.status==200){
				  if (onsucess)
					  onsuccess(ctx, this.responseText);
			  }
			  else {
				  if (onerror)
					  onerror(ctx, this.responseText);
			  }
		  }
	};
	xhr.send();
};	

function getFormData(form_id) {
	var data={};
	var fe=$(form_id);
	var inputs=fe.getElementsByTagName("input");

	for (var index=0;index<inputs.length;index++) {
		var input=inputs[index];
		data[input.name]=input.value;
		//console.log("name("+input.name+"): "+input.value);
	};

	return data;
};

function listAllProperties(o){     
	var objectToInspect;     
	var result = [];
	
	for(objectToInspect = o; objectToInspect !== null; objectToInspect = Object.getPrototypeOf(objectToInspect)){  
		result = result.concat(Object.getOwnPropertyNames(objectToInspect));  
	}
	
	return result; 
}

/**
 * $
 * =
 * var div = $('divid');
 */
function $(id) { return document.getElementById(id); };

/**
 * LOG
 * ===
 * log('message');
 */
function log(message) { console['log'](message) }

/**
 * SEARCH
 * ======
 * var elements = search('a div span');
 */
function search( elements, start ) {
    var list = [];
    each( elements.split(/\s+/), function(el) {
        each( (start || document).getElementsByTagName(el), function(node) {
            list.push(node);
        } );
    } );
    return list;
}

/**
 * EACH
 * ====
 * each( [1,2,3], function(item) { console.log(item) } )
 */
function each( o, f ) {
    if ( !o || !f ) return;

    if ( typeof o[0] != 'undefined' )
        for ( var i = 0, l = o.length; i < l; )
            f.call( o[i], o[i], i++ );
    else
        for ( var i in o )
            o.hasOwnProperty    &&
            o.hasOwnProperty(i) &&
            f.call( o[i], i, o[i] );
}

/**
 * MAP
 * ===
 * var list = map( [1,2,3], function(item) { return item + 1 } )
 */
function map( list, fun ) {
    var fin = [];
    each( list || [], function( k, v ) { fin.push(fun( k, v )) } );
    return fin;
}

/**
 * GREP
 * ====
 * var list = grep( [1,2,3], function(item) { return item % 2 } )
 */
function grep( list, fun ) {
    var fin = [];
    each( list || [], function(l) { fun(l) && fin.push(l) } );
    return fin
}

/**
 * SUPPLANT
 * ========
 * var text = supplant( 'Hello {name}!', { name : 'John' } )
 */
function supplant( str, values ) {
    return str.replace( MAGIC, function( _, match ) {
        return values[match] || _
    } );
}
