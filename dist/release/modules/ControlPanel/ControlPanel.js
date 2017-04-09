/*
global config, inherits, controller, MHA
*/
define('ControlPanel', ['AbstractModule', 'WebServer'], function(AbstractModule, WebServer){
   
   function ControlPanel(config) {
        ControlPanel.super_.call(this, config);
        this.name = 'ControlPanel';
        this.log('construcror');

        this.ML = MHA.ModuleLoader;
        this.modules = MHA.ModuleLoader.modules;
        
        
        this._initFrontend();
        
    }

    inherits(ControlPanel, AbstractModule);


    ControlPanel.prototype._initFrontend = function(){
        var ws = WebServer;
        
    	ws.addRoute('/modules/'+this.name+'/api/modules', function(args){
	        var data = {};
	        
	        Object.keys(this.modules).forEach(function(name){
	            var module = this.modules[name];
	            var obj = {
	                name: module.name,
                    visible: module.visible || false, // видимость модуля в UI
                    deps: module.deps, // текущий модуль зависит от этих
            		loaded: module.loaded, // файл модуля загружен из ФС и выполнен
            		//func: null, // функция-конструктор, определенная через define
            		created: module.created, // был ли модуль создан, или ждет зависимостей
            		//module: null // ссылка на созданный модуль
	            }
                data[name] = obj;
            }, this);
	        
	        return ws.sendJSON(data);
    	}, this);
    	
    	
    	ws.addRoute('/modules/'+this.name+'/api/modules/:name/start', function(args){
    	    var name = args[0];
    	       
            this.ML.activateModule(name);
	        
	        return ws.sendJSON({success:true});
    	}, this);
    	
    	ws.addRoute('/modules/'+this.name+'/api/modules/:name/stop', function(args){
    	    var name = args[0];
    	       
	        var res = this.ML.deactivateModule(name);
	        if (!res || !res.length) 
	            return ws.sendJSON({success:false});
	        else 
	            return ws.sendJSON({success: true, deps: res});
	        
    	}, this);
    	
    	ws.addRoute('/modules/'+this.name+'/api/modules/:name/restart', function(args){
    	    var name = args[0];
    	       
	        var res = this.ML.restartModule(name);
	        if (!res || !res.length) 
	            return ws.sendJSON({success:false});
	        else 
	            return ws.sendJSON({success: true, deps: res});
    	}, this);
    	
    	
    	ws.addRoute('/modules/'+this.name+'/api/update', function(args){
    	    try {
    	        var updateResult = system('bash /opt/z-way-server/automation/modules/MyHomeAutomation/update.bash');
    	        return ws.sendJSON({success:true, updateResult:updateResult});
    	    } catch (err){
    	        return ws.sendJSON({success:false, message: err.toString(), stack: err.stack});
    	    }
    	}, this);
    	
    	ws.addRoute('/modules/'+this.name+'/api/updateReload', function(args){
    	    try {
    	        var updateResult = system('bash /opt/z-way-server/automation/modules/MyHomeAutomation/update.bash');
    	        var reloadResult = this.ML.restartModule('AbstractModule');
    	        return ws.sendJSON({success:true, updateResult:updateResult, reloadResult:reloadResult});
    	    } catch (err){
    	        return ws.sendJSON({success:false, message: err.toString(), stack: err.stack});
    	    }
    	}, this);
    	
    	
    	WebServer.addPanel({
    	    key: this.name,
            title:'Control Panel',
            template: '/views/ControlPanel/htdocs/ControlPanel.html'
        });
    };
    
    
    ControlPanel.prototype.stop = function(){
        WebServer.removePanel(this.name);
        ControlPanel.super_.prototype.stop.apply(this, arguments);
    };

    return new ControlPanel(config);

});

