 /*** MyHomeAutomation ZAutomation module ****************************************/



 /*
 	log: function(message) // лог с глобальным префиксом
 	prefixLog: function(prefix, message);
 	modules: {name -> MODULE}
 	
 */
 function MyHomeAutomation(id, controller) {
 	// Call superconstructor first (AutomationModule)
 	this.logData = [];
 	this.log = MyHomeAutomation.prototype.prefixLog.bind(this, 'MyHomeAutomation');

 	MyHomeAutomation.super_.call(this, id, controller);
 }

 inherits(MyHomeAutomation, AutomationModule);

 _module = MyHomeAutomation;

 // ----------------------------------------------------------------------------
 // --- Module instance initialized
 // ----------------------------------------------------------------------------

 MyHomeAutomation.prototype.init = function init(config) {
 	// Call superclass' init (this will process config argument and so on)
 	MyHomeAutomation.super_.prototype.init.call(this, config);

 	//this.modules = {};
 	//this.modulesGraph = {};

 	this.fsRoot = 'modules/MyHomeAutomation/';

 	//this.log('start');

 	this.controller.MHA = this;

 	this.start();
 	//this.loadModules();


 };

 MyHomeAutomation.prototype.start = function start() {
 	this.log('start');
 	try {
 		var MHA = this;
 		//var module;
 		//var config = moduleObj.config;

 		var moduleStr = fs.load(this.fsRoot + 'ModuleLoader.js');
 		moduleStr = decodeURIComponent(escape(moduleStr));
 		eval(moduleStr);
 	}
 	catch (err) {
 		this.log('start Error: ' + err.toString() + '\n' + err.stack);
 		return;
 	}
 };


 MyHomeAutomation.prototype.stop = function stop() {
 	this.log('stop');

 	//this.unloadModules();
 	this.ModuleLoader && this.ModuleLoader.stop();

 	MyHomeAutomation.super_.prototype.stop.call(this);
 	this.log('stop completed');
 };



 MyHomeAutomation.prototype.prefixLog = function prefixLog(prefix, data) {
 	//console.log('[MyHomeAutomation_'+this.id + (this.module && this.module.name ? ' ('+this.module.name+')' : '') + '] ' + data);

 	if (!data) {
 		//console.log('[MHA] ' + prefix + data);
 		log.call(this, '[MHA] ' + prefix + data)
 		return;
 	}
 	data.split('\n').forEach(function(line) {
 		//console.log('[MHA] ' + prefix + ' ' + line);	
 		log.call(this, '[MHA] ' + prefix + ' ' + line);
 	})

 	function log(data) {
 		console.log(data);
 		controller.MHA.logData.push({
 			time: Date.now(),
 			data: data
 		});
 		controller.MHA.logData = controller.MHA.logData.slice(-500);
 	}

 };
 