/*
 * A lightweight proc & task runner
 * 
 *  runner.js
 *  
 *   @author Jean-Lou Dupont
 *   
 *   @dependencies:  
 *   - oo.js  ('method')
 */
(window._ || function(){

	function Runner(name) {
		this.name=name;
		
		this.procs=[];	
		this.tasks=[];
		
		var self=this;
		setInterval(function(){
			self.run.apply(self);
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

	Runner.method("run", function(){

		each(this.procs, function(proc){
			var scope=proc.scope;
			if (scope===undefined || scope===null)
				proc.fn(proc.param);
			else
				proc.fn.apply(scope, proc.param);
		});

		var task=this.tasks.shift();
		while(task !== undefined) {
			var scope=task.scope;
			if (scope===undefined || scope===null)
				task.fn(task.param);
			else
				task.fn.apply(scope, task.param);
			task=this.tasks.shift();
		};
	});

	_=new Runner();

})();

