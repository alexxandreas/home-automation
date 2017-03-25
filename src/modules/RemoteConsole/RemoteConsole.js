/*
global config, inherits, controller, MHA
*/
define('RemoteConsole', ['AbstractModule', 'WebServer', 'WebApp'], function(AbstractModule, WebServer, WebApp){
   
   function RemoteConsole(config) {
        RemoteConsole.super_.call(this, config);
        this.name = 'RemoteConsole';
        this.log('construcror');

        this._initFrontend();
    }

    inherits(RemoteConsole, AbstractModule);


    RemoteConsole.prototype._initFrontend = function(){
        var ws = WebServer;
        
    	ws.addRoute('/modules/'+this.name+'/api/eval/:code', function(args){
	        var code = args[0];
	        
	       
	        return ws.sendJSON(data);
    	}, this);
    	
    	
    	
    	WebApp.addPanel({
            title:'Remote Console',
            template: '/views/RemoteConsole/htdocs/RemoteConsole.html'
        });
    };
    
    
    RemoteConsole.prototype.stop = function(){
        RemoteConsole.super_.prototype.stop.apply(this, arguments);
    };

    return new RemoteConsole(config);

});
