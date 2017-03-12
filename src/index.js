 /*** MyHomeAutomation ZAutomation module ****************************************/
 
 

/*
	log: function(message) // лог с глобальным префиксом
	prefixLog: function(prefix, message);
	modules: {name -> MODULE}
	



*/
function MyHomeAutomation (id, controller) {
    // Call superconstructor first (AutomationModule)
    this.log = MyHomeAutomation.prototype.prefixLog.bind(this, 'MyHomeAutomation');
    MyHomeAutomation.super_.call(this, id, controller);
}

inherits(MyHomeAutomation, AutomationModule);

_module = MyHomeAutomation;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

MyHomeAutomation.prototype.init = function (config) {
    // Call superclass' init (this will process config argument and so on)
    MyHomeAutomation.super_.prototype.init.call(this, config);
	
	this.modules = {};
	
	this.fsRoot = 'modules/MyHomeAutomation/';
	
	this.log('start');
	
	this.controller.MHA = this;
	
	this.loadModules();
	
	
};

MyHomeAutomation.prototype.loadModules = function(){
	this.log('reading modules config...');

	try {
		var config = null;
		var configStr = fs.load(this.fsRoot + 'config.js');
		eval(configStr);
		if (!config) throw new Error('config not loaded!');
		this.modulesConfig = config;
		this.log('config loaded: ' + JSON.stringify(config));
	} catch (err){
		this.log(err.toString() + '\n' + err.stack);
		return;
	}
	
	for (var i = 0; i < this.modulesConfig.modules.length; i++){
		var moduleObj = this.modulesConfig.modules[i];
		this.log('loading module ' + moduleObj.name + '...');
		try {
			var MHA = this;
			var module;
			var config = moduleObj.config;
			var moduleStr = fs.load(this.fsRoot + 'modules/' + moduleObj.name + '/' + moduleObj.name + '.js');
			eval(moduleStr);
			if (!module) throw new Error('module ' + moduleObj.name + ' not loaded!');
			this.modules[moduleObj.name] = module;
		} catch (err){
			this.log(err.toString() + '\n' + err.stack);
			this.unloadModules();
			return;
		}
	}
}

MyHomeAutomation.prototype.unloadModules = function(){
	this.log('unloading modules...');
	for (var i = this.modulesConfig.modules.length-1; i >= 0; i--){
		var moduleObj = this.modulesConfig.modules[i];
		var module = this.modules[moduleObj.name];
		if (!module) continue;
		this.log('unloading module ' + moduleObj.name + '...');
		try {
			// как-то выгрузить модуль	
			if (module.stop instanceof Function)
				module.stop.call(module);
			delete this.modules[moduleObj.name];
		} catch (err){
			this.log(err.toString() + '\n' + err.stack);
		}

	}
}

MyHomeAutomation.prototype.stop = function () {
	this.log('stop');
	
	this.unloadModules();
	
    MyHomeAutomation.super_.prototype.stop.call(this);
	this.log('stop completed');
};


MyHomeAutomation.prototype.loadData = function (key) {
	var objName = 'MyHomeAutomation_' + key;
	return loadObject(objName);
};

MyHomeAutomation.prototype.saveData = function (key, value) {
	var objName = 'MyHomeAutomation_' + key;
	saveObject(objName, value);
};

MyHomeAutomation.prototype.prefixLog = function (prefix, data) {
	//console.log('[MyHomeAutomation_'+this.id + (this.module && this.module.name ? ' ('+this.module.name+')' : '') + '] ' + data);
	if (!data) {
		console.log('[MHA] ' + prefix + data);
		return;
	}
	data.split('\n').forEach(function(line){
		console.log('[MHA] ' + prefix + ' ' + line);	
	})
	
};



//MyHomeAutomation.prototype.log = MyHomeAutomation.prototype.log

