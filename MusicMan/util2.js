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

/**
 * ENCODE URL
 * ==========
 * var encoded_path = encode('path');
 */
function encode_url(path) {
    return map( (encodeURIComponent(path)).split(''), function(chr) {
        return "-_.!~*'()".indexOf(chr) < 0 ? chr :
               "%"+chr.charCodeAt(0).toString(16).toUpperCase()
    } ).join('');
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


/*
forEach, version 1.0
Copyright 2006, Dean Edwards
License: http://www.opensource.org/licenses/mit-license.php
*/

//array-like enumeration
if (!Array.forEach) { // mozilla already supports this
	Array.forEach = function(array, block, context) {
		for (var i = 0; i < array.length; i++) {
			block.call(context, array[i], i, array);
		}
	};
}

//generic enumeration
Function.prototype.forEach = function(object, block, context) {
	for (var key in object) {
		if (typeof this.prototype[key] == "undefined") {
			block.call(context, object[key], key, object);
		}
	}
};

//character enumeration
String.forEach = function(string, block, context) {
	Array.forEach(string.split(""), function(chr, index) {
		block.call(context, chr, index, string);
	});
};

//globally resolve forEach enumeration
var forEach = function(object, block, context) {
	if (object) {
		var resolve = Object; // default
		if (object instanceof Function) {
			// functions have a "length" property
			resolve = Function;
		} else if (object.forEach instanceof Function) {
			// the object implements a custom forEach method so use that
			object.forEach(block, context);
			return;
		} else if (typeof object == "string") {
			// the object is a string
			resolve = String;
		} else if (typeof object.length == "number") {
			// the object is array-like
			resolve = Array;
		}
		resolve.forEach(object, block, context);
	}
};

// dean edwards}

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
