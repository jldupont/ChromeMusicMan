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
	
};

Agent.method("init", function(){
	var self=this;
	setInterval(this.run, 500);		
});

Agent.method("push_task", function(ctx, fn, params){
	this.tasks.push(ctx, fn, params);
});

Agent.method("run", function(){
	each(this.task, function(task){
		var ctx=this.task.shift();
		var fn=this.task.shift();
		fn(ctx, task);
	});
});
