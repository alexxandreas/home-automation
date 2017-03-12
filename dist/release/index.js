 /*** MyHomeAutomation ZAutomation module ****************************************/
 
 

/*
	log: function(message)
	modules: {name -> MODULE}
	



*/
function MyHomeAutomation (id, controller) {
    // Call superconstructor first (AutomationModule)
    this.log = MyHomeAutomation.prototype.prefixLog.bind(this, 'MyHomeAutomation');
    // this.log = function(data){
    	// return MyHomeAutomation.prototype.log('MyHomeAutomation ' + data);
    // };
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
	
	//this.logPrefix = 'MyHomeAutomation ';
	this.modules = {};
	
	
	this.fsRoot = 'modules/MyHomeAutomation/';
	
	this.log('start');
	
	
	
	this.controller.MHA = this;
	
	this.loadModules();
	
	//this.startWebServer();

	//this.log('MyHomeAutomation: eval');
		
	/*try {	
		var MHA = this;
		eval(this.config.customCode);
		this.log('MyHomeAutomation: running...');
	} catch (err){
		this.log('MyHomeAutomation: init error\n' + err.toString() + (err.stack ? '\n'+err.stack : ''));
	}*/
	
};

MyHomeAutomation.prototype.loadModules = function(){
	this.log('reading modules config...');

	try {
		var config = null;
		// function exportConfig(_config){config = _config;}
		// var configStr = fs.load('modules/MyHomeAutomation/config.js');
		var configStr = fs.load(this.fsRoot + 'config.js');
		//this.log('config loaded: ' + configStr);
		//executeFile('modules/MyHomeAutomation/config.js');
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
			var moduleStr = fs.load(this.fsRoot + 'modules/' + moduleObj.name + '.js');
			eval(moduleStr);
			//executeFile('modules/' + moduleObj.name + 'js');
			if (!module) throw new Error('module ' + moduleObj.name + ' not loaded!');
			//moduleObj.module = module;
			this.modules[moduleObj.name] = module;
		} catch (err){
			//var msg = (err.toString()  || '').split(\n);
			this.log(err.toString() + '\n' + err.stack);
			this.unloadModules();
			return;
		}
	}
	
	
	
	
	
	//this.log('MyHomeAutomation: eval');
	//this.log('MyHomeAutomation: eval');
	
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
			delete this.modules[moduleObj.name];
		} catch (err){
			
		}

	}
}

MyHomeAutomation.prototype.stop = function () {
	this.log('stop');
	
	//this.stopWebServer();
	this.unloadModules();
	
	this.myZWay.eventBus.emit('MHA.stop');
	
    //var wrapper = this;
    //this.saveData();
	
    // вызываем деструктор пользователя, если он определен
	/*if (this.destroy instanceof Function){
		wrapper.log('stop: destructor');
		this.destroy();
	}*/
	
	// if (this.module && (this.module.destroy instanceof Function)){
	// 	this.log('MyHomeAutomation: call destructor');
	// 	this.module.destroy.call(this.module);
	// }
	
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
		console.log('[MHA] ' + prefix + ' no data');
		return;
	}
	data.split('\n').forEach(function(line){
		console.log('[MHA] ' + prefix + ' ' + line);	
	})
	
};

//MyHomeAutomation.prototype.log = MyHomeAutomation.prototype.log

MyHomeAutomation.prototype.startWebServer = function (){
	this.routes = [];
	
    // define global handler for HTTP requests
    mha = function(url, request) {
    	var idx = url.indexOf('?');
    	
        var path = this.trimSlash(url.substring(0, idx >= 0 ? idx : undefined));
        var params = {};
        if (idx >= 0){
        	url
        	.substring(idx+1)
        	.split('&')
        	forEach(function(a) { idx = a.indexOf('='); params[a.substring(0, idx)] = a.substring(idx+1)})
        }	
        
		if (this.routes[path]){
			this.routes[path](params);
		}
		
    };
    ws.allowExternalAccess("mha", this.controller.auth.ROLE.ANONYMOUS); // login required
	
	this.addDefaultRoutes();
}

MyHomeAutomation.prototype.addDefaultRoutes = function(){
	this.addRoute('/', rootHandler, this);
	this.addRoute('/index.html', rootHandler, this);
	
	this.addRoute('/static/', staticHandler, this);
	
	function rootHandler(params){
		this.log(' get index: ' + JSON.stringify(params));
		
	}
	
	function staticHandler(params){
		this.log(' get static: ' + JSON.stringify(params));
	}
}
	
	
MyHomeAutomation.prototype.addRoute = function(route, handler, scope){
	this.routes[trimSlash(route)] = scope ? handler.bind(scope) : handler;
}

MyHomeAutomation.prototype.trimSlash = function(str){
	while (str.length && str[0] == '/') str = str.substring(1);
	while (str.length && str[str.length-1] == '/') str = str.substring(0, str.length-1);
	return str;
}

MyHomeAutomation.prototype.stopWebServer = function (){
	ws.revokeExternalAccess("mha");
    mha = null;
}