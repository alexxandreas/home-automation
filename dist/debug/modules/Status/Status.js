/*
global config, inherits, controller, MHA
*/
define('Status', ['AbstractModule', 'WebServer', 'UtilsRoomHelpers'], function(AbstractModule, WebServer, UtilsRoomHelpers){
   
   function Status(config) {
        Status.super_.call(this, config);
        this.name = 'Status';
        this.log('construcror');

        //this.ML = MHA.ModuleLoader;
        this.modules = MHA.ModuleLoader.modules;
        
        this.modulesNames = [
            'Hallway', 
            'Bathroom', 
            'Toilet', 
            'Kitchen',
            'Corridor',
            'Wardrobe',
            'Bedroom',
            'Hall'
        ];
        
        this.devices = {
            switch220: {},
            light12: {},
            motionSensor: {},
            lightSensor: {},
            tempSensor: {},
            humSensor: {},
            door: {},
            fan: {},
            tabletopSwitch: {},
            tabletopLight: {}
        };
        
        this.timers = [
            'offTimer',
            'userMode',
            'clearLastLight',
            'fanStartTimer',
            'fanStopTimer'
        ]
        
        this._initFrontend();
        
    }

    inherits(Status, AbstractModule);


    Status.prototype._initFrontend = function(){
        var ws = WebServer;
        
    	ws.addRoute('/modules/'+this.name+'/api/status', function(args){
	        var data = {};
	        
	        this.modulesNames.forEach(function(moduleName){
	            var module = this.modules[moduleName];
	            if (!module || !module.module) return; 
	            module = module.module;
	            
	            data[moduleName] = {
	                devices:{},
	                timers: {}
	            };
	            
	            Object.keys(this.devices).forEach(function(devName){
	                var key = module.devices[devName];
	                var devData = UtilsRoomHelpers.getDeviceData(key);
	                if (devData.deviceNotExists) return;
	                
	                data[moduleName].devices[devName] = devData;
	            }, this);
	            
	            if (module.timers && module.timers._timers){
	                var moduleTimers = module.timers._timers
    	            this.timers.forEach(function(timerName){
    	                if (!moduleTimers[timerName]) return;
    	                data[moduleName].timers[timerName] = {
    	                    timeout: moduleTimers[timerName].offTime - Date.now()
    	                }
    	            }, this);
	            }
	        }, this);
	        
	        // timers
	        //return MHA.ModuleLoader.modules['Hallway'].module.timers._timers.clearLastLight.offTime - Date.now()

	        
	        return ws.sendJSON(data);
    	}, this);
    	 
    	
    
    	
    	
    	WebServer.addPanel({
    	    key: this.name,
            title:'Status',
            template: '/views/Status/htdocs/Status.html'
        });
    };
    
    
    Status.prototype.stop = function(){
        WebServer.removePanel(this.name);
        Status.super_.prototype.stop.apply(this, arguments);
    };

    return new Status(config);

});

