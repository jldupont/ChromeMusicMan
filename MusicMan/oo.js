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

Function.method('inherits', function (parent) {
    var d = {}, p = (this.prototype = new parent());
    this.method('uber', function uber(name) {
        if (!(name in d)) {
            d[name] = 0;
        }        
        var f, r, t = d[name], v = parent.prototype;
        if (t) {
            while (t) {
                v = v.constructor.prototype;
                t -= 1;
            }
            f = v[name];
        } else {
            f = p[name];
            if (f == this[name]) {
                f = v[name];
            }
        }
        d[name] += 1;
        r = f.apply(this, Array.prototype.slice.apply(arguments, [1]));
        d[name] -= 1;
        return r;
    });
    return this;
});
