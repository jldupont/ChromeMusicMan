/*
 * Base class for Agents
 * 
 * @dependencies:
 * 	- oo.js
 * 
 * @author Jean-Lou Dupont
 */

function Agent(name) {
	this.name=name;
	console.log("Agent '"+name+"' created");
	
	this.procs=[];	
	this.tasks=[];
	
	var self=this;
	setInterval(function(){
		self.run(self);
	}, 500);		
};

Agent.method("push_procs", function(scope, fn, params){
	this.procs.push([scope, fn, params]);
});

Agent.method("push_tasks", function(scope, fn, params){
	this.tasks.push([scope, fn, params]);
});


Agent.method("run", function(self){
	//console.log(self);
	
	each(self.procs, function(proc){
		var scope=proc[0];
		var fn=proc[1];
		fn.call(scope, proc.slice(2));
	});

	var task=self.tasks.shift();
	while(task !== undefined) {
		var scope=task[0];
		var fn=task[1];
		fn.call(scope, task.slice(2));
		task=self.tasks.shift();
	};
	
});
