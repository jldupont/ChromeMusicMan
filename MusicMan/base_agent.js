/*
 * Base class for Agents
 * 
 * NOTE:   *not used* at the moment
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

Agent.method("push_proc", function(scope, fn, params){
	this.procs.push([scope, fn, params]);
});

Agent.method("push_task", function(scope, fn, params){
	this.tasks.push([scope, fn, params]);
});


Agent.method("run", function(self){
	//console.log(self);
	
	each(self.procs, function(proc){
		var scope=proc[0];
		var fn=proc[1];
		//console.log(scope);
		fn.apply(scope, proc.slice(2));
	});

	var task=self.tasks.shift();
	while(task !== undefined) {
		var scope=task[0];
		var fn=task[1];
		fn.apply(scope, task.slice(2));
		task=self.tasks.shift();
	};
	
});
