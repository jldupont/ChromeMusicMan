/** 
 * 	oo.js
 * 
 * @author: Jean-Lou Dupont
 */

/**
 * 	Callback generator for 'class' method instances	
 * 
 *  Useful for binding callbacks to a scope
 *  Required function for Classes defined herein
 */
function bind(scope, fn) {
    return function () {
        fn.apply(scope, arguments);
    };
}

/**
 * Adds a method definition facility 
 * to the base Function definition
 * 
 * from D. Crockford
 */
Function.prototype.method = function (name, func) {
	this.prototype[name] = func;
	return this;
};

Object.prototype.clone=function(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}
