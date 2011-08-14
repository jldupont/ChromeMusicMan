/*
 * A lightweight task scheduler
 * 
 *  scheduler.js
 *  
 *   @author Jean-Lou Dupont
 *   
 *   @dependencies:  oo.js
 */

function Scheduler(debug) {
	this.debug=debug || false;
	this.stack=new Array();
};

Scheduler.method("push_task", function(name, callback, param){
	this.stack.push([name, callback, param]);
	if (this.debug)
		console.log("Scheduler: push task: "+name);
});

Scheduler.method("exec_one", function(){
	var task=this.stack.pop();
	if (task==undefined)
		return false;
	var name=task[0];
	var cb=task[1];
	var param=task[2];
	if (this.debug)
		console.log("Scheduler.exec_one: before, "+name);
	cb(this, param);
	if (this.debug)
		console.log("Scheduler.exec_one: after, "+name);
	return true;
});


Scheduler.method("exec_stack", function(){
	var result=true;
	while(result) {
		result=this.exec_one();
	};
});