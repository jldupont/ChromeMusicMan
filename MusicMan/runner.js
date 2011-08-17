/*
 * A lightweight proc & task runner
 * 
 *  runner.js
 *  
 *   @author Jean-Lou Dupont
 *   
 *   @dependencies:  oo.js
 */


function Runner(name) {
	this.name=name;
	
	this.procs=[];	
	this.tasks=[];
	
	var self=this;
	setInterval(function(){
		self.run(self);
	}, 500);		
};

Runner.method("push_proc", function(p0, p1, p2){
	if (typeof p0==="function")
		this.procs.push({ fn:p0, param: p1 });
	else
		this.procs.push({ scope:p0, fn:p1, param: p2 });
});

Runner.method("push_task", function(p0, p1, p2){
	if (typeof p0==="function")
		this.tasks.push({ fn:p0, param: p1 });
	else
		this.tasks.push({ scope:p0, fn:p1, param: p2 });

});


Runner.method("run", function(self){

	each(self.procs, function(proc){
		var fn=proc.fn;
		var scope=proc.scope;
		if (scope===undefined || scope===null)
			fn(proc.param);
		else
			fn.apply(scope, proc.param);
	});

	var task=self.tasks.shift();
	while(task !== undefined) {
		var fn=task.fn;
		var scope=task.scope;
		if (scope===undefined || scope===null)
			fn(task.param);
		else
			fn.apply(scope, task.param);
		task=self.tasks.shift();
	};
});

_=new Runner();
