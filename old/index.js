 /*** JSWrapper ZAutomation module ****************************************

Version: 1.0.0
(c) Z-Wave.Me, 2013

-------------------------------------------------------------------------------
Author: Poltorak Serguei <ps@z-wave.me>
Description:
    This module executes custom JS code listed in configuration parameters.

******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------

function JSWrapper (id, controller) {
    // Call superconstructor first (AutomationModule)
    JSWrapper.super_.call(this, id, controller);
}

inherits(JSWrapper, AutomationModule);

_module = JSWrapper;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

JSWrapper.prototype.init = function (config) {
    // Call superclass' init (this will process config argument and so on)
    JSWrapper.super_.prototype.init.call(this, config);
	
	try {
		var wrapper = this;
		//console.log('init: start');
		this.log('JSWrapper: start');
		
		this.initMyZWay();
		
		this.initTargets();
		
		this.loadData();
		
		this.exports = {
			controller: this.controller,
			getTargets: this.getTargets.bind(this),
			getTarget: this.getTarget.bind(this),
			log: this.log.bind(this),
			myZWay: this.myZWay,
			loadData: this.loadData.bind(this),
			saveData: this.saveData.bind(this)
		};

		this.log('JSWrapper: eval');
		
		//var cls = eval('(function(){ ' + wrapper.config.customCode + ' })()');
		eval(this.config.customCode);
		/*if (cls instanceof Function){
			wrapper.module = new cls();
			
			// сохраняем модуль для доступа извне через wrapper.myZWay.modules[name]
			/*if (wrapper.module.name) {
				wrapper.myZWay.modules[wrapper.module.name] = wrapper.module;
			}*/
			
			/*if (wrapper.module.config.waitInitTimeout){
				if (wrapper.myZWay.started) {
					setTimeout(function () { wrapper.module.init.call(wrapper.module); }, wrapper.module.config.waitInitTimeout*1000);
				} else {
					wrapper.controller.myZWay.startCallbacks.push({fn: wrapper.module.init, scope: wrapper.module, timeout:wrapper.module.config.waitInitTimeout});
				}
			} else {
				wrapper.module.init.call(wrapper.module);
			}		*/
			
		//}
			
		this.log('JSWrapper: running...');
	} catch (err){
		this.log('JSWrapper: init error\n' + err.toString() + (err.stack ? '\n'+err.stack : ''));
	}
};

JSWrapper.prototype.initMyZWay = function(){
	// глобальный объект для коммуникации между модулями
	if (!this.controller.myZWay){
		this.controller.myZWay = {
			modules: {}
		};
	}
	this.myZWay = this.controller.myZWay;	
};


JSWrapper.prototype.initTargets = function(){
	this.targets = {};
	this.config.targets.forEach(function(el) {
		var name = el.groupName;
		var filter = el.groupFilter;
		var devices = filter ? (el[filter] || []) : [];
		
		//devices = devices.map(function(id){
		//	return {id:id, vDev:null};
		//})
		
		this.targets[name] = devices;
	}, this); 
	//this.log('JSWrapper: initTargets(): ' + JSON.stringify(this.targets));
};


// возвращает массив девайсов с указанным именем группы в виде
// [{id, vDev}]
JSWrapper.prototype.getTargets = function(name){
	var targets = this.targets[name];
	if (!targets) return [];
	/*targets.forEach(function(target){
		if (!target.vDev)
			target.vDev = this.controller.devices.get(target.id);
	}, this);*/
	return targets;
};
		
// возвращает ОДИН ПЕРВЫЙ девайс с указанным именем группы в виде
// {id, vDev} или null
JSWrapper.prototype.getTarget = function(name){
	var targets = this.getTargets(name);
	return targets[0] || null;
};

JSWrapper.prototype.stop = function () {
	this.log('JSWrapper: stop');
    //var wrapper = this;
    this.saveData();
	
    // вызываем деструктор пользователя, если он определен
	/*if (this.destroy instanceof Function){
		wrapper.log('stop: destructor');
		this.destroy();
	}*/
	
	if (this.module && (this.module.destroy instanceof Function)){
		this.log('JSWrapper: call destructor');
		this.module.destroy.call(this.module);
	}
	
    JSWrapper.super_.prototype.stop.call(this);
	this.log('JSWrapper: stop completed');
};

JSWrapper.prototype.loadData = function () {
	var objName = 'JSWrapper_'+this.id;
	this.data = loadObject(objName) || {};
};


JSWrapper.prototype.saveData = function () {
	var objName = 'JSWrapper_'+this.id;
	saveObject(objName, this.data);
};

JSWrapper.prototype.log = function (data) {
	console.log('[JSWrapper_'+this.id + (this.module && this.module.name ? ' ('+this.module.name+')' : '') + '] ' + data);
};

