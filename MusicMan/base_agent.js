/*
 * Base class for Agents
 * 
 * @dependencies:
 * 	- oo.js
 * 
 * @author Jean-Lou Dupont
 */

function Agent() {
	console.log("Agent created");
	this.tasks=[];
	var self=this;
	setInterval(function(){
		self.run(self);
	}, 500);		
};

Agent.method("push_task", function(scope, fn, params){
	this.tasks.push([scope, fn, params]);
});

Agent.method("run", function(self){
	//console.log(self);
	each(self.tasks, function(task){
		var scope=task[0];
		var fn=task[1];
		fn.call(scope, task.slice(2));
	});
});
