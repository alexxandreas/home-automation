/*
global config, inherits, controller, MHA
*/
define('Logger', ['AbstractModule', 'WebServer'], function(AbstractModule, WebServer){
   
   function Logger(config) {
        Logger.super_.call(this, config);
        this.name = 'Logger';
        this.log('construcror');

        this.logData = controller.MHA.logData;
        if (logData) 
            this.log(logData.length);
        else this.log('no logData');
        //this.ML = MHA.ModuleLoader;
        //this.modules = MHA.ModuleLoader.modules;
        
        this._initFrontend();
        
    }

    inherits(Logger, AbstractModule);


    Logger.prototype._initFrontend = function(){
        var ws = WebServer;
        
    	ws.addRoute('/modules/'+this.name+'/api/getLog/:time', function(args){
    	    var time = args[0];
    	    
    	    var log = this.logData.filter(function(item){
    	        return item.time > time;
    	    });
    	       
	        return ws.sendJSON(log);
	        
    	}, this);
    	
    
    	WebServer.addPanel({
    	    key: this.name,
            title:'Logs',
            template: '/views/Logger/htdocs/Logger.html'
        });
    };
    
    
    Logger.prototype.stop = function(){
        WebServer.removePanel(this.name);
        Logger.super_.prototype.stop.apply(this, arguments);
    };

    return new Logger(config);

});

